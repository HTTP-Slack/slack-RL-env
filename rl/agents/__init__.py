"""
Agent implementations for Slack UI navigation.

Provides agent wrappers for different models and baselines.
"""

from .megallm_client import MegaLLMClient
from .glm46_agent import GLM46Agent, RandomAgent

__all__ = [
    "MegaLLMClient",
    "GLM46Agent",
    "RandomAgent",
]
