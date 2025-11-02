"""
GLM-4.6 agent for web navigation via MegaLLM API.

Wraps GLM-4.6 vision model for Slack UI navigation tasks.
"""

import json
from typing import Dict, List, Any, Optional
from PIL import Image
import structlog

from .megallm_client import MegaLLMClient
from ..env.actions import FUNCTION_DEFINITIONS
from ..env.observation import format_observation_for_prompt

logger = structlog.get_logger()


class GLM46Agent:
    """
    GLM-4.6 agent for web navigation.

    Uses vision + function calling to navigate Slack UI.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "glm-4.6",
        temperature: float = 0.0,
        max_tokens: int = 2000,
        include_screenshot: bool = True,
        include_accessibility_tree: bool = True
    ):
        """
        Initialize GLM-4.6 agent.

        Args:
            api_key: MegaLLM API key
            model: Model ID (default: 'glm-4.6')
            temperature: Sampling temperature (0.0 for deterministic)
            max_tokens: Maximum tokens to generate
            include_screenshot: Whether to include screenshots in observations
            include_accessibility_tree: Whether to include accessibility tree
        """
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.include_screenshot = include_screenshot
        self.include_accessibility_tree = include_accessibility_tree

        self.client = MegaLLMClient(api_key=api_key)
        self.conversation_history: List[Dict[str, Any]] = []

        logger.info(
            "GLM-4.6 agent initialized",
            model=model,
            temperature=temperature,
            vision=include_screenshot
        )

    async def act(
        self,
        observation: Dict[str, Any],
        task_description: str,
        hints: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Decide next action based on observation and task.

        Args:
            observation: Multi-modal observation from environment
            task_description: Goal/task to accomplish
            hints: Optional list of hints for the task

        Returns:
            Action dict with 'name' and 'parameters'
        """
        logger.debug("Agent deciding action", task=task_description, step=observation["state"]["step_count"])

        # Build prompt
        prompt = self._build_prompt(observation, task_description, hints)

        # Create message with vision if enabled
        if self.include_screenshot:
            # Convert numpy array to PIL Image
            screenshot_array = observation["screenshot"]["array"]
            screenshot_pil = Image.fromarray(screenshot_array)

            message = MegaLLMClient.create_image_message(
                text=prompt,
                image=screenshot_pil,
                role="user"
            )
        else:
            # Text-only message
            message = {
                "role": "user",
                "content": prompt
            }

        self.conversation_history.append(message)

        # Call GLM-4.6 with function calling
        try:
            response = await self.client.chat_completion(
                messages=self.conversation_history,
                model=self.model,
                functions=FUNCTION_DEFINITIONS,
                function_call="auto",
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            # Extract function call from response
            assistant_message = response["choices"][0]["message"]
            self.conversation_history.append(assistant_message)

            action = self._extract_action(assistant_message)

            logger.info("Agent action decided", action=action["name"])
            return action

        except Exception as e:
            logger.error("Agent action failed", error=str(e))
            # Fallback: wait action
            return {"name": "wait", "parameters": {"seconds": 1.0}}

    def _build_prompt(
        self,
        observation: Dict[str, Any],
        task_description: str,
        hints: Optional[List[str]] = None
    ) -> str:
        """Build prompt for GLM-4.6."""
        # Format observation as text
        obs_text = format_observation_for_prompt(observation)

        # Build full prompt
        prompt = f"""You are an AI agent navigating a Slack-like web application.

**TASK**: {task_description}
"""

        if hints:
            prompt += f"""
**HINTS**:
{chr(10).join(f'- {hint}' for hint in hints)}
"""

        prompt += f"""
{obs_text}

**INSTRUCTIONS**:
1. Analyze the current page state and screenshot
2. Determine the next action to take towards completing the task
3. Call one of the available functions to execute the action
4. If the task is complete, call the 'task_complete' function

Choose the most appropriate action to make progress on the task.
"""

        return prompt

    def _extract_action(self, assistant_message: Dict[str, Any]) -> Dict[str, Any]:
        """Extract action from assistant's function call."""
        function_call = assistant_message.get("function_call")

        if function_call:
            # Parse function call
            action = {
                "name": function_call["name"],
                "parameters": json.loads(function_call["arguments"])
            }
        else:
            # No function call - default to wait
            logger.warning("No function call in response, defaulting to wait")
            action = {"name": "wait", "parameters": {}}

        return action

    def reset(self):
        """Reset conversation history between episodes."""
        logger.debug("Resetting agent conversation history")
        self.conversation_history = []

    async def close(self):
        """Close API client."""
        await self.client.close()

    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get full conversation history."""
        return self.conversation_history.copy()

    def get_stats(self) -> Dict[str, Any]:
        """Get agent statistics."""
        return {
            "model": self.model,
            "temperature": self.temperature,
            "conversation_turns": len(self.conversation_history) // 2,  # Approx
            "vision_enabled": self.include_screenshot
        }


class RandomAgent:
    """
    Random baseline agent for comparison.

    Randomly selects actions from the action space.
    """

    def __init__(self, seed: Optional[int] = None):
        """
        Initialize random agent.

        Args:
            seed: Random seed for reproducibility
        """
        import random
        self.random = random.Random(seed)
        logger.info("Random agent initialized", seed=seed)

    async def act(
        self,
        observation: Dict[str, Any],
        task_description: str,
        hints: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Randomly select an action."""
        # Simple random action selection
        actions = [
            {"name": "navigate_to_url", "parameters": {"url": "/dashboard"}},
            {"name": "navigate_to_url", "parameters": {"url": "/later"}},
            {"name": "navigate_to_url", "parameters": {"url": "/search"}},
            {"name": "wait", "parameters": {"seconds": 1.0}},
            {"name": "scroll", "parameters": {"direction": "down"}},
            {"name": "scroll", "parameters": {"direction": "up"}},
        ]

        action = self.random.choice(actions)
        logger.debug("Random action selected", action=action["name"])
        return action

    def reset(self):
        """Reset agent state."""
        pass

    async def close(self):
        """Close agent (no-op for random agent)."""
        pass
