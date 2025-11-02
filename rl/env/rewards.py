"""
Reward function library for the Slack UI navigation environment.

Provides modular reward components that can be combined for different
research configurations and task types.
"""

from typing import Dict, Any, Callable
from dataclasses import dataclass


@dataclass
class RewardConfig:
    """Configuration for reward calculation"""
    sparse: bool = False  # Sparse (only on completion) vs dense (partial credit)
    time_penalty: float = 0.01  # Penalty per step to encourage efficiency
    invalid_action_penalty: float = 0.1  # Penalty for failed actions
    completion_reward: float = 1.0  # Reward for completing task
    efficiency_bonus_weight: float = 0.3  # Weight for efficiency bonus
    progress_weight: float = 0.5  # Weight for progress-based rewards


def calculate_reward(
    observation: Dict[str, Any],
    action: Dict[str, Any],
    task: Any,  # TaskInstance
    action_result: Dict[str, bool],
    config: RewardConfig = None
) -> float:
    """
    Calculate reward based on observation, action, task progress, and config.

    Args:
        observation: Current observation from environment
        action: Action that was taken
        task: Task instance with completion criteria
        action_result: Result of action execution (success/failure)
        config: Reward configuration

    Returns:
        Reward value (float)
    """
    if config is None:
        config = RewardConfig()

    reward = 0.0

    # Sparse reward mode: only reward on task completion
    if config.sparse:
        if task.is_complete(observation):
            reward = config.completion_reward
        return reward

    # Dense reward mode: partial credit for progress
    # 1. Time penalty (encourage efficiency)
    reward -= config.time_penalty

    # 2. Invalid action penalty
    if not action_result.get("success", True):
        reward -= config.invalid_action_penalty

    # 3. Progress-based reward
    progress = task.get_progress(observation)
    reward += progress * config.progress_weight

    # 4. Completion reward
    if task.is_complete(observation):
        reward += config.completion_reward

        # 5. Efficiency bonus (complete faster = higher reward)
        steps_taken = observation["state"]["step_count"]
        max_steps = getattr(task, "timeout", 30)  # Default max 30 steps
        efficiency_ratio = max(0, (max_steps - steps_taken) / max_steps)
        efficiency_bonus = efficiency_ratio * config.efficiency_bonus_weight
        reward += efficiency_bonus

    return reward


def sparse_reward(observation: Dict[str, Any], task: Any) -> float:
    """
    Simple sparse reward: +1 for completion, 0 otherwise.

    Args:
        observation: Current observation
        task: Task instance

    Returns:
        1.0 if task complete, else 0.0
    """
    return 1.0 if task.is_complete(observation) else 0.0


def dense_reward_with_progress(
    observation: Dict[str, Any],
    task: Any,
    action_success: bool = True
) -> float:
    """
    Dense reward with progress-based partial credit.

    Args:
        observation: Current observation
        task: Task instance
        action_success: Whether the action succeeded

    Returns:
        Reward value
    """
    reward = 0.0

    # Time penalty
    reward -= 0.01

    # Invalid action penalty
    if not action_success:
        reward -= 0.1

    # Progress reward
    progress = task.get_progress(observation)
    reward += progress * 0.5

    # Completion reward
    if task.is_complete(observation):
        reward += 1.0

    return reward


def navigation_reward(
    observation: Dict[str, Any],
    target_url: str,
    target_view: str = None
) -> float:
    """
    Specialized reward for navigation tasks.

    Args:
        observation: Current observation
        target_url: Target URL to navigate to
        target_view: Optional target view name

    Returns:
        Reward value based on navigation progress
    """
    reward = 0.0

    current_url = observation["state"]["url"]
    current_view = observation["state"]["active_view"]

    # Partial credit for being on the right path
    if target_url in current_url:
        reward += 0.5

    # Full reward for exact match
    if current_url == target_url or current_url.endswith(target_url):
        reward += 0.5

    # Additional reward if view matches
    if target_view and current_view == target_view:
        reward += 0.3

    return reward


def message_interaction_reward(
    observation: Dict[str, Any],
    expected_action: str,
    action: Dict[str, Any]
) -> float:
    """
    Specialized reward for message interaction tasks.

    Args:
        observation: Current observation
        expected_action: Expected action type (e.g., "send_message")
        action: Action that was taken

    Returns:
        Reward value
    """
    reward = 0.0

    # Reward for taking the right action type
    if action.get("name") == expected_action:
        reward += 0.3

    # Additional reward based on page state
    # (This would check if message was actually sent)
    # For now, simplified version
    if expected_action == "send_message" and action.get("name") == "send_message":
        reward += 0.7

    return reward


class RewardShaper:
    """
    Flexible reward shaping class for custom reward configurations.

    Allows combining multiple reward components with different weights.
    """

    def __init__(self):
        self.components: list[tuple[Callable, float]] = []

    def add_component(self, reward_fn: Callable, weight: float = 1.0):
        """
        Add a reward component with a weight.

        Args:
            reward_fn: Function that returns reward value
            weight: Weight for this component
        """
        self.components.append((reward_fn, weight))

    def calculate(self, **kwargs) -> float:
        """
        Calculate total reward by combining all components.

        Args:
            **kwargs: Arguments to pass to reward functions

        Returns:
            Weighted sum of all reward components
        """
        total_reward = 0.0
        for reward_fn, weight in self.components:
            try:
                component_reward = reward_fn(**kwargs)
                total_reward += component_reward * weight
            except TypeError:
                # Skip if function signature doesn't match
                pass
        return total_reward


# Pre-configured reward functions for common use cases
REWARD_PRESETS = {
    "sparse": RewardConfig(sparse=True),
    "dense": RewardConfig(sparse=False, time_penalty=0.01, progress_weight=0.5),
    "navigation_optimized": RewardConfig(
        sparse=False,
        time_penalty=0.02,  # Higher penalty for navigation tasks
        progress_weight=0.6,
        efficiency_bonus_weight=0.4
    ),
    "interaction_optimized": RewardConfig(
        sparse=False,
        time_penalty=0.005,  # Lower penalty for complex interactions
        progress_weight=0.4,
        invalid_action_penalty=0.15,  # Higher penalty for wrong actions
        efficiency_bonus_weight=0.2
    )
}


def get_reward_config(preset_name: str) -> RewardConfig:
    """
    Get a pre-configured reward configuration by name.

    Args:
        preset_name: Name of the preset ('sparse', 'dense', etc.)

    Returns:
        RewardConfig instance

    Raises:
        ValueError: If preset name not found
    """
    if preset_name not in REWARD_PRESETS:
        raise ValueError(f"Unknown reward preset: {preset_name}. "
                        f"Available: {list(REWARD_PRESETS.keys())}")
    return REWARD_PRESETS[preset_name]
