# Azure Container Registry Deployment Guide

Complete guide for deploying BKS cBIM AI platform to Azure using Container Registry.

## 📋 Overview

This deployment uses Azure Container Registry (ACR) to host Docker images and provides three deployment options:

1. **Azure Container Instances (ACI)** - Simplest, serverless containers
2. **Azure App Service** - Fully managed PaaS with auto-scaling
3. **Azure Kubernetes Service (AKS)** - Full Kubernetes orchestration (advanced)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Azure Container Registry (ACR)          │
│  sunabimacr.azurecr.io                          │
│  ├── suna-backend:latest                        │
│  └── suna-frontend:latest                       │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼──────┐      ┌────────▼─────────┐
│ Backend      │      │ Frontend         │
│ FastAPI      │◄─────┤ Next.js          │
│ Port: 8000   │      │ Port: 3000       │
│ - API Routes │      │ - SSR/SSG        │
│ - Auth       │      │ - API Client     │
│ - BIM Logic  │      │ - UI Components  │
└──────────────┘      └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Azure CLI** installed and configured
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   az login
   ```

2. **Docker** installed
   ```bash
   docker --version
   ```

3. **Azure Subscription** active

### Step 1: Build and Push to ACR

Run the main setup script:

```bash
./azure-acr-setup.sh
```

This script will:
- ✅ Create Azure Resource Group
- ✅ Create Azure Container Registry
- ✅ Build backend Docker image (multi-stage, optimized)
- ✅ Build frontend Docker image (standalone Next.js)
- ✅ Push both images to ACR
- ✅ Save deployment configuration

**Output:** `azure-acr-deployment.env` with all credentials and URLs

### Step 2: Choose Deployment Target

#### Option A: Azure Container Instances (Recommended for Testing)

**Pros:** Fastest setup, pay-per-second billing, no infrastructure management

```bash
./azure-deploy-aci.sh
```

**Access:**
- Frontend: `http://suna-frontend-*.southeastasia.azurecontainer.io:3000`
- Backend API: `http://suna-backend-*.southeastasia.azurecontainer.io:8000/docs`

**Cost:** ~$0.10/hour for 2 CPU + 4GB per container

#### Option B: Azure App Service (Recommended for Production)

**Pros:** Auto-scaling, custom domains, HTTPS, continuous deployment

```bash
./azure-deploy-app-service.sh
```

**Access:**
- Frontend: `https://suna-frontend-app.azurewebsites.net`
- Backend API: `https://suna-backend-app.azurewebsites.net/docs`

**Cost:** ~$55/month for B2 plan (2 apps)

**Features:**
- ✅ Automatic HTTPS with managed certificates
- ✅ Custom domain support
- ✅ Auto-restart on image update
- ✅ Built-in monitoring and logs
- ✅ Deployment slots (staging/production)

## 📦 Docker Images

### Backend Image

**File:** `suna-init/backend/Dockerfile.production`

**Multi-stage build:**
1. **Base stage:** Install UV package manager
2. **Dependencies stage:** Install Python packages with UV (3-5x faster than pip)
3. **Runtime stage:** Minimal image with only runtime dependencies

**Optimizations:**
- ✅ UV for fast dependency installation
- ✅ Non-root user for security
- ✅ Health check endpoint
- ✅ Gunicorn with Uvicorn workers (production-ready)
- ✅ 4 workers for optimal performance

**Size:** ~400MB (from ~800MB base)

### Frontend Image

**File:** `suna-init/apps/frontend/Dockerfile.production`

**Multi-stage build:**
1. **Deps stage:** Install dependencies with pnpm
2. **Builder stage:** Build Next.js with standalone output
3. **Runner stage:** Minimal runtime with only built files

**Optimizations:**
- ✅ Standalone output (70% smaller)
- ✅ Static asset optimization
- ✅ Non-root user
- ✅ Health check
- ✅ Alpine Linux base (minimal)

**Size:** ~180MB (from ~600MB base)

## 🔄 CI/CD with GitHub Actions

**File:** `.github/workflows/azure-acr-deploy.yml`

**Triggers:**
- Push to `main` or `production` branches
- Changes in `suna-init/backend/**` or `suna-init/apps/frontend/**`
- Manual workflow dispatch

**Required Secrets:**

Add these to your GitHub repository (Settings → Secrets):

```bash
AZURE_CREDENTIALS     # Azure service principal JSON
ACR_USERNAME          # ACR admin username
ACR_PASSWORD          # ACR admin password
```

**Get Azure credentials:**
```bash
az ad sp create-for-rbac \
  --name "github-actions-suna" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/suna-bim-rg \
  --sdk-auth
```

**Workflow steps:**
1. Checkout code
2. Login to Azure
3. Login to ACR
4. Build backend image with commit SHA tag
5. Build frontend image with commit SHA tag
6. Push images to ACR
7. Restart App Service apps (auto-pull new images)

## 🧪 Local Testing with ACR Images

Test production images locally before deploying:

```bash
# Load ACR credentials
source azure-acr-deployment.env

# Login to ACR
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

# Run with docker-compose
docker-compose -f docker-compose.acr-test.yml up
```

**Services:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs
- PostgreSQL database
- Redis cache

## 🔧 Configuration

### Environment Variables

**Backend** (set in Azure Portal or via CLI):
```bash
PORT=8000
ENVIRONMENT=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=<random-secret>
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

**Frontend:**
```bash
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://backend-url
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Update Environment Variables

**App Service:**
```bash
az webapp config appsettings set \
  --resource-group suna-bim-rg \
  --name suna-backend-app \
  --settings \
    DATABASE_URL="postgresql://..." \
    SECRET_KEY="new-secret"
```

**Container Instances:**
```bash
# Must delete and recreate with new env vars
az container delete --name suna-backend-aci --resource-group suna-bim-rg -y
./azure-deploy-aci.sh  # Re-run with updated .env
```

## 📊 Monitoring & Logs

### View Logs (App Service)

```bash
# Stream backend logs
az webapp log tail \
  --name suna-backend-app \
  --resource-group suna-bim-rg

# Stream frontend logs
az webapp log tail \
  --name suna-frontend-app \
  --resource-group suna-bim-rg
```

### View Logs (ACI)

```bash
# Backend logs
az container logs \
  --resource-group suna-bim-rg \
  --name suna-backend-aci

# Frontend logs
az container logs \
  --resource-group suna-bim-rg \
  --name suna-frontend-aci
```

### Health Checks

**Backend:**
- Health: `GET /health`
- API Docs: `GET /docs`
- OpenAPI: `GET /openapi.json`

**Frontend:**
- Health: `GET /api/health`
- Homepage: `GET /`

## 🔒 Security Best Practices

1. ✅ **Non-root containers** - Both images run as non-root users
2. ✅ **Minimal base images** - Alpine Linux for frontend, slim for backend
3. ✅ **Multi-stage builds** - No build tools in production images
4. ✅ **Health checks** - Container auto-restart on failure
5. ✅ **Secrets in Azure Key Vault** - Never commit credentials
6. ✅ **HTTPS enforced** - App Service provides free SSL
7. ✅ **Admin user disabled** - Use managed identities where possible

### Disable ACR Admin User (Production)

```bash
az acr update \
  --name sunabimacr \
  --resource-group suna-bim-rg \
  --admin-enabled false

# Use managed identity instead
az webapp identity assign \
  --name suna-backend-app \
  --resource-group suna-bim-rg
```

## 💰 Cost Optimization

### Development Setup
- **ACI**: 2 containers × $0.10/hour = $144/month (24/7)
- **Alternative**: Scale down to B1 App Service = $13/month

### Production Setup
- **App Service B2**: $55/month (both apps)
- **ACR Basic**: $5/month
- **Database**: Azure Database for PostgreSQL Flexible Server (~$15/month)
- **Total**: ~$75/month

### Save Costs
```bash
# Stop ACI containers when not in use
az container stop --name suna-backend-aci --resource-group suna-bim-rg
az container stop --name suna-frontend-aci --resource-group suna-bim-rg

# Scale down App Service
az appservice plan update \
  --name suna-plan \
  --resource-group suna-bim-rg \
  --sku B1  # $13/month
```

## 🔄 Update Deployment

### Push New Version

```bash
# Option 1: Via GitHub Actions (automatic)
git push origin main

# Option 2: Manual rebuild
./azure-acr-setup.sh

# App Service auto-pulls on restart
az webapp restart --name suna-backend-app --resource-group suna-bim-rg
az webapp restart --name suna-frontend-app --resource-group suna-bim-rg
```

### Rollback to Previous Version

```bash
# List image tags
az acr repository show-tags \
  --name sunabimacr \
  --repository suna-backend

# Deploy specific version
az webapp config container set \
  --name suna-backend-app \
  --resource-group suna-bim-rg \
  --docker-custom-image-name sunabimacr.azurecr.io/suna-backend:20260329-123456
```

## 🧹 Cleanup

```bash
# Delete everything
az group delete --name suna-bim-rg --yes --no-wait

# Or delete individually
az container delete --name suna-backend-aci --resource-group suna-bim-rg -y
az container delete --name suna-frontend-aci --resource-group suna-bim-rg -y
az webapp delete --name suna-backend-app --resource-group suna-bim-rg
az webapp delete --name suna-frontend-app --resource-group suna-bim-rg
az acr delete --name sunabimacr --resource-group suna-bim-rg -y
```

## 📚 Additional Resources

- [Azure Container Registry Docs](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure App Service Containers](https://docs.microsoft.com/en-us/azure/app-service/configure-custom-container)
- [Azure Container Instances](https://docs.microsoft.com/en-us/azure/container-instances/)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 🆘 Troubleshooting

### Frontend Build OOM

If frontend build fails with out-of-memory:
```dockerfile
# In Dockerfile.production, increase Node memory
RUN NODE_OPTIONS="--max-old-space-size=8192" pnpm run build
```

### Backend Slow Startup

Check Gunicorn workers:
```bash
# Reduce workers if memory constrained
CMD ["gunicorn", "api:app", "--workers", "2", ...]
```

### Health Check Failures

```bash
# Check container logs
az container logs --name suna-backend-aci --resource-group suna-bim-rg

# Exec into running container
az container exec \
  --resource-group suna-bim-rg \
  --name suna-backend-aci \
  --exec-command "/bin/sh"
```

### Image Pull Errors

```bash
# Verify ACR credentials
az acr credential show --name sunabimacr

# Test login
docker login sunabimacr.azurecr.io

# Check image exists
az acr repository list --name sunabimacr
```

---

**Status:** ✅ Complete deployment infrastructure ready
**Last Updated:** 2026-03-29
**Version:** 1.0.0
