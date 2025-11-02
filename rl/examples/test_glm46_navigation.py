"""
End-to-end test of GLM-4.6 agent on navigation task.

This script demonstrates the complete RL environment pipeline:
1. Load environment and task
2. Initialize GLM-4.6 agent
3. Run episode with vision-based navigation
4. Display detailed results
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

from rl.env import SlackUIEnv
from rl.agents import GLM46Agent
from rl.tasks.navigation_tasks import create_task_instance


async def test_navigation():
    """Run a single navigation episode with GLM-4.6."""

    print("=" * 80)
    print(" GLM-4.6 WEB NAVIGATION TEST")
    print("=" * 80)

    # Check API key
    api_key = os.getenv("MEGALLM_API_KEY")
    if not api_key:
        print("❌ ERROR: MEGALLM_API_KEY not found in .env file")
        return

    print(f"✅ API Key loaded: {api_key[:20]}...")

    # Create task
    print("\n📋 Creating navigation task...")
    task = create_task_instance("navigate_to_later")
    print(f"   Task: {task.name}")
    print(f"   Goal: {task.goal}")
    print(f"   Hints:")
    for hint in task.hints:
        print(f"      - {hint}")

    # Create environment
    print("\n🌐 Initializing environment...")
    env = SlackUIEnv(
        task=task,
        headless=False,  # Show browser for demo
        max_steps=10
    )
    print("   ✅ Environment created")

    # Create agent
    print("\n🤖 Initializing GLM-4.6 agent...")
    agent = GLM46Agent(
        api_key=api_key,
        model="glm-4.6",
        temperature=0.0,  # Deterministic
        include_screenshot=True,
        include_accessibility_tree=True
    )
    print("   ✅ Agent initialized")

    try:
        # Reset environment
        print("\n🔄 Resetting environment...")
        obs, info = await env.reset()
        print(f"   ✅ Reset complete")
        print(f"   Starting URL: {obs['state']['url']}")
        print(f"   Starting View: {obs['state']['active_view']}")
        print(f"   Interactive Elements Found: {len(obs['accessibility_tree']['interactive_elements'])}")

        # Run episode
        print("\n" + "=" * 80)
        print(" EPISODE EXECUTION")
        print("=" * 80)

        done = False
        step = 0

        while not done and step < 10:
            step += 1
            print(f"\n📊 STEP {step}")
            print("-" * 40)

            # Agent decides action
            print("🧠 Agent thinking...")
            action = await agent.act(obs, task.goal, task.hints)

            print(f"🎬 Action Selected: {action['name']}")
            if action.get('parameters'):
                print(f"   Parameters: {action['parameters']}")

            # Execute action
            obs, reward, terminated, truncated, info = await env.step(action)
            done = terminated or truncated

            # Display step results
            print(f"💰 Reward: {reward:.3f}")
            print(f"📍 Current URL: {obs['state']['url']}")
            print(f"🎯 Task Progress: {info['task_progress']:.1%}")
            print(f"✅ Action Success: {info['action_success']}")

            if info.get('action_error'):
                print(f"⚠️  Error: {info['action_error']}")

            # Check termination
            if terminated:
                print(f"\n{'🎉' if info['task_complete'] else '❌'} Episode Terminated!")
                if info['task_complete']:
                    print("   ✅ Task completed successfully!")
                else:
                    print("   ❌ Task not completed")
                break

            if truncated:
                print(f"\n⏱️  Episode Truncated (max steps reached)")
                break

        # Final results
        print("\n" + "=" * 80)
        print(" FINAL RESULTS")
        print("=" * 80)

        stats = env.get_episode_stats()

        print(f"\n📊 Episode Statistics:")
        print(f"   Task: {stats['task_name']}")
        print(f"   Goal: {stats['task_goal']}")
        print(f"   Steps Taken: {stats['step_count']}")
        print(f"   Total Reward: {stats['episode_reward']:.3f}")
        print(f"   Final Progress: {stats['progress']:.1%}")

        if info['task_complete']:
            print(f"\n✅ SUCCESS! Task completed in {step} steps")
            print(f"   Efficiency: {(10 - step) / 10 * 100:.0f}% ({step}/10 steps used)")
        else:
            print(f"\n❌ INCOMPLETE: Task not completed within {step} steps")

        print(f"\n💵 Estimated Cost:")
        # Rough estimate: ~1500 tokens per step
        tokens = step * 1500
        cost = tokens / 1_000_000 * 1.0  # $1 per 1M tokens
        print(f"   Tokens: ~{tokens:,}")
        print(f"   Cost: ~${cost:.4f}")

        print("\n" + "=" * 80)

    except Exception as e:
        print(f"\n❌ ERROR during execution: {e}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        print("\n🧹 Cleaning up...")
        await env.close()
        await agent.close()
        print("   ✅ Cleanup complete")

    print("\n" + "=" * 80)
    print(" TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    print("\n🚀 Starting GLM-4.6 Navigation Test...\n")
    asyncio.run(test_navigation())
