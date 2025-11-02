"""Rich content generators for synthetic Slack data."""

from __future__ import annotations

import base64
import io
import random
from typing import List

from PIL import Image

from rl.data.specs import (
    ChannelMessageSpec,
    FileAttachmentSpec,
    ReactionSpec,
    ThreadReplySpec,
)


class RichContentGenerator:
    """Generates realistic Slack messages with markdown, files, reactions, and threads."""

    MARKDOWN_TEMPLATES = [
        # Task-oriented: Code snippets
        """Here's the fix for the bug:

```python
def process_payment(amount: float) -> bool:
    if amount <= 0:
        raise ValueError("Amount must be positive")
    return charge_card(amount)
```

This should resolve the issue! 🎉""",
        # Task-oriented: Checklist
        """**Sprint Planning Checklist:**

- [ ] Review user stories
- [ ] Estimate complexity
- [ ] Assign owners
- [ ] Set up tracking

Let's start with the first item.""",
        # Task-oriented: API documentation
        """**API Endpoint:** `/api/users/{id}`

**Method:** `GET`

**Response:**
```json
{
  "id": "123",
  "username": "alice",
  "email": "alice@example.com"
}
```""",
        # Rich formatting: Bold, italic, links
        """**Important Update:** We're releasing version *2.0* next week!

Check out the [release notes](https://example.com/releases) for details.

> This is a major milestone for our team! 🚀""",
        # Mixed formatting
        """Hey team! 👋

Here's what we accomplished:
- ✅ Fixed the authentication bug
- ✅ Added new endpoints
- 🔄 Still working on: Performance optimization

**Next steps:** Review the code and test thoroughly.""",
        # Code block with explanation
        """I found the issue! The problem is in the validation logic:

```javascript
if (value && value.length > 0) {
    // This doesn't handle null properly
    return process(value);
}
```

We should use `value?.length` instead.""",
        # Markdown table (as code block)
        """Here's the status report:

| Task | Status | Owner |
|------|--------|-------|
| Feature A | ✅ Done | Alice |
| Feature B | 🔄 In Progress | Bob |
| Feature C | 📋 Planned | Carol |""",
        # Strikethrough and formatting
        """~~Old approach~~ **New approach:**

We're moving from the legacy system to a modern architecture. The benefits include:
- *Better performance*
- __More reliable__
- `Easier to maintain`

Let me know if you have questions!""",
        # Complex nested lists
        """**Quarterly Goals:**

1. Product Launch
   - Finalize features
   - Beta testing
   - Documentation
2. Team Growth
   - Hire 2 engineers
   - Onboarding process
   - Training materials""",
        # Link with context
        """Check out this [awesome article](https://example.com/article) about best practices.

> The key takeaway is that we should focus on user experience first.

What do you think? 🤔""",
    ]

    REACTION_COMBINATIONS = [
        ["👍", "❤️"],
        ["🎉", "🚀"],
        ["✅", "👏"],
        ["🔥", "💯"],
        ["😊", "👍"],
        ["🎯", "✨"],
    ]

    def generate_rich_message(
        self,
        author_email: str,
        *,
        use_markdown: bool = True,
        include_file: bool = False,
        include_reactions: bool = True,
        include_thread: bool = False,
        task_oriented: bool = False,
        rng: random.Random | None = None,
        available_emails: List[str] | None = None,
    ) -> ChannelMessageSpec:
        """Generate a message with optional rich features."""
        if rng is None:
            rng = random.Random()

        if task_oriented:
            content = rng.choice(
                [
                    t
                    for t in self.MARKDOWN_TEMPLATES
                    if "```" in t or "checklist" in t.lower() or "api" in t.lower()
                ]
            )
        elif use_markdown:
            content = rng.choice(self.MARKDOWN_TEMPLATES)
        else:
            content = self._generate_plain_message(rng)

        attachments: List[FileAttachmentSpec] = []
        if include_file:
            attachments.append(self._generate_file_attachment(rng))

        reactions: List[ReactionSpec] = []
        if include_reactions and rng.random() > 0.3:
            reactions = self._generate_reactions(rng, available_emails)

        thread_replies: List[ThreadReplySpec] = []
        if include_thread and rng.random() > 0.5:
            thread_replies = [self._generate_thread_reply(rng, available_emails)]

        return ChannelMessageSpec(
            author_email=author_email,
            content=content,
            attachments=attachments,
            reactions=reactions,
            thread_replies=thread_replies,
            is_task_oriented=task_oriented,
        )

    def _generate_plain_message(self, rng: random.Random) -> str:
        templates = [
            "Hey team! How's everyone doing?",
            "Quick update: We're making good progress.",
            "Thanks for the help earlier! 🙏",
            "Can someone review this PR?",
            "Let's sync up tomorrow morning.",
            "Great work on the latest release!",
        ]
        return rng.choice(templates)

    def _generate_file_attachment(self, rng: random.Random) -> FileAttachmentSpec:
        file_types = [
            ("screenshot.png", "image/png"),
            ("document.pdf", "application/pdf"),
            ("data.csv", "text/plain"),
            ("presentation.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            ("spreadsheet.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        ]
        filename, content_type = rng.choice(file_types)

        if content_type.startswith("image/"):
            content_bytes = self._generate_synthetic_image(rng)
        elif content_type == "application/pdf":
            content_bytes = self._generate_synthetic_pdf(rng)
        elif content_type == "text/plain":
            content_bytes = self._generate_synthetic_text(rng)
        else:
            content_bytes = b"fake content"

        return FileAttachmentSpec(
            filename=filename,
            content_type=content_type,
            content_bytes=content_bytes,
        )

    def _generate_synthetic_image(self, rng: random.Random) -> bytes:
        """Generate a simple PNG image."""
        img = Image.new("RGB", (800, 600), color=(rng.randint(200, 255), rng.randint(200, 255), rng.randint(200, 255)))
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()

    def _generate_synthetic_pdf(self, rng: random.Random) -> bytes:
        """Generate a minimal PDF (fake)."""
        return b"%PDF-1.4\nfake pdf content\n%%EOF"

    def _generate_synthetic_text(self, rng: random.Random) -> bytes:
        """Generate synthetic CSV/text content."""
        lines = [
            "Name,Email,Role",
            "Alice,alice@example.com,Engineer",
            "Bob,bob@example.com,Designer",
            "Carol,carol@example.com,Manager",
        ]
        return "\n".join(lines).encode("utf-8")

    def _generate_reactions(self, rng: random.Random, available_emails: List[str] | None = None) -> List[ReactionSpec]:
        """Generate 1-3 reactions."""
        num_reactions = rng.randint(1, 3)
        combo = rng.choice(self.REACTION_COMBINATIONS)
        reactions = []
        for emoji in combo[:num_reactions]:
            # Use placeholder emails - will be replaced with actual member emails during plan generation
            num_reactors = rng.randint(1, 3)
            if available_emails:
                reactors = rng.sample(available_emails, min(num_reactors, len(available_emails)))
            else:
                reactors = [f"user{i}@example.com" for i in range(1, num_reactors + 1)]
            reactions.append(ReactionSpec(emoji=emoji, reacted_by_emails=reactors))
        return reactions

    def _generate_thread_reply(self, rng: random.Random, available_emails: List[str] | None = None) -> ThreadReplySpec:
        """Generate a thread reply."""
        replies = [
            "Good point! Let me clarify...",
            "I agree with this approach.",
            "We should also consider...",
            "This is exactly what we needed!",
        ]
        content = rng.choice(replies)
        reactions = []
        if rng.random() > 0.6:
            reactions = self._generate_reactions(rng, available_emails)
        author_email = rng.choice(available_emails) if available_emails else f"user{rng.randint(1, 3)}@example.com"
        return ThreadReplySpec(
            author_email=author_email,
            content=content,
            reactions=reactions,
        )


__all__ = ["RichContentGenerator"]

