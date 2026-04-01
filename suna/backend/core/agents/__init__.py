"""Multi-agent intelligence layer with LangGraph orchestration.

This package contains the LangGraph-based multi-agent system for SUNA BIM,
including supervisor pattern, specialist agents, and state management.
"""

from .state import AgentState, validate_state, serialize_state, deserialize_state
from .base import Agent, AgentRegistry
from .router import SupervisorRouter
from .supervisor import supervisor_node, create_supervisor_graph, set_router

# Specialist agents
from .material_analyst import MaterialAnalystAgent
from .carbon_calculator import CarbonCalculatorAgent
from .tgo_database import TGODatabaseAgent
from .knowledge_graph import KnowledgeGraphAgent
from .user_interaction import UserInteractionAgent

__all__ = [
    # State management
    "AgentState",
    "validate_state",
    "serialize_state",
    "deserialize_state",
    # Base classes
    "Agent",
    "AgentRegistry",
    # Routing and supervision
    "SupervisorRouter",
    "supervisor_node",
    "create_supervisor_graph",
    "set_router",
    # Specialist agents
    "MaterialAnalystAgent",
    "CarbonCalculatorAgent",
    "TGODatabaseAgent",
    "KnowledgeGraphAgent",
    "UserInteractionAgent",
]
