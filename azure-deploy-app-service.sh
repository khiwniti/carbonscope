#!/bin/bash
# Deploy to Azure App Service
# Fully managed PaaS with auto-scaling and custom domains

set -e

# Source deployment configuration
if [ -f "azure-acr-deployment.env" ]; then
    source azure-acr-deployment.env
else
    echo "Error: Run ./azure-acr-setup.sh first"
    exit 1
fi

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Deploy to Azure App Service${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Create App Service Plan (Linux)
echo -e "${YELLOW}[i]${NC} Creating App Service Plan..."
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --is-linux \
    --sku B2 \
    --output none || echo "Plan already exists"

echo -e "${GREEN}[✓]${NC} App Service Plan ready"

# Deploy backend
echo -e "${YELLOW}[i]${NC} Creating backend web app..."
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_SERVICE_BACKEND" \
    --deployment-container-image-name "$BACKEND_IMAGE" \
    --output none

# Configure backend container
az webapp config container set \
    --name "$APP_SERVICE_BACKEND" \
    --resource-group "$RESOURCE_GROUP" \
    --docker-custom-image-name "$BACKEND_IMAGE" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
    --docker-registry-server-user "$ACR_USERNAME" \
    --docker-registry-server-password "$ACR_PASSWORD" \
    --output none

# Configure backend settings
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE_BACKEND" \
    --settings \
        PORT=8000 \
        WEBSITES_PORT=8000 \
        ENVIRONMENT=production \
    --output none

BACKEND_URL="https://${APP_SERVICE_BACKEND}.azurewebsites.net"
echo -e "${GREEN}[✓]${NC} Backend deployed: $BACKEND_URL"

# Deploy frontend
echo -e "${YELLOW}[i]${NC} Creating frontend web app..."
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_SERVICE_FRONTEND" \
    --deployment-container-image-name "$FRONTEND_IMAGE" \
    --output none

# Configure frontend container
az webapp config container set \
    --name "$APP_SERVICE_FRONTEND" \
    --resource-group "$RESOURCE_GROUP" \
    --docker-custom-image-name "$FRONTEND_IMAGE" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
    --docker-registry-server-user "$ACR_USERNAME" \
    --docker-registry-server-password "$ACR_PASSWORD" \
    --output none

# Configure frontend settings
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE_FRONTEND" \
    --settings \
        PORT=3000 \
        WEBSITES_PORT=3000 \
        NEXT_PUBLIC_API_URL="$BACKEND_URL" \
        NODE_ENV=production \
    --output none

FRONTEND_URL="https://${APP_SERVICE_FRONTEND}.azurewebsites.net"
echo -e "${GREEN}[✓]${NC} Frontend deployed: $FRONTEND_URL"

# Enable continuous deployment
echo -e "${YELLOW}[i]${NC} Enabling continuous deployment..."
az webapp deployment container config \
    --name "$APP_SERVICE_BACKEND" \
    --resource-group "$RESOURCE_GROUP" \
    --enable-cd true \
    --output none

az webapp deployment container config \
    --name "$APP_SERVICE_FRONTEND" \
    --resource-group "$RESOURCE_GROUP" \
    --enable-cd true \
    --output none

# Save URLs
cat > azure-app-service-urls.txt << EOF
Backend URL: $BACKEND_URL
Frontend URL: $FRONTEND_URL

Backend Health: $BACKEND_URL/health
API Docs: $BACKEND_URL/docs

App Service Plan: $APP_SERVICE_PLAN
Backend App: $APP_SERVICE_BACKEND
Frontend App: $APP_SERVICE_FRONTEND
EOF

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "${BLUE}Frontend:${NC} $FRONTEND_URL"
echo -e "${BLUE}Backend API:${NC} $BACKEND_URL/docs"
echo
echo -e "${YELLOW}[i]${NC} Note: First startup may take 2-3 minutes"
echo -e "${YELLOW}[i]${NC} Continuous deployment enabled - push new images to auto-update"
echo
