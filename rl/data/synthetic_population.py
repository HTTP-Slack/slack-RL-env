"""Utilities for seeding the Slack clone with synthetic data."""

from __future__ import annotations

from typing import Dict, Iterable, List

from structlog import get_logger

from rl.config.settings import Settings
from rl.data.api_client import Credentials, SlackApiClient
from rl.data.planner import WorkspacePlanGenerator
from rl.data.specs import ChannelSpec, SyntheticWorkspacePlan, UserSpec


LOGGER = get_logger(__name__)


class SyntheticWorkspacePopulator:
    """Executes workspace plans by calling the backend APIs."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._plan_generator = WorkspacePlanGenerator(settings)

    def generate_plan(self, *, seed: int | None = None, context: str | None = None) -> SyntheticWorkspacePlan:
        return self._plan_generator.generate(seed=seed, context=context)

    def populate(self, plan: SyntheticWorkspacePlan) -> Dict[str, object]:
        LOGGER.info("synthetic.populate.start", workspace=plan.workspace_name)
        plan = self._ensure_owner_user(plan)

        owner_credentials = Credentials(
            email=self._settings.slack.default_email,
            password=self._settings.slack.default_password,
        )

        summary: Dict[str, object] = {"workspace": plan.workspace_name, "channels": []}

        with SlackApiClient(self._settings, credentials=owner_credentials) as owner_client:
            owner_client.ensure_authenticated()
            workspace = owner_client.create_workspace(plan.workspace_name)
            organisation_id = workspace.get("_id") or workspace.get("id")
            if not organisation_id:
                raise RuntimeError("Workspace creation did not return an identifier")

            LOGGER.info("synthetic.workspace.created", id=organisation_id)
            summary["organisation_id"] = organisation_id

            self._register_additional_users(owner_client, plan.users)
            self._add_users_to_workspace(owner_client, organisation_id, plan.users)

            channel_results = []
            client_cache: Dict[str, SlackApiClient] = {}
            try:
                for channel_spec in plan.channels:
                    channel = owner_client.create_channel(organisation_id, channel_spec.name)
                    channel_id = channel.get("_id") or channel.get("id")
                    if not channel_id:
                        raise RuntimeError("Channel creation did not return an identifier")

                    LOGGER.info(
                        "synthetic.channel.created",
                        channel=channel_spec.name,
                        channel_id=channel_id,
                    )

                    self._add_channel_members(owner_client, channel_id, channel_spec.members)

                    messages_summary = []
                    for message in channel_spec.messages:
                        user_spec = plan.get_user(message.author_email)
                        if user_spec is None:
                            LOGGER.warning(
                                "synthetic.message.skipped",
                                reason="unknown_user",
                                author=message.author_email,
                                channel=channel_spec.name,
                            )
                            continue

                        user_client = self._get_or_create_user_client(client_cache, user_spec)
                        
                        # Upload files first if any
                        attachment_ids = []
                        for attachment in message.attachments:
                            if attachment.content_bytes:
                                try:
                                    file_response = user_client.upload_file(
                                        organisation_id,
                                        channel_id=channel_id,
                                        conversation_id=None,
                                        filename=attachment.filename,
                                        content=attachment.content_bytes,
                                        content_type=attachment.content_type,
                                    )
                                    file_id = file_response.get("_id") or file_response.get("id")
                                    if file_id:
                                        attachment_ids.append(file_id)
                                        LOGGER.info(
                                            "synthetic.file.uploaded",
                                            filename=attachment.filename,
                                            file_id=file_id,
                                        )
                                except Exception as exc:
                                    LOGGER.warning(
                                        "synthetic.file.upload_failed",
                                        filename=attachment.filename,
                                        error=str(exc),
                                    )
                        
                        # Post message with attachments
                        response = user_client.post_channel_message(
                            organisation_id,
                            channel_id,
                            message.content,
                            attachment_ids=attachment_ids if attachment_ids else None,
                        )
                        message_id = response.get("_id") or response.get("id")
                        
                        # Add reactions
                        for reaction in message.reactions:
                            for reactor_email in reaction.reacted_by_emails:
                                reactor_spec = plan.get_user(reactor_email)
                                if reactor_spec:
                                    reactor_client = self._get_or_create_user_client(client_cache, reactor_spec)
                                    try:
                                        reactor_client.add_reaction(message_id, reaction.emoji)
                                    except Exception as exc:
                                        LOGGER.warning(
                                            "synthetic.reaction.failed",
                                            emoji=reaction.emoji,
                                            error=str(exc),
                                        )
                        
                        # Add thread replies (simplified - would need message API for threads)
                        # For now, we log them but don't create actual threads
                        if message.thread_replies:
                            LOGGER.info(
                                "synthetic.thread.queued",
                                message_id=message_id,
                                reply_count=len(message.thread_replies),
                            )
                        
                        messages_summary.append(
                            {
                                "id": message_id,
                                "has_attachments": len(attachment_ids) > 0,
                                "reaction_count": sum(len(r.reacted_by_emails) for r in message.reactions),
                                "thread_reply_count": len(message.thread_replies),
                                "is_task_oriented": message.is_task_oriented,
                            }
                        )

                    channel_results.append(
                        {
                            "name": channel_spec.name,
                            "id": channel_id,
                            "messages": messages_summary,
                        }
                    )
            finally:
                for cached_client in client_cache.values():
                    cached_client.close()

            summary["channels"] = channel_results

        LOGGER.info("synthetic.populate.complete", workspace=plan.workspace_name)
        return summary

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _ensure_owner_user(self, plan: SyntheticWorkspacePlan) -> SyntheticWorkspacePlan:
        if plan.get_user(self._settings.slack.default_email):
            return plan

        owner = UserSpec(
            username="Agent",
            email=self._settings.slack.default_email,
            password=self._settings.slack.default_password,
        )
        updated_users = [owner, *plan.users]
        return plan.model_copy(update={"users": updated_users})

    def _register_additional_users(self, owner_client: SlackApiClient, users: Iterable[UserSpec]) -> None:
        for user in users:
            if user.email == owner_client.credentials.email:
                continue
            created = owner_client.register_user(user.username, user.email, user.password)
            status = "created" if created else "exists"
            LOGGER.info("synthetic.user.ensure", email=user.email, status=status)

    def _add_users_to_workspace(
        self,
        owner_client: SlackApiClient,
        organisation_id: str,
        users: Iterable[UserSpec],
    ) -> None:
        emails = [user.email for user in users if user.email != owner_client.credentials.email]
        if emails:
            owner_client.add_coworkers(organisation_id, emails)

    def _add_channel_members(self, owner_client: SlackApiClient, channel_id: str, members: List[str]) -> None:
        additional = [email for email in members if email != owner_client.credentials.email]
        if additional:
            owner_client.add_users_to_channel(channel_id, additional)

    def _get_or_create_user_client(
        self,
        cache: Dict[str, SlackApiClient],
        user: UserSpec,
    ) -> SlackApiClient:
        client = cache.get(user.email)
        if client is None:
            client = SlackApiClient(self._settings, credentials=Credentials(email=user.email, password=user.password))
            client.ensure_authenticated()
            cache[user.email] = client
        return client

