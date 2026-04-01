# Project knowledge

## What is this?

CarbonBIM — a consultant-grade Thai construction carbon analysis platform built on the BKS agent platform (Suna). Calculates embodied carbon from BOQ Excel files using TGO emission factors. Generates TREES/EDGE certification-ready reports. Uses a 12-specialist LangGraph agent system with GraphDB knowledge graph.

## Monorepo structure

| Directory | What | Tech |
|-----------|------|------|
| `apps/frontend/` | Web dashboard & chat UI | Next.js 15, React 18, Tailwind, Radix UI, pnpm |
| `apps/mobile/` | Mobile app | React Native, Expo |
| `backend/` | API server & agent orchestration | Python 3.11, FastAPI, LiteLLM, LangGraph, Supabase |
| `packages/shared/` | Shared TypeScript types/utils | TypeScript |
| `infra/` | Infrastructure as code | Pulumi, TypeScript |
| `sdk/` | Python SDK for the platform | Python, uv |
| `setup/` | Setup wizard for local dev | Python |
| `knowledge_graph/` | RDF ontologies & SPARQL queries | TREES/EDGE certification data |
| `backend/lca/` | LCA carbon calculator engine | Brightway2, deterministic mode |
| `backend/certification/` | TREES & EDGE certification modules | Python |
| `backend/reports/` | PDF/Excel report generation | WeasyPrint, ReportLab |
| `backend/evals/` | Agent evaluation framework | Braintrust, pytest |

## Commands

### Install
```bash
pnpm install                  # Frontend + monorepo deps
cd backend && uv sync         # Backend deps
```

### Dev
```bash
make dev                      # Start frontend + backend together
make dev-frontend             # Frontend only (Next.js turbopack on :3000)
make dev-backend              # Backend only (FastAPI on :8000)
# Or directly:
pnpm dev:frontend             # Same as make dev-frontend
cd backend && uv run python api.py  # Same as make dev-backend
```

### Build
```bash
pnpm build:frontend           # Next.js production build
```

### Test
```bash
make backend-test             # cd backend && uv run pytest
make backend-test-e2e         # pytest -m e2e -v
make backend-test-coverage    # pytest --cov
```

### Lint & Format
```bash
make lint                     # Lint frontend + backend
make lint-frontend            # pnpm lint (eslint)
make lint-backend             # ruff check .
make format                   # Format frontend + backend
make format-frontend          # prettier --write
make format-backend           # ruff check --fix
```

### Docker
```bash
docker compose up -d          # Start all (frontend :3000, backend :8000, redis :6379)
docker compose down
docker compose logs -f
```

### Setup wizard
```bash
python setup.py               # Interactive setup for all services
python start.py               # Interactive start/stop/status/restart
```

## Tooling

- **Package manager (JS):** pnpm (monorepo workspaces in `apps/*`, `packages/*`)
- **Package manager (Python):** uv
- **Runtime versions:** Node 20, Python 3.11.10, uv 0.6.5 (via mise.toml)
- **Database:** PostgreSQL via Supabase (auth, storage, realtime)
- **Cache:** Redis (Upstash in prod, local in dev)
- **LLM:** LiteLLM (Anthropic, OpenAI, etc.)
- **Agent orchestration:** LangGraph with 12 specialist agents
- **Frontend component library:** Radix UI + custom CarbonScope design system (`components/ui/carbonscope/`)

## Conventions

- **Python:** snake_case functions, PascalCase classes, UPPER_SNAKE constants
- **Docstrings only** — no inline comments in Python
- **No dead code, no commented-out code, no speculative logic**
- **Composition over inheritance**
- **Backend linting:** ruff
- **Frontend linting:** eslint + prettier
- **Frontend uses React 18** with `@types/react@^18` (not React 19)
- **Bilingual:** Thai + English throughout the UI

## Gotchas

- Root `package.json` uses `overrides` (not `pnpm.overrides`) for type version pinning
- Frontend uses React 18.3.x but some packages (mobile) use React 19 — don't mix type versions across apps
- Local Supabase (`npx supabase start`) does NOT work with Docker Compose — use cloud Supabase or run manually
- Backend has no build step — runs directly via `uv run python api.py`
- `backend/supabase/` contains SQL migration files meant to be run via psql, not auto-migrated
- Brightway2 is pinned to `<2.5.0` for Python 3.12 compatibility
- The CarbonScope design system uses an emerald green theme — follow existing patterns in `components/ui/carbonscope/`
