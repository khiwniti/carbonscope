#!/bin/bash
set -e

# Quick Production Restart
# Updates App Services to latest images and restarts

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ACR_LOGIN_SERVER="carbonscopeacr.azurecr.io"
RESOURCE_GROUP="suna-bim-rg"
FRONTEND_APP="suna-frontend-app"
BACKEND_APP="suna-backend-app"

# Latest tags from ACR
FRONTEND_TAG="v1.0.8"
BACKEND_TAG="v2.0.6"

echo -e "${BLUE}🔄 Restarting Production Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "🏷️  Frontend: ${FRONTEND_TAG}"
echo "🏷️  Backend: ${BACKEND_TAG}"
echo ""

# Update Frontend to latest image
echo -e "${YELLOW}🔄 Updating Frontend to ${FRONTEND_TAG}...${NC}"
az webapp config container set \
  --name ${FRONTEND_APP} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG} \
  --output none

# Update Backend to latest image
echo -e "${YELLOW}🔄 Updating Backend to ${BACKEND_TAG}...${NC}"
az webapp config container set \
  --name ${BACKEND_APP} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG} \
  --output none

echo ""
echo -e "${YELLOW}🔄 Restarting services...${NC}"
az webapp restart --name ${FRONTEND_APP} --resource-group ${RESOURCE_GROUP} --output none &
az webapp restart --name ${BACKEND_APP} --resource-group ${RESOURCE_GROUP} --output none &
wait

echo ""
echo -e "${GREEN}✅ Production Restarted!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Active Images:"
echo "   Frontend: ${ACR_LOGIN_SERVER}/suna-frontend:${FRONTEND_TAG}"
echo "   Backend:  ${ACR_LOGIN_SERVER}/suna-backend:${BACKEND_TAG}"
echo ""
echo "🌐 Production URLs:"
echo "   Frontend: https://${FRONTEND_APP}.azurewebsites.net"
echo "   Backend:  https://${BACKEND_APP}.azurewebsites.net/health"
echo ""
echo "⏰ Wait 2-3 minutes for services to fully start..."
echo ""
