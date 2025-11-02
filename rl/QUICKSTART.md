# Quick Start Guide - Slack UI RL Pipeline

## TLDR: Run the Environment in 5 Steps

### Step 1: Install Python & Dependencies
```bash
cd rl
python3.11 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Install Playwright Browsers
```bash
playwright install chromium
```

### Step 3: Set Up Your Slack Clone Credentials
Create a `.env` file in the `rl/` directory:
```bash
# Copy from .env.example or create manually
SLACK_RL_SLACK__BASE_URL=http://localhost:3000
SLACK_RL_SLACK__API_BASE_URL=http://localhost:4000/api
SLACK_RL_SLACK__DEFAULT_EMAIL=your-email@example.com
SLACK_RL_SLACK__DEFAULT_PASSWORD=your-password
```

### Step 4: Start Your Slack Clone Backend & Frontend
**In separate terminals:**
```bash
# Terminal 1: Start backend
cd backend
npm start  # or however you run your backend

# Terminal 2: Start frontend
cd frontend
npm run dev  # or however you run your frontend
```

### Step 5: Run a Test Rollout
```bash
cd rl
python -m scripts.run_env rollout --steps 3
```

When prompted:
- Enter action ID (e.g., `2` for send_message)
- Enter payload JSON (e.g., `{"text": "Hello!"}`)

---

## What Just Happened?

1. **Environment launched** → Playwright opened a browser window
2. **Auto-login** → Signed into your Slack clone with your credentials
3. **Dashboard loaded** → Navigated to the chat interface
4. **You controlled it** → Typed actions via the console

---

## Common Commands

### Test the environment interactively
```bash
python -m scripts.run_env rollout --steps 5
```

### List available actions
```bash
python -c "from rl.env.actions import ActionID; print([a.name for a in ActionID])"
```

### Run with debug screenshots
```bash
SLACK_RL_RUNTIME__CAPTURE_DEBUG_ARTIFACTS=true python -m scripts.run_env rollout
```

---

## Troubleshooting

**"Module not found" error?**
- Make sure you're in the `rl/` directory
- Activate your virtual environment: `source .venv/bin/activate`

**"Browser not found" error?**
- Run: `playwright install chromium`

**"Authentication failed" error?**
- Check your `.env` file has correct credentials
- Make sure your Slack clone backend/frontend are running

**"Can't connect to localhost:3000"?**
- Start your frontend server first
- Check the URL matches `SLACK_RL_SLACK__BASE_URL` in `.env`

---

## Next Steps

- **Add more actions**: Edit `rl/env/actions.py`
- **Create tasks**: Edit `rl/tasks/specs.py`
- **Train an agent**: Coming soon in `scripts/train_agent.py`
- **Read docs**: Check `docs/environment.md` for details

---

## Example Session

```
$ python -m scripts.run_env rollout --steps 3

Initial observation:
{"url": "http://localhost:3000/dashboard", "active_conversation": "", ...}

Available actions: {"0": {"name": "noop"}, "2": {"name": "send_message"}, ...}

Action id: 2
Payload JSON (or blank): {"text": "Hello world!"}
{"action_result": {"status": "sent", "text": "Hello world!"}, "steps": 1}
Reward: 0.0, terminated=False, truncated=False

Action id: 0
Payload JSON (or blank): 
{"action_result": {"status": "ok"}, "steps": 2}
Reward: 0.0, terminated=False, truncated=False
```

That's it! You're running the RL pipeline. 🎉


