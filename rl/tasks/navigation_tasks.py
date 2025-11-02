"""
Navigation task definitions for Slack UI environment.

Defines concrete tasks for benchmarking web navigation agents.
"""

from typing import Dict, Any
from datetime import timedelta
from .specs import TaskSpec, AcceptanceCriteria, TaskInstance


def check_url_match(target_url: str):
    """Create validator function for URL matching."""
    def validator(obs: Dict[str, Any]) -> bool:
        current_url = obs["state"]["url"]
        return current_url.endswith(target_url) or target_url in current_url
    return validator


def check_view_active(target_view: str):
    """Create validator function for active view."""
    def validator(obs: Dict[str, Any]) -> bool:
        return obs["state"]["active_view"] == target_view
    return validator


def check_component_visible(component_name: str):
    """Create validator function for component visibility."""
    def validator(obs: Dict[str, Any]) -> bool:
        visible = obs["state"].get("visible_components", [])
        return component_name in visible
    return validator


# ============================================================================
# TIER 1: SIMPLE NAVIGATION TASKS
# ============================================================================

NAVIGATE_TO_LATER = TaskSpec(
    name="navigate_to_later",
    goal="Navigate from the dashboard to the Later view",
    hints=[
        "Look for the Later button in the left navigation sidebar",
        "The Later button has a bookmark icon",
        "Click the Later button to navigate to /later"
    ],
    timeout=timedelta(seconds=30),
    acceptance_criteria=AcceptanceCriteria(
        description="URL is /later and Later view is active",
        validator=lambda obs: check_url_match("/later")(obs) and check_view_active("later")(obs)
    ),
    reward_weight=1.0
)


NAVIGATE_TO_SEARCH = TaskSpec(
    name="navigate_to_search",
    goal="Open the search interface",
    hints=[
        "Use Cmd/Ctrl+K to open search",
        "Or click the search bar in the top navigation",
        "Search modal should appear"
    ],
    timeout=30,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="Search modal is visible",
            validator=check_component_visible("search-modal")
        )
    ],
    reward_weight=1.0
)


OPEN_ACTIVITY_PANEL = TaskSpec(
    name="open_activity_panel",
    goal="Open the Activity panel from dashboard",
    hints=[
        "Find the Activity button in the left sidebar",
        "The Activity button has a bell/notification icon",
        "Click it to open the activity panel"
    ],
    timeout=30,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="Activity panel is visible",
            validator=check_component_visible("activity-panel")
        )
    ],
    reward_weight=1.0
)


OPEN_DMS_PANEL = TaskSpec(
    name="open_dms_panel",
    goal="Open the Direct Messages panel",
    hints=[
        "Look for the DMs button in the left sidebar",
        "The DMs button has a chat/message icon",
        "Click to open the DM panel"
    ],
    timeout=30,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="DM panel is visible",
            validator=check_component_visible("dm-panel")
        )
    ],
    reward_weight=1.0
)


RETURN_TO_DASHBOARD = TaskSpec(
    name="return_to_dashboard",
    goal="Navigate back to the dashboard from any other view",
    hints=[
        "Look for the Home button in the left sidebar",
        "Or navigate to /dashboard",
        "The dashboard shows channels and conversations"
    ],
    timeout=30,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="URL is /dashboard",
            validator=check_url_match("/dashboard")
        ),
        AcceptanceCriteria(
            description="Dashboard view is active",
            validator=check_view_active("dashboard")
        )
    ],
    reward_weight=1.0
)


# ============================================================================
# TIER 2: MESSAGE INTERACTION TASKS
# ============================================================================

def check_message_sent(channel_name: str, message_text: str):
    """Create validator for message sent (simplified)."""
    def validator(obs: Dict[str, Any]) -> bool:
        # In a real implementation, this would check the message history
        # For now, we'll use a heuristic based on page state
        return obs["state"]["active_view"] == "dashboard"
    return validator


SEND_MESSAGE_TO_GENERAL = TaskSpec(
    name="send_message_to_general",
    goal="Send the message 'Hello team!' to the #general channel",
    hints=[
        "First, open the #general channel from the sidebar",
        "Click on the message composer at the bottom",
        "Type 'Hello team!' into the composer",
        "Press Enter or click Send to send the message"
    ],
    timeout=50,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="Message sent successfully",
            validator=check_message_sent("#general", "Hello team!")
        )
    ],
    reward_weight=1.5
)


OPEN_CHANNEL_GENERAL = TaskSpec(
    name="open_channel_general",
    goal="Open the #general channel",
    hints=[
        "Look in the Channels section of the sidebar",
        "Find #general in the channel list",
        "Click on #general to open it"
    ],
    timeout=40,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="Chat pane is visible",
            validator=check_component_visible("chat-pane")
        )
    ],
    reward_weight=1.2
)


# ============================================================================
# TIER 3: COMPLEX WORKFLOWS
# ============================================================================

SEARCH_AND_NAVIGATE = TaskSpec(
    name="search_and_navigate",
    goal="Open search and search for the keyword 'meeting'",
    hints=[
        "Press Cmd/Ctrl+K to open search",
        "Type 'meeting' in the search box",
        "Results should appear"
    ],
    timeout=50,
    acceptance_criteria=[
        AcceptanceCriteria(
            description="Search modal is open",
            validator=check_component_visible("search-modal")
        )
    ],
    reward_weight=1.8
)


# ============================================================================
# TASK REGISTRY
# ============================================================================

# Organize tasks by tier
TIER_1_TASKS = [
    NAVIGATE_TO_LATER,
    NAVIGATE_TO_SEARCH,
    OPEN_ACTIVITY_PANEL,
    OPEN_DMS_PANEL,
    RETURN_TO_DASHBOARD,
]

TIER_2_TASKS = [
    SEND_MESSAGE_TO_GENERAL,
    OPEN_CHANNEL_GENERAL,
]

TIER_3_TASKS = [
    SEARCH_AND_NAVIGATE,
]

ALL_TASKS = TIER_1_TASKS + TIER_2_TASKS + TIER_3_TASKS


# Convenience function to get tasks
def get_task_by_name(name: str) -> TaskSpec:
    """
    Get task specification by name.

    Args:
        name: Task name

    Returns:
        TaskSpec instance

    Raises:
        ValueError: If task not found
    """
    for task in ALL_TASKS:
        if task.name == name:
            return task
    raise ValueError(f"Task '{name}' not found. Available tasks: {[t.name for t in ALL_TASKS]}")


def get_tasks_by_tier(tier: int) -> list[TaskSpec]:
    """
    Get all tasks for a specific tier.

    Args:
        tier: Tier number (1, 2, or 3)

    Returns:
        List of TaskSpec instances
    """
    if tier == 1:
        return TIER_1_TASKS
    elif tier == 2:
        return TIER_2_TASKS
    elif tier == 3:
        return TIER_3_TASKS
    else:
        raise ValueError(f"Invalid tier: {tier}. Must be 1, 2, or 3")


def create_task_instance(task_name: str, seed: int = None) -> TaskInstance:
    """
    Create a task instance from a task name.

    Args:
        task_name: Name of the task
        seed: Random seed for task instance

    Returns:
        TaskInstance
    """
    task_spec = get_task_by_name(task_name)
    if seed is None:
        import random
        seed = random.randint(0, 1000000)
    return TaskInstance(spec=task_spec, seed=seed)
