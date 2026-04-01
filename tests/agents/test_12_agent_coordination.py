"""Tests for 12-agent coordination and routing accuracy."""

import pytest
from suna.backend.core.agents.supervisor import create_supervisor_graph, ALL_AGENTS
from suna.backend.core.agents.router import SupervisorRouter
from suna.backend.core.agents.state import AgentState


def test_all_12_agents_registered():
    """Test that all 12 agents are registered in the system.

    Note: The system has 11 specialist agents + 1 supervisor (12 total components).
    ALL_AGENTS tracks all components including the supervisor.
    """
    assert len(ALL_AGENTS) == 12, f"Expected 12 components (11 specialists + supervisor), got {len(ALL_AGENTS)}"

    expected_agents = {
        # 11 specialist agents
        "material_analyst",
        "carbon_calculator",
        "tgo_database",
        "knowledge_graph",
        "user_interaction",
        "boq_parser",
        "sustainability",
        "cost_analyst",
        "compliance",
        "report_generator",
        "data_validator",
        # 1 supervisor (orchestrator)
        "supervisor",
    }

    assert set(ALL_AGENTS.keys()) == expected_agents


def test_graph_compiles_with_12_agents():
    """Test that the graph compiles successfully with all 12 agents."""
    graph = create_supervisor_graph()
    assert graph is not None


def test_12_agent_routing_accuracy():
    """Test supervisor routes queries to correct agents (routing accuracy validation)."""
    graph = create_supervisor_graph()

    test_cases = [
        # Original 5 agents
        ("Calculate carbon footprint", ["carbon_calculator"]),
        ("Find material alternatives", ["material_analyst"]),
        ("Query TGO database for emission factor", ["tgo_database", "material_analyst"]),  # Both can handle
        ("Check compliance with SPARQL", ["knowledge_graph"]),  # Specific to KG
        ("What can I do?", ["user_interaction"]),

        # 6 additional agents
        ("Parse BOQ file", ["boq_parser"]),
        ("Generate optimization strategies", ["sustainability"]),
        ("Analyze cost impact", ["cost_analyst"]),
        ("Check TREES compliance", ["compliance", "knowledge_graph"]),  # Both can handle
        ("Generate PDF report", ["report_generator"]),
        ("Validate data quality", ["data_validator"]),
    ]

    correct_routes = 0
    total_tests = len(test_cases)

    for query, expected_agents in test_cases:
        # Handle both single agent and list of acceptable agents
        if not isinstance(expected_agents, list):
            expected_agents = [expected_agents]

        state: AgentState = {
            "user_query": query,
            "current_agent": "",
            "agent_history": [],
            "task_results": {},
            "error_count": 0,
            "scenario_context": None
        }

        result = graph.invoke(state)
        actual_agent = result["current_agent"]

        if actual_agent in expected_agents:
            correct_routes += 1
        else:
            expected_str = " or ".join(expected_agents)
            print(f"Routing mismatch: '{query}' -> {actual_agent} (expected {expected_str})")

    routing_accuracy = (correct_routes / total_tests) * 100
    print(f"Routing accuracy: {routing_accuracy:.1f}% ({correct_routes}/{total_tests})")

    # Target: ≥90% routing accuracy
    assert routing_accuracy >= 90.0, f"Routing accuracy {routing_accuracy:.1f}% < 90%"


def test_capability_based_routing_material_analyst():
    """Test material analyst agent is routed for material-related queries."""
    graph = create_supervisor_graph()

    queries = [
        ("Find alternatives for concrete", ["material_analyst", "sustainability"]),
        ("Match materials from BOQ", ["material_analyst", "boq_parser"]),
        ("Material identification", ["material_analyst"]),
    ]

    for query, acceptable_agents in queries:
        state: AgentState = {
            "user_query": query,
            "current_agent": "",
            "agent_history": [],
            "task_results": {},
            "error_count": 0,
            "scenario_context": None
        }

        result = graph.invoke(state)
        assert result["current_agent"] in acceptable_agents, \
            f"Query '{query}' routed to {result['current_agent']}, expected one of {acceptable_agents}"


def test_capability_based_routing_compliance():
    """Test compliance agent is routed for TREES/EDGE queries."""
    graph = create_supervisor_graph()

    queries = [
        "Check TREES NC 1.1 compliance",
        "Validate EDGE certification requirements",
        "Check MR1 criteria"
    ]

    for query in queries:
        state: AgentState = {
            "user_query": query,
            "current_agent": "",
            "agent_history": [],
            "task_results": {},
            "error_count": 0,
            "scenario_context": None
        }

        result = graph.invoke(state)
        # Compliance or knowledge_graph could handle these
        assert result["current_agent"] in ["compliance", "knowledge_graph"]


def test_capability_based_routing_cost_analyst():
    """Test cost analyst agent is routed for cost-related queries."""
    graph = create_supervisor_graph()

    queries = [
        ("Analyze cost impact", ["cost_analyst"]),
        ("What's the cost-carbon tradeoff?", ["cost_analyst", "carbon_calculator"]),  # "carbon" keyword matches calculator
        ("cost-effective analysis", ["cost_analyst"]),
    ]

    for query, acceptable_agents in queries:
        state: AgentState = {
            "user_query": query,
            "current_agent": "",
            "agent_history": [],
            "task_results": {},
            "error_count": 0,
            "scenario_context": None
        }

        result = graph.invoke(state)
        assert result["current_agent"] in acceptable_agents, \
            f"Query '{query}' routed to {result['current_agent']}, expected one of {acceptable_agents}"


def test_capability_based_routing_sustainability():
    """Test sustainability agent is routed for optimization queries."""
    graph = create_supervisor_graph()

    queries = [
        "Generate carbon optimization strategies",
        "Recommend ways to reduce carbon",
        "What are high-impact materials?"
    ]

    for query in queries:
        state: AgentState = {
            "user_query": query,
            "current_agent": "",
            "agent_history": [],
            "task_results": {},
            "error_count": 0,
            "scenario_context": None
        }

        result = graph.invoke(state)
        # Sustainability or material_analyst could handle these
        assert result["current_agent"] in ["sustainability", "material_analyst"]


def test_routing_with_multiple_capable_agents():
    """Test routing when multiple agents have same capability."""
    graph = create_supervisor_graph()

    # "optimize:carbon" capability shared by material_analyst and sustainability
    # Also "carbon" keyword matches carbon_calculator
    state: AgentState = {
        "user_query": "Generate carbon optimization strategies",
        "current_agent": "",
        "agent_history": [],
        "task_results": {},
        "error_count": 0,
        "scenario_context": None
    }

    result = graph.invoke(state)

    # Multiple agents can handle optimization
    assert result["current_agent"] in ["material_analyst", "sustainability", "carbon_calculator"]


def test_all_agents_have_capabilities():
    """Test that all 12 agents have at least one capability defined."""
    for agent_name, capabilities in ALL_AGENTS.items():
        assert len(capabilities) > 0, f"Agent {agent_name} has no capabilities"


def test_capability_uniqueness():
    """Test capability distribution across agents."""
    all_capabilities = []
    for capabilities in ALL_AGENTS.values():
        all_capabilities.extend(capabilities)

    # Check we have a good variety of capabilities
    unique_capabilities = set(all_capabilities)
    assert len(unique_capabilities) >= 10, "Need diverse set of capabilities"


def test_agent_state_preservation():
    """Test that agent state is properly preserved during routing."""
    graph = create_supervisor_graph()

    initial_state: AgentState = {
        "user_query": "Calculate carbon",
        "current_agent": "",
        "agent_history": [],
        "task_results": {"test": "data"},
        "error_count": 0,
        "scenario_context": {"scenario_id": "test-123"}
    }

    result = graph.invoke(initial_state)

    # Task results should be preserved
    assert result["task_results"]["test"] == "data"

    # Scenario context should be preserved
    assert result["scenario_context"]["scenario_id"] == "test-123"

    # Error count should be preserved
    assert result["error_count"] == 0


@pytest.mark.asyncio
async def test_12_agent_coordination_flow():
    """Test multi-agent handoff flow with 12 agents (integration test)."""
    # This is a placeholder for future coordination tests
    # Full implementation in Plan 03-04 (stress testing)

    graph = create_supervisor_graph()

    # Test simple query that might use multiple agents
    state: AgentState = {
        "user_query": "Analyze BOQ, find alternatives, optimize carbon, check compliance",
        "current_agent": "",
        "agent_history": [],
        "task_results": {},
        "error_count": 0,
        "scenario_context": None
    }

    result = graph.invoke(state)

    # At minimum, supervisor should route to one agent
    assert result["current_agent"] != ""
    assert len(result["agent_history"]) > 0


def test_router_handles_unknown_queries():
    """Test router falls back to user_interaction for unknown queries."""
    graph = create_supervisor_graph()

    state: AgentState = {
        "user_query": "What is the meaning of life?",
        "current_agent": "",
        "agent_history": [],
        "task_results": {},
        "error_count": 0,
        "scenario_context": None
    }

    result = graph.invoke(state)

    # Should fall back to user_interaction
    assert result["current_agent"] == "user_interaction"
