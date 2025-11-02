#!/usr/bin/env python3
"""
Check available models from MegaLLM API.
"""

import os
import sys
import requests


def check_models():
    """Fetch and display available models."""

    api_key = os.getenv("MEGALLM_API_KEY")
    if not api_key:
        print("ERROR: MEGALLM_API_KEY environment variable not set")
        sys.exit(1)

    # According to docs, the models endpoint is GET /api/models
    # Try different base URLs to find the right one
    endpoints = [
        "https://ai.megallm.io/api/models",
        "https://ai.megallm.io/v1/models",
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    print("Checking available models...\n")

    for endpoint in endpoints:
        print(f"Trying endpoint: {endpoint}")
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
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
                        print(f"\nGLM Models found ({len(glm_models)}):")
                        for model in glm_models:
                            print(f"  - ID: {model.get('id')}")
                            print(f"    Name: {model.get('display_name', 'N/A')}")
                            print(f"    Type: {model.get('type', 'N/A')}")
                            print(f"    Context: {model.get('context_length', 'N/A')}")
                            if "capabilities" in model:
                                caps = model["capabilities"]
                                print(f"    Vision: {caps.get('vision', False)}")
                                print(f"    Function calling: {caps.get('function_calling', False)}")
                            print()
                    else:
                        print("\nNo GLM models found. Available model IDs:")
                        for model in models[:20]:  # Show first 20
                            print(f"  - {model.get('id')} ({model.get('display_name', 'N/A')})")
                        if len(models) > 20:
                            print(f"  ... and {len(models) - 20} more")

                    return True
                else:
                    print(f"Response: {response.text[:500]}")
            else:
                print(f"Error: {response.text[:200]}\n")

        except Exception as e:
            print(f"Error: {str(e)}\n")

    return False


if __name__ == "__main__":
    success = check_models()
    sys.exit(0 if success else 1)
