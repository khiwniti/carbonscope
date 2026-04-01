# Azure Deployment Complete ✅

## Deployment Summary

**Date**: March 30, 2026
**Platform**: Azure App Service (PaaS)
**Status**: Successfully Deployed

## Deployed Services

### Frontend (Next.js)
- **URL**: https://suna-frontend-app.azurewebsites.net
- **Image**: sunabimacr.azurecr.io/suna-frontend:latest
- **Size**: 427 MB (includes pre-built .next and node_modules)
- **Port**: 3000
- **Runtime**: Node.js 20 with pnpm

### Backend (Python FastAPI)
- **URL**: https://suna-backend-app.azurewebsites.net
- **API Docs**: https://suna-backend-app.azurewebsites.net/docs
- **Health Check**: https://suna-backend-app.azurewebsites.net/health
- **Image**: sunabimacr.azurecr.io/suna-backend:latest
- **Size**: 3.12 GB
- **Port**: 8000
- **Runtime**: Python with Gunicorn + Uvicorn workers

## Infrastructure

### Azure Resources
- **Resource Group**: suna-bim-rg
- **Region**: Southeast Asia
- **Container Registry**: sunabimacr.azurecr.io
- **App Service Plan**: suna-app-service-plan (B2 SKU)

### Features Enabled
- ✅ Continuous Deployment (auto-update on image push)
- ✅ HTTPS enabled (Azure-provided SSL)
- ✅ Container health monitoring
- ✅ Auto-scaling capable
- ✅ Zero-downtime deployments

## Build Approach

### Challenge
The monorepo structure with pnpm workspaces created Docker build conflicts:
- Workspace dependency `@agentpress/shared@workspace:*` couldn't resolve in Docker
- Multiple attempts to build from scratch in Docker failed
- Symlink preservation issues between Docker stages

### Solution
**Runtime-Only Docker Build**:
1. Build Next.js app locally (where pnpm workspaces work natively)
2. Copy entire pre-built application including node_modules to Docker
3. Skip dependency installation in Docker - just run the production server
4. Result: 13-second Docker build vs. 4+ minute build attempts

### Key Files
- `suna-init/apps/frontend/Dockerfile.runtime` - Runtime-only frontend image
- `suna-init/backend/Dockerfile.production` - Python backend with UV package manager
- `azure-deploy-app-service.sh` - App Service deployment script
- `azure-acr-deployment.env` - Deployment configuration

## Docker Images in ACR

```bash
# List images
az acr repository list --name sunabimacr

# View tags
az acr repository show-tags --name sunabimacr --repository suna-backend
az acr repository show-tags --name sunabimacr --repository suna-frontend
```

## Deployment Workflow

### Initial Deployment
```bash
# 1. Build images locally
cd suna-init/apps/frontend && pnpm run build
cd ../.. && docker build -f apps/frontend/Dockerfile.runtime -t sunabimacr.azurecr.io/suna-frontend:latest apps/frontend

# 2. Push to ACR
docker push sunabimacr.azurecr.io/suna-frontend:latest
docker push sunabimacr.azurecr.io/suna-backend:latest

# 3. Deploy to App Service
./azure-deploy-app-service.sh
```

### Continuous Deployment
With continuous deployment enabled, simply push new images to ACR:
```bash
docker build -t sunabimacr.azurecr.io/suna-frontend:latest .
docker push sunabimacr.azurecr.io/suna-frontend:latest
# App Service will automatically pull and deploy the new image
```

## Custom Domain Configuration

### Next Steps for carbonscope.ensimu.space

1. **Add Custom Domain to App Service**:
   ```bash
   az webapp config hostname add \
     --webapp-name suna-frontend-app \
     --resource-group suna-bim-rg \
     --hostname carbonscope.ensimu.space
   ```

2. **Configure DNS in Cloudflare**:
   - Add CNAME record: `carbonscope` → `suna-frontend-app.azurewebsites.net`
   - Or A record pointing to App Service IP

3. **Enable SSL**:
   - Azure provides free managed certificates for custom domains
   - Or upload existing SSL certificate if available

4. **Verify Domain**:
   - Add TXT record for domain verification
   - Azure will auto-provision SSL certificate after verification

## Monitoring & Management

### View Logs
```bash
# Backend logs
az webapp log tail --name suna-backend-app --resource-group suna-bim-rg

# Frontend logs
az webapp log tail --name suna-frontend-app --resource-group suna-bim-rg
```

### Restart Services
```bash
az webapp restart --name suna-backend-app --resource-group suna-bim-rg
az webapp restart --name suna-frontend-app --resource-group suna-bim-rg
```

### Scale Services
```bash
# Scale up App Service Plan
az appservice plan update \
  --name suna-app-service-plan \
  --resource-group suna-bim-rg \
  --sku P1V2  # Premium tier for production

# Scale out (increase instances)
az appservice plan update \
  --name suna-app-service-plan \
  --resource-group suna-bim-rg \
  --number-of-workers 3
```

## Cost Estimate

### Current Configuration (B2 SKU)
- **App Service Plan**: ~$55/month
- **Container Registry**: Storage-based (~$5/month for 10GB)
- **Bandwidth**: Pay-as-you-go
- **Total Estimated**: ~$60-70/month

### Production Recommendation (P1V2 SKU)
- **App Service Plan**: ~$146/month
- Better performance, auto-scaling, deployment slots
- **Total Estimated**: ~$150-160/month

## Troubleshooting

### Containers Won't Start
1. Check logs: `az webapp log tail --name <app-name> --resource-group suna-bim-rg`
2. Verify image exists in ACR: `az acr repository show-tags --name sunabimacr --repository <image-name>`
3. Check environment variables: `az webapp config appsettings list --name <app-name> --resource-group suna-bim-rg`

### 502 Bad Gateway
- Container is starting (wait 2-3 minutes)
- Check WEBSITES_PORT matches container PORT
- Verify health check endpoint is responding

### Cannot Pull Image
- Verify ACR credentials are configured
- Check network connectivity from App Service to ACR
- Ensure image exists: `docker pull sunabimacr.azurecr.io/suna-frontend:latest`

## Security Considerations

1. **ACR Access**: Credentials stored in App Service configuration
2. **HTTPS Only**: Force HTTPS redirect in production
3. **Environment Variables**: Never commit `.env` files
4. **Database Connection**: Use Azure Key Vault for secrets (when database is added)
5. **API Keys**: Store in Azure App Configuration or Key Vault

## Next Steps

1. ✅ Deploy to Azure App Service
2. ⏳ Configure custom domain (carbonscope.ensimu.space)
3. ⏳ Set up SSL certificate
4. ⏳ Configure environment variables for production
5. ⏳ Add database connection (if needed)
6. ⏳ Set up monitoring and alerts
7. ⏳ Configure CI/CD pipeline (GitHub Actions)
8. ⏳ Implement backup strategy

## Support & Documentation

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
