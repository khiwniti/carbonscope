# Suna Platform Makefile
# Main entry point for development commands

.PHONY: help dev dev-frontend dev-backend backend-install frontend-install backend-test frontend-test lint format clean build

# Default target
help:
	@echo "Suna Platform - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev              - Start all services (frontend + backend)"
	@echo "  dev-frontend     - Start frontend dev server"
	@echo "  dev-backend      - Start backend API server"
	@echo ""
	@echo "Installation:"
	@echo "  frontend-install - Install frontend dependencies"
	@echo "  backend-install  - Install backend dependencies"
	@echo ""
	@echo "Testing:"
	@echo "  backend-test     - Run backend tests"
	@echo "  backend-test-e2e - Run backend E2E tests"
	@echo "  backend-test-coverage - Run tests with coverage"
	@echo ""
	@echo "Linting & Formatting:"
	@echo "  lint             - Lint all code"
	@echo "  lint-frontend    - Lint frontend code"
	@echo "  lint-backend   - Lint backend code"
	@echo "  format           - Format all code"
	@echo "  format-frontend  - Format frontend code"
	@echo "  format-backend - Format backend code"
	@echo ""
	@echo "Build:"
	@echo "  build            - Build all services"
	@echo "  build-frontend   - Build frontend"
	@echo "  build-backend  - Build backend"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean            - Remove build artifacts and dependencies"

# Development servers
dev: ## Start all services
	@echo "Starting frontend and backend..."
	@pnpm dev:frontend & uv run --directory backend python api.py

dev-frontend: ## Start frontend dev server
	@pnpm dev:frontend

dev-backend: ## Start backend API server
	@cd backend && uv run python api.py

# Installation
frontend-install: ## Install frontend dependencies
	@pnpm install --prefer-frozen-lockfile

backend-install: ## Install backend dependencies
	@cd backend && uv sync

# Testing
backend-test: ## Run backend tests
	@cd backend && uv run pytest

backend-test-e2e: ## Run backend E2E tests only
	@cd backend && uv run pytest -m e2e -v

backend-test-coverage: ## Run tests with coverage
	@cd backend && uv run pytest --cov=backend/core --cov-report=html

frontend-test: ## Run frontend tests (if configured)
	@echo "No test framework configured for frontend"

# Linting
lint: lint-frontend lint-backend ## Lint all code

lint-frontend: ## Lint frontend code
	@pnpm lint

lint-backend: ## Lint backend code
	@cd backend && uv run ruff check .

# Formatting
format: format-frontend format-backend ## Format all code

format-frontend: ## Format frontend code
	@pnpm format

format-backend: ## Format backend code
	@cd backend && uv run ruff check --fix .

# Build
build: build-frontend ## Build all services

build-frontend: ## Build frontend for production
	@pnpm build:frontend

build-backend: ## Build backend (no build step needed)
	@echo "Backend does not require a build step"

# Cleanup
clean: ## Remove build artifacts
	@echo "Cleaning build artifacts..."
	@rm -rf backend/.pytest_cache backend/.coverage backend/htmlcov
	@rm -rf apps/frontend/.next apps/frontend/node_modules
	@rm -rf node_modules .pnpm-store
	@echo "Cleanup complete"

# Setup
setup: ## Run initial setup
	@python setup.py

# Database migrations
db-migrate: ## Run database migrations
	@echo "Database migrations handled by Supabase"

# Docker
docker-up: ## Start Docker containers
	@docker compose up -d

docker-down: ## Stop Docker containers
	@docker compose down

docker-logs: ## Show Docker logs
	@docker compose logs -f
