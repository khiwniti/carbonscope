#!/bin/bash

# CarbonScope BIM AI - Start Services with Port Forwarding

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting CarbonScope Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if cluster is running
if ! kubectl cluster-info >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Cluster not running. Starting minikube...${NC}"
  minikube start
fi

# Check pods
echo -e "${YELLOW}📊 Checking pod status...${NC}"
kubectl get pods -n carbonscope

echo ""
echo -e "${GREEN}✅ Starting port forwarding...${NC}"
echo ""

# Kill existing port forwards
pkill -f "kubectl port-forward" >/dev/null 2>&1 || true

# Start port forwarding in background
kubectl port-forward -n carbonscope pod/$(kubectl get pods -n carbonscope -l app=frontend -o jsonpath='{.items[0].metadata.name}') 3000:3000 > /tmp/frontend-pf.log 2>&1 &
FRONTEND_PID=$!

kubectl port-forward -n carbonscope svc/local-backend 8000:80 > /tmp/backend-pf.log 2>&1 &
BACKEND_PID=$!

sleep 2

echo -e "${GREEN}✅ Port forwarding active!${NC}"
echo ""
echo -e "${BLUE}🌐 Access your services:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}📝 Process IDs:${NC}"
echo -e "   Frontend PID: ${FRONTEND_PID}"
echo -e "   Backend PID:  ${BACKEND_PID}"
echo ""
echo -e "${YELLOW}ℹ️  To stop port forwarding:${NC}"
echo -e "   kill ${FRONTEND_PID} ${BACKEND_PID}"
echo -e "   or"
echo -e "   pkill -f 'kubectl port-forward'"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Services ready! Open http://localhost:3000 in your browser${NC}"
echo ""
