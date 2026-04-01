# BKS Production Deployment - Quick Start

Get BKS deployed to Azure VM in under 30 minutes.

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Docker installed locally
- SSH key at `~/.ssh/id_rsa.pub`

## 3-Step Deployment

### Step 1: Build and Push Images (10-15 minutes)

```bash
# Authenticate with ACR
az acr login --name carbonbimbc6740962ecd

# Build and push all services
./deploy-to-acr.sh
```

### Step 2: Create VM (5-8 minutes)

```bash
# Create VM with Docker and data disk
./deploy-vm-production.sh
```

**Note the VM IP from the output** - you'll need it for Step 3.

### Step 3: Deploy Services (5-10 minutes)

```bash
# Replace with your actual VM IP
./setup-vm-docker-compose.sh 20.205.XXX.XXX
```

## Post-Deployment Configuration

### 1. Update Environment Variables

```bash
# SSH to VM
ssh azureuser@YOUR_VM_IP

# Navigate to project
cd ~/suna-production

# Generate encryption keys
openssl rand -base64 32  # For ENCRYPTION_KEY
openssl rand -base64 32  # For MCP_CREDENTIAL_ENCRYPTION_KEY

# Edit backend environment
nano backend/.env
# Update: DATABASE_URL, SUPABASE_*, ENCRYPTION_KEY, MCP_CREDENTIAL_ENCRYPTION_KEY

# Edit frontend environment
nano suna/apps/frontend/.env.local
# Update: NEXT_PUBLIC_URL, NEXT_PUBLIC_SUPABASE_*, KORTIX_ADMIN_API_KEY

# Restart services
docker compose -f docker-compose.production.yml restart
```

### 2. Initialize GraphDB

```bash
# Create repository
curl -X POST http://localhost:7200/rest/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "id": "carbonbim-thailand",
    "title": "BKS Carbon BIM Thailand",
    "ruleset": "rdfsplus-optimized"
  }'
```

### 3. Verify Deployment

```bash
# Check services
docker compose -f docker-compose.production.yml ps

# Test endpoints (from VM)
curl http://localhost:8000/v1/health  # Backend
curl http://localhost:3000/api/health # Frontend
curl http://localhost:7200            # GraphDB
```

## Access Your Deployment

- **Frontend**: http://YOUR_VM_IP:3000
- **Backend API**: http://YOUR_VM_IP:8000
- **GraphDB**: http://YOUR_VM_IP:7200

## Next Steps

1. **Set up custom domain** - See DEPLOYMENT_GUIDE.md Step 7
2. **Configure SSL** - Use nginx + Let's Encrypt
3. **Set up backups** - See DEPLOYMENT_GUIDE.md Step 9
4. **Enable monitoring** - See DEPLOYMENT_GUIDE.md Step 8

## Common Commands

```bash
# View logs
docker compose -f docker-compose.production.yml logs -f

# Restart services
docker compose -f docker-compose.production.yml restart

# Update deployment
./deploy-to-acr.sh  # Build new images
ssh azureuser@YOUR_VM_IP
cd ~/suna-production
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

## Troubleshooting

**Services not starting?**
```bash
docker compose -f docker-compose.production.yml logs
```

**Need more help?**
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed documentation
- Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for security review
