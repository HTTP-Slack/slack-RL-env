"""Application-wide configuration models."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class RuntimeSettings(BaseSettings):
    """Runtime configuration for environment rollouts."""

    max_steps: int = 120
    step_timeout_seconds: float = 15.0
    browser: Literal["chromium", "firefox", "webkit"] = "chromium"
    headless: bool = True
    capture_debug_artifacts: bool = False
    screenshot_dir: Path = Path("./evals/artifacts")

    model_config = SettingsConfigDict(env_prefix="SLACK_RL_RUNTIME_")


class SlackSettings(BaseSettings):
    """Slack clone connectivity settings."""

    base_url: str = "http://localhost:3000"
    api_base_url: str = "http://localhost:8080/api"
    default_email: str = "agent@example.com"
    default_password: str = "password"

    model_config = SettingsConfigDict(env_prefix="SLACK_RL_SLACK_")


class LLMSettings(BaseSettings):
    """Configuration for LLM calls used during training and data generation."""

    provider: Literal["openai", "anthropic", "azure", "litellm"] = "openai"
    model: str = "gpt-4o-mini"
    api_key: str | None = None
    base_url: str | None = None
    request_timeout_seconds: float = 60.0

    model_config = SettingsConfigDict(env_prefix="SLACK_RL_LLM_", env_file=".env", env_file_encoding="utf-8")


class Settings(BaseSettings):
    """Top-level container aggregating workspace settings."""

    runtime: RuntimeSettings = RuntimeSettings()
    slack: SlackSettings = SlackSettings()
    llm: LLMSettings = LLMSettings()

    model_config = SettingsConfigDict(env_nested_delimiter="__")


settings = Settings()


