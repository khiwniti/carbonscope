#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔧 Updating ALL Production Environment Variables"
echo "================================================"
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'UPDATEALLENV'

echo "=== Step 1: Update Backend .env ==="
cat > /root/suna-production/suna/backend/.env << 'BACKENDENV'
# Daytona API Key for sandbox functionality
DAYTONA_API_KEY=dtn_ed90089fe80c133c6a7fa3583104db2f526705f6017d26db1f141a8428b7017f

# Encryption key for MCP credentials
ENCRYPTION_KEY="D1OsjL9VsBHW24ymsqd-qiRXJP6r8W026HvywVBvI_o="

# Supabase Configuration
SUPABASE_URL="https://vplbjxijbrgwskgxiukd.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGJqeGlqYnJnd3NrZ3hpdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mjc2MjQsImV4cCI6MjA4ODMwMzYyNH0.l35Qo5-A1yqi4xS044TLQc_WhT3-vwFZu7wOEwErMGU"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGJqeGlqYnJnd3NrZ3hpdWtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjcyNzYyNCwiZXhwIjoyMDg4MzAzNjI0fQ.8ii8WltJe8jX690CyeS2h_UcBYVptYMTK4X0ymDliPs"

# Database Connection (Supabase Connection Pooler)
DATABASE_URL="postgresql+psycopg://postgres.vplbjxijbrgwskgxiukd:sb_secret_hzFXV3SOTHtuo10uM2zJZw_tX3EFsx3@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Redis (Internal Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# GraphDB (Internal Docker)
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand

# Environment
ENV_MODE=production
WORKERS=4
TIMEOUT=75
BACKENDENV

echo ""
echo "=== Step 2: Update Frontend .env.local ==="
cat > /root/suna-production/suna/apps/frontend/.env.local << 'FRONTENDENV'
# Production Environment
NEXT_PUBLIC_ENV_MODE="production"
NEXT_PUBLIC_DISABLE_MOBILE_ADVERTISING="true"

# Production Supabase (CORRECT URL)
NEXT_PUBLIC_SUPABASE_URL="https://vplbjxijbrgwskgxiukd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGJqeGlqYnJnd3NrZ3hpdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mjc2MjQsImV4cCI6MjA4ODMwMzYyNH0.l35Qo5-A1yqi4xS044TLQc_WhT3-vwFZu7wOEwErMGU"

# Production Backend URL (internal Docker network)
NEXT_PUBLIC_BACKEND_URL="http://backend:8000/v1"

# Production Public URL
NEXT_PUBLIC_URL="https://carbon-bim.ensimu.space"

# CRITICAL: Disable localhost forcing!
NEXT_PUBLIC_FORCE_LOCALHOST="false"

# Optional (add when available)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
KORTIX_ADMIN_API_KEY=""
EDGE_CONFIG=""
NEXT_PUBLIC_GTM_ID=""
NEXT_PUBLIC_GA_ID_1=""
NEXT_PUBLIC_GA_ID_2=""
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=""
FRONTENDENV

echo ""
echo "=== Step 3: Verify Files Created ==="
echo "Backend .env:"
ls -lh /root/suna-production/suna/backend/.env
echo ""
echo "Frontend .env.local:"
ls -lh /root/suna-production/suna/apps/frontend/.env.local

echo ""
echo "=== Step 4: Restart All Containers ==="
cd /root/suna-production
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d

echo ""
echo "=== Waiting 30 seconds for services to start ==="
sleep 30

echo ""
echo "=== Step 5: Service Status ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== Step 6: Verify Environment in Containers ==="
echo "Frontend Supabase URL:"
docker exec suna-frontend env | grep NEXT_PUBLIC_SUPABASE_URL || echo "Not found"
echo ""
echo "Backend Daytona Key (first 20 chars):"
docker exec suna-backend env | grep DAYTONA_API_KEY | cut -c1-40 || echo "Not found"

echo ""
echo "=== Step 7: Recent Backend Logs ==="
docker compose -f docker-compose.production.yml logs --tail=20 backend

UPDATEALLENV
) --query "value[0].message" -o tsv

echo ""
echo "✅ All environment variables updated!"
echo ""
echo "📊 Updated Configuration:"
echo "   - Supabase URL: https://vplbjxijbrgwskgxiukd.supabase.co"
echo "   - Daytona API Key: Configured"
echo "   - Database URL: Connection pooler (port 6543)"
echo "   - Encryption Key: Configured"
echo ""
echo "🧪 Test Authentication:"
echo "   https://carbon-bim.ensimu.space"
echo ""
echo "   Auth should now redirect to: https://vplbjxijbrgwskgxiukd.supabase.co"
