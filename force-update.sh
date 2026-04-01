#!/bin/bash
set -e

# =============================================================================
# Force Update SUNA - Run this ON coder-vm
# =============================================================================
# Forces a complete update by pulling new images and clearing all caches
# =============================================================================

echo "🔄 Force Updating SUNA"
echo "====================="
echo ""

cd ~/suna-production

# Stop all services
echo "1️⃣  Stopping all services..."
docker compose -f docker-compose.production.yml down

# Remove old images (force fresh pull)
echo "2️⃣  Removing old images..."
docker rmi -f carbonbimbc6740962ecd.azurecr.io/backend:latest || true
docker rmi -f carbonbimbc6740962ecd.azurecr.io/frontend:latest || true

# Login to ACR
echo "3️⃣  Logging into ACR..."
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | docker login carbonbimbc6740962ecd.azurecr.io --username carbonbimbc6740962ecd --password-stdin

# Pull latest images
echo "4️⃣  Pulling latest images from ACR..."
docker compose -f docker-compose.production.yml pull --no-cache

# Start services with fresh containers
echo "5️⃣  Starting services with fresh containers..."
docker compose -f docker-compose.production.yml up -d --force-recreate

# Wait for services
echo "6️⃣  Waiting for services to start..."
sleep 30

# Show status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.production.yml ps

# Show image tags
echo ""
echo "📦 Running Image Versions:"
docker compose -f docker-compose.production.yml images

echo ""
echo "✅ Force update complete!"
echo ""
echo "🧹 Next: Clear browser and Cloudflare cache"
echo ""
echo "   Clear Browser Cache:"
echo "   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "   - Or open DevTools > Network > Disable cache"
echo ""
echo "   Clear Cloudflare Cache:"
echo "   - Go to Cloudflare Dashboard"
echo "   - Select your domain: ensimu.space"
echo "   - Click 'Caching' > 'Configuration'"
echo "   - Click 'Purge Everything' button"
echo ""
