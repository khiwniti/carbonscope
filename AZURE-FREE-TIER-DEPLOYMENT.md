# BIM Agent SaaS - Azure Free Tier Deployment Guide

**Optimized for Azure free tier quota with hybrid Vercel frontend**

---

## 🎯 Free Tier Resources Available

### Azure Free Services (12 months)
- ✅ **B1S Virtual Machine**: 750 hours/month (1 vCPU, 1GB RAM)
- ✅ **Azure Database for PostgreSQL**: Flexible Server Basic tier
- ✅ **5GB Blob Storage**: For IFC files and uploads
- ✅ **250GB Bandwidth**: Outbound data transfer
- ⚠️ **Note**: 1GB RAM is tight for BIM processing - we'll optimize for this

### Always Free
- ✅ **App Service**: F1 Free tier (1GB RAM, 60 CPU minutes/day)
- ✅ **Azure Functions**: 1 million requests/month
- ✅ **Azure Cache for Redis**: 250MB C0 tier (always free)

---

## 📋 Optimized Architecture for Free Tier

```
Frontend (Vercel Free)     Azure Free Tier            External
──────────────────        ─────────────────          ────────
Next.js App              B1S VM (1GB RAM)            LiteLLM APIs
AI Elements UI           - Nginx                     - Anthropic
3D BIM Viewer     ←──→   - Lightweight FastAPI      - OpenAI
                         - Redis (local, no Azure)
                         PostgreSQL Flexible         Supabase Free
                         Server (Free tier)          (PostgreSQL)
```

**Free Tier Optimizations:**
- Use **Supabase free PostgreSQL** instead of Azure PostgreSQL (saves quota)
- Run **Redis locally in Docker** (250MB Azure Redis is too small)
- Use **Vercel free tier** for frontend (100GB bandwidth/month)
- **Optimize FastAPI** for 1GB RAM constraint

---

## 🚀 Step-by-Step Deployment

### **Step 1: Create Azure Account & Resources**

#### 1.1 Sign Up for Azure Free Account
```bash
# Visit: https://azure.microsoft.com/free/
# Sign up with credit card (won't be charged in free tier)
# Verify email and identity
```

#### 1.2 Install Azure CLI
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Verify subscription
az account show
```

#### 1.3 Create Resource Group
```bash
# Create resource group in Southeast Asia (closest to Thailand)
az group create \
  --name bim-agent-rg \
  --location southeastasia

# Verify
az group list --output table
```

---

### **Step 2: Provision B1S Virtual Machine (Free Tier)**

#### 2.1 Create B1S VM
```bash
# Create Ubuntu 22.04 LTS VM with B1S size (1 vCPU, 1GB RAM)
az vm create \
  --resource-group bim-agent-rg \
  --name bim-agent-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --public-ip-address-allocation static

# Note: This uses 750 free hours/month (24/7 coverage)
```

#### 2.2 Open Ports for HTTP/HTTPS
```bash
# Open port 80 (HTTP)
az vm open-port \
  --resource-group bim-agent-rg \
  --name bim-agent-vm \
  --port 80 \
  --priority 1000

# Open port 443 (HTTPS)
az vm open-port \
  --resource-group bim-agent-rg \
  --name bim-agent-vm \
  --port 443 \
  --priority 1001

# Get public IP
VM_IP=$(az vm show \
  --resource-group bim-agent-rg \
  --name bim-agent-vm \
  --show-details \
  --query publicIps \
  --output tsv)

echo "VM IP: $VM_IP"
```

#### 2.3 Connect to VM
```bash
# SSH into VM
ssh azureuser@$VM_IP
```

---

### **Step 3: Setup VM Environment (On Azure VM)**

#### 3.1 Update System & Install Docker
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install monitoring tools
sudo apt install htop nethogs -y

# Logout and login to apply docker group
exit
ssh azureuser@$VM_IP
```

#### 3.2 Optimize VM for 1GB RAM
```bash
# Create swap file (2GB) for memory safety
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

### **Step 4: Setup Supabase PostgreSQL (Free Alternative)**

#### 4.1 Create Supabase Project
```bash
# Visit: https://supabase.com/dashboard
# Create new project (free tier: 500MB database, 2GB bandwidth)
# Region: Southeast Asia (Singapore)
# Note down:
# - Database URL
# - API Key (anon public)
# - Service Role Key
```

#### 4.2 Initialize Database Schema
```sql
-- Run in Supabase SQL Editor

-- BIM Projects table
CREATE TABLE bim_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  ifc_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon Analysis Results
CREATE TABLE carbon_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES bim_projects(id),
  total_carbon_kg DECIMAL(12, 2),
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES bim_projects(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bim_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own projects"
  ON bim_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON bim_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### **Step 5: Deploy Lightweight Backend (Optimized for 1GB RAM)**

#### 5.1 Clone Project
```bash
# On Azure VM
cd ~
git clone https://github.com/your-org/comprehensive-suna-bim-agent.git
cd comprehensive-suna-bim-agent
```

#### 5.2 Create Memory-Optimized Docker Compose
```bash
cat > docker-compose.azure-free.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.lightweight
    container_name: bim-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      # Database (Supabase)
      DATABASE_URL: ${SUPABASE_DATABASE_URL}
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}

      # Redis (local container)
      REDIS_URL: redis://redis:6379

      # LLM Providers
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      LITELLM_NUM_RETRIES: 2
      LITELLM_REQUEST_TIMEOUT: 300

      # BIM Processing
      MAX_WORKERS: 1
      WORKER_MEMORY_LIMIT: 512MB

      # Security
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: https://*.vercel.app,https://yourdomain.com

    volumes:
      - ./backend/data:/app/data
      - ./uploads:/app/uploads
    depends_on:
      - redis
    mem_limit: 512m
    cpus: 0.8

  redis:
    image: redis:7-alpine
    container_name: bim-redis
    restart: unless-stopped
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    mem_limit: 128m
    cpus: 0.2

  nginx:
    image: nginx:alpine
    container_name: bim-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    mem_limit: 64m

volumes:
  redis_data:
EOF
```

#### 5.3 Create Lightweight Backend Dockerfile
```bash
cat > backend/Dockerfile.lightweight << 'EOF'
FROM python:3.12-slim

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with single worker (memory optimization)
CMD ["gunicorn", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", \
     "api:app", "--bind", "0.0.0.0:8000", \
     "--timeout", "300", "--max-requests", "1000", \
     "--max-requests-jitter", "100"]
EOF
```

#### 5.4 Create Environment File
```bash
cat > .env.production << 'EOF'
# Supabase (Free Tier)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# LLM Providers
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Security
JWT_SECRET=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://*.vercel.app

# Optimization
MAX_WORKERS=1
WORKER_MEMORY_LIMIT=512MB
EOF
```

#### 5.5 Configure Nginx
```bash
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 512;
}

http {
    upstream backend {
        server backend:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name _;

        # Redirect to HTTPS (will be added later)
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Timeouts
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;

            # Rate limiting
            limit_req zone=api_limit burst=20 nodelay;
        }

        # Health check (bypass rate limit)
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }

        # File upload size
        client_max_body_size 50M;
    }
}
EOF
```

#### 5.6 Deploy Backend
```bash
# Load environment variables
set -a
source .env.production
set +a

# Build and start services
docker compose -f docker-compose.azure-free.yml up -d

# Check status
docker compose -f docker-compose.azure-free.yml ps

# View logs
docker compose -f docker-compose.azure-free.yml logs -f

# Test health endpoint
curl http://localhost:8000/health
```

---

### **Step 6: Configure Domain & SSL**

#### 6.1 Configure DNS
```bash
# Option 1: Use Azure DNS (Free for first 25 zones)
# Point your domain to VM_IP

# Option 2: Use Cloudflare (Free)
# Add A record: api.yourdomain.com -> VM_IP
```

#### 6.2 Install SSL Certificate
```bash
# Install certbot
sudo apt install certbot -y

# Stop nginx temporarily
docker compose -f docker-compose.azure-free.yml stop nginx

# Get certificate (standalone mode)
sudo certbot certonly --standalone \
  -d api.yourdomain.com \
  --agree-tos \
  --email your-email@example.com \
  --non-interactive

# Restart nginx
docker compose -f docker-compose.azure-free.yml up -d nginx

# Test HTTPS
curl https://api.yourdomain.com/health
```

#### 6.3 Auto-Renew SSL
```bash
# Add cron job for renewal
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker compose -f /home/azureuser/comprehensive-suna-bim-agent/docker-compose.azure-free.yml restart nginx'") | sudo crontab -
```

---

### **Step 7: Deploy Frontend to Vercel (Free Tier)**

#### 7.1 Prepare Frontend
```bash
# On your local machine
cd comprehensive-suna-bim-agent/apps/frontend

# Install dependencies
pnpm install

# Install AI SDK + AI Elements
pnpm add ai @ai-sdk/react
bunx ai-elements@latest
```

#### 7.2 Configure Environment
```bash
cat > .env.local << 'EOF'
# Backend API (Azure VM)
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF
```

#### 7.3 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
# - NEXT_PUBLIC_BACKEND_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

### **Step 8: Optimize for Free Tier Limits**

#### 8.1 Backend Memory Monitoring
```bash
# Add to backend/core/monitoring.py
import psutil
import logging

def check_memory_usage():
    memory = psutil.virtual_memory()
    if memory.percent > 90:
        logging.warning(f"High memory usage: {memory.percent}%")
        # Trigger cleanup or alert
```

#### 8.2 Request Rate Limiting
```python
# backend/api.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/chat")
@limiter.limit("10/minute")  # Free tier protection
async def chat_endpoint(request: Request):
    pass
```

#### 8.3 Response Caching
```python
# Use Redis for caching common queries
from redis import Redis
import json

redis_client = Redis.from_url(os.getenv("REDIS_URL"))

def cache_response(key: str, data: dict, ttl: int = 3600):
    redis_client.setex(key, ttl, json.dumps(data))

def get_cached_response(key: str):
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None
```

---

## 💰 Cost Breakdown (Free Tier)

### Azure Free Tier (12 months)
- ✅ B1S VM: **$0** (750 hours/month = 100% coverage)
- ✅ 5GB Storage: **$0**
- ✅ 250GB Bandwidth: **$0**
- **Total Azure: $0/month** (Year 1)

### External Free Services
- ✅ Supabase: **$0** (500MB DB, 2GB bandwidth)
- ✅ Vercel: **$0** (100GB bandwidth, unlimited requests)
- ✅ Cloudflare DNS: **$0** (optional)

### Paid (Required)
- 💰 LLM API costs: ~$10-50/month (usage-based)
- 💰 Domain: ~$12/year

**Total Monthly Cost: $10-50** (mostly LLM usage)

---

## ⚠️ Free Tier Limitations & Solutions

### 1. **1GB RAM Constraint**
- ✅ **Solution**: Single worker, swap file, aggressive caching
- ✅ **Monitoring**: Alert at >90% memory usage
- ⚠️ **Upgrade Path**: B2s (2 vCPU, 4GB) = ~$30/month

### 2. **Limited Compute**
- ✅ **Solution**: Offload heavy processing to LLM APIs
- ✅ **Async Processing**: Queue large IFC files
- ⚠️ **Upgrade Path**: B2ms (2 vCPU, 8GB) = ~$60/month

### 3. **750 Hours/Month = 24/7**
- ✅ **Solution**: Single VM runs continuously (exactly 750 hours)
- ⚠️ **Don't**: Create multiple VMs (exceeds quota)

### 4. **Supabase 500MB Database**
- ✅ **Solution**: Archive old projects, optimize storage
- ⚠️ **Upgrade**: Pro plan ($25/month) for 8GB

---

## 📊 Monitoring Free Tier Usage

### Azure Portal
```bash
# Check VM hours used
az monitor metrics list \
  --resource /subscriptions/<subscription-id>/resourceGroups/bim-agent-rg/providers/Microsoft.Compute/virtualMachines/bim-agent-vm \
  --metric "Percentage CPU" \
  --start-time 2024-01-01T00:00:00Z

# Check bandwidth usage
az monitor metrics list \
  --resource <vm-resource-id> \
  --metric "Network Out Total"
```

### VM Resource Monitoring
```bash
# Install monitoring script
cat > /home/azureuser/monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Resources ==="
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Swap: $(free -h | grep Swap | awk '{print $3 "/" $2}')"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2}')"
echo "========================"
EOF

chmod +x /home/azureuser/monitor.sh

# Add to crontab (check every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/azureuser/monitor.sh >> /var/log/resource-monitor.log") | crontab -
```

---

## ✅ Deployment Checklist

- [ ] Azure account created
- [ ] B1S VM provisioned (Southeast Asia region)
- [ ] VM ports 80/443 opened
- [ ] Docker installed on VM
- [ ] Swap file created (2GB)
- [ ] Supabase project created
- [ ] Database schema initialized
- [ ] Backend deployed with Docker Compose
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Memory monitoring enabled
- [ ] Rate limiting configured
- [ ] End-to-end testing completed

---

## 🚀 Next Steps After Free Tier

When you exceed free tier or need more power:

1. **Upgrade VM**: B2s (2 vCPU, 4GB RAM) = $30/month
2. **Add Redis**: Azure Cache for Redis C1 (1GB) = $15/month
3. **Managed PostgreSQL**: Azure Database = $50/month
4. **Load Balancer**: For horizontal scaling = $20/month

**Or migrate to VM-only**: Use reserved instances for 30-50% discount.
