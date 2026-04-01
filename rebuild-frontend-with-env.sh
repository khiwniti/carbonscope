#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔧 Rebuilding Frontend with Production Environment"
echo "=================================================="
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'REBUILD'

cd /root/suna-production

echo "=== Step 1: Ensure correct .env.local ==="
cat > suna/apps/frontend/.env.local << 'ENVFILE'
NEXT_PUBLIC_ENV_MODE="production"
NEXT_PUBLIC_DISABLE_MOBILE_ADVERTISING="true"
NEXT_PUBLIC_SUPABASE_URL="https://ujzsbwvurfyeuerxxeaz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqenNid3Z1cmZ5ZXVlcnh4ZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQwMzUsImV4cCI6MjA4NDQ4MDAzNX0.-yXpKNQphoh5F4MSPxVkW1P63Ow7jZvHgFppS2KMfWc"
NEXT_PUBLIC_BACKEND_URL="http://backend:8000/v1"
NEXT_PUBLIC_URL="https://carbon-bim.ensimu.space"
NEXT_PUBLIC_FORCE_LOCALHOST="false"
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
KORTIX_ADMIN_API_KEY=""
EDGE_CONFIG=""
NEXT_PUBLIC_GTM_ID=""
NEXT_PUBLIC_GA_ID_1=""
NEXT_PUBLIC_GA_ID_2=""
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=""
ENVFILE

echo ""
echo "=== Step 2: Stop frontend container ==="
docker compose -f docker-compose.production.yml stop frontend

echo ""
echo "=== Step 3: Remove old frontend image ==="
docker rmi carbonbimbc6740962ecd.azurecr.io/frontend:latest || echo "Image already removed"

echo ""
echo "=== Step 4: Login to ACR ==="
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | \
  docker login carbonbimbc6740962ecd.azurecr.io \
  --username carbonbimbc6740962ecd \
  --password-stdin

echo ""
echo "=== Step 5: Pull latest frontend image ==="
docker pull carbonbimbc6740962ecd.azurecr.io/frontend:latest

echo ""
echo "=== Step 6: Start frontend with new image ==="
docker compose -f docker-compose.production.yml up -d frontend

echo ""
echo "=== Waiting 20 seconds for frontend to start ==="
sleep 20

echo ""
echo "=== Step 7: Verify environment variables in container ==="
docker exec suna-frontend env | grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_FORCE_LOCALHOST|NEXT_PUBLIC_URL"

echo ""
echo "=== Step 8: Container Status ==="
docker compose -f docker-compose.production.yml ps frontend

REBUILD
) --query "value[0].message" -o tsv

echo ""
echo "✅ Frontend rebuilt and restarted!"
echo ""
echo "⚠️  IMPORTANT: If the container still shows wrong SUPABASE_URL:"
echo "   The image in ACR was built with wrong env vars"
echo "   You need to rebuild and push a new image from your dev machine"
