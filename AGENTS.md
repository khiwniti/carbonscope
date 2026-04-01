# AGENTS.md - Agent Development Guide

## Quick Reference

**Frontend (TypeScript/Next.js):**
- `pnpm dev` - Start dev server (Turbopack)
- `pnpm build` - Production build
- `pnpm lint` - ESLint check
- `pnpm format` - Prettier write
- `pnpm format:check` - Prettier check

**Backend (Python/FastAPI):**
- `cd backend && uv run python api.py` - Start API server
- `cd backend && uv run pytest` - Run all tests
- `cd backend && uv run pytest tests/path/to/test_file.py -v` - Run single test
- `cd backend && uv run pytest -m e2e` - Run E2E tests only
- `cd backend && uv run pytest -m "not slow"` - Exclude slow tests
- `cd backend && uv run ruff check core/` - Lint
- `cd backend && uv run ruff check --fix core/` - Auto-fix lint
- `cd backend && uv run python core/utils/scripts/verify_build.py` - Verify build

**Platform:**
- `python setup.py` - Interactive setup wizard
- `python start.py start` - Start platform
- `python start.py stop` - Stop platform

## Project Structure

```
suna/
├── apps/frontend/       # Next.js 15 web app
├── apps/mobile/         # React Native app
├── apps/desktop/        # Electron desktop app
├── packages/shared/     # Shared TypeScript types/utils
├── backend/             # FastAPI Python backend
│   ├── core/            # Business logic
│   ├── tests/           # Test suite (pytest)
│   └── pyproject.toml   # Python deps (uv)
├── sdk/                 # Python SDK for agents
├── setup/               # Setup wizard
├── infra/               # IaC (Terraform/Pulumi)
└── docs/                # Documentation
```

## Code Style Guidelines

### Philosophy
- **Simplicity first**: Less is more. Prefer 10 lines over 100.
- **No inline comments**: Use docstrings only. Code should be self-documenting.
- **Single responsibility**: Each function/class does one thing well.
- **Fail fast**: Meaningful errors, no hidden side effects.

### TypeScript/React Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `AgentCard.tsx`)
- Pages: `page.tsx`, `layout.tsx` (Next.js convention)
- API Routes: `route.ts`
- Hooks: `use*.ts` (e.g., `useAgent.ts`)
- Utils: `camelCase.ts` or `kebab-case.ts`

**Imports (ordered):**
```typescript
// 1. React/Next.js core
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party (alphabetical)
import { Button } from '@radix-ui/react-button';
import { z } from 'zod';

// 3. Internal (@bks/shared)
import { Agent } from '@bks/shared';

// 4. Relative imports
import { cn } from '@/lib/utils';
import type { Props } from './types';
```

**Components:**
```typescript
'use client'; // If interactive

interface Props {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick?.();
    } finally {
      setLoading(false);
    }
  };

  return <div>{agent.name}</div>;
}
```

**Types:**
- Use interfaces for object shapes
- Avoid `any` (use `unknown` + type guards)
- Prefer type inference when clear

### Python Conventions

**Files:**
- Modules: `snake_case.py` (e.g., `agent_manager.py`)
- Tests: `test_*.py` (pytest convention)
- Classes: `PascalCase`

**Imports (ordered):**
```python
# 1. Standard library
import asyncio
from typing import Any, Optional

# 2. Third-party
import httpx
from fastapi import FastAPI, Depends
from pydantic import BaseModel

# 3. Local application
from core.agents import AgentManager
from .models import Agent
```

**Functions:**
```python
async def create_agent(
    name: str,
    model: str,
    tools: Optional[list[str]] = None,
) -> Agent:
    """
    Create a new AI agent.

    Args:
        name: Human-readable name
        model: LLM model identifier
        tools: Optional tool names

    Returns:
        The created Agent instance

    Raises:
        ValidationError: If name empty or model invalid
    """
    if not name:
        raise ValidationError("Name required")

    return Agent(id=uuid(), name=name, model=model)
```

**Naming:**
- Functions/vars: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE`
- Private: `_internal` (single underscore)

## Error Handling

### Frontend
```typescript
async function handleSubmit() {
  try {
    setIsLoading(true);
    setError(null);
    const result = await createAgent(data);
    toast.success('Created!');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
}
```

### Backend
```python
from fastapi import HTTPException, status

@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str, user: User = Depends(get_current_user)):
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent
```

## Testing

### Running Tests
```bash
# Backend (all tests)
cd backend && uv run pytest

# Single test file
cd backend && uv run pytest tests/core/test_agent.py -v

# Single test function
cd backend && uv run pytest tests/core/test_agent.py::test_create_agent -v

# E2E tests only
cd backend && uv run pytest -m e2e -v

# Exclude slow tests
cd backend && uv run pytest -m "not slow" -v

# With coverage
cd backend && uv run pytest --cov=backend/core --cov-report=html
```

### Test Naming (Python)
```python
def test_<function>_<scenario>_<expected_result>():
    """Should describe expected behavior in docstring."""
```

### Test Structure
```python
# backend/tests/core/test_agent.py
import pytest
from core.agents import AgentManager

@pytest.mark.asyncio
async def test_create_agent_with_valid_data_returns_agent(sample_agent):
    manager = AgentManager(db=test_db)
    agent = await manager.create(**sample_agent)
    assert agent.name == sample_agent["name"]
    assert agent.id is not None
```

## Logging

### Backend (structlog)
```python
import structlog

logger = structlog.get_logger()

logger.info("agent_created", agent_id=agent.id, user_id=user.id)
logger.error("llm_request_failed", error=str(e), model=model)
```

### Frontend
```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Agent:', agent);
}

// Production logging
logger.info('agent_created', { agentId: agent.id });
```

## Key Technologies

**Frontend:** Next.js 15, React 18, TypeScript 5, TailwindCSS 4, Radix UI, Zustand, TanStack Query
**Backend:** Python 3.11+, FastAPI, LiteLLM, Pydantic v2, Redis, Supabase
**Package Mgr:** pnpm (frontend), uv (backend)
**Testing:** pytest (backend), no test framework configured (frontend - gap)

## Cursor Rules

See `.claude/` directory for project-specific rules:
- `code-style.md` - Style guide
- `simplicity.md` - Simplicity philosophy
- `local-dev.md` - Local development
- `package-management.md` - Dependency management
- `supabase-migrations.md` - Database migrations

## Notes

- **Monorepo:** Use `pnpm` for frontend, `uv` for backend
- **Shared types:** Update `packages/shared` when adding new entities
- **Async by default:** Use async/await throughout both stacks
- **Consistency:** Follow existing patterns in codebase
- **Auto-format:** Run `pnpm format` / `ruff check --fix` before committing
