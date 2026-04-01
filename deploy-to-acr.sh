#!/bin/bash
set -e

# Azure Container Registry configuration
ACR_NAME="carbonbimbc6740962ecd"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Deploying SUNA services to Azure Container Registry: ${ACR_LOGIN_SERVER}"
echo "📅 Build timestamp: ${TIMESTAMP}"

# Authenticate with ACR
echo ""
echo "🔐 Authenticating with Azure Container Registry..."
az acr login --name ${ACR_NAME}

cd suna

# Build and push Backend
echo ""
echo "🐍 Building Backend service..."
docker build \
  -f backend/Dockerfile \
  -t ${ACR_LOGIN_SERVER}/backend:latest \
  -t ${ACR_LOGIN_SERVER}/backend:${TIMESTAMP} \
  ./backend

echo "⬆️  Pushing Backend to ACR..."
docker push ${ACR_LOGIN_SERVER}/backend:latest
docker push ${ACR_LOGIN_SERVER}/backend:${TIMESTAMP}

# Build and push Frontend (if not already built)
echo ""
echo "⚛️  Building Frontend service..."
docker build \
  -f apps/frontend/Dockerfile \
  -t ${ACR_LOGIN_SERVER}/frontend:latest \
  -t ${ACR_LOGIN_SERVER}/frontend:${TIMESTAMP} \
  .

echo "⬆️  Pushing Frontend to ACR..."
docker push ${ACR_LOGIN_SERVER}/frontend:latest
docker push ${ACR_LOGIN_SERVER}/frontend:${TIMESTAMP}

# Redis (pull official image and push to ACR for consistency)
echo ""
echo "📦 Pulling and pushing Redis..."
docker pull redis:8-alpine
docker tag redis:8-alpine ${ACR_LOGIN_SERVER}/redis:8-alpine
docker push ${ACR_LOGIN_SERVER}/redis:8-alpine

cd ..

echo ""
echo "✅ All services pushed to Azure Container Registry!"
echo ""
echo "📋 Deployed images:"
echo "   - ${ACR_LOGIN_SERVER}/backend:${TIMESTAMP}"
echo "   - ${ACR_LOGIN_SERVER}/frontend:${TIMESTAMP}"
echo "   - ${ACR_LOGIN_SERVER}/redis:8-alpine"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy to Azure Container Instances (ACI)"
echo "   2. Or deploy to Azure App Service"
echo "   3. Or deploy to Azure Kubernetes Service (AKS)"
