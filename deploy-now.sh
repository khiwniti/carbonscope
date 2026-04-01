#!/bin/bash
set -e

# =============================================================================
# SUNA Production Deployment - Complete Automation
# =============================================================================
# Run this from YOUR LOCAL MACHINE where you have SSH access to coder-vm
# =============================================================================

VM_IP="20.55.21.69"
VM_USER="azureuser"
SSH_KEY="${SSH_KEY:-./VM Key.pem}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SUNA Production Deployment${NC}"
echo "=============================="
echo ""
echo "Target: ${VM_USER}@${VM_IP}"
echo "SSH Key: ${SSH_KEY}"
echo ""

# Check SSH key exists
if [ ! -f "${SSH_KEY}" ]; then
    echo -e "${RED}❌ SSH key not found: ${SSH_KEY}${NC}"
    echo "Please set SSH_KEY environment variable or place VM Key.pem in current directory"
    exit 1
fi

# Fix SSH key permissions
chmod 600 "${SSH_KEY}"

# Test SSH connection
echo -e "${YELLOW}1️⃣  Testing SSH connection...${NC}"
if ! ssh -i "${SSH_KEY}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to coder-vm${NC}"
    echo "Please check:"
    echo "  - VM is running: az vm show --resource-group DSC-TEAM --name coder-vm"
    echo "  - SSH key is correct: ${SSH_KEY}"
    echo "  - Your network can reach 20.55.21.69:22"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection verified${NC}"
echo ""

# Copy files to coder-vm
echo -e "${YELLOW}2️⃣  Copying files to coder-vm...${NC}"
echo "   (This may take 2-3 minutes...)"
echo ""

# Create directory structure
ssh -i "${SSH_KEY}" ${VM_USER}@${VM_IP} "mkdir -p ~/suna-production"

# Copy suna directory
rsync -avz --progress \
  -e "ssh -i ${SSH_KEY}" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  --exclude '.pytest_cache' \
  --exclude '*.pyc' \
  --exclude '.git' \
  ./suna/ ${VM_USER}@${VM_IP}:~/suna-production/suna/

# Copy deployment files
scp -i "${SSH_KEY}" docker-compose.production.yml ${VM_USER}@${VM_IP}:~/suna-production/
scp -i "${SSH_KEY}" deploy-package.sh ${VM_USER}@${VM_IP}:~/
scp -i "${SSH_KEY}" setup-cloudflare-domain.sh ${VM_USER}@${VM_IP}:~/
scp -i "${SSH_KEY}" force-update.sh ${VM_USER}@${VM_IP}:~/
scp -i "${SSH_KEY}" check-version.sh ${VM_USER}@${VM_IP}:~/

echo -e "${GREEN}✅ Files copied${NC}"
echo ""

# Deploy on coder-vm
echo -e "${YELLOW}3️⃣  Deploying services on coder-vm...${NC}"
ssh -i "${SSH_KEY}" ${VM_USER}@${VM_IP} << 'ENDSSH'
set -e

# Make scripts executable
chmod +x ~/deploy-package.sh ~/setup-cloudflare-domain.sh ~/force-update.sh ~/check-version.sh

# Run deployment
echo "🚀 Starting deployment..."
./deploy-package.sh

echo ""
echo "✅ Services deployed!"
ENDSSH

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Show next steps
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}STEP A: Update Environment Variables${NC}"
echo "   ssh -i \"${SSH_KEY}\" ${VM_USER}@${VM_IP}"
echo "   cd ~/suna-production"
echo ""
echo "   # Generate encryption keys:"
echo "   openssl rand -base64 32  # Copy for ENCRYPTION_KEY"
echo "   openssl rand -base64 32  # Copy for MCP_CREDENTIAL_ENCRYPTION_KEY"
echo ""
echo "   # Edit backend .env:"
echo "   nano suna/backend/.env"
echo "   # Update: DATABASE_URL, SUPABASE_*, ENCRYPTION_KEY, MCP_CREDENTIAL_ENCRYPTION_KEY"
echo ""
echo "   # Edit frontend .env.local:"
echo "   nano suna/apps/frontend/.env.local"
echo "   # Update: NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space"
echo "   #         NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space"
echo "   #         NEXT_PUBLIC_SUPABASE_*, KORTIX_ADMIN_API_KEY"
echo ""
echo "   # Restart services:"
echo "   docker compose -f docker-compose.production.yml restart"
echo ""
echo -e "${YELLOW}STEP B: Initialize GraphDB${NC}"
echo "   curl -X POST http://localhost:7200/rest/repositories \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"id\":\"carbonbim-thailand\",\"title\":\"SUNA\",\"ruleset\":\"rdfsplus-optimized\"}'"
echo ""
echo -e "${YELLOW}STEP C: Setup HTTPS${NC}"
echo "   ./setup-cloudflare-domain.sh"
echo ""
echo -e "${YELLOW}STEP D: Configure Cloudflare DNS${NC}"
echo "   Go to: https://dash.cloudflare.com"
echo "   Domain: ensimu.space"
echo "   Add DNS records (all Proxied):"
echo "     A | carbon-bim         | 20.55.21.69"
echo "     A | api.carbon-bim     | 20.55.21.69"
echo "     A | graphdb.carbon-bim | 20.55.21.69"
echo ""
echo "   SSL/TLS: Set to 'Full (strict)'"
echo ""
echo -e "${GREEN}🌐 Services currently accessible at:${NC}"
echo "   http://20.55.21.69:3000 (Frontend)"
echo "   http://20.55.21.69:8000 (Backend)"
echo "   http://20.55.21.69:7200 (GraphDB)"
echo ""
echo -e "${GREEN}🎉 After completing steps A-D, your site will be live at:${NC}"
echo "   https://carbon-bim.ensimu.space"
echo "   https://api.carbon-bim.ensimu.space"
echo "   https://graphdb.carbon-bim.ensimu.space"
echo ""
