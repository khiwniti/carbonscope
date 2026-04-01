#!/bin/bash
# Azure Container Registry Setup and Deployment Script
# Complete deployment for BKS cBIM AI platform

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-suna-bim-rg}"
LOCATION="${AZURE_LOCATION:-southeastasia}"
ACR_NAME="${ACR_NAME:-sunabimacr}"
ACR_SKU="${ACR_SKU:-Basic}"
BACKEND_IMAGE_NAME="suna-backend"
FRONTEND_IMAGE_NAME="suna-frontend"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Azure Container Registry Deployment${NC}"
echo -e "${BLUE}  BKS cBIM AI Platform${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check Azure CLI
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
print_info "Checking Azure login status..."
if ! az account show &> /dev/null; then
    print_info "Please login to Azure..."
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
print_status "Using subscription: $SUBSCRIPTION_ID"

# Create resource group
print_info "Creating resource group: $RESOURCE_GROUP..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output none || print_info "Resource group already exists"
print_status "Resource group ready"

# Create Azure Container Registry
print_info "Creating Azure Container Registry: $ACR_NAME..."
if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    az acr create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$ACR_NAME" \
        --sku "$ACR_SKU" \
        --admin-enabled true \
        --output none
    print_status "ACR created successfully"
else
    print_info "ACR already exists"
    # Enable admin user if not enabled
    az acr update \
        --name "$ACR_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --admin-enabled true \
        --output none
fi

# Get ACR credentials
print_info "Retrieving ACR credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)

print_status "ACR Login Server: $ACR_LOGIN_SERVER"

# Login to ACR
print_info "Logging into ACR..."
echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_SERVER" --username "$ACR_USERNAME" --password-stdin
print_status "Logged into ACR successfully"

# Build and push backend
print_info "Building backend image..."
cd suna-init/backend
docker build \
    -f Dockerfile.production \
    -t "${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}" \
    -t "${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
    .
print_status "Backend image built"

print_info "Pushing backend image to ACR..."
docker push "${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" || true
print_status "Backend image pushed"

# Build and push frontend
print_info "Building frontend image..."
cd ../apps/frontend

# Update next.config.ts for standalone build
if ! grep -q "output: 'standalone'" next.config.ts 2>/dev/null; then
    print_info "Adding standalone output to next.config.ts..."
    cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
EOF
fi

docker build \
    -f Dockerfile.production \
    -t "${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}" \
    -t "${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
    .
print_status "Frontend image built"

print_info "Pushing frontend image to ACR..."
docker push "${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
docker push "${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" || true
print_status "Frontend image pushed"

cd ../../..

# Save deployment information
print_info "Saving deployment configuration..."
cat > azure-acr-deployment.env << EOF
# Azure ACR Deployment Configuration
# Generated: $(date)

RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
ACR_NAME=$ACR_NAME
ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER
ACR_USERNAME=$ACR_USERNAME
ACR_PASSWORD=$ACR_PASSWORD

BACKEND_IMAGE=${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
FRONTEND_IMAGE=${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}

# For Azure Container Instances deployment
ACI_BACKEND_NAME=suna-backend-aci
ACI_FRONTEND_NAME=suna-frontend-aci

# For Azure App Service deployment
APP_SERVICE_PLAN=suna-plan
APP_SERVICE_BACKEND=suna-backend-app
APP_SERVICE_FRONTEND=suna-frontend-app
EOF

print_status "Configuration saved to azure-acr-deployment.env"

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
print_info "ACR Login Server: ${BLUE}$ACR_LOGIN_SERVER${NC}"
print_info "Backend Image: ${BLUE}${ACR_LOGIN_SERVER}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}${NC}"
print_info "Frontend Image: ${BLUE}${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo
print_info "Next steps:"
echo "  1. Deploy to Azure Container Instances: ${YELLOW}./azure-deploy-aci.sh${NC}"
echo "  2. Deploy to Azure App Service: ${YELLOW}./azure-deploy-app-service.sh${NC}"
echo "  3. Deploy to Azure Kubernetes: ${YELLOW}./azure-deploy-aks.sh${NC}"
echo
