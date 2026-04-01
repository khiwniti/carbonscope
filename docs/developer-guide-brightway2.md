# Brightway2 Developer Guide

This guide explains how to work with the Brightway2 LCA engine in the CarbonBIM backend.

## Project Initialization
```python
from core.carbon.brightway.engine import init_project
init_project('CarbonBIM-Thailand')
```

## Deterministic Settings
All calculations must be deterministic. See `core/carbon/brightway/determinism.py` for configuration constants.

## Loading TGO Emission Factors
The loader `core.carbon.brightway.database_loader.load_tgo_database` (to be implemented) reads material data from GraphDB and creates Brightway2 activities.

## Using the Calculator
```python
from core.carbon.brightway.calculator import CarbonCalculator
calc = CarbonCalculator()
result = calc.calculate_material_carbon(
    material_id='materials/concrete-c30',
    quantity=Decimal('1200'),
    unit='kg'
)
print(result)
```

## Testing
Run the test suite with:
```
cd backend
uv run pytest core/carbon/brightway/tests
```
All tests must pass and maintain ≥ 2 % error tolerance against manual assessments.

## Performance
- 500 materials → < 5 s on typical CI runner.
- Use bulk loading (Turtle file import) to avoid per‑material INSERT overhead.

## Audit Trail
Audit records are created with `core.carbon.audit.AuditTrail`. Include the audit record when exposing API endpoints.
