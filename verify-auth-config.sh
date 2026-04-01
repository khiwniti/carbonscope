#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔍 Verifying Authentication Configuration"
echo "=========================================="
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'VERIFY'

echo "=== Environment File Content ==="
cd /root/suna-production/suna/apps/frontend
echo "Location: $(pwd)/.env.local"
echo ""
cat .env.local | grep -E "SUPABASE_URL|FORCE_LOCALHOST|PUBLIC_URL"

echo ""
echo "=== Frontend Container Environment ==="
docker exec suna-frontend env | grep -E "SUPABASE_URL|FORCE_LOCALHOST|PUBLIC_URL" || echo "Variables not found in container"

echo ""
echo "=== Frontend Container Status ==="
docker ps --filter "name=suna-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

VERIFY
) --query "value[0].message" -o tsv

echo ""
echo "✅ Verification complete!"
echo ""
echo "🧪 Now test authentication:"
echo "   1. Go to: https://carbon-bim.ensimu.space"
echo "   2. Click 'Sign In' button"
echo "   3. Auth URL should start with: https://ujzsbwvurfyeuerxxeaz.supabase.co"
