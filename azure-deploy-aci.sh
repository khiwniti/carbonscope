#!/bin/bash
set -e

# Configuration
RESOURCE_GROUP="carbon-bim-rg"
LOCATION="southeastasia"
ACR_NAME="carbonbimbc6740962ecd"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
CONTAINER_GROUP_NAME="suna-services"

echo "🚀 Deploying SUNA to Azure Container Instances"
echo "📍 Resource Group: ${RESOURCE_GROUP}"
echo "📍 Location: ${LOCATION}"

# Get ACR credentials
echo ""
echo "🔑 Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name ${ACR_NAME} --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name ${ACR_NAME} --query passwords[0].value -o tsv)

# Deploy container group with all services
echo ""
echo "🚀 Deploying container group..."

az container create \
  --resource-group ${RESOURCE_GROUP} \
  --name ${CONTAINER_GROUP_NAME} \
  --location ${LOCATION} \
  --registry-login-server ${ACR_LOGIN_SERVER} \
  --registry-username ${ACR_USERNAME} \
  --registry-password ${ACR_PASSWORD} \
  --dns-name-label suna-bim-staging \
  --ports 3000 8000 6379 \
  --cpu 2 \
  --memory 4 \
  --restart-policy Always \
  --os-type Linux \
  --yaml-file azure-container-group.yaml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend: http://suna-bim-staging.${LOCATION}.azurecontainer.io:3000"
echo "   Backend:  http://suna-bim-staging.${LOCATION}.azurecontainer.io:8000"
echo ""
echo "📋 Check status:"
echo "   az container show --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME}"
echo ""
echo "📜 View logs:"
echo "   az container logs --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME} --container-name frontend"
echo "   az container logs --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_GROUP_NAME} --container-name backend"
