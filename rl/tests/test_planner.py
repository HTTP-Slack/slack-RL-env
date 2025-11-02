from rl.config.settings import Settings
from rl.data.planner import WorkspacePlanGenerator


def test_fallback_plan_is_deterministic_without_llm(monkeypatch):
    monkeypatch.setenv("SLACK_RL_LLM__API_KEY", "")
    settings = Settings()

    generator = WorkspacePlanGenerator(settings)
    plan_a = generator.generate(seed=123)
    plan_b = generator.generate(seed=123)

    assert plan_a.workspace_name == plan_b.workspace_name
    assert plan_a.users == plan_b.users
    assert plan_a.channels == plan_b.channels

