# BKS Production Deployment - Quick Start

## ⚡ TL;DR - Deploy in 5 Commands

```bash
# 1. Set up secrets management
./azure-keyvault-setup.sh

# 2. Build and push all Docker images to ACR
./deploy-to-acr.sh

# 3. Edit configuration file
nano azure-container-group-production.yaml
# Replace all YOUR_* placeholders with actual values

# 4. Deploy to Azure
./azure-deploy-production.sh

# 5. Verify deployment
az container show --resource-group carbon-bim-rg --name suna-production
```

---

## 📋 Pre-Deployment Checklist (2 minutes)

Before running any commands:

- [ ] Azure CLI authenticated: `az account show`
- [ ] Docker running: `docker ps`
- [ ] ACR accessible: `az acr login --name carbonbimbc6740962ecd`
- [ ] Production Supabase credentials ready
- [ ] Strong Redis password generated (32+ chars)
- [ ] Admin API key generated (32+ chars)

---

## 🔑 Critical Configuration Values

**You MUST replace these in `azure-container-group-production.yaml`:**

### Line 9: Managed Identity
```yaml
/subscriptions/YOUR_SUBSCRIPTION/resourceGroups/carbon-bim-rg/...
```
Get from: `./azure-keyvault-setup.sh` output

### Lines 32 + 45: Redis Password
```yaml
secureValue: SAME_STRONG_PASSWORD_IN_BOTH_PLACES
```
Generate: `openssl rand -base64 32`

### Lines 75-84: Database & Supabase
```yaml
- name: DATABASE_URL
  secureValue: postgresql://user:pass@host:5432/db?sslmode=require
- name: SUPABASE_URL
  secureValue: https://YOUR_PROJECT.supabase.co
- name: SUPABASE_SERVICE_ROLE_KEY
  secureValue: eyJhbG...
```

### Lines 87-90: Encryption Keys
```yaml
- name: ENCRYPTION_KEY
  secureValue: GENERATED_32_BYTE_KEY_1
- name: MCP_CREDENTIAL_ENCRYPTION_KEY
  secureValue: GENERATED_32_BYTE_KEY_2
```
Generate: `openssl rand -base64 32` (run twice for 2 different keys)

### Lines 144-147: Frontend URLs
```yaml
- name: NEXT_PUBLIC_BACKEND_URL
  value: https://YOUR_DOMAIN/api/v1
- name: NEXT_PUBLIC_URL
  value: https://YOUR_DOMAIN
```

---

## 🚀 Deployment Stages

### Stage 1: Local Build (15 minutes)
```bash
# Test build locally first
cd suna
docker build -f apps/frontend/Dockerfile -t test-frontend .
docker build -f backend/Dockerfile -t test-backend backend/
```

### Stage 2: Push to ACR (10 minutes)
```bash
./deploy-to-acr.sh
```
**Verify**: `az acr repository list --name carbonbimbc6740962ecd -o table`

### Stage 3: Configure (5 minutes)
```bash
# Edit with your values
nano azure-container-group-production.yaml

# Validate (no YOUR_ should remain)
grep -n "YOUR_" azure-container-group-production.yaml
```

### Stage 4: Deploy (5 minutes)
```bash
./azure-deploy-production.sh
```

### Stage 5: Verify (2 minutes)
```bash
# Get access URL
FQDN=$(az container show \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --query ipAddress.fqdn -o tsv)

# Test endpoints
curl http://${FQDN}:8000/health  # Backend
curl http://${FQDN}:3000         # Frontend

# Check logs
az container logs \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name backend \
  --tail 50
```

---

## 🆘 Common Issues & Fixes

### "Image not found in ACR"
```bash
# Run the build script first
./deploy-to-acr.sh
```

### "Container stuck in Waiting state"
```bash
# Check logs for errors
az container logs \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name backend

# Common causes:
# - Wrong environment variables
# - Database connection failed
# - Redis password mismatch
```

### "Cannot pull image from ACR"
```bash
# Verify ACR credentials
az acr credential show --name carbonbimbc6740962ecd

# Test manual pull
docker pull carbonbimbc6740962ecd.azurecr.io/frontend:latest
```

### "Database connection timeout"
```bash
# Check connection string format
# Must include: ?sslmode=require
# Example: postgresql://user:pass@host.supabase.co:5432/postgres?sslmode=require

# Test from local machine
psql "postgresql://user:pass@host.supabase.co:5432/postgres?sslmode=require"
```

---

## 📊 Post-Deployment Monitoring

### Health Checks (run every 5 minutes)
```bash
# Container status
az container show \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --query "{State:instanceView.state,Restarts:instanceView.currentState.startTime}" \
  -o table

# Resource usage
az monitor metrics list \
  --resource-group carbon-bim-rg \
  --resource suna-production \
  --resource-type Microsoft.ContainerInstance/containerGroups \
  --metric CPUUsage,MemoryUsage \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)
```

### Log Monitoring
```bash
# Live log streaming
az container attach \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name backend

# Search for errors
az container logs \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name backend \
  | grep -i "error\|exception\|failed"
```

---

## 🔄 Update & Rollback

### Deploy New Version
```bash
# 1. Build new images
./deploy-to-acr.sh

# 2. Images are tagged with timestamp automatically
# Update YAML to use specific timestamp if needed:
# image: carbonbimbc6740962ecd.azurecr.io/frontend:20240324-142800

# 3. Redeploy
./azure-deploy-production.sh
```

### Rollback
```bash
# 1. Find previous version
az acr repository show-tags \
  --name carbonbimbc6740962ecd \
  --repository frontend \
  --orderby time_desc \
  | head -5

# 2. Update YAML with previous timestamp
# 3. Redeploy
./azure-deploy-production.sh
```

---

## 💡 Pro Tips

1. **Always tag images with timestamps** - Already done by `deploy-to-acr.sh`
2. **Keep backups** - `azure-deploy-production.sh` auto-backs up before deploying
3. **Test locally first** - Build images locally before pushing to ACR
4. **Use Key Vault in production** - Run `azure-keyvault-setup.sh` for secure secrets
5. **Monitor resource usage** - Set up alerts for CPU/memory > 80%
6. **Enable Application Insights** - Add instrumentation key to containers
7. **Use custom domain** - Configure Azure Application Gateway for SSL/HTTPS

---

## 📞 Need Help?

1. **Check logs first**: `az container logs`
2. **Review checklist**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
3. **Full guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Azure docs**: https://docs.microsoft.com/azure/container-instances

---

**Total deployment time**: ~40 minutes (first time)
**Update deployment time**: ~10 minutes (subsequent deploys)
