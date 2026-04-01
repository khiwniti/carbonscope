#!/bin/bash

# =============================================================================
# Check SUNA Version - Run this ON coder-vm
# =============================================================================
# Shows what's currently running and when images were built
# =============================================================================

echo "🔍 SUNA Version Check"
echo "===================="
echo ""

cd ~/suna-production

echo "📊 Running Containers:"
docker compose -f docker-compose.production.yml ps
echo ""

echo "📦 Image Details:"
docker compose -f docker-compose.production.yml images
echo ""

echo "🏷️  Image Build Dates:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep carbonbim
echo ""

echo "📝 Frontend Build Info:"
docker exec suna-frontend cat /app/apps/frontend/.next/BUILD_ID 2>/dev/null || echo "  ⚠️  No build ID found"
echo ""

echo "📝 Backend Version:"
docker exec suna-backend uv run python -c "from api import __version__; print(__version__)" 2>/dev/null || echo "  ⚠️  Could not get version"
echo ""

echo "🌐 Service Health:"
echo "  Backend:  $(curl -s http://localhost:8000/v1/health | jq -r '.status' 2>/dev/null || echo 'Not responding')"
echo "  Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'Not responding')"
echo "  GraphDB:  $(curl -s -o /dev/null -w '%{http_code}' http://localhost:7200 2>/dev/null || echo 'Not responding')"
echo ""

echo "🕐 Container Start Times:"
docker compose -f docker-compose.production.yml ps --format "table {{.Name}}\t{{.Status}}"
echo ""
