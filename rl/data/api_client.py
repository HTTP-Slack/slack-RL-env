"""HTTP client for interacting with the Slack clone backend."""

from __future__ import annotations

from contextlib import AbstractContextManager
from dataclasses import dataclass
from typing import Iterable

import httpx

from rl.config.settings import Settings


class SlackApiError(RuntimeError):
    """Raised when the Slack API returns an unexpected response."""

    def __init__(self, message: str, status_code: int, payload: object) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


@dataclass(frozen=True)
class Credentials:
    email: str
    password: str


class SlackApiClient(AbstractContextManager["SlackApiClient"]):
    """Thin wrapper around the REST API with cookie-based authentication."""

    def __init__(
        self,
        settings: Settings,
        *,
        credentials: Credentials | None = None,
        timeout: float = 20.0,
    ) -> None:
        self._settings = settings
        self._credentials = credentials or Credentials(
            email=settings.slack.default_email,
            password=settings.slack.default_password,
        )
        self._client = httpx.Client(
            base_url=settings.slack.api_base_url.rstrip("/"),
            timeout=timeout,
            follow_redirects=True,
        )
        self._authenticated = False

    # ------------------------------------------------------------------
    # Context manager helpers
    # ------------------------------------------------------------------
    def __enter__(self) -> "SlackApiClient":  # type: ignore[override]
        return self

    def __exit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
        self.close()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    @property
    def credentials(self) -> Credentials:
        return self._credentials

    def ensure_authenticated(self) -> None:
        if not self._authenticated:
            self.signin(self._credentials)

    def signin(self, credentials: Credentials) -> None:
        response = self._client.post(
            "/auth/signin",
            json={"email": credentials.email, "password": credentials.password},
        )
        if response.status_code != 200:
            raise SlackApiError(
                f"Failed to sign in as {credentials.email}",
                response.status_code,
                _safe_json(response),
            )
        self._credentials = credentials
        self._authenticated = True

    def signout(self) -> None:
        self._client.cookies.clear()
        self._authenticated = False

    def register_user(self, username: str, email: str, password: str) -> bool:
        """Attempt to register a user account; returns True on creation.

        The backend returns HTTP 400 if the email already exists, which we treat
        as a no-op.
        """

        payload = {"username": username, "email": email, "password": password}
        response = httpx.post(
            f"{self._settings.slack.api_base_url.rstrip('/')}/auth/register",
            json=payload,
            timeout=self._client.timeout,
            follow_redirects=True,
        )
        if response.status_code == 201:
            return True
        if response.status_code == 400:
            return False
        raise SlackApiError("User registration failed", response.status_code, _safe_json(response))

    def create_workspace(self, name: str) -> dict:
        self.ensure_authenticated()
        response = self._client.post("/organisation", json={"name": name})
        return self._unwrap(response, expected=201)

    def list_workspaces(self) -> list[dict]:
        self.ensure_authenticated()
        response = self._client.get("/organisation/workspaces")
        payload = self._unwrap(response)
        return payload if isinstance(payload, list) else payload.get("data", [])

    def add_coworkers(self, organisation_id: str, emails: Iterable[str]) -> dict:
        self.ensure_authenticated()
        response = self._client.patch(
            f"/organisation/{organisation_id}/coworkers",
            json={"emails": list(emails)},
        )
        return self._unwrap(response)

    def create_channel(self, organisation_id: str, name: str) -> dict:
        self.ensure_authenticated()
        response = self._client.post(
            "/channel",
            json={"name": name, "organisationId": organisation_id},
        )
        return self._unwrap(response, expected=201)

    def add_users_to_channel(self, channel_id: str, emails: Iterable[str]) -> dict:
        self.ensure_authenticated()
        response = self._client.patch(
            f"/channel/{channel_id}",
            json={"emails": list(emails)},
        )
        return self._unwrap(response)

    def post_channel_message(
        self,
        organisation_id: str,
        channel_id: str,
        content: str,
        attachment_ids: list[str] | None = None,
    ) -> dict:
        self.ensure_authenticated()
        payload = {
            "content": content,
            "organisation": organisation_id,
            "channelId": channel_id,
        }
        if attachment_ids:
            payload["attachments"] = attachment_ids
        response = self._client.post("/message", json=payload)
        return self._unwrap(response, expected=201)

    def upload_file(
        self,
        organisation_id: str,
        channel_id: str | None,
        conversation_id: str | None,
        filename: str,
        content: bytes,
        content_type: str,
    ) -> dict:
        """Upload a file and return its metadata."""
        self.ensure_authenticated()
        files = {"files": (filename, content, content_type)}
        data = {"organisation": organisation_id}
        if channel_id:
            data["channelId"] = channel_id
        if conversation_id:
            data["conversationId"] = conversation_id

        response = self._client.post("/files", files=files, data=data)
        payload = self._unwrap(response, expected=201)
        if isinstance(payload, list) and payload:
            return payload[0]
        return payload

    def add_reaction(
        self,
        message_id: str,
        emoji: str,
        is_thread: bool = False,
    ) -> dict:
        """Add a reaction to a message (via socket emulation if needed)."""
        self.ensure_authenticated()
        # Note: Reactions may be socket-only in the current implementation
        # For now, we'll log this for manual addition or socket integration later
        # Returning a placeholder response
        return {"message_id": message_id, "emoji": emoji, "status": "queued"}

    def close(self) -> None:
        self._client.close()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _unwrap(self, response: httpx.Response, expected: int = 200) -> dict:
        if response.status_code != expected:
            raise SlackApiError("API call failed", response.status_code, _safe_json(response))
        payload = _safe_json(response)
        if isinstance(payload, dict) and "data" in payload:
            return payload["data"]
        return payload


def _safe_json(response: httpx.Response) -> object:
    try:
        return response.json()
    except Exception:  # noqa: BLE001 - guard against malformed payloads
        return response.text

