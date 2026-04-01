# LangGraph Multi-Agent System Guide

This document describes the LangGraph-based multi-agent architecture implemented in BKS BIM Agent.

## Architecture Overview

The system uses **LangGraph's supervisor pattern** for multi-agent orchestration:

```
User Query → Supervisor → Routes to Specialist Agent → Returns Result
                ↓
         Capability-Based Routing
                ↓
         PostgreSQL Checkpointing
```

### Key Components

1. **Supervisor Agent** (`core/agents/supervisor.py`)
   - Central orchestrator that routes queries to specialist agents
   - Uses capability-based routing via `SupervisorRouter`
   - Stateless routing logic - delegates execution to specialists

2. **SupervisorRouter** (`core/agents/router.py`)
   - Matches user queries to agent capabilities
   - Simple keyword-based routing (ready for LLM upgrade)
   - Maintains registry of available specialist agents

3. **AgentState** (`core/agents/state.py`)
   - Typed state container using TypedDict
   - Tracks conversation flow and agent history
   - Manages task results and error tracking

4. **PostgreSQL Checkpointing** (`core/agents/checkpointer.py`)
   - Enables conversation memory across invocations
   - Thread-based state isolation (`thread_id`)
   - Durable state persistence for scenario forking

## State Management

### AgentState Structure

```python
{
    "user_query": str,              # Current user request
    "current_agent": str,           # Active agent name
    "agent_history": list[str],     # Sequence of agents invoked
    "task_results": dict,           # Accumulated results
    "error_count": int,             # Error tracking
    "scenario_context": dict | None # Scenario forking metadata
}
```

### State Accumulation Pattern

Agent history uses `Annotated[Sequence[str], operator.add]` for automatic list accumulation:

```python
# First invocation
state["agent_history"] = ["carbon_calculator"]

# Second invocation (same thread_id)
state["agent_history"] = ["carbon_calculator", "material_analyst"]
```

**Important**: `task_results` do NOT automatically accumulate - they must be explicitly carried forward in the input state.

## Thread-Based Conversations

Each conversation has a unique `thread_id` for state isolation:

```python
from suna.backend.core.agents.supervisor import create_supervisor_graph
from suna.backend.core.agents.checkpointer import get_checkpointer

# Create checkpointed graph
checkpointer = get_checkpointer()
graph = create_supervisor_graph(checkpointer)

# First message in conversation
result1 = graph.invoke(
    initial_state,
    config={"configurable": {"thread_id": "user-123-session-456"}}
)

# Follow-up message - state persists
result2 = graph.invoke(
    follow_up_state,
    config={"configurable": {"thread_id": "user-123-session-456"}}
)
```

### Thread ID Convention

Format: `user-{user_id}-session-{session_id}` or `user-{user_id}:base:boq-{boq_id}:fork:{fork_id}`

- Base conversations: `user-123-session-abc`
- Scenario forking: `user-123:base:boq-456:fork:789`

## Supervisor Pattern

### Router Configuration

```python
from suna.backend.core.agents.router import SupervisorRouter
from suna.backend.core.agents.supervisor import set_router

router = SupervisorRouter()
router.register_agent(carbon_calculator_agent)
router.register_agent(material_analyst_agent)
# ... register all agents

set_router(router)  # Global configuration
```

### Routing Logic

The supervisor uses keyword-based capability matching:

```python
# User query: "Calculate carbon footprint"
# Matches: carbon_calculator (capability: "calculate:carbon")

# User query: "Find sustainable materials"
# Matches: material_analyst (capability: "match:materials")
```

**Future Enhancement**: Replace keyword matching with LLM-based routing for semantic understanding.

## Testing Strategies

### 1. Stateless Testing (No Checkpointing)

```python
from suna.backend.core.agents.supervisor import create_supervisor_graph, set_router

set_router(configured_router)
try:
    graph = create_supervisor_graph()  # No checkpointer
    result = graph.invoke(initial_state)
    assert result["current_agent"] == "carbon_calculator"
finally:
    set_router(None)  # Clean up global state
```

### 2. Stateful Testing (MemorySaver)

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
graph = create_supervisor_graph(checkpointer)

# Multiple invocations with same thread_id
result1 = graph.invoke(state1, config={"configurable": {"thread_id": "test-1"}})
result2 = graph.invoke(state2, config={"configurable": {"thread_id": "test-1"}})

# Agent history accumulates
assert "carbon_calculator" in result2["agent_history"]
```

### 3. PostgreSQL Testing (Integration)

```python
@pytest.mark.skipif(
    not os.getenv("DATABASE_URL"),
    reason="PostgreSQL DATABASE_URL not configured"
)
def test_postgres_checkpointing():
    checkpointer = get_checkpointer()
    graph = create_supervisor_graph(checkpointer)
    # ... test with real database
```

## Health Monitoring

The `/v1/health` endpoint includes agent system status:

```json
{
  "status": "ok",
  "timestamp": "2025-01-10T12:34:56Z",
  "instance_id": "abc-123",
  "agent_system": {
    "initialized": true,
    "checkpointer_connected": true,
    "active_agents": 0
  }
}
```

**Status Values**:
- `ok`: All systems operational
- `degraded`: Agent system failed to initialize (still serving requests)
- `shutting_down`: Graceful shutdown in progress (503 response)

## Dependency Injection Pattern

The supervisor uses a global router for production and allows parameter injection for testing:

```python
# Production (global router)
set_router(production_router)
graph = create_supervisor_graph(checkpointer)

# Testing (parameter injection)
graph = create_supervisor_graph()
result = supervisor_node(state, router=test_router)
```

**Why**: Tests can inject mock routers without polluting global state.

## Common Patterns

### 1. Scenario Forking

```python
base_state = {
    "user_query": "Fork scenario with green concrete",
    "scenario_context": {
        "base_scenario_id": "user-123:base:boq-456",
        "forked_scenario_ids": [],
        "material_swaps": [
            {"original": "tgo:concrete-c30", "replacement": "tgo:concrete-green"}
        ]
    },
    # ... other state fields
}

result = graph.invoke(
    base_state,
    config={"configurable": {"thread_id": "user-123:base:boq-456:fork:abc"}}
)
```

### 2. Task Results Accumulation

```python
# First agent execution
state1 = {
    "user_query": "Parse BOQ",
    "task_results": {}
}
result1 = graph.invoke(state1, config)

# Second agent execution - carry forward results
state2 = {
    "user_query": "Calculate carbon",
    "task_results": {
        "boq_parsed": True,
        "materials_count": 42,
        # ... previous results
    }
}
result2 = graph.invoke(state2, config)
```

### 3. Error Handling

```python
try:
    result = graph.invoke(state, config)
except Exception as e:
    # Increment error count
    state["error_count"] += 1
    logger.error(f"Agent execution failed: {e}")

    if state["error_count"] >= 3:
        # Escalate to user interaction agent
        state["user_query"] = f"Error: {e}. Need clarification."
        result = graph.invoke(state, config)
```

## Wave 2-4 Implementation Guide

Specialist agents will be implemented in three waves:

### Wave 2: Core Agents (Tasks 10-15)
1. BOQ Parser Agent
2. Carbon Calculator Agent
3. Material Matcher Agent
4. Material Optimizer Agent
5. Scenario Manager Agent
6. User Interaction Agent

### Wave 3: Advanced Agents (Tasks 16-18)
7. Knowledge Graph Query Agent
8. Semantic Reasoning Agent
9. Cost Analyst Agent

### Wave 4: Emerging Agents (Tasks 19-21)
10. Regulatory Compliance Agent
11. Supply Chain Agent
12. Reporting Agent

### Agent Implementation Pattern

Each specialist agent follows this structure:

```python
from suna.backend.core.agents.base import Agent
from suna.backend.core.agents.state import AgentState

class BOQParserAgent(Agent):
    def __init__(self):
        super().__init__(
            name="boq_parser",
            capabilities={"parse:boq", "extract:quantities"}
        )

    async def execute(self, state: AgentState) -> dict[str, any]:
        """Parse BOQ and extract material quantities."""
        # Implementation logic
        return {
            "boq_parsed": True,
            "materials": [...],
            "quantities": {...}
        }
```

## Environment Configuration

```bash
# PostgreSQL checkpointing (production)
DATABASE_URL=postgresql://user:pass@localhost/suna

# Health check will automatically detect and test agent system
# No additional configuration needed
```

## Best Practices

1. **Always use thread_id** for stateful conversations
2. **Explicitly carry forward task_results** between invocations
3. **Use MemorySaver for tests** (fast, no database dependency)
4. **Clean up global router** in test teardown (`set_router(None)`)
5. **Skip PostgreSQL tests** if `DATABASE_URL` not configured
6. **Monitor agent_history** for debugging routing decisions
7. **Increment error_count** on failures for circuit breaking

## References

- LangGraph Documentation: https://langchain-ai.github.io/langgraph/
- PostgresSaver: https://langchain-ai.github.io/langgraph/reference/checkpoints/#postgressaver
- Supervisor Pattern: https://langchain-ai.github.io/langgraph/how-tos/supervisor/
- State Management: https://langchain-ai.github.io/langgraph/concepts/low_level/#state
