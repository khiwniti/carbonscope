#!/bin/bash
set -e

# Production Redeployment Script
# Builds and deploys latest code to Azure App Services

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ACR_NAME="carbonscopeacr"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
RESOURCE_GROUP="suna-bim-rg"
FRONTEND_APP="suna-frontend-app"
BACKEND_APP="suna-backend-app"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Version tags
FRONTEND_TAG="v2.0.5"
BACKEND_TAG="v1.0.7"

echo -e "${BLUE}🚀 Production Redeployment Started${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "📅 Timestamp: ${TIMESTAMP}"
echo "🏷️  Frontend: ${FRONTEND_TAG}"
echo "🏷️  Backend: ${BACKEND_TAG}"
echo ""

# Authenticate with ACR
echo -e "${YELLOW}🔐 Authenticating with Azure Container Registry...${NC}"
az acr login --name ${ACR_NAME}
echo ""

# Build and push Frontend
echo -e "${YELLOW}⚛️  Building Frontend...${NC}"
cd suna-init
docker build \
  -f apps/frontend/Dockerfile.production \
  -t ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG} \
  -t ${ACR_LOGIN_SERVER}/suna-frontend:latest \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://vplbjxijbrgwskgxiukd.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGJqeGlqYnJnd3NrZ3hpdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDIxNjksImV4cCI6MjA1ODM3ODE2OX0.Fhn_TKPa8y0mGYUKPWWvPdVwfj0y42kbcvslON1tcmQ \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://suna-backend-app.azurewebsites.net/v1 \
  .

echo -e "${YELLOW}⬆️  Pushing Frontend to ACR...${NC}"
docker push ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG}
docker push ${ACR_LOGIN_SERVER}/suna-frontend:latest
echo -e "${GREEN}✅ Frontend pushed${NC}"
echo ""

# Build and push Backend
echo -e "${YELLOW}🐍 Building Backend...${NC}"
docker build \
  -f backend/Dockerfile \
  -t ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG} \
  -t ${ACR_LOGIN_SERVER}/suna-backend:latest \
  backend/

echo -e "${YELLOW}⬆️  Pushing Backend to ACR...${NC}"
docker push ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG}
docker push ${ACR_LOGIN_SERVER}/suna-backend:latest
echo -e "${GREEN}✅ Backend pushed${NC}"
echo ""

cd ..

# Update App Services to use new images
echo -e "${YELLOW}🔄 Updating Frontend App Service...${NC}"
az webapp config container set \
  --name ${FRONTEND_APP} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG}

echo -e "${YELLOW}🔄 Updating Backend App Service...${NC}"
az webapp config container set \
  --name ${BACKEND_APP} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG}

echo ""
echo -e "${YELLOW}🔄 Restarting services...${NC}"
az webapp restart --name ${FRONTEND_APP} --resource-group ${RESOURCE_GROUP} &
az webapp restart --name ${BACKEND_APP} --resource-group ${RESOURCE_GROUP} &
wait

echo ""
echo -e "${GREEN}✅ Redeployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Deployed Images:"
echo "   Frontend: ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG}"
echo "   Backend:  ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG}"
echo ""
echo "🌐 Production URLs:"
echo "   Frontend: https://${FRONTEND_APP}.azurewebsites.net"
echo "   Backend:  https://${BACKEND_APP}.azurewebsites.net"
echo ""
echo "⏰ Wait 2-3 minutes for services to fully start..."
echo ""
