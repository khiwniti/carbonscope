# BKS Production Deployment Guide

Complete guide for deploying BKS (Frontend, Backend, Redis, GraphDB) to Azure VM with Docker Compose.

## Architecture Overview

**Single VM Deployment**:
- **VM**: Azure Standard_D4s_v3 (4 vCPUs, 16GB RAM)
- **OS Disk**: 128GB Premium SSD
- **Data Disk**: 256GB Premium SSD (mounted at /mnt/data)
- **Services**: All running as Docker containers on one VM
- **Networking**: Docker bridge network for inter-service communication
- **Persistence**: GraphDB and Redis data stored on attached Azure disk

**Service Ports**:
- Frontend: 3000 (Next.js)
- Backend: 8000 (FastAPI)
- GraphDB: 7200 (RDF/SPARQL)
- Redis: 6379 (Cache/Queue)

## Prerequisites

### Local Machine Setup
```bash
# 1. Install Azure CLI
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
# Windows: https://aka.ms/installazurecliwindows

# 2. Login to Azure
az login

# 3. Set active subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_NAME"

# 4. Verify resource group exists
az group show --name carbon-bim-rg

# 5. Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Press Enter to accept default location (~/.ssh/id_rsa)
```

### Environment Variables Preparation
```bash
# 1. Copy template
cp .env.production.template .env.production

# 2. Fill in all required values:
# - Database credentials (Supabase)
# - Encryption keys (generate with: openssl rand -base64 32)
# - Redis password
# - API keys (Daytona, PostHog, etc.)

# 3. Review and update:
nano .env.production
```

## Deployment Steps

### Step 1: Build and Push Images to ACR

**Build all Docker images locally and push to Azure Container Registry**:

```bash
# Authenticate with ACR
az acr login --name carbonbimbc6740962ecd

# Build and push all services (takes 10-15 minutes)
./deploy-to-acr.sh
```

**What this does**:
- Builds Backend image (Python FastAPI with uv)
- Builds Frontend image (Next.js 15 with Turbopack)
- Pulls and re-tags Redis 8 alpine
- Tags each with timestamp and :latest
- Pushes all images to ACR

**Expected output**:
```
🚀 Deploying BKS services to Azure Container Registry
📅 Build timestamp: 20260324-143022
🔐 Authenticating with Azure Container Registry...
🐍 Building Backend service...
⚛️  Building Frontend service...
📦 Pulling and pushing Redis...
✅ All services pushed to Azure Container Registry!

📋 Deployed images:
   - carbonbimbc6740962ecd.azurecr.io/backend:20260324-143022
   - carbonbimbc6740962ecd.azurecr.io/frontend:20260324-143022
   - carbonbimbc6740962ecd.azurecr.io/redis:8-alpine
```

### Step 2: Create Azure VM

**Provision the production VM with all dependencies**:

```bash
# Create VM, install Docker, attach data disk (takes 5-8 minutes)
./deploy-vm-production.sh
```

**What this does**:
1. Creates Azure VM (Standard_D4s_v3)
2. Attaches 256GB data disk
3. Opens ports: 80, 443, 3000, 8000
4. Installs Docker and Docker Compose V2
5. Formats and mounts data disk to /mnt/data
6. Creates directories: /mnt/data/redis, /mnt/data/graphdb, /mnt/data/logs
7. Installs additional tools (git, curl, wget, jq)

**Expected output**:
```
🚀 BKS Production VM Deployment
==================================
Configuration:
  VM Name: suna-production-vm
  VM Size: Standard_D4s_v3
  Location: southeastasia

1️⃣  Creating Azure VM...
✅ VM created with IP: 20.205.XXX.XXX

2️⃣  Creating data disk for GraphDB and Redis...
✅ Data disk attached

3️⃣  Configuring firewall (NSG rules)...
✅ Ports opened: 80, 443, 3000, 8000

4️⃣  Installing Docker and dependencies on VM...
✅ Docker installed

✅ VM Deployment Complete!

📋 VM Information:
   Name: suna-production-vm
   IP: 20.205.XXX.XXX
   SSH: ssh azureuser@20.205.XXX.XXX

🎯 Next steps:
   1. Run: ./setup-vm-docker-compose.sh 20.205.XXX.XXX
```

**Save the VM IP address** - you'll need it for the next step.

### Step 3: Deploy Services to VM

**Copy code and start all services**:

```bash
# Replace with your actual VM IP from Step 2
./setup-vm-docker-compose.sh 20.205.XXX.XXX
```

**What this does**:
1. Tests SSH connection
2. Copies project files to VM (excludes node_modules, .venv, build artifacts)
3. Creates .env files from templates if missing
4. Pulls latest images from ACR
5. Starts all services with docker compose
6. Shows service status

**Expected output**:
```
🚀 Setting up BKS on VM: 20.205.XXX.XXX
====================================

1️⃣  Testing SSH connection...
✅ SSH connection verified

2️⃣  Copying project files to VM...
   (This may take a few minutes...)
✅ Files copied

3️⃣  Configuring environment and starting services...
⚠️  Creating backend .env from template...
⚠️  IMPORTANT: Edit backend/.env with your actual credentials!
⚠️  Creating frontend .env.local from template...
⚠️  IMPORTANT: Edit suna/apps/frontend/.env.local with your actual credentials!

📦 Pulling latest images from ACR...
🚀 Starting all services...
⏳ Waiting for services to be healthy...

📊 Service Status:
NAME              IMAGE                                            STATUS
suna-redis        redis:8-alpine                                   Up 30 seconds (healthy)
suna-graphdb      ontotext/graphdb:10.7.0                         Up 30 seconds (healthy)
suna-backend      carbonbimbc6740962ecd.azurecr.io/backend:latest Up 30 seconds (healthy)
bks-cbim-frontend     carbonbimbc6740962ecd.azurecr.io/frontend:latest Up 30 seconds (healthy)

✅ Services started!
```

### Step 4: Configure Environment Variables

**SSH into the VM and update environment variables**:

```bash
# SSH to VM
ssh azureuser@20.205.XXX.XXX

# Navigate to project
cd ~/suna-production

# Edit backend .env
nano backend/.env
```

**Backend .env (backend/.env)**:
```bash
# Production Backend Environment
ENV_MODE=production
WORKERS=4
TIMEOUT=75

# Redis (localhost since all services on same VM)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False

# GraphDB (localhost)
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand

# Database - UPDATE THESE!
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Encryption - GENERATE THESE!
ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32
MCP_CREDENTIAL_ENCRYPTION_KEY=GENERATE_WITH_openssl_rand_base64_32

# External Services
DAYTONA_API_KEY=your-daytona-key
POSTHOG_PROJECT_API_KEY=your-posthog-key
```

**Generate encryption keys on VM**:
```bash
# Generate ENCRYPTION_KEY
openssl rand -base64 32

# Generate MCP_CREDENTIAL_ENCRYPTION_KEY
openssl rand -base64 32
```

**Frontend .env.local (suna/apps/frontend/.env.local)**:
```bash
# Production Frontend Environment
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=http://backend:8000/v1
NEXT_PUBLIC_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_FORCE_LOCALHOST=false

# Admin API Key (keep secret!)
KORTIX_ADMIN_API_KEY=your-admin-key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_GTM_ID=your-gtm-id
```

**Restart services after updating .env**:
```bash
docker compose -f docker-compose.production.yml restart
```

### Step 5: Initialize GraphDB Repository

**Create the carbonbim-thailand repository**:

```bash
# On the VM
curl -X POST http://localhost:7200/rest/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "id": "carbonbim-thailand",
    "title": "BKS Carbon BIM Thailand",
    "ruleset": "rdfsplus-optimized",
    "params": {
      "defaultNS": {
        "value": "http://carbonbim.ai/ontology/"
      }
    }
  }'

# Verify repository created
curl http://localhost:7200/rest/repositories
```

**Load TGO ontology and emission factors** (if you have data files):
```bash
# Upload TTL/RDF files via GraphDB Workbench
# Access: http://20.205.XXX.XXX:7200
# Or use SPARQL load commands
```

### Step 6: Verify Deployment

**Check service health**:

```bash
# On the VM
docker compose -f ~/suna-production/docker-compose.production.yml ps
docker compose -f ~/suna-production/docker-compose.production.yml logs --tail=50

# Test each service
curl http://localhost:6379  # Redis (should get PONG)
curl http://localhost:7200/rest/monitor/infrastructure  # GraphDB
curl http://localhost:8000/v1/health  # Backend
curl http://localhost:3000/api/health  # Frontend
```

**From your local machine**:
```bash
# Replace with your VM IP
curl http://20.205.XXX.XXX:3000
curl http://20.205.XXX.XXX:8000/v1/health
curl http://20.205.XXX.XXX:7200
```

### Step 7: Configure Custom Domain and SSL

**Option A: Using Nginx Reverse Proxy** (recommended):

```bash
# SSH to VM
ssh azureuser@20.205.XXX.XXX

# Install nginx
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/suna
```

**Nginx config** (/etc/nginx/sites-available/suna):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and get SSL**:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/suna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Option B: Using Azure Application Gateway** (enterprise):
- Create Application Gateway in Azure Portal
- Configure backend pools pointing to VM IP:3000 and VM IP:8000
- Set up SSL certificate in Application Gateway
- Configure routing rules

### Step 8: Set Up Monitoring

**Install monitoring stack** (optional but recommended):

```bash
# On the VM
cd ~/suna-production

# Create monitoring docker-compose
nano docker-compose.monitoring.yml
```

**Monitoring stack** (Prometheus + Grafana):
```yaml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - /mnt/data/prometheus:/prometheus
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - suna-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - /mnt/data/grafana:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your_password
    networks:
      - suna-network

networks:
  suna-network:
    external: true
```

### Step 9: Set Up Backups

**Automated daily backups**:

```bash
# Create backup script on VM
nano ~/backup-suna.sh
```

**Backup script**:
```bash
#!/bin/bash
BACKUP_DIR="/mnt/data/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup GraphDB data
tar -czf $BACKUP_DIR/graphdb-${DATE}.tar.gz -C /mnt/data/graphdb .

# Backup Redis data
docker exec suna-redis redis-cli SAVE
cp /mnt/data/redis/dump.rdb $BACKUP_DIR/redis-${DATE}.rdb

# Keep only last 7 days
find $BACKUP_DIR -name "graphdb-*" -mtime +7 -delete
find $BACKUP_DIR -name "redis-*" -mtime +7 -delete

echo "Backup completed: ${DATE}"
```

**Schedule with cron**:
```bash
chmod +x ~/backup-suna.sh
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/azureuser/backup-suna.sh >> /var/log/suna-backup.log 2>&1
```

## Maintenance Commands

### Managing Services
```bash
# SSH to VM
ssh azureuser@20.205.XXX.XXX
cd ~/suna-production

# View status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend

# Restart services
docker compose -f docker-compose.production.yml restart
docker compose -f docker-compose.production.yml restart backend

# Stop services
docker compose -f docker-compose.production.yml stop

# Start services
docker compose -f docker-compose.production.yml start

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --force-recreate
```

### Updating Deployment
```bash
# 1. Build new images locally
./deploy-to-acr.sh

# 2. SSH to VM
ssh azureuser@20.205.XXX.XXX
cd ~/suna-production

# 3. Pull latest images
docker compose -f docker-compose.production.yml pull

# 4. Restart with new images
docker compose -f docker-compose.production.yml up -d
```

### VM Management
```bash
# View VM details
az vm show --resource-group carbon-bim-rg --name suna-production-vm --show-details

# Stop VM (saves costs when not in use)
az vm stop --resource-group carbon-bim-rg --name suna-production-vm

# Start VM
az vm start --resource-group carbon-bim-rg --name suna-production-vm

# Restart VM
az vm restart --resource-group carbon-bim-rg --name suna-production-vm

# Resize VM (if needed)
az vm list-sizes --location southeastasia --output table
az vm resize --resource-group carbon-bim-rg --name suna-production-vm --size Standard_D8s_v3
```

## Troubleshooting

### Services Not Starting
```bash
# Check logs
docker compose -f docker-compose.production.yml logs

# Check disk space
df -h

# Check memory
free -h

# Check Docker resources
docker system df
```

### GraphDB Not Accessible
```bash
# Check GraphDB logs
docker compose logs graphdb

# Verify repository exists
curl http://localhost:7200/rest/repositories

# Restart GraphDB
docker compose restart graphdb
```

### Frontend Not Loading
```bash
# Check frontend logs
docker compose logs frontend

# Verify environment variables
docker exec bks-cbim-frontend env | grep NEXT_PUBLIC

# Check if backend is accessible
docker exec bks-cbim-frontend curl http://backend:8000/v1/health
```

### Backend Errors
```bash
# Check backend logs
docker compose logs backend

# Check database connection
docker exec suna-backend curl $DATABASE_URL

# Check Redis connection
docker exec suna-backend curl redis://redis:6379
```

## Security Checklist

- [ ] Updated all environment variables with real credentials
- [ ] Generated strong encryption keys
- [ ] Configured firewall rules (NSG)
- [ ] Set up SSL certificate for custom domain
- [ ] Changed default passwords (GraphDB, monitoring tools)
- [ ] Restricted SSH access (IP whitelist or key-only)
- [ ] Enabled Azure Backup for VM and disks
- [ ] Set up automated backups for GraphDB and Redis
- [ ] Configured monitoring and alerting
- [ ] Reviewed and hardened Docker container security
- [ ] Disabled unnecessary services and ports
- [ ] Set up log retention and rotation
- [ ] Documented disaster recovery procedures

## Cost Optimization

- Stop VM when not in use (dev/staging environments)
- Use Azure Reserved Instances for production (up to 72% savings)
- Enable auto-shutdown for non-production VMs
- Monitor and optimize disk usage
- Use Azure Cost Management to track spending
- Consider Azure Spot VMs for non-critical workloads

## Next Steps

1. **Custom Domain**: Configure DNS and SSL certificate
2. **Monitoring**: Set up Prometheus/Grafana or Azure Monitor
3. **Backups**: Automate daily backups and test restore procedures
4. **Scaling**: Consider Azure Load Balancer for multiple VMs
5. **CI/CD**: Set up GitHub Actions for automated deployments
6. **Documentation**: Document your specific configurations and procedures
