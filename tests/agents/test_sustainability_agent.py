"""Tests for Sustainability Agent - Pareto analysis and optimization strategies."""

import pytest
from decimal import Decimal
from suna.backend.core.agents.sustainability_agent import SustainabilityAgent
from suna.backend.core.agents.state import AgentState


@pytest.fixture
def agent():
    """Create Sustainability Agent for testing."""
    return SustainabilityAgent()


@pytest.fixture
def sample_materials():
    """Sample material breakdown for testing."""
    return [
        {
            "material_id": "tgo:concrete_c30",
            "name": "Concrete C30",
            "quantity": 500.0,
            "unit": "m³",
            "emission_factor": 320.0,
            "total_carbon": 160000.0  # 500 * 320
        },
        {
            "material_id": "tgo:steel_rebar",
            "name": "Steel Rebar SD40",
            "quantity": 15000.0,
            "unit": "kg",
            "emission_factor": 2.8,
            "total_carbon": 42000.0  # 15000 * 2.8
        },
        {
            "material_id": "tgo:glass_float",
            "name": "Float Glass",
            "quantity": 200.0,
            "unit": "m²",
            "emission_factor": 25.0,
            "total_carbon": 5000.0  # 200 * 25
        },
        {
            "material_id": "tgo:wood_lumber",
            "name": "Wood Lumber",
            "quantity": 10.0,
            "unit": "m³",
            "emission_factor": 150.0,
            "total_carbon": 1500.0  # 10 * 150
        }
    ]


def test_identify_high_impact_materials_pareto_analysis(agent, sample_materials):
    """Test Pareto analysis identifies materials contributing to 80% of carbon."""
    total_carbon = Decimal("208500.0")  # Sum of all materials

    high_impact = agent.identify_high_impact_materials(sample_materials, total_carbon)

    # Should identify concrete and steel (combined ~97% of carbon)
    assert len(high_impact) >= 2
    assert high_impact[0]["material_id"] == "tgo:concrete_c30"  # Highest contributor
    assert high_impact[1]["material_id"] == "tgo:steel_rebar"  # Second highest

    # Check carbon percentages are calculated
    assert "carbon_percentage" in high_impact[0]
    assert "cumulative_percentage" in high_impact[0]

    # Concrete should be ~76.8% of total carbon
    assert high_impact[0]["carbon_percentage"] > 70

    # Cumulative should reach ~80% within first 2-3 materials
    cumulative = high_impact[-1]["cumulative_percentage"]
    assert cumulative >= 80.0


def test_identify_high_impact_materials_sorting(agent, sample_materials):
    """Test high-impact materials are sorted by carbon contribution (descending)."""
    total_carbon = Decimal("208500.0")

    high_impact = agent.identify_high_impact_materials(sample_materials, total_carbon)

    # Check sorting
    for i in range(len(high_impact) - 1):
        current_carbon = Decimal(str(high_impact[i]["total_carbon"]))
        next_carbon = Decimal(str(high_impact[i + 1]["total_carbon"]))
        assert current_carbon >= next_carbon


def test_identify_high_impact_materials_empty_input(agent):
    """Test Pareto analysis with empty material list."""
    high_impact = agent.identify_high_impact_materials([], Decimal("0"))
    assert high_impact == []


@pytest.mark.asyncio
async def test_execute_generates_strategies(agent, sample_materials):
    """Test agent execution generates optimization strategies."""
    state: AgentState = {
        "user_query": "Generate carbon optimization strategies",
        "current_agent": "sustainability",
        "agent_history": [],
        "task_results": {
            "material_breakdown": sample_materials,
            "total_carbon": Decimal("208500.0")
        },
        "error_count": 0,
        "scenario_context": None
    }

    result = await agent.execute(state)

    # Check result structure
    assert "high_impact_materials" in result
    assert "optimization_strategies" in result
    assert "estimated_reduction" in result

    # Should have identified high-impact materials
    assert len(result["high_impact_materials"]) > 0

    # Should have generated strategies
    assert len(result["optimization_strategies"]) > 0

    # Each strategy should have required fields
    for strategy in result["optimization_strategies"]:
        assert "type" in strategy
        assert strategy["type"] in ["material_swap", "design_optimization", "quantity_reduction"]
        assert "material_name" in strategy
        assert "recommendation" in strategy
        assert "estimated_reduction_kgco2e" in strategy
        assert "estimated_reduction_percentage" in strategy


@pytest.mark.asyncio
async def test_execute_estimates_reduction(agent, sample_materials):
    """Test estimated reduction is calculated correctly."""
    state: AgentState = {
        "user_query": "Generate carbon optimization strategies",
        "current_agent": "sustainability",
        "agent_history": [],
        "task_results": {
            "material_breakdown": sample_materials,
            "total_carbon": Decimal("208500.0")
        },
        "error_count": 0,
        "scenario_context": None
    }

    result = await agent.execute(state)

    # Estimated reduction should be sum of all strategy reductions
    estimated_reduction = result["estimated_reduction"]
    assert estimated_reduction > 0

    # Manual sum check
    strategy_sum = sum(
        Decimal(str(s["estimated_reduction_kgco2e"]))
        for s in result["optimization_strategies"]
    )
    assert estimated_reduction == strategy_sum


@pytest.mark.asyncio
async def test_execute_handles_empty_materials(agent):
    """Test agent handles empty material breakdown gracefully."""
    state: AgentState = {
        "user_query": "Generate carbon optimization strategies",
        "current_agent": "sustainability",
        "agent_history": [],
        "task_results": {},
        "error_count": 0,
        "scenario_context": None
    }

    result = await agent.execute(state)

    # Should return empty results without errors
    assert result["high_impact_materials"] == []
    assert result["optimization_strategies"] == []
    assert result["estimated_reduction"] == Decimal("0")


def test_strategy_types_generated(agent, sample_materials):
    """Test that all three strategy types are generated for structural materials."""
    # Focus on concrete (should get all 3 strategy types)
    concrete_material = [m for m in sample_materials if "concrete" in m["name"].lower()][0]

    strategies = []
    import asyncio

    async def generate():
        state: AgentState = {
            "user_query": "Generate strategies",
            "current_agent": "sustainability",
            "agent_history": [],
            "task_results": {
                "material_breakdown": [concrete_material],
                "total_carbon": Decimal("160000.0")
            },
            "error_count": 0,
            "scenario_context": None
        }
        return await agent.execute(state)

    result = asyncio.run(generate())
    strategies = result["optimization_strategies"]

    # Should have at least 3 strategies for concrete
    assert len(strategies) >= 3

    strategy_types = {s["type"] for s in strategies}
    assert "material_swap" in strategy_types
    assert "design_optimization" in strategy_types
    assert "quantity_reduction" in strategy_types
