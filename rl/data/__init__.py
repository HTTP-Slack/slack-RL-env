"""Synthetic data generation, dataset schemas, and utilities."""

from .api_client import SlackApiClient, Credentials
from .planner import WorkspacePlanGenerator
from .rich_content import RichContentGenerator
from .specs import (
    ChannelMessageSpec,
    ChannelSpec,
    FileAttachmentSpec,
    ReactionSpec,
    SyntheticWorkspacePlan,
    ThreadReplySpec,
    UserSpec,
)
from .synthetic_population import SyntheticWorkspacePopulator

__all__ = [
    "SlackApiClient",
    "Credentials",
    "WorkspacePlanGenerator",
    "RichContentGenerator",
    "SyntheticWorkspacePlan",
    "UserSpec",
    "ChannelSpec",
    "ChannelMessageSpec",
    "FileAttachmentSpec",
    "ReactionSpec",
    "ThreadReplySpec",
    "SyntheticWorkspacePopulator",
]

