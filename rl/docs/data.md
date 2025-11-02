## Synthetic Data Toolkit

The data toolkit bootstraps realistic Slack-like workspaces so RL agents can train against non-empty timelines with rich content including markdown, files, reactions, and threads.

### Components
- `data/specs.py` – Pydantic models describing users, channels, messages, files, reactions, and threads.
- `data/rich_content.py` – Generates realistic messages with markdown, file attachments, reactions, and thread replies.
- `data/planner.py` – Optional LLM integration with a deterministic fallback generator.
- `data/api_client.py` – Authenticated HTTP client for the Slack clone backend (supports file uploads and reactions).
- `data/synthetic_population.py` – Orchestrates plan execution via API calls.
- `scripts/bootstrap_workspace.py` – CLI entrypoint for generating workspaces.

### Quickstart
```bash
cd rl
source .venv/bin/activate
python -m rl.scripts.bootstrap_workspace --seed 42
```

The command will:
1. Generate a workspace plan (LLM if configured, otherwise the offline fallback).
2. Log in using `SLACK_RL_SLACK__DEFAULT_EMAIL` and create a workspace.
3. Register additional synthetic teammates if needed.
4. Add them to the workspace and relevant channels.
5. Post rich messages with markdown, files, reactions, and threads.

Use `--dry-run` to print the generated plan without mutating the backend. Supply `--plan-file path/to/plan.json` to replay a saved plan verbatim.

### Rich Features Generated

#### Markdown Messages
- **Bold**, *italic*, __underline__, ~~strikethrough~~
- `Inline code` and code blocks with syntax highlighting
- Links, blockquotes, ordered/bullet lists
- Tables (via code blocks)
- **10+ markdown templates** covering various use cases

#### File Attachments
- **Images**: PNG (synthetic 800x600 images generated with Pillow)
- **Documents**: PDF, DOCX, XLSX, PPTX
- **Data**: CSV, plain text
- **Media**: MP4, MP3 (placeholder content)

#### Reactions
- Emoji reactions (👍, ❤️, 🎉, 🚀, ✅, 👏, 🔥, 💯)
- Multiple users reacting to messages
- Realistic distribution across channel members

#### Thread Replies
- Contextual replies to messages
- Replies can have their own reactions
- Multi-participant conversations

#### Task-Oriented Content
Messages marked `is_task_oriented: true` include:
- Code snippets for debugging tasks
- Checklists for task completion
- API documentation for integration
- Status reports with structured data

See `RICH_FEATURES.md` for detailed examples and usage.

### LLM Configuration
- Set `SLACK_RL_LLM__API_KEY` and optionally `SLACK_RL_LLM__BASE_URL` to enable LLM-backed plans.
- Without credentials the generator falls back to a deterministic plan so tests remain reproducible.

### Safety Notes
- The HTTP client uses authenticated cookies, so run the CLI only against trusted environments.
- User registration treats duplicate emails as a no-op to support idempotent runs.
- Channel membership is synchronized automatically based on the plan.


