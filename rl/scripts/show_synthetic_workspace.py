"""Show synthetic workspace in browser - standalone version that avoids import issues."""

from __future__ import annotations

import json
import time
from pathlib import Path

import httpx
import typer
from playwright.sync_api import sync_playwright

app = typer.Typer(add_completion=False)

# Configuration
API_BASE_URL = "http://localhost:8080/api"
FRONTEND_URL = "http://localhost:5173"
AGENT_EMAIL = "agent@example.com"
AGENT_PASSWORD = "password"


def register_user(email: str, username: str, password: str) -> bool:
    """Register a user, returns True if created, False if already exists."""
    url = f"{API_BASE_URL}/auth/register"
    payload = {"username": username, "email": email, "password": password}
    response = httpx.post(url, json=payload, timeout=20.0, follow_redirects=True)
    return response.status_code == 201


def signin(email: str, password: str) -> httpx.Client:
    """Sign in and return an authenticated client."""
    client = httpx.Client(base_url=API_BASE_URL, timeout=20.0, follow_redirects=True)
    response = client.post("/auth/signin", json={"email": email, "password": password})
    if response.status_code != 200:
        raise RuntimeError(f"Sign in failed: {response.status_code} - {response.text}")
    return client


def create_workspace(client: httpx.Client, name: str) -> str:
    """Create a workspace and return its ID."""
    response = client.post("/organisation", json={"name": name})
    if response.status_code != 201:
        raise RuntimeError(f"Workspace creation failed: {response.status_code} - {response.text}")
    data = response.json()
    workspace_id = data.get("data", {}).get("_id") or data.get("_id") or data.get("data", {}).get("id")
    if not workspace_id:
        raise RuntimeError(f"Workspace creation did not return an ID: {data}")
    return workspace_id


def create_channel(client: httpx.Client, workspace_id: str, name: str) -> str:
    """Create a channel and return its ID."""
    response = client.post("/channel", json={"name": name, "organisationId": workspace_id})
    if response.status_code != 201:
        raise RuntimeError(f"Channel creation failed: {response.status_code} - {response.text}")
    data = response.json()
    channel_id = data.get("data", {}).get("_id") or data.get("_id") or data.get("data", {}).get("id")
    if not channel_id:
        raise RuntimeError(f"Channel creation did not return an ID: {data}")
    return channel_id


def post_message(client: httpx.Client, workspace_id: str, channel_id: str, content: str) -> str:
    """Post a message and return its ID."""
    response = client.post(
        "/message",
        json={"content": content, "organisation": workspace_id, "channelId": channel_id},
    )
    if response.status_code != 201:
        raise RuntimeError(f"Message posting failed: {response.status_code} - {response.text}")
    data = response.json()
    message_id = data.get("data", {}).get("_id") or data.get("_id") or data.get("data", {}).get("id")
    return message_id or "unknown"


@app.command()
def show(
    seed: int = typer.Option(42, help="Random seed for generation"),
    headless: bool = typer.Option(False, help="Run browser in headless mode"),
    wait_seconds: int = typer.Option(60, help="How long to keep browser open"),
) -> None:
    """Generate synthetic workspace and show it in a browser."""

    typer.echo("📝 Ensuring RL agent user exists...")
    register_user(AGENT_EMAIL, "agent", AGENT_PASSWORD)

    typer.echo("🔐 Signing in...")
    client = signin(AGENT_EMAIL, AGENT_PASSWORD)

    typer.echo("🏢 Creating synthetic workspace...")
    workspace_name = f"Synthetic Workspace {seed}"
    workspace_id = create_workspace(client, workspace_name)

    typer.echo(f"✅ Workspace created: {workspace_id}")

    # Create some channels with messages
    typer.echo("� channel Creating channels...")
    channels = [
        ("general", ["Hello everyone! 👋", "This is a synthetic workspace for RL training.", "Welcome! 🎉"]),
        ("random", ["Random chatter here", "Testing the synthetic data generation", "This looks great!"]),
        ("engineering", ["Code review needed", "Deploy to staging?", "Bug fix merged ✅"]),
    ]

    for channel_name, messages in channels:
        channel_id = create_channel(client, workspace_id, channel_name)
        typer.echo(f"   Created channel: {channel_name} ({channel_id})")
        for msg in messages:
            try:
                post_message(client, workspace_id, channel_id, msg)
            except Exception as e:
                typer.echo(f"   ⚠️  Failed to post message: {e}")

    client.close()

    typer.echo("\n🌐 Opening browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            typer.echo(f"   Navigating to {FRONTEND_URL}/signin...")
            page.goto(f"{FRONTEND_URL}/signin", wait_until="networkidle", timeout=10000)

            typer.echo("   Logging in...")
            email_input = page.get_by_placeholder("name@work-email.com")
            password_input = page.get_by_placeholder("Password")
            submit_button = page.get_by_role("button", name="Sign In With Email")

            if email_input.count() > 0:
                email_input.fill(AGENT_EMAIL)
                password_input.fill(AGENT_PASSWORD)
                submit_button.click()

                typer.echo("   Waiting for dashboard...")
                page.wait_for_url("**/home**", timeout=15000)

                typer.echo(f"   Navigating to workspace: {workspace_id}")
                page.goto(f"{FRONTEND_URL}/dashboard?workspace={workspace_id}", wait_until="networkidle", timeout=10000)

                # Ensure a channel with seeded content is selected
                channel_link = page.get_by_role(
                    "link",
                    name=lambda name: bool(name and name.strip().startswith("#")),
                )
                if channel_link.count() > 0:
                    channel_link.first.click()
                    typer.echo("   Selected first channel to display seeded messages")
                else:
                    typer.echo("   ⚠️ Could not automatically locate a channel link; please click one manually.")

                typer.echo("\n✅ Browser is open! You should see:")
                typer.echo("   - Synthetic workspace with channels")
                typer.echo("   - Messages in various channels")
                typer.echo(f"\n⏳ Keeping browser open for {wait_seconds} seconds...")
                typer.echo("   (Press Ctrl+C to close early)")

                # Take a screenshot
                screenshot_path = Path("rl/evals/artifacts/workspace_preview.png")
                screenshot_path.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshot_path), full_page=True)
                typer.echo(f"   📸 Screenshot saved: {screenshot_path}")

                time.sleep(wait_seconds)

            else:
                typer.echo("⚠️  Could not find sign-in form. Is the frontend running?")
                typer.echo(f"   Tried: {FRONTEND_URL}/signin")

        except Exception as exc:
            typer.echo(f"❌ Error: {exc}")
            typer.echo("\n💡 Make sure:")
            typer.echo("   1. Frontend is running: cd frontend && npm run dev")
            typer.echo("   2. Backend is running: cd backend && npm start")
            typer.echo("   3. Credentials are correct")

        finally:
            if not headless:
                typer.echo("\n👋 Closing browser...")
            browser.close()


if __name__ == "__main__":
    app()

