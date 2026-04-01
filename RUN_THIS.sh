#!/bin/bash
# =============================================================================
# COPY AND RUN THIS ON YOUR LOCAL MACHINE
# =============================================================================

set -e

VM_IP="20.55.21.69"
VM_USER="azureuser"

echo "🚀 Deploying SUNA to coder-vm"
echo "=============================="
echo ""

# Step 1: Copy files to coder-vm
echo "1️⃣  Copying files to coder-vm..."
scp -r suna/ ${VM_USER}@${VM_IP}:~/suna-production/
scp docker-compose.production.yml ${VM_USER}@${VM_IP}:~/suna-production/
scp deploy-package.sh ${VM_USER}@${VM_IP}:~/
scp setup-cloudflare-domain.sh ${VM_USER}@${VM_IP}:~/
scp force-update.sh ${VM_USER}@${VM_IP}:~/
scp check-version.sh ${VM_USER}@${VM_IP}:~/

echo "✅ Files copied"
echo ""

# Step 2: Deploy on coder-vm
echo "2️⃣  Deploying on coder-vm..."
ssh ${VM_USER}@${VM_IP} << 'REMOTE_COMMANDS'
set -e

# Make scripts executable
chmod +x ~/deploy-package.sh ~/setup-cloudflare-domain.sh ~/force-update.sh ~/check-version.sh

# Run deployment
echo "🚀 Starting deployment..."
./deploy-package.sh

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update environment variables:"
echo "      cd ~/suna-production"
echo "      nano suna/backend/.env"
echo "      nano suna/apps/frontend/.env.local"
echo ""
echo "   2. Restart services:"
echo "      docker compose -f docker-compose.production.yml restart"
echo ""
echo "   3. Initialize GraphDB:"
echo "      curl -X POST http://localhost:7200/rest/repositories \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"id\":\"carbonbim-thailand\",\"title\":\"SUNA\",\"ruleset\":\"rdfsplus-optimized\"}'"
echo ""
echo "   4. Setup HTTPS with Cloudflare:"
echo "      ./setup-cloudflare-domain.sh"
echo ""
REMOTE_COMMANDS

echo ""
echo "✅ All done!"
echo ""
echo "🌐 Your services are running at:"
echo "   http://20.55.21.69:3000 (Frontend)"
echo "   http://20.55.21.69:8000 (Backend)"
echo "   http://20.55.21.69:7200 (GraphDB)"
echo ""
echo "📝 To complete setup, SSH to coder-vm and:"
echo "   ssh ${VM_USER}@${VM_IP}"
echo "   cd ~/suna-production"
echo "   nano suna/backend/.env          # Update credentials"
echo "   nano suna/apps/frontend/.env.local  # Update credentials"
echo "   docker compose -f docker-compose.production.yml restart"
echo "   ./setup-cloudflare-domain.sh    # Setup HTTPS"
echo ""
