import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch


@pytest.mark.parametrize(
    "material_id,quantity,unit,expected_factor",
    [
        ("material1", "10", "kg", Decimal("0.5")),
    ],
)
def test_calculate_material_carbon(material_id, quantity, unit, expected_factor):
    """Test carbon calculation with mocked Brightway2 database."""

    # Create activity matching what calculator.py expects:
    # act.get("code"), act["exchanges"][0]["amount"]
    activity = {
        "code": material_id,
        "name": material_id,
        "exchanges": [{"amount": float(expected_factor), "type": "biosphere"}],
    }

    class DummyDB:
        def __bool__(self): return True
        def __iter__(self):
            return iter([activity])

    mock_bw = MagicMock()
    mock_bw.Database.return_value = DummyDB()

    with patch.dict("sys.modules", {"brightway2": mock_bw}):
        import sys
        for key in list(sys.modules.keys()):
            if "carbon.brightway" in key:
                del sys.modules[key]

        from core.carbon.brightway.calculator import CarbonCalculator
        calc = CarbonCalculator("dummy")
        result = calc.calculate_material_carbon(material_id, Decimal(quantity), unit)

    assert result["emission_factor"] == expected_factor
    assert result["total_carbon"] == Decimal(quantity) * expected_factor
