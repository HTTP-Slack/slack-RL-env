# RL Environment Implementation Guide

## Overview

This directory contains a **Gymnasium-compatible RL environment** for benchmarking web navigation agents on the Slack UI. The environment is designed for research and evaluation, leveraging **GLM-4.6** via **MegaLLM API** for vision-based navigation.

## Architecture

```
rl/
├── env/                    # Core Gymnasium environment
│   ├── slack_ui_env.py    # Main environment class
│   ├── actions.py         # Action space definitions (function calling)
│   ├── observation.py     # Multi-modal observation extraction
│   ├── rewards.py         # Reward function library
│   └── playwright_controller.py  # Browser automation
│
├── agents/                 # Agent implementations
│   ├── megallm_client.py  # MegaLLM API client
│   ├── glm46_agent.py     # GLM-4.6 agent wrapper
│   └── ...                # Other agent implementations
│
├── tasks/                  # Task definitions
│   ├── specs.py           # Task specification models
│   └── navigation_tasks.py # Concrete navigation tasks
│
├── evals/                  # Evaluation infrastructure
│   └── ...                # Benchmark runners and metrics
│
└── docs/                   # Documentation
    ├── IMPLEMENTATION.md  # This file
    └── ...                # Other documentation
```

## Key Components

### 1. Gymnasium Environment (`SlackUIEnv`)

**File:** `rl/env/slack_ui_env.py`

The main environment implementing the Gymnasium interface:

```python
from rl.env import SlackUIEnv
from rl.tasks.navigation_tasks import create_task_instance

# Create environment
task = create_task_instance("navigate_to_later")
env = SlackUIEnv(task=task, headless=False)

# Run episode
observation, info = await env.reset()
done = False
while not done:
    action = {"name": "navigate_to_url", "parameters": {"url": "/later"}}
    obs, reward, terminated, truncated, info = await env.step(action)
    done = terminated or truncated

await env.close()
```

**Features:**
- Multi-modal observations (screenshots + accessibility tree)
- Function calling-based action space
- Configurable reward functions
- Playwright-based browser automation

### 2. Multi-Modal Observations

**File:** `rl/env/observation.py`

Observations include:

```python
observation = {
    "screenshot": {
        "array": np.array,      # (H, W, 3) numpy array
        "encoding": str,        # base64-encoded PNG for API
        "resolution": tuple,    # (height, width)
    },
    "accessibility_tree": {
        "interactive_elements": [
            {
                "id": "elem_0",
                "type": "button",
                "text": "Later",
                "role": "navigation",
                "xpath": "/html/body/...",
                "position": {"x": 50, "y": 100, ...}
            },
            # ... more elements
        ],
        "text_content": str,    # Page text preview
    },
    "state": {
        "url": str,            # Current URL
        "active_view": str,    # dashboard/later/search
        "step_count": int,
        "visible_components": list,  # Components on page
    }
}
```

### 3. Action Space (Function Calling)

**File:** `rl/env/actions.py`

Actions are defined as OpenAI-style function definitions:

```python
FUNCTION_DEFINITIONS = [
    {
        "name": "navigate_to_url",
        "description": "Navigate to a specific URL path",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "enum": ["/dashboard", "/later", "/search"]}
            },
            "required": ["url"]
        }
    },
    {
        "name": "click_element",
        "description": "Click on an interactive element by ID",
        "parameters": {
            "type": "object",
            "properties": {
                "element_id": {"type": "string"}
            },
            "required": ["element_id"]
        }
    },
    # ... 8 total actions
]
```

**Available Actions:**
1. `navigate_to_url` - Navigate to a URL path
2. `click_element` - Click an element by ID
3. `type_text` - Type text into input field
4. `send_message` - Send typed message (press Enter)
5. `open_search` - Open search modal (Cmd/Ctrl+K)
6. `scroll` - Scroll page up/down
7. `wait` - Wait for page load
8. `task_complete` - Mark task as complete

### 4. Reward Functions

**File:** `rl/env/rewards.py`

Modular reward system with presets:

```python
from rl.env import RewardConfig, get_reward_config

# Sparse reward (baseline)
config = get_reward_config("sparse")

# Dense reward with progress
config = get_reward_config("dense")

# Navigation-optimized
config = get_reward_config("navigation_optimized")

# Custom config
config = RewardConfig(
    sparse=False,
    time_penalty=0.01,
    progress_weight=0.5,
    completion_reward=1.0,
    efficiency_bonus_weight=0.3
)
```

**Reward Components:**
- **Time penalty**: -0.01 per step (encourage efficiency)
- **Invalid action penalty**: -0.1 for failed actions
- **Progress reward**: Partial credit for sub-goals
- **Completion reward**: +1.0 for task completion
- **Efficiency bonus**: Bonus for completing quickly

### 5. GLM-4.6 Agent

**File:** `rl/agents/glm46_agent.py`

Agent wrapper for GLM-4.6 via MegaLLM API:

```python
from rl.agents import GLM46Agent

agent = GLM46Agent(
    api_key="your_megallm_api_key",
    model="glm-4.6",
    temperature=0.0,           # Deterministic
    include_screenshot=True,    # Vision-based
    include_accessibility_tree=True
)

# Decide action
action = await agent.act(
    observation=observation,
    task_description="Navigate to the Later view"
)

# Reset between episodes
agent.reset()
```

### 6. Task Definitions

**File:** `rl/tasks/navigation_tasks.py`

Tasks are organized by difficulty tier:

**Tier 1: Simple Navigation** (5 tasks)
- Navigate to Later view
- Open Search
- Open Activity panel
- Open DMs panel
- Return to Dashboard

**Tier 2: Message Interaction** (2 tasks)
- Send message to #general
- Open #general channel

**Tier 3: Complex Workflows** (1 task)
- Search and navigate

```python
from rl.tasks.navigation_tasks import get_task_by_name, create_task_instance

# Get task spec
task_spec = get_task_by_name("navigate_to_later")

# Create task instance
task = create_task_instance("navigate_to_later", seed=42)
```

## Usage Examples

### Example 1: Run Single Episode

```python
import asyncio
from rl.env import SlackUIEnv
from rl.agents import GLM46Agent
from rl.tasks.navigation_tasks import create_task_instance

async def main():
    # Create task
    task = create_task_instance("navigate_to_later")

    # Create environment
    env = SlackUIEnv(task=task, headless=False)

    # Create agent
    agent = GLM46Agent(api_key="your_key")

    # Run episode
    obs, info = await env.reset()
    done = False

    while not done:
        # Agent decides action
        action = await agent.act(obs, task.goal, task.hints)

        # Execute action
        obs, reward, terminated, truncated, info = await env.step(action)
        done = terminated or truncated

        print(f"Step {info['step']}: {action['name']} -> reward={reward:.2f}")

    print(f"Episode complete! Success={info['task_complete']}")

    await env.close()
    await agent.close()

asyncio.run(main())
```

### Example 2: Benchmark Multiple Tasks

```python
from rl.tasks.navigation_tasks import TIER_1_TASKS

async def benchmark():
    agent = GLM46Agent(api_key="your_key")

    results = []
    for task_spec in TIER_1_TASKS:
        task = TaskInstance.from_spec(task_spec)
        env = SlackUIEnv(task=task)

        obs, _ = await env.reset()
        done = False
        steps = 0

        while not done and steps < 30:
            action = await agent.act(obs, task.goal)
            obs, reward, terminated, truncated, info = await env.step(action)
            done = terminated or truncated
            steps += 1

        results.append({
            "task": task.name,
            "success": info['task_complete'],
            "steps": steps
        })

        await env.close()

    return results
```

## Configuration

### Environment Variables

Create `.env` file:

```bash
# MegaLLM API
MEGALLM_API_KEY=your_api_key_here

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# Browser settings
HEADLESS=false
BROWSER_TYPE=chromium
```

### Reward Function Selection

Choose reward function based on research goal:

- **Sparse**: For baseline comparison
- **Dense**: For faster learning/exploration
- **Navigation-optimized**: Higher time penalty, good for simple tasks
- **Interaction-optimized**: Lower time penalty, for complex tasks

## API Costs

**GLM-4.6 via MegaLLM:**
- Cost: $1.00 per 1M tokens (input and output)
- Per step: ~1,500 tokens (screenshot + response)
- Per episode: ~45,000 tokens (~$0.045 or 4.5 cents)
- Full benchmark (8 tasks × 5 trials): ~$1.80

**Cost Optimization:**
- Use lower resolution screenshots
- Disable vision for text-only evaluation
- Cache repeated observations
- Use temperature=0 for deterministic behavior

## Next Steps

1. **Add more tasks**: Extend `navigation_tasks.py` with message interactions
2. **Implement benchmarking**: Create evaluation harness in `rl/evals/`
3. **Add more agents**: Integrate other VLMs (Qwen, GPT-4V)
4. **Optimize observations**: Reduce screenshot resolution, smart caching
5. **Trajectory recording**: Save episodes for dataset creation

## Troubleshooting

### Browser won't launch
- Check Playwright installation: `playwright install chromium`
- Verify frontend is running: `http://localhost:5173`

### API errors
- Check MegaLLM API key is valid
- Verify GLM-4.6 model ID: `glm-4.6`
- Check API quota/limits

### Element not found
- Elements are dynamically extracted; IDs may change
- Improve element detection in `observation.py`
- Add data attributes to frontend components

## References

- **Gymnasium Docs**: https://gymnasium.farama.org/
- **Playwright Docs**: https://playwright.dev/python/
- **MegaLLM API**: https://docs.megallm.io/
- **GLM-4.6**: Open-source agentic model by Zhipu AI
