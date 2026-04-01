#!/bin/bash
# =============================================================================
# Update Environment Variables via Azure CLI
# =============================================================================
# Usage: Edit the variables below, then run this script
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

# ===== EDIT THESE VALUES =====

# Database (Supabase)
DATABASE_URL="postgresql://user:pass@host.supabase.co:5432/postgres?sslmode=require"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"

# Encryption Keys (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="YOUR_32_BYTE_BASE64_KEY_HERE"
MCP_CREDENTIAL_ENCRYPTION_KEY="YOUR_32_BYTE_BASE64_KEY_HERE"

# Admin API Key (generate with: openssl rand -base64 32)
KORTIX_ADMIN_API_KEY="YOUR_ADMIN_API_KEY_HERE"

# Optional: External services
DAYTONA_API_KEY=""
POSTHOG_PROJECT_API_KEY=""

# ===== END OF EDITABLE SECTION =====

echo "🔧 Updating environment variables..."
echo ""

# Update backend .env
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << BACKENDUPDATE
cat > /root/suna-production/suna/backend/.env << 'EOF'
ENV_MODE=production
WORKERS=4
TIMEOUT=75
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand
DATABASE_URL=${DATABASE_URL}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
MCP_CREDENTIAL_ENCRYPTION_KEY=${MCP_CREDENTIAL_ENCRYPTION_KEY}
DAYTONA_API_KEY=${DAYTONA_API_KEY}
POSTHOG_PROJECT_API_KEY=${POSTHOG_PROJECT_API_KEY}
EOF
echo "Backend .env updated"
BACKENDUPDATE
)

# Update frontend .env.local
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << FRONTENDUPDATE
cat > /root/suna-production/suna/apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space
NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_FORCE_LOCALHOST=false
KORTIX_ADMIN_API_KEY=${KORTIX_ADMIN_API_KEY}
EOF
echo "Frontend .env.local updated"
FRONTENDUPDATE
)

# Restart services
echo ""
echo "🔄 Restarting services..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts "cd /root/suna-production && docker compose -f docker-compose.production.yml restart" \
  --query "value[0].message" -o tsv

echo ""
echo "✅ Environment variables updated and services restarted!"
echo ""
echo "🔍 Check status:"
echo "   ./check-services-via-cli.sh"
echo ""
