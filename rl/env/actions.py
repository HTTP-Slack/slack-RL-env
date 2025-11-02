"""
Action space definitions for the Slack UI navigation environment.

This module defines the action space using OpenAI function calling format,
which is compatible with GLM-4.6 and other function-calling LLMs.
"""

from typing import Dict, List, Any
from enum import IntEnum


class ActionID(IntEnum):
    """Enumeration of action IDs for discrete action space"""
    NAVIGATE_TO_URL = 0
    CLICK_ELEMENT = 1
    TYPE_TEXT = 2
    SEND_MESSAGE = 3
    OPEN_SEARCH = 4
    SCROLL = 5
    WAIT = 6
    TASK_COMPLETE = 7


# Function definitions for GLM-4.6 function calling
FUNCTION_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "name": "navigate_to_url",
        "description": "Navigate to a specific URL path in the application",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "enum": ["/dashboard", "/later", "/search", "/home"],
                    "description": "The URL path to navigate to"
                }
            },
            "required": ["url"]
        }
    },
    {
        "name": "click_element",
        "description": "Click on an interactive element by its ID from the accessibility tree",
        "parameters": {
            "type": "object",
            "properties": {
                "element_id": {
                    "type": "string",
                    "description": "The element ID from the accessibility tree (e.g., 'elem_0', 'elem_5')"
                }
            },
            "required": ["element_id"]
        }
    },
    {
        "name": "type_text",
        "description": "Type text into a focused input field or text area",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The text to type into the input field"
                }
            },
            "required": ["text"]
        }
    },
    {
        "name": "send_message",
        "description": "Send the currently typed message (press Enter)",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "open_search",
        "description": "Open the search modal (equivalent to Cmd/Ctrl+K)",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "scroll",
        "description": "Scroll the page in a specified direction",
        "parameters": {
            "type": "object",
            "properties": {
                "direction": {
                    "type": "string",
                    "enum": ["up", "down"],
                    "description": "Direction to scroll"
                },
                "amount": {
                    "type": "integer",
                    "default": 300,
                    "description": "Amount to scroll in pixels"
                }
            },
            "required": ["direction"]
        }
    },
    {
        "name": "wait",
        "description": "Wait for a specified duration to allow page loading or animations to complete",
        "parameters": {
            "type": "object",
            "properties": {
                "seconds": {
                    "type": "number",
                    "default": 1.0,
                    "minimum": 0.1,
                    "maximum": 5.0,
                    "description": "Number of seconds to wait"
                }
            }
        }
    },
    {
        "name": "task_complete",
        "description": "Indicate that the task has been completed successfully",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
]


def get_action_by_name(action_name: str) -> Dict[str, Any]:
    """
    Get action definition by name.

    Args:
        action_name: Name of the action (e.g., 'click_element')

    Returns:
        Action definition dictionary

    Raises:
        ValueError: If action name is not found
    """
    for action in FUNCTION_DEFINITIONS:
        if action["name"] == action_name:
            return action
    raise ValueError(f"Action '{action_name}' not found in action space")


def validate_action(action_call: Dict[str, Any]) -> bool:
    """
    Validate that an action call has the correct format and parameters.

    Args:
        action_call: Dictionary with 'name' and 'parameters' keys

    Returns:
        True if valid, False otherwise
    """
    if not isinstance(action_call, dict):
        return False

    if "name" not in action_call:
        return False

    try:
        action_def = get_action_by_name(action_call["name"])
    except ValueError:
        return False

    parameters = action_call.get("parameters", {})
    required_params = action_def["parameters"].get("required", [])

    # Check all required parameters are present
    for param in required_params:
        if param not in parameters:
            return False

    return True


def get_all_action_names() -> List[str]:
    """Get list of all action names."""
    return [action["name"] for action in FUNCTION_DEFINITIONS]
