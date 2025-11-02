"""Core task specification models used across the RL workspace."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import timedelta
from typing import Callable, Dict, List, Optional


TaskRewardFn = Callable[[Dict[str, object]], float]


@dataclass(slots=True)
class AcceptanceCriteria:
    """Describes how to determine whether a task succeeded."""

    description: str
    validator: TaskRewardFn


@dataclass(slots=True)
class TaskSpec:
    """Declarative description of a UI-level task."""

    name: str
    goal: str
    hints: List[str] = field(default_factory=list)
    timeout: timedelta = timedelta(minutes=3)
    acceptance_criteria: AcceptanceCriteria | None = None
    reward_weight: float = 1.0


@dataclass(slots=True)
class TaskInstance:
    """Runtime container holding a task specification and rollout context."""

    spec: TaskSpec
    seed: int
    metadata: Dict[str, object] = field(default_factory=dict)

    def reward(self, signals: Dict[str, object]) -> float:
        if self.spec.acceptance_criteria is None:
            return 0.0
        return self.spec.reward_weight * self.spec.acceptance_criteria.validator(signals)


