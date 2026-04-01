#!/bin/bash
set -e

# =============================================================================
# Setup Docker Compose on Production VM
# =============================================================================
# Copies code, configures environment, and starts all services
# =============================================================================

if [ -z "$1" ]; then
    echo "Usage: ./setup-vm-docker-compose.sh <VM_IP>"
    echo "Example: ./setup-vm-docker-compose.sh 20.205.123.45"
    exit 1
fi

VM_IP=$1
SSH_USER="azureuser"

echo "🚀 Setting up SUNA on VM: ${VM_IP}"
echo "===================================="
echo ""

# Test SSH connection
echo "1️⃣  Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 ${SSH_USER}@${VM_IP} "echo 'SSH connection successful'"; then
    echo "❌ Cannot connect to VM. Check:"
    echo "   - VM is running: az vm show --resource-group carbon-bim-rg --name suna-production-vm"
    echo "   - SSH key is correct"
    echo "   - NSG allows SSH (port 22)"
    exit 1
fi
echo "✅ SSH connection verified"
echo ""

# Copy project files
echo "2️⃣  Copying project files to VM..."
echo "   (This may take a few minutes...)"

# Create directory structure
ssh ${SSH_USER}@${VM_IP} "mkdir -p ~/suna-production"

# Copy suna directory (excluding node_modules and .venv)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  --exclude '.pytest_cache' \
  --exclude '*.pyc' \
  --exclude '.git' \
  ./suna/ ${SSH_USER}@${VM_IP}:~/suna-production/suna/

# Copy production docker-compose
scp docker-compose.production.yml ${SSH_USER}@${VM_IP}:~/suna-production/

echo "✅ Files copied"
echo ""

# Setup environment and start services
echo "3️⃣  Configuring environment and starting services..."
ssh ${SSH_USER}@${VM_IP} << 'ENDSSH'
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

# Redis (localhost since all services on same VM)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False

# GraphDB (localhost)
GRAPHDB_URL=http://localhost:7200
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
    echo "⚠️  IMPORTANT: Edit suna/backend/.env with your actual credentials!"
fi

if [ ! -f "suna/apps/frontend/.env.local" ]; then
    echo "⚠️  Creating frontend .env.local from template..."
    cat > suna/apps/frontend/.env.local << 'EOF'
# Production Frontend Environment
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1
NEXT_PUBLIC_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_FORCE_LOCALHOST=false
EOF
    echo "⚠️  IMPORTANT: Edit suna/apps/frontend/.env.local with your actual credentials!"
fi

# Pull images if using pre-built images from ACR
echo "📦 Pulling latest images from ACR (if configured)..."
if [ -f "~/.docker/config.json" ]; then
    docker compose -f docker-compose.production.yml pull || echo "⚠️  Could not pull images, will build locally"
fi

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
echo "   docker compose -f docker-compose.production.yml logs -f"
echo ""
echo "🔧 Manage services:"
echo "   docker compose -f docker-compose.production.yml stop"
echo "   docker compose -f docker-compose.production.yml start"
echo "   docker compose -f docker-compose.production.yml restart"
echo "   docker compose -f docker-compose.production.yml down"
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
echo "   1. Configure custom domain and SSL"
echo "   2. Set up nginx reverse proxy for HTTPS"
echo "   3. Configure monitoring and backups"
echo ""
echo "🔑 SSH to VM:"
echo "   ssh ${SSH_USER}@${VM_IP}"
