"""Generate synthetic workspace plans using either an LLM or deterministic fallback."""

from __future__ import annotations

import json
import random
from typing import Any

import httpx

from rl.config.settings import Settings
from rl.data.rich_content import RichContentGenerator
from rl.data.specs import ChannelSpec, SyntheticWorkspacePlan, UserSpec


class WorkspacePlanGenerator:
    """Produces `SyntheticWorkspacePlan` instances.

    When no LLM credentials are configured the generator falls back to a
    deterministic plan so the pipeline remains fully runnable offline.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._content_generator = RichContentGenerator()

    def generate(self, *, seed: int | None = None, context: str | None = None) -> SyntheticWorkspacePlan:
        if self._settings.llm.api_key:
            plan = self._generate_with_llm(seed=seed, context=context)
            if plan is not None:
                return plan
        return self._fallback_plan(seed=seed)

    # ------------------------------------------------------------------
    # LLM-backed generation
    # ------------------------------------------------------------------
    def _generate_with_llm(
        self,
        *,
        seed: int | None = None,
        context: str | None = None,
    ) -> SyntheticWorkspacePlan | None:
        prompt = self._build_prompt(seed=seed, context=context)
        base_url = self._settings.llm.base_url or "https://api.openai.com/v1/responses"
        headers = {
            "Authorization": f"Bearer {self._settings.llm.api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": self._settings.llm.model,
            "input": prompt,
            "response_format": {"type": "json_object"},
        }

        try:
            response = httpx.post(base_url, json=body, headers=headers, timeout=self._settings.llm.request_timeout_seconds)
            response.raise_for_status()
            parsed = response.json()
            content = _extract_text(parsed)
            if content:
                return SyntheticWorkspacePlan.model_validate_json(content)
        except Exception:
            # Swallow LLM errors and fall back to deterministic plan.
            return None
        return None

    def _build_prompt(self, *, seed: int | None, context: str | None) -> str:
        seed_text = f"Seed: {seed}" if seed is not None else ""
        extra_context = context or ""
        return (
            "You are generating seed data for a Slack-like environment. "
            "Return JSON with workspace_name, description, users (username, email, password) "
            "and channels (name, topic, members, messages). Messages should include author_email and content. "
            "Keep it small (<=3 channels, <=5 users). "
            f"{seed_text} {extra_context}"
        ).strip()

    # ------------------------------------------------------------------
    # Deterministic fallback
    # ------------------------------------------------------------------
    def _fallback_plan(self, *, seed: int | None) -> SyntheticWorkspacePlan:
        rng = random.Random(seed)
        owner = UserSpec(
            username="Agent",
            email=self._settings.slack.default_email,
            password=self._settings.slack.default_password,
        )

        teammates = [
            UserSpec(username="Nora", email="nora@example.com"),
            UserSpec(username="Devon", email="devon@example.com"),
            UserSpec(username="Kiran", email="kiran@example.com"),
        ]

        channel_templates = [
            ("launch-planning", "Rolling launch updates"),
            ("customer-support", "Escalations and highlights"),
            ("random", "Team watercooler"),
        ]

        channels: list[ChannelSpec] = []
        all_user_emails = [owner.email] + [user.email for user in teammates]
        
        for idx, (name, topic) in enumerate(channel_templates[: rng.randint(2, 3)]):
            members = [owner.email] + rng.sample([user.email for user in teammates], rng.randint(1, len(teammates)))
            
            # Generate 3-5 messages per channel with rich features
            num_messages = rng.randint(3, 5)
            messages = []
            
            for msg_idx in range(num_messages):
                author = rng.choice(members)
                
                # Vary message types
                include_file = msg_idx == 1 and rng.random() > 0.5  # Sometimes include file
                include_reactions = msg_idx > 0  # Reactions on later messages
                include_thread = msg_idx == num_messages - 1 and rng.random() > 0.6  # Sometimes thread on last
                task_oriented = name == "launch-planning" and msg_idx == 0  # Task-oriented in planning channel
                
                message = self._content_generator.generate_rich_message(
                    author,
                    use_markdown=rng.random() > 0.3,  # 70% markdown
                    include_file=include_file,
                    include_reactions=include_reactions,
                    include_thread=include_thread,
                    task_oriented=task_oriented,
                    rng=rng,
                    available_emails=members,
                )
                
                messages.append(message)
            
            channels.append(
                ChannelSpec(
                    name=name,
                    topic=topic,
                    members=members,
                    messages=messages,
                )
            )

        return SyntheticWorkspacePlan(
            workspace_name="Project Atlas",
            description="Synthetic workspace seeded without external LLM access.",
            users=[owner, *teammates],
            channels=channels,
        )


def _extract_text(response: dict[str, Any]) -> str | None:
    choices = response.get("choices")
    if isinstance(choices, list) and choices:
        message = choices[0].get("message", {})
        if isinstance(message, dict):
            return message.get("content")
    # OpenAI Responses API returns {"output": [{"content": [{"text": {...}}]}]}
    output = response.get("output")
    if isinstance(output, list) and output:
        content_list = output[0].get("content", [])
        for entry in content_list:
            text_obj = entry.get("text")
            if isinstance(text_obj, dict) and "value" in text_obj:
                return text_obj["value"]
    return None


