## SlackUIEnv Walkthrough

`SlackUIEnv` is a Gymnasium-compatible environment that operates the Slack clone through Playwright. This guide covers the lifecycle of reset/step calls, observation encoding, and reward plumbing.

### Source Files
- `env/slack_ui_env.py` – environment implementation and Gym interface.
- `env/actions.py` – high-level action registry invoked during `env.step`.
- `env/observation.py` – utilities that transform DOM state into observations.
- `env/playwright_driver.py` – lifecycle helper for Playwright browsers.
- `env/errors.py` – domain-specific exception hierarchy.

### Reset Sequence
1. Launch a Playwright browser context (Chromium by default).
2. Navigate to the Slack clone sign-in page and authenticate using credentials from environment variables or the task payload.
3. Optionally seed the workspace by invoking synthetic data routines before task execution.
4. Capture the initial observation, which includes rendered UI metadata and any task hints.

### Observation Interface
Observations are returned as a dictionary with the following keys:
- `timeline` – Parsed message/thread metadata for the active channel.
- `ui_state` – High-level snapshot of focusable elements, modals, and navigation context.
- `task_context` – Serialized task description, acceptance criteria, and reward shaping hints.
- `browser` – Debug information such as current URL, viewport size, and Playwright locator handles (hashed).

All observations are designed to remain serializable via `orjson` for logging and replay.

### Action Interface
Agents operate over a `Discrete` action space with an accompanying payload structure:
- `action_id` selects from a registry of high-level UI macros (e.g., open channel switcher, send message, upload file).
- `parameters` supply text or locator overrides. Validation is handled by pydantic models.
Low-level Playwright interactions (click/type/press) are encapsulated in `env/actions.py` to ensure deterministic execution.

### Reward Hooks
`SlackUIEnv` supports layered reward components through task validators:
- **Task Reward** – Provided by the active task specification once success criteria are met.
- **Shaping Reward** – Optional heuristics such as penalizing repeated invalid actions or rewarding state transitions.
- **Safety Penalties** – Triggered on timeouts, navigation errors, or environment crashes.

Developers can extend rewards via environment wrappers located in `env/wrappers.py`.

### Episode Termination
Episodes terminate when any of the following conditions are met:
- Task reports success or failure.
- Step count exceeds `config.runtime.max_steps`.
- Browser session becomes invalid (e.g., unexpected navigation, console error).

### Logging and Tracing
- Structured logs are emitted through `structlog` with correlation IDs tied to rollout IDs.
- Screenshots and DOM snapshots may be captured for debugging when `config.runtime.capture_debug_artifacts` is true.
- Trajectories are written to parquet/JSONL via `env/replay.py` for downstream training.

Consult `env/slack_ui_env.py` for inline documentation, `env/actions.py` for the list of registered actions, and `docs/evaluation.md` for how rollout artifacts feed into benchmarking.

