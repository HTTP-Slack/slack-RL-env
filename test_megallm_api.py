#!/usr/bin/env python3
"""
Simple test script to verify MegaLLM API is working.

Tests basic inference with the GLM model.
"""

import asyncio
import os
import sys
from rl.agents.megallm_client import MegaLLMClient


async def test_api():
    """Test basic API inference."""

    # Get API key from environment
    api_key = os.getenv("MEGALLM_API_KEY")
    if not api_key:
        print("ERROR: MEGALLM_API_KEY environment variable not set")
        print("Please set it with: export MEGALLM_API_KEY='your-api-key'")
        sys.exit(1)

    print("Testing MegaLLM API...")
    print(f"Base URL: https://ai.megallm.io/v1")
    print(f"API Key: {api_key[:10]}..." if len(api_key) > 10 else "Set")
    print()

    # Initialize client
    async with MegaLLMClient(api_key=api_key) as client:
        # Simple test message
        messages = [
            {
                "role": "user",
                "content": "Hello! Please respond with 'API is working!' to confirm the connection."
            }
        ]

        print("Sending test message...")
        try:
            response = await client.chat_completion(
                messages=messages,
                model="glm-4.6",
                temperature=0.0,
                max_tokens=50
            )

            # Extract response
            assistant_message = response["choices"][0]["message"]["content"]

            print("\n✓ SUCCESS! API is working!")
            print(f"\nModel: {response.get('model', 'unknown')}")
            print(f"Response: {assistant_message}")
            print(f"\nUsage: {response.get('usage', {})}")

            return True

        except Exception as e:
            print(f"\n✗ FAILED! API request failed")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e).__name__}")

            if hasattr(e, 'response'):
                print(f"Status code: {e.response.status_code}")
                print(f"Response: {e.response.text[:500]}")

            return False


if __name__ == "__main__":
    success = asyncio.run(test_api())
    sys.exit(0 if success else 1)
