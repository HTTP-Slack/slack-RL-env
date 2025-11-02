"""Register the RL agent user in the database to avoid authorization issues."""

from __future__ import annotations

import sys
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import typer
import httpx

# Try to import from rl package, fallback to direct imports
try:
    from rl.config.settings import Settings
except ImportError:
    # Fallback: add rl to path and try direct imports
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    try:
        from rl.config.settings import Settings
    except ImportError:
        # Last resort: use environment variables directly
        import os
        from dataclasses import dataclass
        
        @dataclass
        class SlackSettings:
            base_url: str = os.getenv("SLACK_RL_SLACK__BASE_URL", "http://localhost:3000")
            api_base_url: str = os.getenv("SLACK_RL_SLACK__API_BASE_URL", "http://localhost:8080/api")
            default_email: str = os.getenv("SLACK_RL_SLACK__DEFAULT_EMAIL", "agent@example.com")
            default_password: str = os.getenv("SLACK_RL_SLACK__DEFAULT_PASSWORD", "password")
        
        @dataclass
        class Settings:
            slack: SlackSettings = SlackSettings()

app = typer.Typer(add_completion=False)


@app.command()
def register(
    email: str | None = typer.Option(None, help="Email for the RL agent (defaults to settings)"),
    password: str | None = typer.Option(None, help="Password for the RL agent (defaults to settings)"),
    username: str | None = typer.Option(None, help="Username for the RL agent (defaults to email prefix)"),
    api_url: str | None = typer.Option(None, help="API base URL (defaults to settings)"),
) -> None:
    """Register the RL agent user in the database."""

    settings = Settings()
    
    agent_email = email or settings.slack.default_email
    agent_password = password or settings.slack.default_password
    agent_username = username or agent_email.split("@")[0]
    api_base_url = api_url or settings.slack.api_base_url

    typer.echo(f"📝 Registering RL agent user...")
    typer.echo(f"   Email: {agent_email}")
    typer.echo(f"   Username: {agent_username}")
    typer.echo(f"   API Base URL: {api_base_url}")

    try:
        register_url = f"{api_base_url.rstrip('/')}/auth/register"
        payload = {
            "username": agent_username,
            "email": agent_email,
            "password": agent_password
        }
        
        typer.echo(f"\n📡 Calling {register_url}...")
        response = httpx.post(register_url, json=payload, timeout=20.0, follow_redirects=True)
        
        if response.status_code == 201:
            typer.echo(f"✅ Successfully registered RL agent user: {agent_email}")
            data = response.json()
            if "data" in data:
                typer.echo(f"   User ID: {data['data'].get('_id', 'N/A')}")
        elif response.status_code == 400:
            error_data = response.json()
            error_msg = error_data.get("message", "Unknown error")
            typer.echo(f"ℹ️  User registration returned 400: {error_msg}")
            
            if "already" in error_msg.lower() or "exists" in error_msg.lower():
                typer.echo("   (This is fine - the user is already in the database)")
                
                # Verify we can sign in
                typer.echo("\n🔐 Verifying credentials...")
                signin_url = f"{api_base_url.rstrip('/')}/auth/signin"
                signin_response = httpx.post(
                    signin_url,
                    json={"email": agent_email, "password": agent_password},
                    timeout=20.0,
                    follow_redirects=True
                )
                
                if signin_response.status_code == 200:
                    typer.echo("✅ Credentials verified - sign-in successful!")
                else:
                    typer.echo(f"⚠️  Warning: Could not sign in with provided credentials")
                    typer.echo(f"   Status: {signin_response.status_code}")
                    try:
                        error_data = signin_response.json()
                        typer.echo(f"   Error: {error_data.get('message', 'Unknown')}")
                    except:
                        typer.echo(f"   Response: {signin_response.text[:200]}")
            else:
                typer.echo(f"❌ Registration failed: {error_msg}")
                raise typer.Exit(1)
        else:
            typer.echo(f"❌ Unexpected status code: {response.status_code}")
            try:
                error_data = response.json()
                typer.echo(f"   Error: {error_data.get('message', response.text[:200])}")
            except:
                typer.echo(f"   Response: {response.text[:200]}")
            raise typer.Exit(1)

    except httpx.ConnectError as exc:
        typer.echo(f"❌ Connection error: {exc}")
        typer.echo("\n💡 Make sure:")
        typer.echo("   1. Backend is running: cd backend && npm start")
        typer.echo(f"   2. Backend is accessible at: {api_base_url}")
        raise typer.Exit(1)
    except Exception as exc:
        typer.echo(f"❌ Error: {exc}")
        typer.echo("\n💡 Make sure:")
        typer.echo("   1. Backend is running: cd backend && npm start")
        typer.echo(f"   2. API base URL is correct: {api_base_url}")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
