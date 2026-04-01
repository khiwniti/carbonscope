# BIM Agent SaaS - Azure Free Tier Deployment

Complete deployment package for running BIM Agent SaaS on Azure free tier (1GB RAM VM).

---

## 📁 Directory Structure

```
azure-deployment/
├── README.md                      # This file
├── docker-compose.all-in-one.yml  # All services in one VM
├── .env.template                  # Environment variables template
├── vm-info.txt                    # Created after VM deployment
├── backend/
│   └── Dockerfile.lightweight     # Memory-optimized backend
├── nginx/
│   ├── frontend.conf              # Frontend serving config
│   └── nginx-proxy.conf           # Main reverse proxy
├── scripts/
│   ├── deploy-azure-vm.sh         # Automated VM creation
│   ├── setup-vm.sh                # VM environment setup (to be created)
│   └── deploy-app.sh              # Application deployment (to be created)
└── docs/
    └── troubleshooting.md         # Common issues (to be created)
```

---

## 🚀 Quick Start

### Step 1: Create Azure VM

```bash
cd azure-deployment/scripts
./deploy-azure-vm.sh
```

This script will:
- ✅ Try multiple Azure regions (Japan East, Korea Central, East US, West Europe)
- ✅ Create B1s VM (1 vCPU, 1GB RAM) - Free tier eligible
- ✅ Open ports 80/443
- ✅ Save VM info to `vm-info.txt`

### Step 2: Connect to VM

```bash
# Load VM information
source ../vm-info.txt

# Connect via SSH
ssh $VM_USERNAME@$VM_IP
```

### Step 3: Setup VM Environment

```bash
# On the VM
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Create swap file (2GB for memory safety)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Logout and login to apply docker group
exit
```

### Step 4: Deploy Application

```bash
# On your local machine
# Copy deployment files to VM
source azure-deployment/vm-info.txt
scp -r azure-deployment/* $VM_USERNAME@$VM_IP:~/deployment/

# Copy backend code
scp -r backend $VM_USERNAME@$VM_IP:~/deployment/

# SSH back into VM
ssh $VM_USERNAME@$VM_IP

# On VM - Deploy
cd ~/deployment
cp .env.template .env
nano .env  # Fill in your API keys

docker compose -f docker-compose.all-in-one.yml up -d

# Check status
docker compose ps
docker compose logs -f
```

---

## 📋 Prerequisites

### 1. Azure Account
- Sign up: https://azure.microsoft.com/free/
- Free tier includes: 750 hours/month B1s VM (1 year)

### 2. Supabase Account (Free PostgreSQL)
- Sign up: https://supabase.com
- Create project (Southeast Asia region)
- Get: Database URL, Service Role Key

### 3. LLM API Keys
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/

### 4. Local Requirements
- Azure CLI installed (`az --version`)
- SSH keys generated (`ssh-keygen`)
- Git installed

---

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Copy template
cp .env.template .env

# Edit with your values
nano .env
```

**Required variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - Generate with `openssl rand -hex 32`
- `ALLOWED_ORIGINS` - Your domain (e.g., https://yourdomain.com)

---

## 🏗️ Architecture

### All-in-One VM (1GB RAM)

```
┌─────────────────────────────────────────┐
│  Azure B1s VM (1 vCPU, 1GB RAM)        │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Nginx Proxy (64MB)                 │ │
│  │ - Routes: / → Frontend             │ │
│  │           /api/ → Backend          │ │
│  │ - Ports: 80, 443                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐│
│  │ Frontend     │  │ Backend (400MB)  ││
│  │ (Nginx 64MB) │  │ FastAPI+LiteLLM  ││
│  │ Static HTML  │  │ BIM Processing   ││
│  └──────────────┘  └──────────────────┘│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Redis (128MB) - Cache & Sessions   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Total: ~856MB (84% utilization)       │
│  Swap: 2GB (safety buffer)             │
└─────────────────────────────────────────┘

External Services:
- Supabase (PostgreSQL) - Free tier
- LLM APIs (Anthropic, OpenAI)
```

---

## 💰 Cost Breakdown

### Azure Free Tier (12 months)
- ✅ B1s VM: **$0** (750 hours/month = 100% coverage)
- ✅ 5GB Storage: **$0**
- ✅ 250GB Bandwidth: **$0**

### External Free Services
- ✅ Supabase: **$0** (500MB DB, 2GB bandwidth)

### Paid (Usage-Based)
- 💰 LLM API calls: ~$10-50/month

**Total: $10-50/month** (mostly LLM usage)

---

## 🔧 Monitoring & Maintenance

### Resource Monitoring

```bash
# On VM - Check Docker containers
docker stats

# Check memory
free -h

# Check disk
df -h

# View logs
docker compose -f docker-compose.all-in-one.yml logs -f backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Full stack
curl http://VM_IP
curl http://VM_IP/api/health
```

---

## 📊 Resource Limits

### Memory Allocation
- Backend: 400MB (FastAPI + Python)
- Frontend: 64MB (Nginx static files)
- Redis: 128MB (Cache)
- Nginx Proxy: 64MB (Reverse proxy)
- System: ~200MB (Ubuntu)
- **Total: 856MB / 1024MB (84%)**

### CPU Allocation
- Backend: 0.7 cores
- Frontend: 0.1 cores
- Redis: 0.1 cores
- Nginx: 0.1 cores
- **Total: 1.0 cores**

---

## 🚨 Troubleshooting

### VM Creation Fails
**Issue:** "SkuNotAvailable" error

**Solution:**
1. Script automatically tries multiple regions
2. If all fail, try larger size: `Standard_B1ms`
3. Or use Azure App Service F1 (free tier)

### Out of Memory
**Issue:** Docker containers keep restarting

**Solution:**
```bash
# Check swap
free -h

# If no swap, create it
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Can't Connect to VM
**Issue:** SSH timeout

**Solution:**
```bash
# Check VM is running
az vm show -g $VM_RESOURCE_GROUP -n $VM_NAME --query powerState

# Restart VM
az vm restart -g $VM_RESOURCE_GROUP -n $VM_NAME
```

---

## 📚 Next Steps

After deployment:

1. **Setup SSL Certificate**
   ```bash
   # On VM
   sudo apt install certbot -y
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Configure Domain DNS**
   - Point A record to `$VM_IP`
   - Wait for propagation (~5-60 minutes)

3. **Test Application**
   - Visit `http://yourdomain.com`
   - Upload IFC file
   - Test carbon analysis

4. **Setup Monitoring**
   - Configure alerts for high memory usage
   - Set up backup schedule
   - Enable auto-renewal for SSL

---

## 📖 Documentation

- Main migration guide: `../AZURE-ALL-IN-ONE-FREE.md`
- Hybrid deployment: `../AZURE-FREE-TIER-DEPLOYMENT.md`
- VM deployment: `../VM-DEPLOYMENT-MIGRATION.md`

---

## 🆘 Support

For issues:
1. Check `docs/troubleshooting.md`
2. Review Docker logs: `docker compose logs`
3. Check Azure Portal for VM status
4. Monitor resource usage: `htop`

---

**Ready to deploy? Run:**

```bash
cd azure-deployment/scripts
./deploy-azure-vm.sh
```
