#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🛑 Stopping OLD Dokploy Deployment"
echo "===================================="
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'STOPOLD'

echo "=== Stopping Traefik ==="
docker stop traefik || echo "Traefik already stopped"

echo ""
echo "=== Stopping OLD Carbon BIM containers ==="
docker stop carbon-bim-frontend carbon-bim-backend carbon-bim-redis carbon-bim-graphdb 2>/dev/null || echo "Some containers not found"

echo ""
echo "=== Current Running Containers ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"

echo ""
echo "=== Port 80 Status ==="
netstat -tulpn 2>/dev/null | grep :80 || ss -tulpn | grep :80 || echo "Port 80 is FREE"

STOPOLD
) --query "value[0].message" -o tsv

echo ""
echo "✅ Old deployment stopped!"
echo ""
echo "Now you need to configure NEW deployment to listen on port 80"
