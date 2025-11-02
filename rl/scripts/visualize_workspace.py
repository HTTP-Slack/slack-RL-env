"""Generate synthetic data and visualize it in a browser."""

from __future__ import annotations

import sys
import time
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import typer
from playwright.sync_api import sync_playwright

# Try to import from rl package, fallback to direct imports
try:
    from rl.config.settings import Settings
    from rl.data.synthetic_population import SyntheticWorkspacePopulator
except ImportError:
    # Fallback: try direct imports
    from config.settings import Settings
    from data.synthetic_population import SyntheticWorkspacePopulator

app = typer.Typer(add_completion=False)


@app.command()
def show(
    seed: int = typer.Option(42, help="Random seed for generation"),
    populate: bool = typer.Option(True, help="Populate workspace via API"),
    headless: bool = typer.Option(False, help="Run browser in headless mode"),
    wait_seconds: int = typer.Option(30, help="How long to keep browser open"),
) -> None:
    """Generate synthetic workspace and show it in a browser."""

    settings = Settings()
    # Override with correct ports (Vite default is 5173, but check if different)
    settings.slack.base_url = "http://localhost:5173"
    settings.slack.api_base_url = "http://localhost:8080/api"
    populator = SyntheticWorkspacePopulator(settings)

    typer.echo("🎨 Generating synthetic workspace plan...")
    plan = populator.generate_plan(seed=seed)

    typer.echo(f"✅ Generated: {plan.workspace_name}")
    typer.echo(f"   Users: {len(plan.users)}")
    typer.echo(f"   Channels: {len(plan.channels)}")
    typer.echo(f"   Total messages: {sum(len(c.messages) for c in plan.channels)}")

    workspace_id = None
    if populate:
        try:
            typer.echo("\n📦 Populating workspace via API...")
            summary = populator.populate(plan)
            workspace_id = summary.get("organisation_id")
            typer.echo(f"✅ Workspace created: {workspace_id}")
        except Exception as exc:
            typer.echo(f"⚠️  Population failed: {exc}")
            typer.echo("   Continuing with browser visualization anyway...")
            populate = False

    typer.echo("\n🌐 Opening browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            typer.echo(f"   Navigating to {settings.slack.base_url}/signin...")
            page.goto(f"{settings.slack.base_url}/signin", wait_until="networkidle", timeout=10000)

            typer.echo("   Logging in...")
            email_input = page.get_by_placeholder("name@work-email.com")
            password_input = page.get_by_placeholder("Password")
            submit_button = page.get_by_role("button", name="Sign In With Email")

            if email_input.count() > 0:
                email_input.fill(settings.slack.default_email)
                password_input.fill(settings.slack.default_password)
                submit_button.click()

                typer.echo("   Waiting for dashboard...")
                page.wait_for_url("**/home**", timeout=15000)

                if workspace_id:
                    typer.echo(f"   Navigating to workspace: {workspace_id}")
                    page.goto(f"{settings.slack.base_url}/dashboard?workspace={workspace_id}", wait_until="networkidle", timeout=10000)
                else:
                    typer.echo("   Selecting first workspace...")
                    launch_button = page.get_by_role("button", name=lambda name: name and "Launch Slack" in name)
                    if launch_button.count() > 0:
                        launch_button.first.click()
                        page.wait_for_url("**/dashboard**", timeout=10000)

                # Wait a bit for channels to load, then try to select one
                try:
                    page.wait_for_timeout(2000)  # Wait 2 seconds for UI to settle
                    channel_link = page.locator("a[href*='channel'], a[href*='dashboard']").filter(has_text="#")
                    if channel_link.count() > 0:
                        channel_link.first.click()
                        page.wait_for_timeout(1000)  # Wait for channel to load
                        typer.echo("   Selected first channel to surface seeded messages")
                    else:
                        typer.echo("   ⚠️ Could not automatically find a channel link; please click one manually.")
                except Exception as e:
                    typer.echo(f"   ⚠️ Could not auto-select channel: {e}")
                    typer.echo("   Please manually click a channel to view messages")

                typer.echo("\n✅ Browser is open! You should see:")
                typer.echo("   - Synthetic workspace with channels")
                typer.echo("   - Rich markdown messages")
                typer.echo("   - File attachments")
                typer.echo("   - Reactions")
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
                typer.echo(f"   Tried: {settings.slack.base_url}/signin")

        except Exception as exc:
            typer.echo(f"❌ Error: {exc}")
            typer.echo("\n💡 Make sure:")
            typer.echo("   1. Frontend is running: cd frontend && npm run dev")
            typer.echo("   2. Backend is running: cd backend && npm start")
            typer.echo("   3. Credentials are correct in .env")

        finally:
            if not headless:
                typer.echo("\n👋 Closing browser...")
            browser.close()


if __name__ == "__main__":
    app()


