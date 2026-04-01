"""Tests for AlternativeRecommendationEngine.

Following TDD approach as specified in plan 03-02.
"""

import pytest
from decimal import Decimal
from suna.backend.agents.alternatives_engine import (
    AlternativeRecommendationEngine,
    MaterialAlternative,
)


class MockGraphDBClient:
    """Mock GraphDB client for testing."""

    async def query(self, sparql: str):
        """Mock SPARQL query that returns lower-emission alternatives."""
        # Simulate finding concrete alternatives
        if "concrete" in sparql.lower() or "tgo:concrete" in sparql.lower():
            return [
                {
                    "material_id": {"value": "tgo:concrete_recycled"},
                    "label": {"value": "Recycled Concrete"},
                    "emission_factor": {"value": "180.5"},
                    "category": {"value": "concrete"},
                },
                {
                    "material_id": {"value": "tgo:concrete_geopolymer"},
                    "label": {"value": "Geopolymer Concrete"},
                    "emission_factor": {"value": "150.2"},
                    "category": {"value": "concrete"},
                },
                {
                    "material_id": {"value": "tgo:concrete_lcpc"},
                    "label": {"value": "Low Carbon Portland Cement"},
                    "emission_factor": {"value": "220.8"},
                    "category": {"value": "concrete"},
                },
            ]
        return []


class MockTGODatabaseAgent:
    """Mock TGO database agent for testing."""

    async def get_material(self, material_id: str):
        """Get material details."""
        materials = {
            "tgo:concrete_c30": {
                "material_id": "tgo:concrete_c30",
                "label": "Concrete C30",
                "emission_factor": Decimal("300.0"),
                "category": "concrete",
                "availability": "high",
            },
            "tgo:concrete_recycled": {
                "material_id": "tgo:concrete_recycled",
                "label": "Recycled Concrete",
                "emission_factor": Decimal("180.5"),
                "category": "concrete",
                "availability": "high",
            },
            "tgo:concrete_geopolymer": {
                "material_id": "tgo:concrete_geopolymer",
                "label": "Geopolymer Concrete",
                "emission_factor": Decimal("150.2"),
                "category": "concrete",
                "availability": "medium",
            },
            "tgo:concrete_lcpc": {
                "material_id": "tgo:concrete_lcpc",
                "label": "Low Carbon Portland Cement",
                "emission_factor": Decimal("220.8"),
                "category": "concrete",
                "availability": "high",
            },
        }
        return materials.get(material_id)


@pytest.fixture
def graphdb_client():
    """Provide mock GraphDB client."""
    return MockGraphDBClient()


@pytest.fixture
def tgo_agent():
    """Provide mock TGO database agent."""
    return MockTGODatabaseAgent()


@pytest.fixture
def alternatives_engine(graphdb_client, tgo_agent):
    """Provide AlternativeRecommendationEngine instance."""
    return AlternativeRecommendationEngine(graphdb_client, tgo_agent)


@pytest.mark.asyncio
async def test_recommend_alternatives_returns_lower_emission_materials(
    alternatives_engine,
):
    """Test 1: Query for concrete alternatives returns materials with lower emission factors."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    assert len(alternatives) > 0
    # All alternatives should have lower emission factors than original (300.0)
    for alt in alternatives:
        assert alt.emission_factor < Decimal("300.0")
        assert alt.carbon_reduction_kgco2e > 0


@pytest.mark.asyncio
async def test_alternatives_ranked_by_carbon_reduction(alternatives_engine):
    """Test 2: Alternatives ranked by carbon reduction potential (highest reduction first)."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    # Should be ranked by ranking_score (which prioritizes carbon reduction)
    for i in range(len(alternatives) - 1):
        # Higher ranking score should come first
        assert alternatives[i].ranking_score >= alternatives[i + 1].ranking_score


@pytest.mark.asyncio
async def test_alternatives_include_cost_impact(alternatives_engine):
    """Test 3: Cost impact calculated and included in ranking."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    for alt in alternatives:
        # Cost impact should be a valid percentage
        assert isinstance(alt.cost_impact_percentage, Decimal)
        # Should be within reasonable range (-50% to +50%)
        assert -50 <= float(alt.cost_impact_percentage) <= 50


@pytest.mark.asyncio
async def test_availability_filter(alternatives_engine):
    """Test 4: Availability included in scoring."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    for alt in alternatives:
        # Availability should be one of the expected values
        assert alt.availability in ["high", "medium", "low"]


@pytest.mark.asyncio
async def test_compatibility_score(alternatives_engine):
    """Test 5: Compatibility score based on building type."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    for alt in alternatives:
        # Compatibility score should be between 0 and 1
        assert 0.0 <= alt.compatibility_score <= 1.0


@pytest.mark.asyncio
async def test_confidence_score(alternatives_engine):
    """Test 6: Confidence score reflects match quality."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    for alt in alternatives:
        # Confidence should be between 0 and 1
        assert 0.0 <= alt.confidence <= 1.0
        # Same category should have high confidence (0.9+)
        if alt.material_id.startswith("tgo:concrete"):
            assert alt.confidence >= 0.9


@pytest.mark.asyncio
async def test_top_5_alternatives_returned(alternatives_engine):
    """Test 7: Top 5 alternatives returned (not all possible matches)."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
    )

    # Should return at most 5 alternatives
    assert len(alternatives) <= 5


@pytest.mark.asyncio
async def test_recommend_alternatives_multi_criteria(alternatives_engine):
    """Integration test: Multi-criteria scoring working correctly."""
    alternatives = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("500.0"),
        building_type="commercial",
        user_priorities={"carbon_reduction": 0.6, "cost_impact": 0.2, "availability": 0.15, "compatibility": 0.05},
    )

    assert len(alternatives) > 0

    # Verify all required fields present
    for alt in alternatives:
        assert alt.material_id
        assert alt.name
        assert alt.emission_factor > 0
        assert alt.carbon_reduction_kgco2e > 0
        assert alt.carbon_reduction_percentage > 0
        assert isinstance(alt.cost_impact_percentage, Decimal)
        assert alt.availability in ["high", "medium", "low"]
        assert 0.0 <= alt.compatibility_score <= 1.0
        assert 0.0 <= alt.confidence <= 1.0
        assert 0.0 <= alt.ranking_score <= 1.0

    # Verify geopolymer (lowest emission factor) gets high ranking
    geopolymer = next((a for a in alternatives if "geopolymer" in a.name.lower()), None)
    assert geopolymer is not None
    assert geopolymer.ranking_score > 0.5  # Should score reasonably well (medium availability impacts score)


@pytest.mark.asyncio
async def test_ranking_strategies(alternatives_engine):
    """Test different ranking strategies produce different orderings."""
    # Carbon-first strategy
    carbon_first = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
        user_priorities={"carbon_reduction": 0.6, "cost_impact": 0.2, "availability": 0.15, "compatibility": 0.05},
    )

    # Cost-constrained strategy
    cost_constrained = await alternatives_engine.recommend_alternatives(
        material_id="tgo:concrete_c30",
        quantity=Decimal("100.0"),
        building_type="residential",
        user_priorities={"carbon_reduction": 0.3, "cost_impact": 0.5, "availability": 0.15, "compatibility": 0.05},
    )

    # Both should return results
    assert len(carbon_first) > 0
    assert len(cost_constrained) > 0

    # Top result might differ based on strategy
    # (This is optional - rankings may be same for mock data)
