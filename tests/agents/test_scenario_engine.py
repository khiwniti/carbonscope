"""Tests for ScenarioEngine.

Following TDD approach as specified in plan 03-02.
"""

import pytest
import asyncio
import time
from decimal import Decimal
from datetime import datetime
from suna.backend.agents.scenario_engine import (
    ScenarioEngine,
    Scenario,
)


class MockCheckpointer:
    """Mock checkpointer for testing."""

    def __init__(self):
        self.storage = {}

    async def put(self, key: str, value: dict):
        """Store scenario data."""
        self.storage[key] = value

    async def get(self, key: str):
        """Retrieve scenario data."""
        return self.storage.get(key)


class MockCarbonCalculator:
    """Mock carbon calculator for testing."""

    async def calculate_material_carbon(
        self, material_id: str, quantity: Decimal, unit: str
    ) -> dict:
        """Calculate carbon for a single material."""
        # Mock emission factors
        emission_factors = {
            "tgo:concrete_c30": Decimal("300.0"),
            "tgo:concrete_recycled": Decimal("180.5"),
            "tgo:steel_rebar": Decimal("2264.5"),
            "tgo:steel_recycled": Decimal("1500.0"),
        }

        factor = emission_factors.get(material_id, Decimal("100.0"))
        total_carbon = factor * quantity

        return {
            "material_id": material_id,
            "total_carbon": total_carbon,
            "emission_factor": factor,
            "quantity": quantity,
            "unit": unit,
        }


@pytest.fixture
def checkpointer():
    """Provide mock checkpointer."""
    return MockCheckpointer()


@pytest.fixture
def carbon_calculator():
    """Provide mock carbon calculator."""
    return MockCarbonCalculator()


@pytest.fixture
def scenario_engine(checkpointer, carbon_calculator):
    """Provide ScenarioEngine instance."""
    return ScenarioEngine(checkpointer, carbon_calculator)


@pytest.mark.asyncio
async def test_create_base_scenario(scenario_engine):
    """Test 1: create_base_scenario() creates immutable base scenario with total_carbon."""
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
        {
            "material_id": "tgo:steel_rebar",
            "quantity": Decimal("10.0"),
            "unit": "ton",
            "description": "Steel Rebar",
            "category": "steel",
            "total_carbon": Decimal("22645.0"),
        },
    ]

    scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    assert scenario is not None
    assert scenario.base_scenario_id is None  # Base scenario has no parent
    assert scenario.boq_id == "boq_123"
    assert scenario.user_id == "user_456"
    assert len(scenario.materials) == 2
    assert scenario.total_carbon > 0
    assert len(scenario.material_swaps) == 0
    assert scenario.delta_carbon is None
    assert scenario.delta_percentage is None


@pytest.mark.asyncio
async def test_fork_scenario_with_material_swaps(scenario_engine):
    """Test 2: fork_scenario() creates new scenario with material swaps applied."""
    # Create base scenario first
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    # Fork with material swap
    material_swaps = [
        {
            "original_material_id": "tgo:concrete_c30",
            "replacement_material_id": "tgo:concrete_recycled",
            "quantity": Decimal("100.0"),
            "unit": "m3",
        }
    ]

    forked_scenario = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=material_swaps,
    )

    assert forked_scenario is not None
    assert forked_scenario.base_scenario_id == base_scenario.scenario_id
    assert forked_scenario.scenario_id != base_scenario.scenario_id
    assert len(forked_scenario.material_swaps) == 1
    assert forked_scenario.total_carbon != base_scenario.total_carbon


@pytest.mark.asyncio
async def test_forked_scenario_has_delta_carbon(scenario_engine):
    """Test 3: Forked scenario has delta_carbon and delta_percentage calculated."""
    # Create base scenario
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    # Fork with lower-carbon material
    material_swaps = [
        {
            "original_material_id": "tgo:concrete_c30",
            "replacement_material_id": "tgo:concrete_recycled",
            "quantity": Decimal("100.0"),
            "unit": "m3",
        }
    ]

    forked_scenario = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=material_swaps,
    )

    assert forked_scenario.delta_carbon is not None
    assert forked_scenario.delta_percentage is not None
    # Should have negative delta (carbon reduction)
    assert forked_scenario.delta_carbon < 0
    assert forked_scenario.delta_percentage < 0


@pytest.mark.asyncio
async def test_incremental_recalculation_only_swapped_materials(scenario_engine):
    """Test 4: Incremental recalculation only recalculates swapped materials."""
    # Create scenario with multiple materials
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
        {
            "material_id": "tgo:steel_rebar",
            "quantity": Decimal("10.0"),
            "unit": "ton",
            "description": "Steel Rebar",
            "category": "steel",
            "total_carbon": Decimal("22645.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    # Swap only concrete (not steel)
    material_swaps = [
        {
            "original_material_id": "tgo:concrete_c30",
            "replacement_material_id": "tgo:concrete_recycled",
            "quantity": Decimal("100.0"),
            "unit": "m3",
        }
    ]

    forked_scenario = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=material_swaps,
    )

    # Verify that steel's carbon is unchanged
    base_steel_carbon = next(
        m["total_carbon"] for m in base_scenario.material_breakdown
        if m["material_id"] == "tgo:steel_rebar"
    )

    forked_steel_carbon = next(
        m["total_carbon"] for m in forked_scenario.material_breakdown
        if m["material_id"] == "tgo:steel_rebar"
    )

    assert base_steel_carbon == forked_steel_carbon


@pytest.mark.asyncio
async def test_scenario_recalculation_performance(scenario_engine):
    """Test 5: Scenario recalculation completes in <2 seconds."""
    # Create base scenario
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    # Measure fork time
    material_swaps = [
        {
            "original_material_id": "tgo:concrete_c30",
            "replacement_material_id": "tgo:concrete_recycled",
            "quantity": Decimal("100.0"),
            "unit": "m3",
        }
    ]

    start_time = time.time()
    forked_scenario = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=material_swaps,
    )
    duration = time.time() - start_time

    assert forked_scenario is not None
    assert duration < 2.0  # Should complete in under 2 seconds


@pytest.mark.asyncio
async def test_compare_scenarios(scenario_engine):
    """Test 6: compare_scenarios() returns side-by-side comparison."""
    # Create base scenario
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    # Create two forks with different swaps
    fork1 = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=[
            {
                "original_material_id": "tgo:concrete_c30",
                "replacement_material_id": "tgo:concrete_recycled",
                "quantity": Decimal("100.0"),
                "unit": "m3",
            }
        ],
    )

    fork2 = await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=[
            {
                "original_material_id": "tgo:concrete_c30",
                "replacement_material_id": "tgo:concrete_recycled",
                "quantity": Decimal("50.0"),  # Only swap half
                "unit": "m3",
            }
        ],
    )

    # Compare all scenarios
    comparison = await scenario_engine.compare_scenarios([
        base_scenario.scenario_id,
        fork1.scenario_id,
        fork2.scenario_id,
    ])

    assert "scenarios" in comparison
    assert len(comparison["scenarios"]) == 3
    assert "best_scenario_id" in comparison
    assert "max_carbon_reduction" in comparison


@pytest.mark.asyncio
async def test_scenario_immutability(scenario_engine):
    """Test 7: Immutability preserved (base scenario unchanged after fork)."""
    # Create base scenario
    materials = [
        {
            "material_id": "tgo:concrete_c30",
            "quantity": Decimal("100.0"),
            "unit": "m3",
            "description": "Concrete C30",
            "category": "concrete",
            "total_carbon": Decimal("30000.0"),
        },
    ]

    base_scenario = await scenario_engine.create_base_scenario(
        boq_id="boq_123",
        user_id="user_456",
        materials=materials,
    )

    original_total_carbon = base_scenario.total_carbon
    original_material_count = len(base_scenario.materials)

    # Fork with material swap
    material_swaps = [
        {
            "original_material_id": "tgo:concrete_c30",
            "replacement_material_id": "tgo:concrete_recycled",
            "quantity": Decimal("100.0"),
            "unit": "m3",
        }
    ]

    await scenario_engine.fork_scenario(
        base_scenario_id=base_scenario.scenario_id,
        material_swaps=material_swaps,
    )

    # Re-load base scenario and verify it hasn't changed
    reloaded_base = await scenario_engine._load_scenario(base_scenario.scenario_id)

    assert reloaded_base.total_carbon == original_total_carbon
    assert len(reloaded_base.materials) == original_material_count
    assert len(reloaded_base.material_swaps) == 0
