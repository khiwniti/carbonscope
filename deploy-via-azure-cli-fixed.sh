#!/bin/bash
set -e

# =============================================================================
# Deploy SUNA via Azure CLI (No SSH Required) - Fixed Version
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🚀 Deploying SUNA via Azure CLI"
echo "================================"
echo ""

# Check VM is running
echo "1️⃣  Checking VM status..."
VM_STATE=$(az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --query "powerState" -o tsv)
if [ "$VM_STATE" != "VM running" ]; then
    echo "⚠️  Starting VM..."
    az vm start --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}
    sleep 30
fi
echo "✅ VM is running"
echo ""

# Complete deployment in one command
echo "2️⃣  Deploying all services..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'FULLDEPLOY'
#!/bin/bash
set -e

echo "=== Installing Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

echo "=== Creating directories ==="
mkdir -p /root/suna-production/suna/backend
mkdir -p /root/suna-production/suna/apps/frontend
mkdir -p /mnt/data/redis
mkdir -p /mnt/data/graphdb/home
mkdir -p /mnt/data/graphdb/work
mkdir -p /mnt/data/logs

echo "=== Creating docker-compose.production.yml ==="
cat > /root/suna-production/docker-compose.production.yml << 'DOCKERCOMPOSE'
version: '3.9'

services:
  redis:
    image: redis:8-alpine
    container_name: suna-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - /mnt/data/redis:/data
    command: redis-server --appendonly yes --maxmemory 4gb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - suna-network

  graphdb:
    image: ontotext/graphdb:10.7.0
    container_name: suna-graphdb
    platform: linux/amd64
    restart: unless-stopped
    ports:
      - "7200:7200"
    volumes:
      - /mnt/data/graphdb/home:/opt/graphdb/home
      - /mnt/data/graphdb/work:/opt/graphdb/work
    environment:
      GDB_JAVA_OPTS: "-Xmx4g -Xms4g -Ddefault.min.distinct.threshold=100000000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7200/rest/monitor/infrastructure"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    networks:
      - suna-network

  backend:
    image: carbonbimbc6740962ecd.azurecr.io/backend:latest
    container_name: suna-backend
    platform: linux/amd64
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - ./suna/backend/.env
    environment:
      - ENV_MODE=production
      - WORKERS=4
      - TIMEOUT=75
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - GRAPHDB_URL=http://graphdb:7200
      - GRAPHDB_REPOSITORY=carbonbim-thailand
    volumes:
      - /mnt/data/logs:/app/logs
    depends_on:
      redis:
        condition: service_healthy
      graphdb:
        condition: service_healthy
    networks:
      - suna-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: carbonbimbc6740962ecd.azurecr.io/frontend:latest
    container_name: suna-frontend
    restart: unless-stopped
    init: true
    ports:
      - "3000:3000"
    env_file:
      - ./suna/apps/frontend/.env.local
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000/v1
    depends_on:
      - backend
    networks:
      - suna-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  suna-network:
    driver: bridge
DOCKERCOMPOSE

echo "=== Creating environment files ==="
cat > /root/suna-production/suna/backend/.env << 'BACKENDENV'
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
BACKENDENV

cat > /root/suna-production/suna/apps/frontend/.env.local << 'FRONTENDENV'
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space
NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_FORCE_LOCALHOST=false
FRONTENDENV

echo "=== Logging into ACR ==="
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | \
  docker login carbonbimbc6740962ecd.azurecr.io \
  --username carbonbimbc6740962ecd \
  --password-stdin

echo "=== Pulling images ==="
cd /root/suna-production
docker compose -f docker-compose.production.yml pull

echo "=== Starting services ==="
docker compose -f docker-compose.production.yml up -d

echo "=== Waiting for services to start ==="
sleep 40

echo "=== Service status ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
FULLDEPLOY
) --query "value[0].message" -o tsv

echo ""
echo "✅ Deployment Complete!"
echo ""

VM_IP=$(az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --show-details --query publicIps -o tsv)

echo "🌐 Services running at:"
echo "   Frontend: http://${VM_IP}:3000"
echo "   Backend:  http://${VM_IP}:8000"
echo "   GraphDB:  http://${VM_IP}:7200"
echo ""
echo "📝 Next Steps:"
echo ""
echo "See UPDATE_ENV_VARIABLES.sh for updating credentials"
echo "See INITIALIZE_GRAPHDB.sh for database setup"
echo "See SETUP_HTTPS.sh for Cloudflare configuration"
echo ""
