# Calculation Methodology

This document describes the ISO 14040/14044 compliant embodied carbon calculation workflow used by CarbonBIM.

## Steps
1. **Data Acquisition**: Emission factors for construction materials are sourced from the TGO database and stored in a Brightway2 database.
2. **Deterministic Configuration**: The calculation runs in deterministic mode (no Monte‑Carlo uncertainty) using `Decimal` precision (28 digits).
3. **Material Carbon**: For each material, total carbon = quantity × emission factor.
4. **Project Aggregation**: Sum material totals to obtain project carbon.
5. **Audit Trail**: An `AuditTrail` record (see `core/carbon/audit.py`) captures inputs, steps, and results.

## Accuracy Requirements
- Consultant‑grade accuracy: ≤ 2 % error compared to manual consultant assessments.
- All calculations use `Decimal` to avoid floating‑point rounding errors.

## Performance
- Loading 500 materials and calculating a project takes < 5 s on typical hardware.

See `core/carbon/brightway/calculator.py` for implementation details.
