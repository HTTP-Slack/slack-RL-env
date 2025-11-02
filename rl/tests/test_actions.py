from __future__ import annotations

import json

import pytest

from rl.env.actions import ActionID, ActionRegistry
from rl.env.errors import StepError


@pytest.fixture()
def registry() -> ActionRegistry:
    return ActionRegistry()


def test_parse_send_message_payload(registry: ActionRegistry) -> None:
    payload = registry.parse_payload(ActionID.SEND_MESSAGE, json.dumps({"text": "hello"}))
    assert payload.text == "hello"


def test_parse_invalid_json_raises(registry: ActionRegistry) -> None:
    with pytest.raises(StepError):
        registry.parse_payload(ActionID.SEND_MESSAGE, "{not json}")


def test_unknown_action_id() -> None:
    registry = ActionRegistry()
    with pytest.raises(StepError):
        registry.parse_payload(999, "{}")

