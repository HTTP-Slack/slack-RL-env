## Slack UI Reinforcement Learning Workspace

This `rl/` workspace contains everything required to train, evaluate, and benchmark agents that operate the Slack clone UI through full browser automation. The codebase is intentionally isolated from the existing backend/frontend implementations so experimentation can happen without touching production code.

### Capabilities
- Gymnasium-compatible environment driven by Playwright.
- Synthetic Slack-like data generation and workspace bootstrapping utilities.
- LLM-centric self-training loops with configurable hyperparameters and reward shaping.
- Task prompt registry, benchmarking harnesses, and evaluation reports.
- Extensive documentation that mirrors the lifecycle of training a browser agent end-to-end.

### Directory Layout
- `agents/` – policy definitions, training loops, replay buffers, and optimizer utilities.
- `config/` – centralized configuration, constants, and hyperparameter definitions.
- `data/` – synthetic data population scripts, API clients, and dataset schemas.
- `docs/` – architecture notes, environment walkthroughs, evaluation guides.
- `env/` – Gymnasium environment, wrappers, and observation/action abstractions.
- `evals/` – benchmarking runners, success metrics, and report generation.
- `scripts/` – CLI entrypoints for training, data population, and diagnostics.
- `tasks/` – task specifications, prompt templates, and success evaluators.
- `tests/` – unit and integration tests for the RL pipeline.

### Getting Started

**New to this?** → Start with [`QUICKSTART.md`](QUICKSTART.md) for a step-by-step guide.

**Quick setup:**
1. Install Python 3.11+ and Node.js (required by Playwright for browser binaries).
2. Create a virtual environment and install dependencies using `pip install -r requirements.txt`.
3. Run `playwright install chromium` to download browsers for automation.
4. Set up `.env` file with your Slack clone credentials (see `QUICKSTART.md`).
5. Run `python -m scripts.run_env rollout --steps 3` to test the environment.

For detailed architecture and environment documentation, see `docs/architecture.md` and `docs/environment.md`.

### Next Steps
- Use `scripts/bootstrap_workspace.py` to populate synthetic workspaces for local experimentation.
- Run `scripts/run_env.py --task send_message` to execute a single rollout in the browser.
- Execute `scripts/train_agent.py --config configs/default.yaml` to start a full training session.
- Generate benchmarking reports with `scripts/run_benchmarks.py` after training checkpoints are available.

All scripts include `--help` flags with additional usage details. Documentation within `docs/` mirrors the expected workflow and should be consulted before extending the environment.

