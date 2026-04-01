# Contributing to BKS cBIM AI Platform

Thank you for your interest in contributing to the BKS cBIM AI Carbon Analysis Platform! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Agent Development](#agent-development)
- [Certification Module Updates](#certification-module-updates)

## Getting Started

### Prerequisites

- **Python 3.12+** with [uv](https://github.com/astral-sh/uv) package manager
- **Node.js 20+** with npm
- **Docker & Docker Compose** (for local services)
- **Git**
- **PostgreSQL 16+** (or use Docker)
- **GraphDB** (or use Docker)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/khiwniti/comprehensive-bks-cbim-ai-agent.git
   cd comprehensive-bks-cbim-ai-agent
   ```

2. **Run setup**
   ```bash
   make setup
   ```
   This will:
   - Install all dependencies
   - Create `.env` files from templates
   - Initialize the database

3. **Update environment variables**
   - Edit `backend/.env` with your database credentials
   - Edit `apps/frontend/.env.local` with API URLs

4. **Start services**
   ```bash
   make docker-up  # Start PostgreSQL, Redis, GraphDB
   make dev        # Start backend + frontend
   ```

5. **Verify installation**
   ```bash
   make health
   ```

## Development Workflow

### Branch Naming

- **Features**: `feature/description` (e.g., `feature/add-trees-mr5-credit`)
- **Bugfixes**: `fix/description` (e.g., `fix/edge-baseline-calculation`)
- **Documentation**: `docs/description`
- **Refactoring**: `refactor/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, or tooling

**Examples:**
```bash
feat(certification): add TREES MR5 credit calculation

Implement MR5 (Regional Materials) credit calculation with:
- Distance calculation from project location
- 10% threshold for 1 credit, 20% for 2 credits
- Integration with material database

Closes #123
```

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Run tests & linting
make pre-commit

# Commit changes
git add .
git commit -m "feat(scope): description"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub
```

## Code Standards

### Python (Backend)

**Formatting:** [Ruff](https://github.com/astral-sh/ruff)
```bash
make format-backend
```

**Linting:**
```bash
make lint-backend
```

**Style Guide:**
- PEP 8 compliant
- Max line length: 100 characters
- Use type hints for all function signatures
- Docstrings for all public functions (Google style)

**Example:**
```python
from typing import List, Dict
from decimal import Decimal

def calculate_carbon_total(
    materials: List[Dict[str, any]],
    emission_factors: Dict[str, Decimal]
) -> Decimal:
    """Calculate total carbon emissions for a list of materials.

    Args:
        materials: List of material dictionaries with 'id' and 'quantity' keys
        emission_factors: Mapping of material IDs to emission factors (kgCO2e/unit)

    Returns:
        Total carbon emissions in kgCO2e

    Raises:
        ValueError: If material ID not found in emission factors
    """
    total = Decimal("0")
    for material in materials:
        if material["id"] not in emission_factors:
            raise ValueError(f"Material {material['id']} not found")
        total += material["quantity"] * emission_factors[material["id"]]
    return total
```

### TypeScript/JavaScript (Frontend)

**Formatting:** Prettier
```bash
make format-frontend
```

**Linting:** ESLint
```bash
make lint-frontend
```

**Style Guide:**
- Max line length: 120 characters
- Use `const` > `let`, never `var`
- Prefer arrow functions
- Use async/await over promises
- TypeScript strict mode enabled

**Example:**
```typescript
interface Material {
  id: string;
  name: string;
  quantity: number;
  emissionFactor: number;
}

export const calculateCarbonTotal = (materials: Material[]): number => {
  return materials.reduce(
    (total, material) => total + material.quantity * material.emissionFactor,
    0
  );
};
```

### File Organization

```
backend/
├── agents/           # LangGraph agents
├── certification/    # TREES/EDGE modules
├── reports/          # PDF/Excel generators
├── core/
│   ├── agents/       # Core agent infrastructure
│   ├── database/     # Database models
│   └── utils/        # Shared utilities
├── tests/            # Test files
└── scripts/          # Utility scripts

apps/frontend/
├── src/
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   │   ├── ui/       # Reusable UI components
│   │   └── features/ # Feature-specific components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities
│   └── styles/       # Global styles
└── public/           # Static assets
```

## Testing Guidelines

### Running Tests

```bash
# All tests
make test

# Backend only
make test-backend

# Specific test suites
make test-agents
make test-certification
make test-reports

# With coverage
make test-coverage
```

### Writing Tests

**Python (pytest):**
```python
import pytest
from decimal import Decimal
from certification.trees import TREESCertificationModule

def test_mr1_recycled_materials_calculation():
    """Test MR1 credit calculation for recycled materials."""
    module = TREESCertificationModule()

    materials = [
        {"id": "MAT001", "recycled_content": Decimal("0.25"), "cost": 10000},
        {"id": "MAT002", "recycled_content": Decimal("0.10"), "cost": 5000},
    ]
    total_cost = Decimal("15000")

    result = module.calculate_mr1_credits(materials, total_cost)

    assert result["credits"] == 1.0
    assert result["recycled_percentage"] == Decimal("0.2")
    assert "thresholds" in result

@pytest.mark.parametrize("recycled_pct,expected_credits", [
    (Decimal("0.05"), 0),
    (Decimal("0.10"), 1),
    (Decimal("0.20"), 2),
])
def test_mr1_credit_thresholds(recycled_pct, expected_credits):
    """Test MR1 credit thresholds."""
    module = TREESCertificationModule()
    credits = module._calculate_mr1_score(recycled_pct)
    assert credits == expected_credits
```

**TypeScript (Vitest):**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateCarbonTotal } from './carbon';

describe('calculateCarbonTotal', () => {
  it('should calculate total carbon emissions', () => {
    const materials = [
      { id: '1', name: 'Concrete', quantity: 100, emissionFactor: 0.15 },
      { id: '2', name: 'Steel', quantity: 50, emissionFactor: 2.5 },
    ];

    const total = calculateCarbonTotal(materials);

    expect(total).toBe(140); // 100*0.15 + 50*2.5
  });

  it('should return 0 for empty materials', () => {
    expect(calculateCarbonTotal([])).toBe(0);
  });
});
```

### Test Coverage Requirements

- **Minimum coverage:** 80%
- **Critical paths:** 100% (certification calculations, carbon calculations)
- **New features:** Must include tests

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run pre-commit checks**
   ```bash
   make pre-commit
   ```

3. **Update documentation**
   - Add/update docstrings
   - Update README if adding features
   - Update CHANGELOG.md

4. **Test your changes**
   ```bash
   make test
   ```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks** must pass:
   - Linting
   - Type checking
   - Tests
   - Build

2. **Code review** by maintainer:
   - Logic correctness
   - Code quality
   - Test coverage
   - Documentation

3. **Merge** after approval

## Agent Development

### Creating a New Agent

1. **Create agent file** in `backend/core/agents/`:
```python
from typing import Dict, Any
from .base import Agent
from .state import AgentState

class MyNewAgent(Agent):
    """Agent for [specific purpose]."""

    def __init__(self, capability: str = "my:capability"):
        super().__init__(name="my_new_agent", capability=capability)

    async def execute(self, state: AgentState) -> Dict[str, Any]:
        """Execute agent logic.

        Args:
            state: Current agent state

        Returns:
            Result dictionary with findings
        """
        # Agent logic here
        return {
            "result": "my result",
            "metadata": {"key": "value"}
        }
```

2. **Register in supervisor** (`backend/core/agents/supervisor.py`):
```python
from .my_new_agent import MyNewAgent

router.register_agent(MyNewAgent())
```

3. **Write tests** (`backend/tests/agents/test_my_new_agent.py`):
```python
import pytest
from backend.core.agents.my_new_agent import MyNewAgent
from backend.core.agents.state import AgentState

@pytest.mark.asyncio
async def test_my_new_agent_execution():
    agent = MyNewAgent()
    state = AgentState(
        user_query="test query",
        current_agent="my_new_agent",
        agent_history=[],
        task_results={},
        error_count=0,
        scenario_context=None
    )

    result = await agent.execute(state)

    assert "result" in result
    assert result["result"] == "my result"
```

## Certification Module Updates

### TREES NC Updates

When TREES criteria change:

1. **Update schema** in `backend/knowledge_graph/schemas/trees-nc-*.ttl`
2. **Update calculation logic** in `backend/certification/trees.py`
3. **Update tests** in `backend/certification/tests/test_trees.py`
4. **Document changes** in commit message with official reference

### EDGE Updates

When EDGE methodology changes:

1. **Update baseline factors** in `backend/certification/edge.py`
2. **Update calculation logic** for new requirements
3. **Update tests** with new examples
4. **Reference official EDGE documentation** in commit

## Thai Language Contributions

- UI strings: Update both `en.json` and `th.json` in `apps/frontend/locales/`
- Report templates: Update both English and Thai templates in `backend/reports/templates/`
- Documentation: Primarily English, Thai translations welcome

## Questions?

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: [maintainer email]

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
