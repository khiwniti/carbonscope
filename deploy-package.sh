#!/bin/bash
set -e

# =============================================================================
# SUNA Deployment Package - Run this ON the coder-vm
# =============================================================================
# This script should be run directly on the coder-vm after copying files
# =============================================================================

echo "🚀 SUNA Deployment Package"
echo "=========================="
echo ""

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER

    echo "📦 Installing Docker Compose..."
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    echo "✅ Docker installed"
    echo "⚠️  Please log out and back in, then run this script again"
    exit 0
fi

# Create data directories
echo "📁 Creating data directories..."
sudo mkdir -p /mnt/data/redis
sudo mkdir -p /mnt/data/graphdb/home
sudo mkdir -p /mnt/data/graphdb/work
sudo mkdir -p /mnt/data/logs
sudo chown -R $USER:$USER /mnt/data

# Navigate to project
cd ~/suna-production

# Login to ACR
echo "🔐 Logging into Azure Container Registry..."
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | docker login carbonbimbc6740962ecd.azurecr.io --username carbonbimbc6740962ecd --password-stdin

# Pull images
echo "📦 Pulling Docker images..."
docker compose -f docker-compose.production.yml pull

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.production.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Show status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.production.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Services running on:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   GraphDB:  http://localhost:7200"
echo ""
echo "📝 Next steps:"
echo "   1. Update environment variables in suna/backend/.env"
echo "   2. Update environment variables in suna/apps/frontend/.env.local"
echo "   3. Restart services: docker compose -f docker-compose.production.yml restart"
echo "   4. Initialize GraphDB repository (see DEPLOYMENT_GUIDE.md)"
echo ""
