#!/bin/bash
set -e

# =============================================================================
# Force Update Production - Clear All Caches
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔄 Force updating production deployment..."
echo ""

# Step 1: Force pull latest images and recreate containers
echo "1️⃣  Pulling latest images and recreating containers..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'FORCEUPDATE'
#!/bin/bash
cd /root/suna-production

echo "=== Stopping services ==="
docker compose -f docker-compose.production.yml down

echo "=== Removing old images ==="
docker rmi -f carbonbimbc6740962ecd.azurecr.io/frontend:latest || true
docker rmi -f carbonbimbc6740962ecd.azurecr.io/backend:latest || true

echo "=== Logging into ACR ==="
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | \
  docker login carbonbimbc6740962ecd.azurecr.io \
  --username carbonbimbc6740962ecd \
  --password-stdin

echo "=== Pulling fresh images ==="
docker compose -f docker-compose.production.yml pull --no-cache

echo "=== Starting services with force recreate ==="
docker compose -f docker-compose.production.yml up -d --force-recreate

echo "=== Waiting for services ==="
sleep 40

echo "=== Service Status ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== Running Image Versions ==="
docker compose -f docker-compose.production.yml images

FORCEUPDATE
) --query "value[0].message" -o tsv

echo ""
echo "✅ Services updated and restarted!"
echo ""

VM_IP=$(az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --show-details --query publicIps -o tsv)

echo "🌐 Verify new version at:"
echo "   http://${VM_IP}:3000"
echo ""
echo "📝 Next: Clear Cloudflare Cache"
echo ""
echo "   CRITICAL: You MUST purge Cloudflare cache now!"
echo ""
echo "   Go to: https://dash.cloudflare.com"
echo "   1. Select domain: ensimu.space"
echo "   2. Click 'Caching' → 'Configuration'"
echo "   3. Click 'Purge Everything' button"
echo "   4. Confirm purge"
echo "   5. Wait 30 seconds"
echo ""
echo "   Then hard reload browser:"
echo "   - Windows/Linux: Ctrl+Shift+R"
echo "   - Mac: Cmd+Shift+R"
echo ""
echo "   Or use Incognito/Private browsing mode"
echo ""
