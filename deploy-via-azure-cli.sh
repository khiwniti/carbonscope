#!/bin/bash
set -e

# =============================================================================
# Deploy SUNA via Azure CLI (No SSH Required)
# =============================================================================
# Uses az vm run-command to execute deployment on coder-vm
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🚀 Deploying SUNA via Azure CLI"
echo "================================"
echo ""

# Step 1: Check VM is running
echo "1️⃣  Checking VM status..."
VM_STATE=$(az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --query "powerState" -o tsv)
if [ "$VM_STATE" != "VM running" ]; then
    echo "⚠️  VM is not running. Starting VM..."
    az vm start --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}
    echo "Waiting 30 seconds for VM to be ready..."
    sleep 30
fi
echo "✅ VM is running"
echo ""

# Step 2: Install Docker if needed
echo "2️⃣  Installing Docker (if needed)..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'DOCKERINSTALL'
#!/bin/bash
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker azureuser

    # Install Docker Compose
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    echo "Docker installed"
else
    echo "Docker already installed"
fi
DOCKERINSTALL
)

echo "✅ Docker ready"
echo ""

# Step 3: Create directories
echo "3️⃣  Creating directories..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'MAKEDIRS'
#!/bin/bash
mkdir -p ~/suna-production
sudo mkdir -p /mnt/data/redis
sudo mkdir -p /mnt/data/graphdb/home
sudo mkdir -p /mnt/data/graphdb/work
sudo mkdir -p /mnt/data/logs
sudo chown -R azureuser:azureuser /mnt/data
echo "Directories created"
MAKEDIRS
)

echo "✅ Directories created"
echo ""

# Step 4: Create docker-compose file on VM
echo "4️⃣  Creating docker-compose.production.yml on VM..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts "cat > ~/suna-production/docker-compose.production.yml << 'DOCKERCOMPOSE'
$(cat docker-compose.production.yml)
DOCKERCOMPOSE
echo 'Docker compose file created'"

echo "✅ Docker compose created"
echo ""

# Step 5: Create environment files
echo "5️⃣  Creating environment file templates..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'CREATEENV'
#!/bin/bash
mkdir -p ~/suna-production/suna/backend
mkdir -p ~/suna-production/suna/apps/frontend

cat > ~/suna-production/suna/backend/.env << 'EOF'
ENV_MODE=production
WORKERS=4
TIMEOUT=75
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_ANON_KEY=your-key
ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32
MCP_CREDENTIAL_ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32
EOF

cat > ~/suna-production/suna/apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space
NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_FORCE_LOCALHOST=false
EOF

echo "Environment templates created"
CREATEENV
)

echo "✅ Environment files created"
echo ""

# Step 6: Login to ACR and pull images
echo "6️⃣  Logging into ACR and pulling images..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'PULLIMAGES'
#!/bin/bash
cd ~/suna-production

# Login to ACR
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | \
  docker login carbonbimbc6740962ecd.azurecr.io \
  --username carbonbimbc6740962ecd \
  --password-stdin

# Pull images
docker compose -f docker-compose.production.yml pull

echo "Images pulled"
PULLIMAGES
) --query "value[0].message" -o tsv

echo "✅ Images pulled"
echo ""

# Step 7: Start services
echo "7️⃣  Starting all services..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'STARTSERVICES'
#!/bin/bash
cd ~/suna-production
docker compose -f docker-compose.production.yml up -d
sleep 30
docker compose -f docker-compose.production.yml ps
echo "Services started"
STARTSERVICES
) --query "value[0].message" -o tsv

echo "✅ Services started"
echo ""

# Step 8: Get VM IP
VM_IP=$(az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --show-details --query publicIps -o tsv)

echo "✅ Deployment Complete!"
echo ""
echo "🌐 Services are running at:"
echo "   Frontend: http://${VM_IP}:3000"
echo "   Backend:  http://${VM_IP}:8000"
echo "   GraphDB:  http://${VM_IP}:7200"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update environment variables:"
echo "   az vm run-command invoke --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} \\"
echo "     --command-id RunShellScript \\"
echo "     --scripts 'cd ~/suna-production && nano suna/backend/.env'"
echo ""
echo "2. Restart services after updating credentials:"
echo "   az vm run-command invoke --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} \\"
echo "     --command-id RunShellScript \\"
echo "     --scripts 'cd ~/suna-production && docker compose -f docker-compose.production.yml restart'"
echo ""
echo "3. Initialize GraphDB:"
echo "   az vm run-command invoke --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} \\"
echo "     --command-id RunShellScript \\"
echo "     --scripts 'curl -X POST http://localhost:7200/rest/repositories -H \"Content-Type: application/json\" -d \"{\\\"id\\\":\\\"carbonbim-thailand\\\",\\\"title\\\":\\\"SUNA\\\",\\\"ruleset\\\":\\\"rdfsplus-optimized\\\"}\"'"
echo ""
echo "4. Setup Cloudflare domain (see setup-cloudflare-domain.sh)"
echo ""
