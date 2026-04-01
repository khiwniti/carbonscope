# Deploy BKS to Existing coder-vm

Quick guide for deploying BKS to your existing `coder-vm` in Azure.

## Prerequisites

- Azure CLI authenticated (`az login`)
- Docker images built and pushed to ACR
- SSH key for coder-vm access (e.g., `VM Key.pem`)

## Step 1: Push Images to ACR

```bash
# Re-authenticate with ACR (if needed)
az acr login --name carbonbimbc6740962ecd

# Build and push all images
./deploy-to-acr.sh
```

**Expected time**: 10-15 minutes

## Step 2: Deploy to coder-vm

### Option A: Using Default SSH Key

```bash
# Uses ~/.ssh/id_rsa by default
./setup-coder-vm.sh
```

### Option B: Using Custom SSH Key (e.g., VM Key.pem)

```bash
# Specify your SSH key file
./setup-coder-vm.sh /path/to/VM_Key.pem
```

**Or set as environment variable**:
```bash
export SSH_KEY="/path/to/VM_Key.pem"
./setup-coder-vm.sh
```

**Expected time**: 5-10 minutes

## What the Script Does

1. ✅ Gets coder-vm IP address automatically from Azure
2. ✅ Checks if VM is running (starts it if needed)
3. ✅ Tests SSH connection
4. ✅ Installs Docker if not present
5. ✅ Creates data directories (/mnt/data)
6. ✅ Copies project files via rsync
7. ✅ Creates environment templates
8. ✅ Pulls images from ACR
9. ✅ Starts all 4 services (Frontend, Backend, Redis, GraphDB)

## Post-Deployment Configuration

### 1. Update Environment Variables

```bash
# Get VM IP (shown at end of setup script output)
# Or get it manually:
az vm show --resource-group DSC-TEAM --name coder-vm --show-details --query publicIps -o tsv

# SSH to coder-vm
ssh -i /path/to/VM_Key.pem azureuser@YOUR_VM_IP

# Navigate to project
cd ~/suna-production

# Generate encryption keys
openssl rand -base64 32  # Copy for ENCRYPTION_KEY
openssl rand -base64 32  # Copy for MCP_CREDENTIAL_ENCRYPTION_KEY

# Edit backend environment
nano backend/.env
# Update:
# - DATABASE_URL (Supabase connection string)
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ANON_KEY
# - ENCRYPTION_KEY (paste generated key)
# - MCP_CREDENTIAL_ENCRYPTION_KEY (paste generated key)
# - DAYTONA_API_KEY (if using)
# - POSTHOG_PROJECT_API_KEY (if using)

# Edit frontend environment
nano suna/apps/frontend/.env.local
# Update:
# - NEXT_PUBLIC_URL (your domain)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - KORTIX_ADMIN_API_KEY (generate secure key)

# Restart services to apply changes
docker compose -f docker-compose.production.yml restart
```

### 2. Initialize GraphDB Repository

```bash
# Still on coder-vm
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

# Verify
curl http://localhost:7200/rest/repositories
```

### 3. Verify Deployment

```bash
# Check all services are running
docker compose -f ~/suna-production/docker-compose.production.yml ps

# Test each service
curl http://localhost:8000/v1/health  # Backend
curl http://localhost:3000/api/health # Frontend
curl http://localhost:7200            # GraphDB

# Check logs
docker compose -f ~/suna-production/docker-compose.production.yml logs -f
```

## Access Your Deployment

Get your VM IP:
```bash
az vm show --resource-group DSC-TEAM --name coder-vm --show-details --query publicIps -o tsv
```

Then access:
- **Frontend**: http://YOUR_VM_IP:3000
- **Backend API**: http://YOUR_VM_IP:8000
- **GraphDB Workbench**: http://YOUR_VM_IP:7200

## Updating Deployment

When you make code changes:

```bash
# 1. Rebuild and push images
./deploy-to-acr.sh

# 2. SSH to coder-vm
ssh -i /path/to/VM_Key.pem azureuser@YOUR_VM_IP

# 3. Pull new images and restart
cd ~/suna-production
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### SSH Key Issues

If you get "Permission denied (publickey)":

```bash
# Check key permissions
chmod 600 /path/to/VM_Key.pem

# Test SSH manually
ssh -i /path/to/VM_Key.pem -v azureuser@YOUR_VM_IP

# Check if key matches VM
az vm show --resource-group DSC-TEAM --name coder-vm --query "osProfile.linuxConfiguration.ssh.publicKeys"
```

### Docker Not Found

If Docker is not installed, the script will install it automatically. After installation:

```bash
# Log out and back in for Docker permissions
exit
ssh -i /path/to/VM_Key.pem azureuser@YOUR_VM_IP

# Verify Docker works
docker ps
```

### Services Not Starting

```bash
# Check logs
docker compose -f ~/suna-production/docker-compose.production.yml logs

# Check disk space
df -h

# Check if ports are available
sudo netstat -tlnp | grep -E "3000|8000|7200|6379"
```

### ACR Authentication Issues

```bash
# On your local machine
az acr login --name carbonbimbc6740962ecd

# On coder-vm (if pulling images fails)
ssh -i /path/to/VM_Key.pem azureuser@YOUR_VM_IP
az login
az acr login --name carbonbimbc6740962ecd
```

## Common Commands

```bash
# SSH to coder-vm
ssh -i /path/to/VM_Key.pem azureuser@YOUR_VM_IP

# View service status
docker compose -f ~/suna-production/docker-compose.production.yml ps

# View logs
docker compose -f ~/suna-production/docker-compose.production.yml logs -f

# Restart specific service
docker compose -f ~/suna-production/docker-compose.production.yml restart backend

# Stop all services
docker compose -f ~/suna-production/docker-compose.production.yml stop

# Start all services
docker compose -f ~/suna-production/docker-compose.production.yml start

# Remove all services (keeps data)
docker compose -f ~/suna-production/docker-compose.production.yml down
```

## Next Steps

1. **Configure custom domain** - Point your domain to coder-vm IP
2. **Set up SSL** - Use nginx + Let's Encrypt (see DEPLOYMENT_GUIDE.md)
3. **Set up backups** - Automate GraphDB and Redis backups
4. **Enable monitoring** - Set up Prometheus/Grafana or Azure Monitor

## Need Help?

- Full deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Production checklist: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- Quick start: [QUICK_START.md](./QUICK_START.md)
