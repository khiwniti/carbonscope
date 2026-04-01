#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔧 Fixing Environment File Name"
echo "================================"
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'FIXENV'

cd /root/suna-production/suna/apps/frontend

echo "=== Current .env files ==="
ls -la .env* 2>/dev/null || echo "No .env files found"

echo ""
echo "=== Creating/Updating .env.local for Production ==="
cat > .env.local << 'ENVFILE'
# Production Environment
NEXT_PUBLIC_ENV_MODE="production"
NEXT_PUBLIC_DISABLE_MOBILE_ADVERTISING="true"

# Production Supabase (NOT localhost!)
NEXT_PUBLIC_SUPABASE_URL="https://ujzsbwvurfyeuerxxeaz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqenNid3Z1cmZ5ZXVlcnh4ZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQwMzUsImV4cCI6MjA4NDQ4MDAzNX0.-yXpKNQphoh5F4MSPxVkW1P63Ow7jZvHgFppS2KMfWc"

# Production Backend URL (internal Docker network)
NEXT_PUBLIC_BACKEND_URL="http://backend:8000/v1"

# Production Public URL
NEXT_PUBLIC_URL="https://carbon-bim.ensimu.space"

# CRITICAL: Disable localhost forcing!
NEXT_PUBLIC_FORCE_LOCALHOST="false"

# Optional
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
echo "=== Verifying .env.local content ==="
cat .env.local | grep -E "FORCE_LOCALHOST|SUPABASE_URL"

echo ""
echo "=== Restarting Frontend Container ==="
cd /root/suna-production
docker compose -f docker-compose.production.yml restart frontend

echo ""
echo "=== Waiting 20 seconds for restart ==="
sleep 20

echo ""
echo "=== Container Status ==="
docker compose -f docker-compose.production.yml ps frontend

FIXENV
) --query "value[0].message" -o tsv

echo ""
echo "✅ Environment file fixed!"
echo ""
echo "🔍 Verify by checking auth URL - should be:"
echo "   https://ujzsbwvurfyeuerxxeaz.supabase.co/auth/v1/authorize"
echo ""
echo "❌ NOT:"
echo "   http://127.0.0.1:54321/auth/v1/authorize"
