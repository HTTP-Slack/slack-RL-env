# Quick Start: GLM-4.6 Web Navigation Agent

Get started with the RL environment and GLM-4.6 agent in 15 minutes.

## Prerequisites

1. **Frontend running**: `http://localhost:5173`
2. **Backend running**: `http://localhost:8080`
3. **MegaLLM API key**: Get from https://megallm.io
4. **Python 3.8+** with async support

## Installation

### 1. Install Python Dependencies

```bash
cd rl
pip install -r requirements.txt
playwright install chromium
```

### 2. Set Up Environment Variables

Create `.env` file in `rl/` directory:

```bash
MEGALLM_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

## Quick Test: Manual Episode

Run a single episode with GLM-4.6:

```python
# rl/examples/quick_test.py
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from rl.env import SlackUIEnv
from rl.agents import GLM46Agent
from rl.tasks.navigation_tasks import create_task_instance

async def main():
    # Create simple navigation task
    task = create_task_instance("navigate_to_later")

    # Create environment (not headless so you can see it)
    env = SlackUIEnv(task=task, headless=False)

    # Create GLM-4.6 agent
    agent = GLM46Agent(
        api_key=os.getenv("MEGALLM_API_KEY"),
        temperature=0.0  # Deterministic for testing
    )

    # Run episode
    print(f"🎯 Task: {task.goal}")
    print(f"💡 Hints: {task.hints}\n")

    obs, info = await env.reset()
    print("✅ Environment reset complete")

    done = False
    step = 0

    while not done and step < 10:
        # Agent decides action
        print(f"\n📊 Step {step + 1}: Agent thinking...")
        action = await agent.act(obs, task.goal, task.hints)

        print(f"🎬 Action: {action['name']}")
        if action.get('parameters'):
            print(f"   Parameters: {action['parameters']}")

        # Execute action
        obs, reward, terminated, truncated, info = await env.step(action)
        done = terminated or truncated

        print(f"💰 Reward: {reward:.3f}")
        print(f"📍 URL: {obs['state']['url']}")
        print(f"🎯 Task Progress: {info['task_progress']:.1%}")

        step += 1

    # Results
    print(f"\n{'='*60}")
    if info['task_complete']:
        print(f"✅ SUCCESS! Task completed in {step} steps")
    else:
        print(f"❌ Task not completed")
    print(f"Total Reward: {env.episode_reward:.3f}")
    print(f"{'='*60}")

    await env.close()
    await agent.close()

if __name__ == "__main__":
    asyncio.run(main())
```

Run it:

```bash
cd rl
python examples/quick_test.py
```

## Expected Output

```
🎯 Task: Navigate from the dashboard to the Later view
💡 Hints: ['Look for the Later button in the left navigation sidebar', ...]

✅ Environment reset complete

📊 Step 1: Agent thinking...
🎬 Action: navigate_to_url
   Parameters: {'url': '/later'}
💰 Reward: 0.990
📍 URL: http://localhost:5173/later
🎯 Task Progress: 100.0%

============================================================
✅ SUCCESS! Task completed in 1 steps
Total Reward: 0.990
============================================================
```

## Run Benchmark on All Tier 1 Tasks

```python
# rl/examples/tier1_benchmark.py
import asyncio
from rl.tasks.navigation_tasks import TIER_1_TASKS, TaskInstance
from rl.env import SlackUIEnv
from rl.agents import GLM46Agent
import os

async def benchmark_tier1():
    agent = GLM46Agent(api_key=os.getenv("MEGALLM_API_KEY"))

    results = []
    for task_spec in TIER_1_TASKS:
        print(f"\n🔬 Testing: {task_spec.name}")

        task = TaskInstance.from_spec(task_spec)
        env = SlackUIEnv(task=task, headless=True)  # Headless for speed

        obs, _ = await env.reset()
        done = False
        steps = 0

        while not done and steps < 30:
            action = await agent.act(obs, task.goal, task.hints)
            obs, reward, terminated, truncated, info = await env.step(action)
            done = terminated or truncated
            steps += 1

        success = info['task_complete']
        results.append({
            "task": task.name,
            "success": "✅" if success else "❌",
            "steps": steps,
            "reward": env.episode_reward
        })

        print(f"   {'✅ PASS' if success else '❌ FAIL'} - {steps} steps, reward={env.episode_reward:.2f}")

        await env.close()

    # Summary
    print(f"\n{'='*60}")
    print(f"TIER 1 BENCHMARK RESULTS")
    print(f"{'='*60}")
    for r in results:
        print(f"{r['success']} {r['task']:30} {r['steps']:2} steps, {r['reward']:6.2f} reward")

    success_rate = sum(1 for r in results if r['success'] == "✅") / len(results)
    print(f"\n📊 Success Rate: {success_rate:.1%} ({sum(1 for r in results if r['success'] == '✅')}/{len(results)})")
    print(f"{'='*60}")

    await agent.close()

if __name__ == "__main__":
    asyncio.run(benchmark_tier1())
```

## Understanding Costs

For the Tier 1 benchmark (5 tasks):
- Estimated tokens per task: ~45,000
- Cost per task: ~$0.045
- **Total cost: ~$0.23** for 5 tasks

Full benchmark with 5 trials per task:
- 5 tasks × 5 trials = 25 episodes
- **Total cost: ~$1.13**

## Next Steps

1. **Run your first test**: `python examples/quick_test.py`
2. **Try headless mode**: Set `headless=True` for faster execution
3. **Experiment with rewards**: Try different `RewardConfig` presets
4. **Add custom tasks**: Extend `navigation_tasks.py`
5. **Compare agents**: Add RandomAgent for baseline

## Troubleshooting

**"Browser not launching"**
```bash
playwright install chromium
```

**"API key error"**
- Check `.env` file has `MEGALLM_API_KEY`
- Verify key at https://megallm.io

**"Frontend not responding"**
```bash
# In frontend directory
npm run dev
```

**"Element not found"**
- The UI may have changed; update element selectors in `playwright_controller.py`
- Add data attributes to frontend components for easier targeting

## Tips for Success

1. **Start with headless=False** to see what the agent is doing
2. **Use temperature=0** for deterministic, reproducible results
3. **Check task hints** to understand expected behavior
4. **Monitor API costs** with vision-based observations
5. **Record videos** with `record_video=True` for debugging

Happy benchmarking! 🚀
