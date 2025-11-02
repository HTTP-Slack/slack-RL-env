"""CLI for generating synthetic Slack workspaces via the backend APIs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import typer

from rl.config.settings import Settings
from rl.data.synthetic_population import SyntheticWorkspacePopulator
from rl.data.specs import SyntheticWorkspacePlan


app = typer.Typer(add_completion=False)


@app.command()
def workspace(
    plan_file: Optional[Path] = typer.Option(None, help="Path to a JSON plan describing the workspace."),
    seed: Optional[int] = typer.Option(None, help="Optional random seed for plan generation."),
    context: Optional[str] = typer.Option(None, help="Extra context to bias LLM generation."),
    dry_run: bool = typer.Option(False, help="Print the plan without executing it."),
) -> None:
    """Populate the Slack clone with synthetic users, channels, and messages."""

    settings = Settings()
    populator = SyntheticWorkspacePopulator(settings)

    if plan_file:
        plan = SyntheticWorkspacePlan.from_file(plan_file)
    else:
        plan = populator.generate_plan(seed=seed, context=context)

    if dry_run:
        typer.echo(json.dumps(plan.model_dump(mode="json"), indent=2))
        return

    summary = populator.populate(plan)
    typer.echo(json.dumps(summary, indent=2))


if __name__ == "__main__":
    app()


