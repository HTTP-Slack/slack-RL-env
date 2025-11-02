#!/usr/bin/env python3
"""
Check available models from MegaLLM API using httpx.
"""

import os
import sys
import asyncio
import httpx
import json
from pathlib import Path

# Load .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv not available, try loading manually
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()


async def check_models():
    """Fetch and display available models."""

    api_key = os.getenv("MEGALLM_API_KEY")
    if not api_key:
        print("ERROR: MEGALLM_API_KEY environment variable not set")
        return False

    # According to docs, try both endpoints
    endpoints = [
        "https://ai.megallm.io/v1/models",
        "https://ai.megallm.io/api/models",
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    print("Checking available models...\n")
    print(f"API Key: {api_key[:15]}...\n")

    async with httpx.AsyncClient(timeout=15.0) as client:
        for endpoint in endpoints:
            print(f"Trying endpoint: {endpoint}")
            try:
                response = await client.get(endpoint, headers=headers)
                print(f"Status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    print(f"\n✓ SUCCESS! Found models endpoint\n")

                    # Display models info
                    if "data" in data:
                        models = data["data"]
                        print(f"Total models available: {len(models)}")

                        # Look for GLM models
                        glm_models = [m for m in models if "glm" in m.get("id", "").lower()]

                        if glm_models:
                            print(f"\n=== GLM Models found ({len(glm_models)}) ===")
                            for model in glm_models:
                                print(f"\n  ID: {model.get('id')}")
                                print(f"  Name: {model.get('display_name', 'N/A')}")
                                print(f"  Type: {model.get('type', 'N/A')}")
                                print(f"  Owner: {model.get('owned_by', 'N/A')}")
                                print(f"  Context: {model.get('context_length', 'N/A')} tokens")
                                if "capabilities" in model:
                                    caps = model["capabilities"]
                                    print(f"  Capabilities:")
                                    print(f"    - Vision: {caps.get('vision', False)}")
                                    print(f"    - Function calling: {caps.get('function_calling', False)}")
                                    print(f"    - Streaming: {caps.get('streaming', False)}")
                        else:
                            print("\n⚠ No GLM models found!")
                            print("\nAvailable model IDs (first 30):")
                            for i, model in enumerate(models[:30]):
                                print(f"  {i+1}. {model.get('id')} - {model.get('display_name', 'N/A')}")
                            if len(models) > 30:
                                print(f"  ... and {len(models) - 30} more")

                        return True
                    elif isinstance(data, list):
                        # Direct list of models
                        print(f"Total models: {len(data)}")
                        glm_models = [m for m in data if "glm" in m.get("id", "").lower()]
                        if glm_models:
                            print(f"\nGLM Models: {[m.get('id') for m in glm_models]}")
                        return True
                    else:
                        print(f"Unexpected response format:")
                        print(json.dumps(data, indent=2)[:500])
                else:
                    print(f"Error response: {response.text[:300]}\n")

            except Exception as e:
                print(f"Error: {type(e).__name__}: {str(e)}\n")

    return False


if __name__ == "__main__":
    success = asyncio.run(check_models())
    sys.exit(0 if success else 1)
