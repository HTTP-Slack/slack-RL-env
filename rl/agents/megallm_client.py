"""
MegaLLM API client for GLM-4.6 integration.

Provides async client for calling MegaLLM API with vision and function calling.
"""

import httpx
import base64
from typing import Dict, List, Any, Optional
from PIL import Image
from io import BytesIO
import structlog

logger = structlog.get_logger()


class MegaLLMClient:
    """
    Async HTTP client for MegaLLM API.

    Supports vision models, function calling, and streaming.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://ai.megallm.io/v1",
        timeout: float = 60.0
    ):
        """
        Initialize MegaLLM client.

        Args:
            api_key: MegaLLM API key
            base_url: Base URL for API (default: https://api.megallm.io/v1)
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout

        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=timeout
        )

        logger.info("MegaLLM client initialized", base_url=base_url)

    async def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "glm-4.6",
        functions: Optional[List[Dict[str, Any]]] = None,
        function_call: str = "auto",
        temperature: float = 0.0,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Call chat completion API with function calling support.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model ID (default: 'glm-4.6')
            functions: List of function definitions for function calling
            function_call: 'auto', 'none', or specific function name
            temperature: Sampling temperature (0.0 for deterministic)
            max_tokens: Maximum tokens to generate

        Returns:
            API response dict

        Raises:
            httpx.HTTPError: If API request fails
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }

        if functions:
            payload["functions"] = functions
            payload["function_call"] = function_call

        if max_tokens:
            payload["max_tokens"] = max_tokens

        logger.debug("Sending chat completion request", model=model, num_messages=len(messages))

        try:
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json=payload
            )
            response.raise_for_status()

            result = response.json()
            logger.debug("Chat completion successful", model=model)
            return result

        except httpx.HTTPError as e:
            logger.error("Chat completion failed", error=str(e))
            raise

    @staticmethod
    def encode_image(image: Image.Image, format: str = "PNG") -> str:
        """
        Encode PIL image to base64 string.

        Args:
            image: PIL Image object
            format: Image format ('PNG', 'JPEG', etc.)

        Returns:
            Base64-encoded image string
        """
        buffered = BytesIO()
        image.save(buffered, format=format)
        img_bytes = buffered.getvalue()
        return base64.b64encode(img_bytes).decode("utf-8")

    @staticmethod
    def create_image_message(
        text: str,
        image: Image.Image,
        role: str = "user"
    ) -> Dict[str, Any]:
        """
        Create a message with both text and image content.

        Args:
            text: Text content
            image: PIL Image object
            role: Message role ('user', 'assistant', 'system')

        Returns:
            Message dict with multi-modal content
        """
        image_b64 = MegaLLMClient.encode_image(image)

        return {
            "role": role,
            "content": [
                {
                    "type": "text",
                    "text": text
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{image_b64}"
                    }
                }
            ]
        }

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
        logger.info("MegaLLM client closed")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
