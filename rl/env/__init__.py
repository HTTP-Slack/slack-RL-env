"""
Environment module for Slack UI navigation.

Exports the main Gymnasium environment and related components.
"""

from .slack_ui_env import SlackUIEnv, AsyncSlackUIEnv
from .actions import FUNCTION_DEFINITIONS, ActionID, get_action_by_name, validate_action
from .observation import extract_observation, format_observation_for_prompt
from .rewards import (
    RewardConfig,
    calculate_reward,
    sparse_reward,
    dense_reward_with_progress,
    navigation_reward,
    get_reward_config
)
from .playwright_controller import PlaywrightController

__all__ = [
    # Main environment
    "SlackUIEnv",
    "AsyncSlackUIEnv",

    # Actions
    "FUNCTION_DEFINITIONS",
    "ActionID",
    "get_action_by_name",
    "validate_action",

    # Observations
    "extract_observation",
    "format_observation_for_prompt",

    # Rewards
    "RewardConfig",
    "calculate_reward",
    "sparse_reward",
    "dense_reward_with_progress",
    "navigation_reward",
    "get_reward_config",

    # Browser control
    "PlaywrightController",
]
