# 🎉 BKS Deployment Successful!

## ✅ What's Been Deployed

All services are now running on coder-vm (20.55.21.69):

- ✅ **Redis 8**: Running and healthy (port 6379)
- ✅ **GraphDB 10.7.0**: Running and healthy (port 7200)
- ✅ **Backend (FastAPI)**: Running (port 8000)
- ✅ **Frontend (Next.js)**: Running (port 3000)

## 🌐 Current Access

Your services are accessible at:

- **Frontend**: http://20.55.21.69:3000
- **Backend API**: http://20.55.21.69:8000
- **GraphDB Workbench**: http://20.55.21.69:7200

## 📋 Next Steps (In Order)

### Step 1: Update Environment Variables (5 minutes)

**Edit the credentials in `update-env-via-cli.sh`**:

```bash
nano update-env-via-cli.sh

# Edit these values:
DATABASE_URL="postgresql://..."      # Your Supabase PostgreSQL URL
SUPABASE_URL="https://..."           # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY="..."     # From Supabase settings
SUPABASE_ANON_KEY="..."              # From Supabase settings
ENCRYPTION_KEY="..."                 # Generate: openssl rand -base64 32
MCP_CREDENTIAL_ENCRYPTION_KEY="..."  # Generate: openssl rand -base64 32
KORTIX_ADMIN_API_KEY="..."          # Generate: openssl rand -base64 32

# Save and run:
./update-env-via-cli.sh
```

This will update both backend and frontend environment variables and restart services.

### Step 2: Initialize GraphDB (30 seconds)

```bash
./initialize-graphdb-via-cli.sh
```

This creates the `carbonbim-thailand` repository in GraphDB for storing TGO emission factors and EDGE/TREES certification data.

### Step 3: Setup HTTPS with Caddy (2 minutes)

```bash
./setup-https-via-cli.sh
```

This installs Caddy web server and configures reverse proxy with automatic HTTPS.

### Step 4: Configure Cloudflare DNS (2 minutes)

**In Cloudflare Dashboard** (https://dash.cloudflare.com):

1. Select domain: **ensimu.space**
2. Go to **DNS** > **Records**
3. Add these A records:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | carbon-bim | 20.55.21.69 | ☁️ Proxied |
| A | api.carbon-bim | 20.55.21.69 | ☁️ Proxied |
| A | graphdb.carbon-bim | 20.55.21.69 | ☁️ Proxied |

4. Go to **SSL/TLS** > **Overview**
5. Set encryption mode to: **Full (strict)**
6. Enable **Always Use HTTPS**

### Step 5: Test Your Production Site (2 minutes)

Wait 2-5 minutes for DNS propagation, then visit:

- **Frontend**: https://carbon-bim.ensimu.space
- **Backend API**: https://api.carbon-bim.ensimu.space/docs
- **GraphDB**: https://graphdb.carbon-bim.ensimu.space

## 🛠️ Helpful Commands

### Check Service Status
```bash
./check-services-via-cli.sh
```

### View Logs
```bash
az vm run-command invoke \
  --resource-group DSC-TEAM \
  --name coder-vm \
  --command-id RunShellScript \
  --scripts "cd /root/suna-production && docker compose logs -f backend"
```

### Restart Services
```bash
az vm run-command invoke \
  --resource-group DSC-TEAM \
  --name coder-vm \
  --command-id RunShellScript \
  --scripts "cd /root/suna-production && docker compose restart"
```

### Force Update (if showing old version)
```bash
az vm run-command invoke \
  --resource-group DSC-TEAM \
  --name coder-vm \
  --command-id RunShellScript \
  --scripts "cd /root/suna-production && docker compose pull && docker compose up -d --force-recreate"
```

## 🔧 Deployment Details

### Services Configuration

**Backend**:
- Workers: 4 (2 per vCPU)
- Timeout: 75 seconds
- Health check: /v1/health

**Frontend**:
- Node.js production mode
- Telemetry disabled
- Standalone output

**GraphDB**:
- JVM Heap: 4GB
- Ruleset: rdfsplus-optimized
- Repository: carbonbim-thailand

**Redis**:
- Max memory: 4GB
- Eviction policy: allkeys-lru
- Persistence: AOF enabled

### Data Persistence

All data is stored in `/mnt/data`:
- `/mnt/data/redis` - Redis persistence
- `/mnt/data/graphdb/home` - GraphDB data
- `/mnt/data/graphdb/work` - GraphDB work files
- `/mnt/data/logs` - Application logs

### Docker Images

All images from Azure Container Registry:
- `carbonbimbc6740962ecd.azurecr.io/backend:latest`
- `carbonbimbc6740962ecd.azurecr.io/frontend:latest`
- `redis:8-alpine`
- `ontotext/graphdb:10.7.0`

## 📊 Monitoring

### Check if Services are Healthy
```bash
curl http://20.55.21.69:8000/v1/health
curl http://20.55.21.69:3000/api/health
curl http://20.55.21.69:7200/rest/monitor/infrastructure
```

### View Container Status
```bash
az vm run-command invoke \
  --resource-group DSC-TEAM \
  --name coder-vm \
  --command-id RunShellScript \
  --scripts "docker ps"
```

## 🆘 Troubleshooting

### Services Not Responding

1. Check status: `./check-services-via-cli.sh`
2. View logs: `docker compose logs -f`
3. Restart: `docker compose restart`

### Database Connection Errors

- Verify `DATABASE_URL` is correct in backend .env
- Check Supabase firewall allows Azure IP ranges
- Ensure SSL mode is set: `?sslmode=require`

### Frontend Shows Old Version

1. Clear Cloudflare cache (Dashboard > Caching > Purge Everything)
2. Hard reload browser (Ctrl+Shift+R)
3. Force update containers: `docker compose pull && docker compose up -d --force-recreate`

### HTTPS Not Working

- Verify Cloudflare DNS records are **Proxied** (orange cloud)
- Check SSL/TLS mode is **Full (strict)**
- Wait 5-10 minutes for Let's Encrypt certificate
- Check Caddy logs: `journalctl -u caddy -f`

## 📚 Additional Resources

- **Complete Deployment Guide**: CODER_VM_DEPLOYMENT.md
- **Cache Clearing Guide**: CLEAR_CACHES.md
- **Production Checklist**: PRODUCTION_CHECKLIST.md

## 🎯 Summary

You now have a fully functional BKS deployment! Complete the 5 steps above to:
1. ✅ Update environment variables
2. ✅ Initialize GraphDB
3. ✅ Setup HTTPS
4. ✅ Configure Cloudflare DNS
5. ✅ Test your production site

After completing these steps, your production site will be live at:
**https://carbon-bim.ensimu.space**

Need help? Check the troubleshooting section or review the detailed guides.
