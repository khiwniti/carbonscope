#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔧 Reconfiguring Ports for Production"
echo "======================================"
echo ""
echo "This will:"
echo "  1. Stop old Dokploy deployment"
echo "  2. Update new deployment to use port 80"
echo "  3. Restart services"
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'RECONFIG'

echo "=== Step 1: Stop OLD deployment ==="
docker stop traefik carbon-bim-frontend carbon-bim-backend carbon-bim-redis carbon-bim-graphdb 2>/dev/null || echo "Some already stopped"
docker rm traefik carbon-bim-frontend carbon-bim-backend carbon-bim-redis carbon-bim-graphdb 2>/dev/null || echo "Some already removed"

echo ""
echo "=== Step 2: Update docker-compose to use port 80 ==="
cd /root/suna-production

# Backup original
cp docker-compose.production.yml docker-compose.production.yml.backup

# Update frontend port from 3000:3000 to 80:3000
sed -i 's/3000:3000/80:3000/g' docker-compose.production.yml

echo ""
echo "=== Step 3: Restart NEW deployment on port 80 ==="
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d

echo ""
echo "=== Waiting for services ==="
sleep 30

echo ""
echo "=== Service Status ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== Port 80 Status ==="
netstat -tulpn 2>/dev/null | grep :80 || ss -tulpn | grep :80

RECONFIG
) --query "value[0].message" -o tsv

echo ""
echo "✅ Reconfiguration complete!"
echo ""
echo "🌐 Test URLs:"
echo "   http://20.55.21.69 (port 80)"
echo "   https://carbon-bim.ensimu.space (via Cloudflare)"
echo ""
echo "   Both should now show: Kortix: Your Autonomous AI Worker"
