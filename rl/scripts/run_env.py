"""Manual driver for experimenting with the Slack UI environment."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Optional

import typer

from rl.env import SlackUIEnv
from rl.tasks.specs import AcceptanceCriteria, TaskInstance, TaskSpec


app = typer.Typer(add_completion=False)


def _default_task() -> TaskInstance:
    spec = TaskSpec(
        name="send_hello",
        goal="Send a greeting message in the default conversation.",
        hints=[
            "Use the message composer at the bottom of the chat pane.",
            "Press enter to send the message.",
        ],
        acceptance_criteria=AcceptanceCriteria(
            description="Reward success once the message composer is used.",
            validator=lambda signals: 1.0 if signals.get("action_result", {}).get("status") == "sent" else 0.0,
        ),
    )
    return TaskInstance(spec=spec, seed=0)


@app.command()
def rollout(steps: int = typer.Option(5, help="Number of interactive steps to run.")) -> None:
    """Run an interactive rollout with console input for quick debugging."""

    env = SlackUIEnv(default_task=_default_task())
    observation, info = env.reset()
    typer.echo("Initial observation:")
    typer.echo(json.dumps(observation, indent=2)[:2000])
    typer.echo(f"Available actions: {json.dumps(info.get('actions', {}), indent=2)}")

    for _ in range(steps):
        action_id = typer.prompt("Action id", default="0")
        payload = typer.prompt("Payload JSON (or blank)", default="")
        action = {
            "action_id": int(action_id),
            "arguments": payload or None,
        }
        observation, reward, terminated, truncated, info = env.step(action)
        typer.echo(json.dumps(info, indent=2))
        typer.echo(f"Reward: {reward}, terminated={terminated}, truncated={truncated}")
        if terminated or truncated:
            break

    env.close()


if __name__ == "__main__":
    app()

