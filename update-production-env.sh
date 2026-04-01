#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔧 Updating Production Environment Variables"
echo "==========================================="
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'UPDATEENV'

echo "=== Creating Production .env for Frontend ==="
cat > /root/suna-production/suna/apps/frontend/.env << 'ENVFILE'
# Production Environment
NEXT_PUBLIC_ENV_MODE="production"
NEXT_PUBLIC_DISABLE_MOBILE_ADVERTISING="true"

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL="https://ujzsbwvurfyeuerxxeaz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqenNid3Z1cmZ5ZXVlcnh4ZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQwMzUsImV4cCI6MjA4NDQ4MDAzNX0.-yXpKNQphoh5F4MSPxVkW1P63Ow7jZvHgFppS2KMfWc"

# Production Backend URL (internal Docker network)
NEXT_PUBLIC_BACKEND_URL="http://backend:8000/v1"

# Production Public URL
NEXT_PUBLIC_URL="https://carbon-bim.ensimu.space"

# CRITICAL: Disable localhost forcing for production!
NEXT_PUBLIC_FORCE_LOCALHOST="false"

# Optional API Keys (add when available)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
KORTIX_ADMIN_API_KEY=""

# Analytics (optional)
NEXT_PUBLIC_GTM_ID=""
NEXT_PUBLIC_GA_ID_1=""
NEXT_PUBLIC_GA_ID_2=""
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=""
ENVFILE

echo ""
echo "=== Restarting Frontend Container ==="
cd /root/suna-production
docker compose -f docker-compose.production.yml restart frontend

echo ""
echo "=== Waiting for frontend to start ==="
sleep 15

echo ""
echo "=== Frontend Container Status ==="
docker compose -f docker-compose.production.yml ps frontend

echo ""
echo "=== Frontend Logs (last 20 lines) ==="
docker compose -f docker-compose.production.yml logs --tail=20 frontend

UPDATEENV
) --query "value[0].message" -o tsv

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "🌐 Test authentication at:"
echo "   https://carbon-bim.ensimu.space"
echo ""
echo "   Auth should now use: https://ujzsbwvurfyeuerxxeaz.supabase.co"
