#!/bin/bash
set -e

# =============================================================================
# SUNA Production Deployment to Azure Container Instances
# =============================================================================
# This script deploys all services to production with proper security
# =============================================================================

RESOURCE_GROUP="carbon-bim-rg"
LOCATION="southeastasia"
ACR_NAME="carbonbimbc6740962ecd"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
CONTAINER_GROUP_NAME="suna-production"

echo "🚀 SUNA Production Deployment"
echo "======================================"
echo ""

# Pre-flight checks
echo "🔍 Running pre-flight checks..."

if [ ! -f "azure-container-group-production.yaml" ]; then
  echo "❌ Error: azure-container-group-production.yaml not found"
  exit 1
fi

# Check for placeholder values
if grep -q "YOUR_" azure-container-group-production.yaml; then
  echo "⚠️  Warning: Found placeholder values (YOUR_*) in configuration"
  echo "Please update azure-container-group-production.yaml with actual values"
  read -p "Continue anyway? (yes/no): " CONTINUE
  if [ "$CONTINUE" != "yes" ]; then
    echo "Deployment cancelled"
    exit 1
  fi
fi

# Authenticate with ACR
echo ""
echo "🔐 Authenticating with Azure Container Registry..."
az acr login --name ${ACR_NAME}

# Get ACR credentials
echo "🔑 Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name ${ACR_NAME} --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name ${ACR_NAME} --query passwords[0].value -o tsv)

# Check if images exist
echo ""
echo "📦 Verifying images in ACR..."
IMAGES=("backend:latest" "frontend:latest" "redis:7-alpine")
for IMAGE in "${IMAGES[@]}"; do
  if az acr repository show --name ${ACR_NAME} --image ${IMAGE} &>/dev/null; then
    echo "✅ ${IMAGE} found"
  else
    echo "❌ ${IMAGE} not found in ACR"
    echo "Run ./deploy-to-acr.sh first to build and push images"
    exit 1
  fi
done

# Backup existing deployment (if exists)
echo ""
if az container show --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME} &>/dev/null; then
  echo "📋 Backing up existing deployment..."
  BACKUP_FILE="backup-${CONTAINER_GROUP_NAME}-$(date +%Y%m%d-%H%M%S).yaml"
  az container export \
    --resource-group ${RESOURCE_GROUP} \
    --name ${CONTAINER_GROUP_NAME} \
    --file ${BACKUP_FILE}
  echo "✅ Backup saved to: ${BACKUP_FILE}"

  echo ""
  read -p "Delete existing deployment? (yes/no): " DELETE
  if [ "$DELETE" == "yes" ]; then
    echo "🗑️  Deleting existing deployment..."
    az container delete \
      --resource-group ${RESOURCE_GROUP} \
      --name ${CONTAINER_GROUP_NAME} \
      --yes
    echo "⏳ Waiting for deletion to complete..."
    sleep 10
  fi
fi

# Deploy container group
echo ""
echo "🚀 Deploying production container group..."
az container create \
  --resource-group ${RESOURCE_GROUP} \
  --file azure-container-group-production.yaml \
  --registry-username ${ACR_USERNAME} \
  --registry-password ${ACR_PASSWORD}

# Wait for containers to start
echo ""
echo "⏳ Waiting for containers to start (this may take 2-3 minutes)..."
sleep 30

# Check container status
echo ""
echo "📊 Checking container status..."
az container show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${CONTAINER_GROUP_NAME} \
  --query "{State:instanceView.state,IP:ipAddress.ip,FQDN:ipAddress.fqdn}" \
  -o table

# Get container logs
echo ""
echo "📜 Checking container health..."

CONTAINERS=("redis" "backend" "frontend")
for CONTAINER in "${CONTAINERS[@]}"; do
  echo ""
  echo "=== ${CONTAINER} logs (last 20 lines) ==="
  az container logs \
    --resource-group ${RESOURCE_GROUP} \
    --name ${CONTAINER_GROUP_NAME} \
    --container-name ${CONTAINER} \
    --tail 20 || echo "Container not ready yet"
done

# Display access information
FQDN=$(az container show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${CONTAINER_GROUP_NAME} \
  --query ipAddress.fqdn -o tsv)

IP=$(az container show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${CONTAINER_GROUP_NAME} \
  --query ipAddress.ip -o tsv)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend: http://${FQDN}:3000"
echo "   Backend:  http://${FQDN}:8000"
echo "   IP Address: ${IP}"
echo ""
echo "📋 Useful commands:"
echo "   # View all logs"
echo "   az container logs --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME} --container-name frontend"
echo ""
echo "   # Check status"
echo "   az container show --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME}"
echo ""
echo "   # Restart container group"
echo "   az container restart --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME}"
echo ""
echo "   # Delete deployment"
echo "   az container delete --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME} --yes"
echo ""
echo "🎯 Next steps:"
echo "   1. Configure custom domain and SSL certificate"
echo "   2. Set up Azure CDN for frontend assets"
echo "   3. Configure monitoring and alerts"
echo "   4. Run smoke tests"
echo "   5. Update DNS records"
