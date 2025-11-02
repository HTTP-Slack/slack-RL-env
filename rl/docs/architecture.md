## Architecture Overview

This document outlines how the RL workspace orchestrates agents, the browser automation layer, and the Slack clone services.

### High-Level Flow
1. **Task Selection** – A task specification is sampled from `tasks/` defining the user goal (e.g., create a channel, send a message).
2. **Environment Reset** – `SlackUIEnv` launches a fresh Playwright browser context, authenticates via the Slack clone UI, and prepares the workspace state.
3. **Agent Rollout** – A policy issues high-level UI actions. The environment converts these into Playwright operations (clicks, text input, navigation) and returns structured observations.
4. **Reward Logging** – Reward functions combine task-specific signals, heuristic shaping, and environment-level safety constraints.
5. **Trajectory Storage** – Rollout data is persisted for training, evaluation, and replay.
6. **Policy Update** – The training loop consumes stored trajectories to improve the agent according to the configured algorithm.
7. **Benchmarking** – Completed policies are validated against the task suite with deterministic seeds and evaluation-only rewards.

### Key Components
- `env/slack_ui_env.py` – Core Gymnasium environment controlling the browser, observation encoding, reward hooks, and logging.
- `agents/` – Implementations of policy optimization, value estimation, and LLM-assisted decision making.
- `data/synthetic_population.py` – Utilities to generate Slack-like workspace state through API calls or LLM templated data.
- `tasks/registry.py` – Declarative definitions of tasks, success metrics, and curriculum grouping.
- `evals/benchmarks.py` – Batch evaluation runner producing aggregate metrics and rich reports.
- `scripts/` – CLI interfaces for bootstrapping data, running rollouts, training, and benchmarking.

### Extensibility Principles
- **Isolation** – All RL-specific code, dependencies, and documentation remain inside `rl/` to avoid coupling with production services.
- **Configurability** – Runtime behavior is controlled through `config/` and YAML/JSON artifacts, making experiments reproducible.
- **Interfaces First** – Environments, agents, and tasks expose protocols and abstract base classes so new behaviors plug in without changing core logic.
- **Observability** – Structured logging, metrics, and replay storage ensure debugging and evaluation remain transparent.

### External Dependencies
- Slack clone backend (REST/WebSocket) for authentication and business logic.
- Slack clone frontend served locally for Playwright-driven UI automation.
- Optional LLM provider (OpenAI-compatible) for synthetic data generation and policy updates.

See `docs/environment.md` for detailed environment diagrams and `docs/evaluation.md` for benchmarking workflows.


