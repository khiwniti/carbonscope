# Deploy BKS cBIM AI to Azure Production

## Pre-Deployment Checklist

### ⚠️ CRITICAL: Update Supabase First!

**Before deploying, you MUST update Supabase redirect URLs:**

1. Go to: https://supabase.com/dashboard
2. Select project: `ujzsbwvurfyeuerxxeaz`
3. **Authentication → URL Configuration**:
   - Site URL: `https://carbon-bim.ensimu.space`
   - Add Redirect URLs:
     - `https://carbon-bim.ensimu.space/auth/callback`
     - `https://carbon-bim.ensimu.space/api/auth/callback`
4. **Settings → API → CORS**: Add `https://carbon-bim.ensimu.space`
5. **Save** all changes

---

## Deployment Steps

### Step 1: Build and Push Docker Images (5-10 min)

```bash
# Build and push to Azure Container Registry
./deploy-to-acr.sh
```

This will:
- Build frontend and backend Docker images
- Tag with latest
- Push to ACR: carbonbimbc6740962ecd.azurecr.io

### Step 2: Deploy to Azure Container Instances (5-10 min)

```bash
# Deploy production container group
./azure-deploy-production.sh
```

This will:
- Authenticate with ACR
- Verify images exist
- Backup existing deployment
- Deploy new container group
- Wait for containers to start
- Display access information

### Step 3: Verify Deployment (5 min)

```bash
# Check container status
az container show \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --query "{State:instanceView.state,IP:ipAddress.ip,FQDN:ipAddress.fqdn}" \
  -o table

# View logs
az container logs \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name frontend \
  --tail 50
```

---

## Quick Deploy (One Command)

```bash
# Build, push, and deploy in one go
./deploy-to-acr.sh && ./azure-deploy-production.sh
```

---

## Expected Output

### After deploy-to-acr.sh:
```
✅ frontend:latest pushed to carbonbimbc6740962ecd.azurecr.io
✅ backend:latest pushed to carbonbimbc6740962ecd.azurecr.io
```

### After azure-deploy-production.sh:
```
✅ Deployment complete!
🌐 Access your services:
   Frontend: http://<fqdn>:3000
   Backend:  http://<fqdn>:8000
   IP Address: <ip>
```

---

## Troubleshooting

### Images not found in ACR
```bash
# List images in ACR
az acr repository list --name carbonbimbc6740962ecd -o table

# If missing, run:
./deploy-to-acr.sh
```

### Container fails to start
```bash
# Check logs
az container logs \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --container-name frontend

# Check environment variables
az container show \
  --resource-group carbon-bim-rg \
  --name suna-production \
  --query "containers[].environmentVariables"
```

### Auth redirects to localhost
- **Cause**: Supabase redirect URLs not updated
- **Solution**: Follow Step 1 in Pre-Deployment Checklist

---

## Post-Deployment Verification

Visit: https://carbon-bim.ensimu.space

**Checklist**:
- [ ] Page loads with "BKS cBIM AI" branding
- [ ] Emerald green theme visible
- [ ] Login button works
- [ ] Auth redirect to production URL (not 127.0.0.1)
- [ ] No console errors
- [ ] API calls to api.carbon-bim.ensimu.space work

---

## Configuration Files

- **azure-container-group-production.yaml** - Container group config
- **docker-compose.production.yml** - Production Docker Compose
- **.env.production** - Frontend production environment (in suna/apps/frontend/)

---

## Estimated Time

- Image build: 5-10 minutes
- Image push: 2-5 minutes
- Deployment: 2-3 minutes
- Container startup: 2-3 minutes
- **Total**: 15-25 minutes

---

## Next Steps After Deployment

1. Configure custom domain SSL certificate
2. Set up Azure CDN for frontend assets
3. Configure monitoring and alerts
4. Run smoke tests
5. Update DNS records (if needed)

