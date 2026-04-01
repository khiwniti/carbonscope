# BIM Agent SaaS - All-Azure Free Tier Deployment

**Both frontend and backend on Azure free tier using App Service + B1S VM**

---

## 🎯 Azure Free Tier Architecture

```
Azure Free Services Only
────────────────────────────────────────────

Frontend (Azure App Service F1)     Backend (Azure B1S VM)
─────────────────────────────      ────────────────────────
Next.js Static Export              FastAPI + LiteLLM
F1 Free Tier (1GB RAM)             B1S (1 vCPU, 1GB RAM)
60 CPU min/day                     Docker + Nginx

         │                                  │
         └──────────────┬───────────────────┘
                        │
                Azure Blob Storage (5GB)
                Supabase PostgreSQL (Free)
                Redis (local container)
```

**Total Cost: $0/month** (Year 1) + LLM API usage (~$10-50/month)

---

## 🚀 Deployment Steps

### **Part 1: Backend on B1S VM** (Same as previous guide)

Follow steps from `AZURE-FREE-TIER-DEPLOYMENT.md`:
- ✅ Create B1S VM
- ✅ Install Docker
- ✅ Deploy FastAPI backend
- ✅ Configure Nginx
- ✅ Install SSL

---

### **Part 2: Frontend on Azure App Service (F1 Free Tier)**

#### Step 1: Build Static Next.js Export
```bash
# On your local machine
cd apps/frontend

# Install dependencies
pnpm install

# Update next.config.ts for static export
cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Static HTML export
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable features not supported in static export
  experimental: {
    // Remove any server-side features
  },
};

export default nextConfig;
EOF

# Build static export
pnpm run build

# This creates 'out/' directory with static HTML/CSS/JS
```

#### Step 2: Create Azure App Service (F1 Free)
```bash
# Login to Azure
az login

# Create App Service Plan (F1 Free tier)
az appservice plan create \
  --name bim-frontend-plan \
  --resource-group bim-agent-rg \
  --sku F1 \
  --is-linux

# Create Web App
az webapp create \
  --name bim-frontend-app \
  --resource-group bim-agent-rg \
  --plan bim-frontend-plan \
  --runtime "NODE:20-lts"

# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name bim-frontend-app \
  --resource-group bim-agent-rg \
  --query "{username: publishingUserName, password: publishingPassword}"
```

#### Step 3: Deploy Static Files to App Service
```bash
# Option 1: Deploy via ZIP
cd apps/frontend
zip -r frontend.zip out/

az webapp deployment source config-zip \
  --resource-group bim-agent-rg \
  --name bim-frontend-app \
  --src frontend.zip

# Option 2: Deploy via Git
# Enable local Git deployment
az webapp deployment source config-local-git \
  --name bim-frontend-app \
  --resource-group bim-agent-rg

# Get Git URL
GIT_URL=$(az webapp deployment source config-local-git \
  --name bim-frontend-app \
  --resource-group bim-agent-rg \
  --query url -o tsv)

# Add remote and push
cd apps/frontend
git init
git add .
git commit -m "Initial deployment"
git remote add azure $GIT_URL
git push azure main
```

#### Step 4: Configure App Service
```bash
# Set Node.js startup command
az webapp config set \
  --resource-group bim-agent-rg \
  --name bim-frontend-app \
  --startup-file "npx serve out -p 8080"

# Add environment variables
az webapp config appsettings set \
  --resource-group bim-agent-rg \
  --name bim-frontend-app \
  --settings \
    NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com \
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Enable HTTPS only
az webapp update \
  --resource-group bim-agent-rg \
  --name bim-frontend-app \
  --https-only true

# Get app URL
az webapp show \
  --resource-group bim-agent-rg \
  --name bim-frontend-app \
  --query defaultHostName -o tsv
```

---

### **Part 3: Alternative - Both Services on Single B1S VM**

**Better approach for free tier**: Run both frontend and backend on the same VM to maximize resources.

#### Step 1: Build Frontend Static Files
```bash
# On your local machine
cd apps/frontend
pnpm run build

# Copy to VM
scp -r out/ azureuser@$VM_IP:/home/azureuser/comprehensive-suna-bim-agent/frontend-dist/
```

#### Step 2: Update Docker Compose (Single VM)
```bash
# On Azure VM
cat > docker-compose.all-in-one.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.lightweight
    container_name: bim-backend
    restart: unless-stopped
    expose:
      - "8000"
    environment:
      DATABASE_URL: ${SUPABASE_DATABASE_URL}
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    volumes:
      - ./backend/data:/app/data
      - ./uploads:/app/uploads
    depends_on:
      - redis
    mem_limit: 400m

  frontend:
    image: nginx:alpine
    container_name: bim-frontend
    restart: unless-stopped
    expose:
      - "80"
    volumes:
      - ./frontend-dist:/usr/share/nginx/html:ro
      - ./nginx/frontend.conf:/etc/nginx/conf.d/default.conf:ro
    mem_limit: 64m

  redis:
    image: redis:7-alpine
    container_name: bim-redis
    restart: unless-stopped
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    mem_limit: 128m

  nginx:
    image: nginx:alpine
    container_name: bim-nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-proxy.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
    mem_limit: 64m

volumes:
  redis_data:
EOF
```

#### Step 3: Configure Nginx Proxy
```bash
mkdir -p nginx

# Frontend Nginx config
cat > nginx/frontend.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Main proxy config
cat > nginx/nginx-proxy.conf << 'EOF'
events {
    worker_connections 512;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name yourdomain.com;

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API routes
        location /api/ {
            proxy_pass http://backend/;
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

        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }

        client_max_body_size 50M;
    }

    # HTTPS configuration (add after SSL cert)
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Same location blocks as above
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
        }

        location /api/ {
            proxy_pass http://backend/;
            # ... same as above
        }
    }
}
EOF
```

#### Step 4: Deploy All Services
```bash
# Load environment
set -a
source .env.production
set +a

# Stop old containers
docker compose -f docker-compose.azure-free.yml down

# Start all-in-one
docker compose -f docker-compose.all-in-one.yml up -d

# Check status
docker compose -f docker-compose.all-in-one.yml ps

# Monitor resources
docker stats
```

#### Step 5: Install SSL Certificate
```bash
# Stop nginx temporarily
docker compose -f docker-compose.all-in-one.yml stop nginx

# Get certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  --agree-tos \
  --email your-email@example.com

# Start nginx
docker compose -f docker-compose.all-in-one.yml up -d nginx

# Auto-renewal
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker compose -f /home/azureuser/comprehensive-suna-bim-agent/docker-compose.all-in-one.yml restart nginx'") | sudo crontab -
```

---

## 📊 Resource Allocation (1GB RAM Total)

### All-in-One VM Approach
```
Total RAM: 1024 MB (1GB)
─────────────────────
Backend:   400 MB (FastAPI + Python)
Frontend:   64 MB (Nginx serving static)
Redis:     128 MB (Cache)
Nginx:      64 MB (Reverse proxy)
System:    200 MB (Ubuntu overhead)
Swap:     2048 MB (Safety buffer)
─────────────────────
Total:     856 MB (84% utilization)
```

### App Service F1 Approach
```
B1S VM (Backend):     1024 MB
App Service (Frontend): 1024 MB
─────────────────────────────
Total Resources:      2048 MB (2GB)
Better isolation but counts as 2 services
```

---

## 💰 Cost Comparison

### Option 1: All-in-One VM
- ✅ Single B1S VM: **$0** (750 hours = 24/7)
- ✅ Blob Storage: **$0** (5GB)
- ✅ Bandwidth: **$0** (250GB)
- **Total: $0/month**

### Option 2: Split Services
- ✅ B1S VM: **$0** (backend)
- ✅ App Service F1: **$0** (frontend)
- ⚠️ Both use separate quotas
- **Total: $0/month** (but uses more free tier quota)

### Recommendation
**Use All-in-One VM** (Option 1):
- Simpler architecture
- Single point of management
- More efficient resource use
- Leaves App Service quota for other projects

---

## ⚠️ F1 App Service Limitations

### Daily Quotas
- ⚠️ **60 CPU minutes/day** (1 hour total compute)
- ⚠️ **1GB disk space**
- ⚠️ **165 MB/day data out**

### Why All-in-One is Better
- ✅ No daily CPU limit on B1S VM
- ✅ Better performance (no cold starts)
- ✅ Full 24/7 availability
- ✅ Simpler deployment

---

## 🚀 Quick Start Commands

### Deploy Everything on Single VM
```bash
# 1. Provision Azure VM
az vm create \
  --resource-group bim-agent-rg \
  --name bim-agent-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys

# 2. Get IP and connect
VM_IP=$(az vm show --resource-group bim-agent-rg --name bim-agent-vm --show-details --query publicIps -o tsv)
ssh azureuser@$VM_IP

# 3. Setup environment (on VM)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y

# 4. Clone and deploy
git clone <your-repo> bim-agent
cd bim-agent
docker compose -f docker-compose.all-in-one.yml up -d

# 5. Configure SSL
sudo certbot certonly --standalone -d yourdomain.com
docker compose -f docker-compose.all-in-one.yml restart nginx

# Done! Visit https://yourdomain.com
```

---

## ✅ Deployment Checklist

- [ ] Azure B1S VM provisioned
- [ ] Docker installed
- [ ] Swap file created (2GB)
- [ ] Supabase database configured
- [ ] Frontend built (static export)
- [ ] Frontend files copied to VM
- [ ] All-in-one Docker Compose configured
- [ ] Environment variables set
- [ ] Services deployed
- [ ] Nginx proxy configured
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Health checks passing
- [ ] Resource monitoring enabled
- [ ] Auto-renewal configured
- [ ] End-to-end testing completed

---

## 🔧 Monitoring & Maintenance

### Resource Monitoring
```bash
# Check container resources
docker stats

# Check memory usage
free -h

# Check disk usage
df -h

# Check logs
docker compose -f docker-compose.all-in-one.yml logs -f
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost

# Full stack
curl https://yourdomain.com
curl https://yourdomain.com/api/health
```

### Backup Strategy
```bash
# Backup Supabase (automatic)
# Supabase provides daily backups on free tier

# Backup uploaded files
rsync -avz /home/azureuser/comprehensive-suna-bim-agent/uploads/ /backup/uploads/

# Backup Docker volumes
docker run --rm -v bim_redis_data:/data -v /backup:/backup alpine tar czf /backup/redis-data.tar.gz -C /data .
```

---

## 🎯 Next Steps

Your BIM Agent SaaS is now fully deployed on Azure free tier!

**Test the deployment:**
1. Visit `https://yourdomain.com`
2. Upload an IFC file
3. Ask questions about carbon analysis
4. Check Thai building codes compliance

**Monitor usage:**
- Check Azure Portal for resource usage
- Monitor VM memory with `htop`
- Review logs with `docker compose logs`

**Ready to scale?**
When you exceed free tier, upgrade to:
- B2s VM (2 vCPU, 4GB RAM) for $30/month
- Or keep free tier and optimize further
