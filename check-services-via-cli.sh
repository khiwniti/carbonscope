#!/bin/bash
set -e

# Check Services Status on coder-vm via Azure CLI
# This script verifies all SUNA services are running correctly

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔍 Checking SUNA Services Status"
echo "================================"
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'CHECKSERVICES'

echo "📦 Docker Compose Status"
echo "========================"
cd /root/suna-production
docker compose -f docker-compose.production.yml ps

echo ""
echo "🏥 Health Check Status"
echo "======================"
docker compose -f docker-compose.production.yml ps --format "table {{.Service}}\t{{.State}}\t{{.Status}}"

echo ""
echo "🔌 Port Bindings"
echo "================"
docker compose -f docker-compose.production.yml port frontend 3000 2>/dev/null && echo "✅ Frontend accessible on port 3000" || echo "⚠️  Frontend port not bound"
docker compose -f docker-compose.production.yml port backend 8000 2>/dev/null && echo "✅ Backend accessible on port 8000" || echo "⚠️  Backend port not bound"
docker compose -f docker-compose.production.yml port redis 6379 2>/dev/null && echo "✅ Redis accessible on port 6379" || echo "⚠️  Redis port not bound"
docker compose -f docker-compose.production.yml port graphdb 7200 2>/dev/null && echo "✅ GraphDB accessible on port 7200" || echo "⚠️  GraphDB port not bound"

echo ""
echo "📊 Container Resource Usage"
echo "==========================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "🔄 Recent Container Logs (Last 10 lines)"
echo "========================================"
echo "--- Frontend ---"
docker compose -f docker-compose.production.yml logs --tail=10 frontend 2>&1 | tail -10
echo ""
echo "--- Backend ---"
docker compose -f docker-compose.production.yml logs --tail=10 backend 2>&1 | tail -10

CHECKSERVICES
) --query "value[0].message" -o tsv

echo ""
echo "✅ Service check complete!"
