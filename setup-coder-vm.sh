#!/bin/bash
set -e

# =============================================================================
# Setup SUNA on Existing coder-vm
# =============================================================================
# Deploys SUNA services to your existing coder-vm using Docker Compose
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"
SSH_USER="azureuser"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"  # Default SSH key, override with SSH_KEY env var

echo "🚀 Deploying SUNA to existing coder-vm"
echo "======================================="
echo ""

# Check if custom SSH key specified
if [ ! -z "$1" ] && [ -f "$1" ]; then
    SSH_KEY="$1"
    echo "Using SSH key: ${SSH_KEY}"
fi

# Get VM IP address
echo "1️⃣  Getting coder-vm IP address..."
VM_IP=$(az vm show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --show-details \
  --query publicIps -o tsv)

if [ -z "$VM_IP" ]; then
    echo "❌ Could not get coder-vm IP address"
    echo "   Check if VM exists: az vm list --resource-group ${RESOURCE_GROUP} -o table"
    exit 1
fi

echo "✅ Found coder-vm at: ${VM_IP}"
echo ""

# Check VM is running
echo "2️⃣  Checking VM status..."
VM_STATE=$(az vm show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --query "powerState" -o tsv)

if [ "$VM_STATE" != "VM running" ]; then
    echo "⚠️  VM is not running (current state: ${VM_STATE})"
    read -p "Do you want to start the VM? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting VM..."
        az vm start --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}
        echo "Waiting 30 seconds for VM to be ready..."
        sleep 30
    else
        exit 1
    fi
fi
echo "✅ VM is running"
echo ""

# Test SSH connection
echo "3️⃣  Testing SSH connection..."
if ! ssh -i ${SSH_KEY} -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${SSH_USER}@${VM_IP} "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to VM. Troubleshooting:"
    echo "   - Verify SSH key: ${SSH_KEY}"
    echo "   - Check NSG allows SSH: az network nsg rule list --resource-group ${RESOURCE_GROUP} --nsg-name ${VM_NAME}-nsg -o table"
    echo "   - Try manual SSH: ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP}"
    exit 1
fi
echo "✅ SSH connection verified"
echo ""

# Check if Docker is installed
echo "4️⃣  Checking Docker installation..."
if ! ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP} "command -v docker" >/dev/null 2>&1; then
    echo "⚠️  Docker not found on coder-vm"
    echo "Installing Docker..."
    ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP} << 'INSTALL_DOCKER'
set -e
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose V2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "✅ Docker installed successfully"
echo "⚠️  You may need to log out and back in for Docker permissions"
INSTALL_DOCKER
    echo "✅ Docker installed"
else
    echo "✅ Docker is already installed"
fi
echo ""

# Create data directories if needed
echo "5️⃣  Setting up data directories..."
ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP} << 'CREATE_DIRS'
set -e
sudo mkdir -p /mnt/data/redis
sudo mkdir -p /mnt/data/graphdb/home
sudo mkdir -p /mnt/data/graphdb/work
sudo mkdir -p /mnt/data/logs
sudo chown -R $USER:$USER /mnt/data
echo "✅ Data directories created"
CREATE_DIRS
echo "✅ Data directories ready"
echo ""

# Copy project files
echo "6️⃣  Copying project files to coder-vm..."
echo "   (This may take a few minutes...)"

# Create directory structure
ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP} "mkdir -p ~/suna-production"

# Copy suna directory (excluding build artifacts)
rsync -avz --progress \
  -e "ssh -i ${SSH_KEY}" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  --exclude '.pytest_cache' \
  --exclude '*.pyc' \
  --exclude '.git' \
  ./suna/ ${SSH_USER}@${VM_IP}:~/suna-production/suna/

# Copy docker-compose
scp -i ${SSH_KEY} docker-compose.production.yml ${SSH_USER}@${VM_IP}:~/suna-production/

echo "✅ Files copied"
echo ""

# Setup environment and start services
echo "7️⃣  Configuring environment and starting services..."
ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP} << 'ENDSSH'
set -e

cd ~/suna-production

# Create .env files if they don't exist
if [ ! -f "suna/backend/.env" ]; then
    echo "⚠️  Creating backend .env from template..."
    cat > suna/backend/.env << 'EOF'
# Production Backend Environment
ENV_MODE=production
WORKERS=4
TIMEOUT=75

# Redis (Docker network)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False

# GraphDB (Docker network)
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand

# Database - UPDATE THESE!
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_ANON_KEY=your-key

# Encryption - GENERATE THESE!
ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32
MCP_CREDENTIAL_ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32
EOF
    echo "⚠️  IMPORTANT: Edit ~/suna-production/suna/backend/.env with your actual credentials!"
fi

if [ ! -f "suna/apps/frontend/.env.local" ]; then
    echo "⚠️  Creating frontend .env.local from template..."
    cat > suna/apps/frontend/.env.local << 'EOF'
# Production Frontend Environment
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=http://backend:8000/v1
NEXT_PUBLIC_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_FORCE_LOCALHOST=false
EOF
    echo "⚠️  IMPORTANT: Edit ~/suna-production/suna/apps/frontend/.env.local with your actual credentials!"
fi

# Login to ACR and pull images
echo "📦 Authenticating with ACR and pulling images..."
az acr login --name carbonbimbc6740962ecd || echo "⚠️  ACR login failed, continuing anyway"
docker compose -f docker-compose.production.yml pull || echo "⚠️  Could not pull some images, will use existing or build locally"

# Start services
echo "🚀 Starting all services..."
docker compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.production.yml ps

echo ""
echo "✅ Services started!"
echo ""
echo "🔍 Check logs:"
echo "   docker compose -f ~/suna-production/docker-compose.production.yml logs -f"
echo ""
echo "🔧 Manage services:"
echo "   docker compose -f ~/suna-production/docker-compose.production.yml stop"
echo "   docker compose -f ~/suna-production/docker-compose.production.yml start"
echo "   docker compose -f ~/suna-production/docker-compose.production.yml restart"
echo "   docker compose -f ~/suna-production/docker-compose.production.yml down"
ENDSSH

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend: http://${VM_IP}:3000"
echo "   Backend:  http://${VM_IP}:8000"
echo "   GraphDB:  http://${VM_IP}:7200"
echo ""
echo "📝 Next steps:"
echo "   1. SSH to VM: ssh -i ${SSH_KEY} ${SSH_USER}@${VM_IP}"
echo "   2. Edit environment files with real credentials"
echo "   3. Restart services: docker compose -f ~/suna-production/docker-compose.production.yml restart"
echo "   4. Initialize GraphDB repository (see DEPLOYMENT_GUIDE.md Step 5)"
echo "   5. Configure custom domain and SSL (see DEPLOYMENT_GUIDE.md Step 7)"
echo ""
