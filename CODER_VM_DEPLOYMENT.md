# Deploy BKS to coder-vm with Cloudflare

Complete deployment guide for deploying BKS to your existing coder-vm with Cloudflare domain.

## Quick Overview

- **VM**: coder-vm (20.55.21.69) in DSC-TEAM resource group
- **Domain**: https://carbon-bim.ensimu.space
- **Services**: Frontend (Next.js), Backend (FastAPI), GraphDB, Redis
- **Reverse Proxy**: Caddy with automatic HTTPS

## Prerequisites

- All Docker images pushed to ACR ✅ (already done)
- SSH access to coder-vm
- Cloudflare account with domain configured

## Deployment Steps

### Step 1: Copy Files to coder-vm

**From your local machine**:

```bash
# Get VM IP (already known: 20.55.21.69)
VM_IP="20.55.21.69"

# Copy project files
rsync -avz --progress \
  -e "ssh" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  --exclude '.git' \
  ./suna/ azureuser@${VM_IP}:~/suna-production/suna/

# Copy deployment files
scp docker-compose.production.yml azureuser@${VM_IP}:~/suna-production/
scp deploy-package.sh azureuser@${VM_IP}:~/
scp setup-cloudflare-domain.sh azureuser@${VM_IP}:~/

# Make scripts executable
ssh azureuser@${VM_IP} "chmod +x ~/deploy-package.sh ~/setup-cloudflare-domain.sh"
```

### Step 2: Deploy Services on coder-vm

**SSH to coder-vm**:

```bash
ssh azureuser@20.55.21.69
```

**Run deployment script**:

```bash
cd ~
./deploy-package.sh
```

This will:
- Install Docker if needed
- Create data directories
- Pull images from ACR
- Start all 4 services
- Show service status

### Step 3: Configure Environment Variables

```bash
cd ~/suna-production

# Generate encryption keys
ENC_KEY=$(openssl rand -base64 32)
MCP_KEY=$(openssl rand -base64 32)

# Update backend environment
nano backend/.env
```

**Backend .env** (update these values):
```bash
# Production Backend Environment
ENV_MODE=production
WORKERS=4
TIMEOUT=75

# Redis (Docker network)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False

# GraphDB (Docker network)
GRAPHDB_URL=http://graphdb:7200
GRAPHDB_REPOSITORY=carbonbim-thailand

# Database - YOUR ACTUAL CREDENTIALS
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-key
SUPABASE_ANON_KEY=your-actual-key

# Encryption - PASTE GENERATED KEYS
ENCRYPTION_KEY=<paste $ENC_KEY>
MCP_CREDENTIAL_ENCRYPTION_KEY=<paste $MCP_KEY>

# External Services
DAYTONA_API_KEY=your-key-if-using
POSTHOG_PROJECT_API_KEY=your-key-if-using
```

**Update frontend environment**:

```bash
nano suna/apps/frontend/.env.local
```

**Frontend .env.local**:
```bash
# Production Frontend Environment
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space
NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-key
NEXT_PUBLIC_FORCE_LOCALHOST=false

# Admin API Key (generate secure random string)
KORTIX_ADMIN_API_KEY=$(openssl rand -base64 32)

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your-key-if-using
NEXT_PUBLIC_GTM_ID=your-id-if-using
```

**Restart services**:
```bash
docker compose -f docker-compose.production.yml restart
```

### Step 4: Initialize GraphDB Repository

```bash
# Create carbonbim-thailand repository
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
curl http://localhost:7200/rest/repositories | jq
```

### Step 5: Verify Services

```bash
# Check all services are healthy
docker compose -f ~/suna-production/docker-compose.production.yml ps

# Test each service
curl http://localhost:8000/v1/health    # Backend
curl http://localhost:3000/api/health   # Frontend
curl http://localhost:7200              # GraphDB

# View logs
docker compose -f ~/suna-production/docker-compose.production.yml logs -f
```

### Step 6: Configure Cloudflare Domain

**Still on coder-vm**:

```bash
./setup-cloudflare-domain.sh
```

This will:
- Install Caddy web server
- Configure reverse proxy for all services
- Set up automatic HTTPS
- Enable security headers

### Step 7: Configure Cloudflare DNS

**In your Cloudflare dashboard** (https://dash.cloudflare.com):

1. Go to your domain: **ensimu.space**
2. Click **DNS** > **Records**
3. Add these DNS records:

| Type | Name        | Content      | Proxy Status | TTL  |
|------|-------------|--------------|--------------|------|
| A    | carbon-bim  | 20.55.21.69  | Proxied ☁️   | Auto |
| A    | api.carbon-bim | 20.55.21.69 | Proxied ☁️ | Auto |
| A    | graphdb.carbon-bim | 20.55.21.69 | Proxied ☁️ | Auto |

**Important**: Make sure "Proxy status" is **Proxied** (orange cloud icon) for DDoS protection.

### Step 8: Configure Cloudflare SSL

**In Cloudflare dashboard**:

1. Go to **SSL/TLS** > **Overview**
2. Set encryption mode to: **Full (strict)**
3. Enable these options:
   - Always Use HTTPS: ✅ On
   - Automatic HTTPS Rewrites: ✅ On
   - Minimum TLS Version: **TLS 1.2**

### Step 9: Test Your Deployment

**Wait 1-2 minutes for DNS propagation**, then test:

```bash
# From your local machine
curl https://carbon-bim.ensimu.space
curl https://api.carbon-bim.ensimu.space/v1/health
curl https://graphdb.carbon-bim.ensimu.space
```

**Or visit in browser**:
- Frontend: https://carbon-bim.ensimu.space
- Backend API: https://api.carbon-bim.ensimu.space/docs (FastAPI docs)
- GraphDB: https://graphdb.carbon-bim.ensimu.space (Workbench)

## Troubleshooting

### SSH Connection Issues

```bash
# Check VM is running
az vm show --resource-group DSC-TEAM --name coder-vm --show-details

# Check NSG allows SSH
az network nsg rule list --resource-group DSC-TEAM --nsg-name coder-vm-nsg --query "[?destinationPortRange=='22']"

# Try SSH with verbose output
ssh -v azureuser@20.55.21.69
```

### Services Not Starting

```bash
# Check Docker is running
sudo systemctl status docker

# Check logs
docker compose -f ~/suna-production/docker-compose.production.yml logs

# Check disk space
df -h

# Restart services
docker compose -f ~/suna-production/docker-compose.production.yml restart
```

### Caddy Not Working

```bash
# Check Caddy status
sudo systemctl status caddy

# View Caddy logs
sudo journalctl -u caddy -f

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy
```

### SSL Certificate Issues

```bash
# Check Caddy logs for certificate errors
sudo tail -f /var/log/caddy/*.log

# Verify Cloudflare SSL mode is "Full (strict)"
# Verify DNS records are Proxied (orange cloud)
# Wait 5-10 minutes for Let's Encrypt to issue certificate
```

### DNS Not Resolving

```bash
# Check DNS propagation
dig carbon-bim.ensimu.space
nslookup carbon-bim.ensimu.space

# Flush local DNS cache
sudo systemd-resolve --flush-caches  # Linux
dscacheutil -flushcache              # macOS

# Wait 1-2 minutes for Cloudflare DNS propagation
```

## Management Commands

### Service Management

```bash
# SSH to VM
ssh azureuser@20.55.21.69
cd ~/suna-production

# View all services
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
docker compose -f docker-compose.production.yml logs -f backend

# Restart specific service
docker compose -f docker-compose.production.yml restart backend

# Restart all services
docker compose -f docker-compose.production.yml restart

# Stop services
docker compose -f docker-compose.production.yml stop

# Start services
docker compose -f docker-compose.production.yml start
```

### Update Deployment

```bash
# From local machine - rebuild and push images
./deploy-to-acr.sh

# SSH to coder-vm
ssh azureuser@20.55.21.69
cd ~/suna-production

# Pull new images
docker compose -f docker-compose.production.yml pull

# Restart services
docker compose -f docker-compose.production.yml up -d
```

### Backup GraphDB Data

```bash
# Create backup
sudo tar -czf /tmp/graphdb-backup-$(date +%Y%m%d).tar.gz /mnt/data/graphdb

# Download backup to local machine
scp azureuser@20.55.21.69:/tmp/graphdb-backup-*.tar.gz ./backups/
```

## Performance Optimization

### Monitor Resource Usage

```bash
# CPU and memory
docker stats

# Disk usage
docker system df
df -h

# Service-specific resources
docker compose -f docker-compose.production.yml top
```

### Optimize Backend Workers

Edit `backend/.env`:
```bash
# For Standard_D2s_v3 (2 vCPUs)
WORKERS=4  # 2 per CPU
TIMEOUT=75
```

### Optimize GraphDB Memory

Edit `docker-compose.production.yml`:
```yaml
graphdb:
  environment:
    # For Standard_D2s_v3 (16GB RAM)
    GDB_JAVA_OPTS: "-Xmx2g -Xms2g"
```

## Security Checklist

- [x] All environment variables configured with real credentials
- [x] Encryption keys generated and stored securely
- [x] Cloudflare proxy enabled (DDoS protection)
- [x] SSL/TLS configured (HTTPS only)
- [x] Security headers enabled in Caddy
- [ ] GraphDB workbench protected with basic auth (optional)
- [ ] VM firewall configured (only necessary ports open)
- [ ] Automated backups configured
- [ ] Monitoring and alerts set up

## Cost Optimization

Current VM: Standard_D2s_v3 (2 vCPUs, 8GB RAM) - ~$70/month

**To reduce costs**:
- Stop VM when not in use: `az vm deallocate --resource-group DSC-TEAM --name coder-vm`
- Use Azure Reserved Instances (up to 72% savings)
- Monitor resource usage and downsize if needed

**To increase performance**:
- Resize to Standard_D4s_v3 (4 vCPUs, 16GB RAM) - ~$140/month

## Next Steps

1. ✅ Set up automated backups (daily GraphDB snapshots)
2. ✅ Configure monitoring (Azure Monitor or Prometheus)
3. ✅ Set up alerting (service downtime, high CPU/memory)
4. ✅ Document your specific configuration
5. ✅ Test disaster recovery procedures

## Support

For issues:
1. Check service logs: `docker compose logs -f`
2. Check Caddy logs: `sudo journalctl -u caddy -f`
3. Review Cloudflare settings
4. Consult [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
