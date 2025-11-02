## Evaluation and Benchmarking

The evaluation stack provides reproducible metrics for Slack UI agents. It is structured to mirror how a human operator would complete end-to-end tasks.

### Benchmark Suite
- Benchmarks are defined in `evals/benchmarks.py` and consume task bundles from `tasks/registry.py`.
- Each benchmark specifies:
  - Task set and curriculum ordering.
  - Number of episodes per task and random seeds.
  - Reward components to report (task success, shaping, penalties).
  - Output directory for JSONL traces, screenshots, and summary artifacts.

### Metrics
- **Success Rate** – Percentage of episodes fulfilling task acceptance criteria.
- **Cumulative Reward** – Sum of raw reward values (task + shaping + penalties).
- **Latency** – Wall-clock time to complete each task and average action latency.
- **Intervention Count** – Number of human or scripted interventions needed (should remain zero during evaluation).
- **Error Taxonomy** – Categorized failure reasons (navigation, validation, backend error, timeout).

### Reporting
- `evals/reporting.py` generates Markdown and HTML snapshots summarizing benchmark runs.
- Optional integration with `rich` renders tables directly to the terminal.
- `docs/templates/eval_report.md.j2` (to be added) can be used for narrative reports.

### Workflow
1. Train or load a policy checkpoint.
2. Run `scripts/run_benchmarks.py --policy path/to.ckpt --benchmark default`.
3. Inspect generated artifacts in `evals/artifacts/<timestamp>`.
4. Compare results across checkpoints or hyperparameter sweeps via `scripts/compare_benchmarks.py`.

### Evals for CI
- Lightweight smoke tests can be executed in headless mode with reduced step counts to ensure regressions are caught.
- Full benchmarks should run on dedicated hardware with GPU acceleration when using neural policies.

Refer to `docs/environment.md` for environment internals and `docs/architecture.md` for the full pipeline context.


