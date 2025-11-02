"""
Main Gymnasium environment for Slack UI navigation tasks.

This environment provides a standardized interface for training and evaluating
agents on web navigation tasks using the Slack-like interface.
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Dict, Any, Optional, Tuple
import structlog

from .playwright_controller import PlaywrightController
from .observation import extract_observation
from .rewards import calculate_reward, RewardConfig
from .actions import validate_action, FUNCTION_DEFINITIONS
from ..tasks.specs import TaskInstance

logger = structlog.get_logger()


class SlackUIEnv(gym.Env):
    """
    Gymnasium environment for Slack UI navigation.

    Provides multi-modal observations (screenshots + accessibility tree)
    and structured action space via function calling.
    """

    metadata = {"render_modes": ["human", "rgb_array"]}

    def __init__(
        self,
        task: TaskInstance,
        headless: bool = True,
        browser_type: str = "chromium",
        base_url: str = "http://localhost:5173",
        max_steps: int = 30,
        reward_config: Optional[RewardConfig] = None,
        record_video: bool = False,
        video_dir: str = "./videos",
        viewport: Optional[Dict[str, int]] = None
    ):
        """
        Initialize the Slack UI environment.

        Args:
            task: Task instance defining the goal and acceptance criteria
            headless: Whether to run browser in headless mode
            browser_type: Browser to use ('chromium', 'firefox', 'webkit')
            base_url: Base URL of the Slack application
            max_steps: Maximum steps per episode
            reward_config: Reward configuration (uses default if None)
            record_video: Whether to record video of sessions
            video_dir: Directory to save videos
            viewport: Viewport size dict
        """
        super().__init__()

        self.task = task
        self.max_steps = max_steps
        self.reward_config = reward_config or RewardConfig()

        # Initialize Playwright controller
        self.controller = PlaywrightController(
            headless=headless,
            browser_type=browser_type,
            viewport=viewport or {"width": 1920, "height": 1080},
            base_url=base_url,
            record_video=record_video,
            video_dir=video_dir
        )

        # Define action space (discrete, representing function call index)
        self.action_space = spaces.Discrete(len(FUNCTION_DEFINITIONS))

        # Define observation space
        # Note: This is a simplified version; full multi-modal obs is in dict format
        self.observation_space = spaces.Dict({
            "screenshot": spaces.Box(
                low=0, high=255,
                shape=(1080, 1920, 3),
                dtype=np.uint8
            ),
            "url": spaces.Text(max_length=500),
            "step_count": spaces.Discrete(max_steps + 1)
        })

        # Episode state
        self.step_count = 0
        self.episode_reward = 0.0
        self.current_observation = None

        logger.info("Environment initialized", task=task.name, max_steps=max_steps)

    async def reset(
        self,
        seed: Optional[int] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Reset environment to initial state.

        Args:
            seed: Random seed for reproducibility
            options: Additional options for reset

        Returns:
            Tuple of (observation, info)
        """
        super().reset(seed=seed)

        logger.info("Resetting environment", task=self.task.name)

        # Launch browser if not already running
        if not self.controller.page:
            await self.controller.launch()

        # Navigate to sign-in and authenticate
        await self.controller.authenticate()

        # Navigate to starting state (dashboard)
        await self.controller.navigate_to("/dashboard")

        # Reset episode state
        self.step_count = 0
        self.episode_reward = 0.0

        # Extract initial observation
        page = await self.controller.get_page()
        self.current_observation = await extract_observation(page, self.step_count)

        info = {
            "task": self.task.name,
            "task_goal": self.task.goal,
            "max_steps": self.max_steps
        }

        logger.info("Environment reset complete", task=self.task.name)
        return self.current_observation, info

    async def step(
        self,
        action_call: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], float, bool, bool, Dict[str, Any]]:
        """
        Execute action and return (obs, reward, terminated, truncated, info).

        Args:
            action_call: Action dictionary with 'name' and 'parameters'

        Returns:
            Tuple of (observation, reward, terminated, truncated, info)
        """
        self.step_count += 1

        logger.debug("Executing step", step=self.step_count, action=action_call.get("name"))

        # Validate action
        if not validate_action(action_call):
            logger.warning("Invalid action format", action=action_call)
            # Return current state with penalty
            reward = -0.5
            terminated = False
            truncated = False
            info = {
                "step": self.step_count,
                "action": action_call,
                "action_success": False,
                "error": "Invalid action format"
            }
            return self.current_observation, reward, terminated, truncated, info

        # Execute action
        action_result = await self.controller.execute_action(action_call)

        # Extract new observation
        page = await self.controller.get_page()
        observation = await extract_observation(page, self.step_count)
        self.current_observation = observation

        # Calculate reward
        reward = calculate_reward(
            observation=observation,
            action=action_call,
            task=self.task,
            action_result=action_result,
            config=self.reward_config
        )
        self.episode_reward += reward

        # Check termination conditions
        task_complete = self.task.is_complete(observation)
        explicitly_completed = action_call.get("name") == "task_complete"
        terminated = task_complete or explicitly_completed

        # Check truncation (max steps reached)
        truncated = self.step_count >= self.max_steps

        # Prepare info dict
        info = {
            "step": self.step_count,
            "action": action_call,
            "action_success": action_result.get("success", False),
            "action_error": action_result.get("error"),
            "task_progress": self.task.get_progress(observation),
            "task_complete": task_complete,
            "episode_reward": self.episode_reward,
            "url": observation["state"]["url"],
            "active_view": observation["state"]["active_view"]
        }

        if terminated:
            logger.info("Episode terminated", task_complete=task_complete, steps=self.step_count, reward=self.episode_reward)
        elif truncated:
            logger.info("Episode truncated", steps=self.step_count, reward=self.episode_reward)

        return observation, reward, terminated, truncated, info

    async def close(self):
        """Clean up resources and close browser."""
        logger.info("Closing environment")
        await self.controller.close()

    def render(self):
        """Render environment (not implemented)."""
        pass

    async def get_screenshot(self, path: Optional[str] = None) -> bytes:
        """
        Get screenshot of current state.

        Args:
            path: Optional path to save screenshot

        Returns:
            Screenshot bytes
        """
        return await self.controller.take_screenshot(path=path)

    def get_current_observation(self) -> Optional[Dict[str, Any]]:
        """Get the current observation without stepping."""
        return self.current_observation

    def get_episode_stats(self) -> Dict[str, Any]:
        """Get statistics about the current episode."""
        return {
            "step_count": self.step_count,
            "episode_reward": self.episode_reward,
            "task_name": self.task.name,
            "task_goal": self.task.goal,
            "max_steps": self.max_steps,
            "progress": self.task.get_progress(self.current_observation) if self.current_observation else 0.0
        }


# Async wrapper for easier usage
class AsyncSlackUIEnv:
    """
    Async wrapper for SlackUIEnv that handles async context automatically.

    This is the recommended way to use the environment.
    """

    def __init__(self, *args, **kwargs):
        self.env = SlackUIEnv(*args, **kwargs)
        self._initialized = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def reset(self, **kwargs) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Reset environment."""
        return await self.env.reset(**kwargs)

    async def step(self, action: Dict[str, Any]) -> Tuple[Dict[str, Any], float, bool, bool, Dict[str, Any]]:
        """Execute step."""
        return await self.env.step(action)

    async def close(self):
        """Close environment."""
        await self.env.close()

    def get_episode_stats(self) -> Dict[str, Any]:
        """Get episode statistics."""
        return self.env.get_episode_stats()

    async def get_screenshot(self, path: Optional[str] = None) -> bytes:
        """Get screenshot."""
        return await self.env.get_screenshot(path=path)
