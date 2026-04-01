# SUNA BIM Platform - Makefile
# Comprehensive build, test, and deployment automation

.PHONY: help install test lint format clean dev build deploy docs

# Default target
.DEFAULT_GOAL := help

# Environment - Add uv to PATH
export PATH := $(HOME)/.local/bin:/teamspace/studios/this_studio/.local/bin:$(PATH)
SHELL := /bin/bash

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

##@ General

help: ## Display this help message
	@echo "$(GREEN)SUNA BIM Platform - Development Commands$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(YELLOW)<target>$(RESET)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

check-uv: ## Check if uv is installed, install if not
	@command -v uv >/dev/null 2>&1 || { \
		echo "$(YELLOW)uv not found, installing...$(RESET)"; \
		curl -LsSf https://astral.sh/uv/install.sh | sh; \
		echo "$(GREEN)✓ uv installed$(RESET)"; \
		echo "$(YELLOW)⚠ Please restart your shell or run: export PATH=\"\$$HOME/.local/bin:\$$PATH\"$(RESET)"; \
	}

##@ Setup & Installation

install: check-uv install-backend install-frontend ## Install all dependencies
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

install-backend: check-uv ## Install Python backend dependencies
	@echo "$(YELLOW)Installing backend dependencies...$(RESET)"
	cd suna/backend && uv sync
	@echo "$(GREEN)✓ Backend dependencies installed$(RESET)"

install-frontend: ## Install Node.js frontend dependencies with pnpm (workspace)
	@echo "$(YELLOW)Installing frontend dependencies...$(RESET)"
	cd suna && pnpm install --prefer-frozen-lockfile --network-concurrency 32
	@echo "$(GREEN)✓ Frontend dependencies installed$(RESET)"

# Performance optimization notes for pnpm:
# - Use --prefer-frozen-lockfile to skip resolution when lockfile is valid
# - Increase network concurrency with --network-concurrency 32 (adjust based on your network)
# - Consider setting registry to a faster mirror: pnpm config set registry https://registry.npmmirror.com
# - For CI environments, consider: pnpm install --frozen-lockfile --ignore-scripts

setup: check-uv install setup-env setup-db ## Complete initial setup
	@echo "$(GREEN)✓ Setup complete! Run 'make dev' to start$(RESET)"

setup-env: ## Create .env files from templates
	@echo "$(YELLOW)Setting up environment files...$(RESET)"
	@test -f backend/.env || cp backend/.env.example backend/.env 2>/dev/null || echo "# SUNA BIM Environment Variables" > backend/.env
	@test -f apps/frontend/.env.local || cp apps/frontend/.env.example apps/frontend/.env.local 2>/dev/null || echo "# Frontend Environment Variables" > apps/frontend/.env.local
	@echo "$(GREEN)✓ Environment files created$(RESET)"
	@echo "$(YELLOW)⚠ Please update .env files with your credentials$(RESET)"

setup-db: ## Initialize database and run migrations
	@echo "$(YELLOW)Setting up database...$(RESET)"
	cd suna/backend && uv run alembic upgrade head 2>/dev/null || echo "$(YELLOW)⚠ Database migrations not yet configured$(RESET)"
	@echo "$(GREEN)✓ Database setup complete (or skipped)$(RESET)"

##@ Development

dev: ## Start all development servers (frontend + backend)
	@echo "$(GREEN)Starting SUNA BIM development servers...$(RESET)"
	@trap 'kill 0' EXIT; \
	make dev-backend & \
	make dev-frontend & \
	wait

dev-backend: ## Start backend development server only
	@echo "$(YELLOW)Starting backend server on http://localhost:8000$(RESET)"
	cd suna/backend && uv run uvicorn api:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend development server only with Bun
	@echo "$(YELLOW)Starting frontend server on http://localhost:3000$(RESET)"
	cd suna/apps/frontend && bun run dev

##@ Testing

test: test-backend test-frontend ## Run all tests
	@echo "$(GREEN)✓ All tests complete$(RESET)"

test-backend: ## Run Python backend tests
	@echo "$(YELLOW)Running backend tests...$(RESET)"
	cd suna/backend && uv run pytest -v --cov=. --cov-report=term-missing

test-frontend: ## Run frontend tests with Bun
	@echo "$(YELLOW)Running frontend tests...$(RESET)"
	cd suna/apps/frontend && bun test

test-e2e: ## Run end-to-end tests with agent-browser
	@echo "$(YELLOW)Running E2E tests...$(RESET)"
	@command -v bunx >/dev/null 2>&1 || { echo "$(RED)✗ Bun not found. Install from https://bun.sh$(RESET)"; exit 1; }
	bunx agent-browser --version >/dev/null 2>&1 && echo "$(GREEN)✓ agent-browser available$(RESET)" || echo "$(YELLOW)agent-browser will be installed on first use$(RESET)"
	./scripts/run-e2e-tests.sh

test-integration: ## Run integration tests only
	@echo "$(YELLOW)Running integration tests...$(RESET)"
	cd suna/backend && uv run pytest tests/integration/ -v

test-agents: ## Run agent coordination tests
	@echo "$(YELLOW)Running agent tests...$(RESET)"
	cd suna/backend && uv run pytest tests/agents/ -v

test-certification: ## Run TREES/EDGE certification tests
	@echo "$(YELLOW)Running certification tests...$(RESET)"
	cd suna/backend && uv run pytest backend/certification/tests/ -v

test-reports: ## Run report generation tests
	@echo "$(YELLOW)Running report tests...$(RESET)"
	cd suna/backend && uv run pytest backend/tests/reports/ -v

test-watch: ## Run tests in watch mode
	cd suna/backend && uv run pytest-watch

test-coverage: ## Generate detailed test coverage report
	@echo "$(YELLOW)Generating coverage report...$(RESET)"
	cd suna/backend && uv run pytest --cov=. --cov-report=html --cov-report=term
	@echo "$(GREEN)✓ Coverage report generated: backend/htmlcov/index.html$(RESET)"

##@ Code Quality

lint: lint-backend lint-frontend ## Run all linters
	@echo "$(GREEN)✓ Linting complete$(RESET)"

lint-backend: ## Lint Python code
	@echo "$(YELLOW)Linting backend code...$(RESET)"
	cd suna/backend && uv run ruff check .
	cd suna/backend && uv run mypy .

lint-frontend: ## Lint TypeScript/JavaScript code with Bun
	@echo "$(YELLOW)Linting frontend code...$(RESET)"
	cd suna/apps/frontend && bun run lint

format: format-backend format-frontend ## Format all code
	@echo "$(GREEN)✓ Code formatting complete$(RESET)"

format-backend: ## Format Python code with ruff
	@echo "$(YELLOW)Formatting backend code...$(RESET)"
	cd suna/backend && uv run ruff format .
	cd suna/backend && uv run ruff check --fix .

format-frontend: ## Format TypeScript/JavaScript code with Bun
	@echo "$(YELLOW)Formatting frontend code...$(RESET)"
	cd suna/apps/frontend && bun run format

typecheck: ## Run TypeScript type checking with Bun
	@echo "$(YELLOW)Running type checks...$(RESET)"
	cd suna/apps/frontend && bun run typecheck
	cd suna/backend && uv run mypy .

##@ Database

db-migrate: ## Create new database migration
	@echo "$(YELLOW)Creating migration...$(RESET)"
	@read -p "Migration name: " name; \
	cd suna/backend && uv run alembic revision --autogenerate -m "$$name"

db-upgrade: ## Apply database migrations
	@echo "$(YELLOW)Applying migrations...$(RESET)"
	cd suna/backend && uv run alembic upgrade head
	@echo "$(GREEN)✓ Database upgraded$(RESET)"

db-downgrade: ## Rollback last migration
	@echo "$(YELLOW)Rolling back migration...$(RESET)"
	cd suna/backend && uv run alembic downgrade -1

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)⚠ WARNING: This will destroy all database data!$(RESET)"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		cd suna/backend && uv run alembic downgrade base && uv run alembic upgrade head; \
		echo "$(GREEN)✓ Database reset complete$(RESET)"; \
	else \
		echo "$(YELLOW)Database reset cancelled$(RESET)"; \
	fi

db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(RESET)"
	cd suna/backend && uv run python ../scripts/seed_database.py
	@echo "$(GREEN)✓ Database seeded$(RESET)"

##@ Build & Deploy

build: build-backend build-frontend ## Build all for production
	@echo "$(GREEN)✓ Build complete$(RESET)"

build-backend: ## Build Python backend (optional - for distribution only)
	@echo "$(YELLOW)Backend is an application, no build required$(RESET)"
	@echo "$(GREEN)✓ Backend ready for deployment$(RESET)"

build-frontend: ## Build Next.js frontend with Bun
	@echo "$(YELLOW)Building frontend...$(RESET)"
	cd suna/apps/frontend && bun run build

build-docker: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(RESET)"
	docker compose build

deploy-staging: ## Deploy to staging environment
	@echo "$(YELLOW)Deploying to staging...$(RESET)"
	./scripts/deploy-staging.sh

deploy-prod: ## Deploy to production (requires confirmation)
	@echo "$(RED)⚠ WARNING: This will deploy to PRODUCTION!$(RESET)"
	@read -p "Are you sure? Type 'production' to continue: " confirm; \
	if [ "$$confirm" = "production" ]; then \
		./scripts/deploy-production.sh; \
	else \
		echo "$(YELLOW)Production deployment cancelled$(RESET)"; \
	fi

##@ Documentation

docs: ## Generate API documentation
	@echo "$(YELLOW)Generating documentation...$(RESET)"
	cd suna/backend && uv run pdoc --html --output-dir docs/api .
	@echo "$(GREEN)✓ Documentation generated: docs/api/index.html$(RESET)"

docs-serve: ## Serve documentation locally
	@echo "$(YELLOW)Serving documentation on http://localhost:8080$(RESET)"
	cd docs && python -m http.server 8080

##@ Docker

docker-up: ## Start all services with Docker Compose
	@echo "$(YELLOW)Starting Docker services...$(RESET)"
	docker compose -f suna/docker-compose.yaml up -d
	@echo "$(GREEN)✓ Services started$(RESET)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(RESET)"
	@echo "$(YELLOW)Backend: http://localhost:8000$(RESET)"
	@echo "$(YELLOW)GraphDB: http://localhost:7200$(RESET)"

docker-down: ## Stop all Docker services
	@echo "$(YELLOW)Stopping Docker services...$(RESET)"
	docker compose -f suna/docker-compose.yaml down

docker-logs: ## Show Docker logs
	docker compose -f suna/docker-compose.yaml logs -f

docker-restart: ## Restart all Docker services
	@make docker-down
	@make docker-up

docker-clean: ## Remove all Docker containers and volumes
	@echo "$(RED)⚠ WARNING: This will remove all containers and volumes!$(RESET)"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker compose down -v; \
		echo "$(GREEN)✓ Docker cleanup complete$(RESET)"; \
	else \
		echo "$(YELLOW)Docker cleanup cancelled$(RESET)"; \
	fi

##@ Agents & AI

agents-test: ## Test agent coordination system
	@echo "$(YELLOW)Testing agent coordination...$(RESET)"
	cd suna/backend && uv run python scripts/test_agent_coordination.py

agents-monitor: ## Monitor agent execution in real-time
	@echo "$(YELLOW)Monitoring agents...$(RESET)"
	./scripts/monitor-agents.sh

agents-traces: ## View agent execution traces
	@echo "$(YELLOW)Fetching agent traces...$(RESET)"
	curl http://localhost:8000/api/v1/agents/traces | jq

agents-metrics: ## View agent performance metrics
	@echo "$(YELLOW)Fetching agent metrics...$(RESET)"
	curl http://localhost:8000/api/v1/agents/metrics | jq

##@ Reports & Certification

report-generate: ## Generate sample carbon analysis report
	@echo "$(YELLOW)Generating sample report...$(RESET)"
	cd suna/backend && uv run python backend/test_report_system.py

cert-trees: ## Test TREES certification calculation
	@echo "$(YELLOW)Testing TREES certification...$(RESET)"
	cd suna/backend && uv run python -c "from certification.trees import TREESCertificationModule; from certification.example_usage import run_trees_examples; run_trees_examples()"

cert-edge: ## Test EDGE certification calculation
	@echo "$(YELLOW)Testing EDGE certification...$(RESET)"
	cd suna/backend && uv run python -c "from certification.edge import EDGECertificationModule; from certification.example_usage import run_edge_examples; run_edge_examples()"

##@ Utilities

clean: ## Remove build artifacts and caches
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf backend/htmlcov backend/.coverage
	@echo "$(GREEN)✓ Cleanup complete$(RESET)"

health: ## Check service health
	@echo "$(YELLOW)Checking service health...$(RESET)"
	@curl -f http://localhost:8000/health && echo "$(GREEN)✓ Backend healthy$(RESET)" || echo "$(RED)✗ Backend unhealthy$(RESET)"
	@curl -f http://localhost:3000 && echo "$(GREEN)✓ Frontend healthy$(RESET)" || echo "$(RED)✗ Frontend unhealthy$(RESET)"

logs: ## Tail all service logs
	@echo "$(YELLOW)Tailing logs...$(RESET)"
	tail -f backend/logs/*.log 2>/dev/null || echo "$(YELLOW)No log files found$(RESET)"

version: ## Show version information
	@echo "$(GREEN)SUNA BIM Platform$(RESET)"
	@echo "Python: $(shell python --version 2>&1 || echo 'not found')"
	@echo "Bun: $(shell bun --version 2>&1 || echo 'not installed')"
	@echo "Node: $(shell node --version 2>&1 || echo 'not found')"
	@echo "UV: $(shell uv --version 2>&1 || echo 'not installed')"

pre-commit: lint test ## Run pre-commit checks (lint + test)
	@echo "$(GREEN)✓ Pre-commit checks passed$(RESET)"

ci: check-uv install lint test build ## Run full CI pipeline locally
	@echo "$(GREEN)✓ CI pipeline complete$(RESET)"
