"""Data models describing synthetic workspace plans."""

from __future__ import annotations

from pathlib import Path
from typing import List, Literal

from pydantic import BaseModel, Field


class UserSpec(BaseModel):
    """Description of a synthetic user to seed into the workspace."""

    username: str
    email: str
    password: str = Field(default="Passw0rd!123")


class FileAttachmentSpec(BaseModel):
    """Specification for a file attachment to include in a message."""

    filename: str
    content_type: Literal[
        "image/png",
        "image/jpeg",
        "image/gif",
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "video/mp4",
        "audio/mpeg",
    ]
    content_bytes: bytes | None = None
    description: str | None = None


class ReactionSpec(BaseModel):
    """Reaction to add to a message."""

    emoji: str
    reacted_by_emails: List[str] = Field(default_factory=list)


class ThreadReplySpec(BaseModel):
    """Thread reply to attach to a message."""

    author_email: str
    content: str
    reactions: List[ReactionSpec] = Field(default_factory=list)


class ChannelMessageSpec(BaseModel):
    """Message content authored by a specific user."""

    author_email: str
    content: str
    attachments: List[FileAttachmentSpec] = Field(default_factory=list)
    reactions: List[ReactionSpec] = Field(default_factory=list)
    thread_replies: List[ThreadReplySpec] = Field(default_factory=list)
    is_task_oriented: bool = Field(
        default=False,
        description="Whether this message contains task-oriented markdown (code, checklists, etc.)",
    )


class ChannelSpec(BaseModel):
    """Channel definition including member roster and sample messages."""

    name: str
    topic: str | None = None
    members: List[str] = Field(default_factory=list)
    messages: List[ChannelMessageSpec] = Field(default_factory=list)


class SyntheticWorkspacePlan(BaseModel):
    """Full plan for generating a synthetic Slack-like workspace."""

    workspace_name: str
    description: str | None = None
    users: List[UserSpec] = Field(default_factory=list)
    channels: List[ChannelSpec] = Field(default_factory=list)

    def all_user_emails(self) -> set[str]:
        return {user.email for user in self.users}

    def get_user(self, email: str) -> UserSpec | None:
        for user in self.users:
            if user.email.lower() == email.lower():
                return user
        return None

    @classmethod
    def from_json(cls, payload: str) -> "SyntheticWorkspacePlan":
        return cls.model_validate_json(payload)

    @classmethod
    def from_file(cls, path: Path) -> "SyntheticWorkspacePlan":
        data = path.read_text(encoding="utf-8")
        return cls.from_json(data)

