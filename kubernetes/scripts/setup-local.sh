#!/bin/bash
set -e

# CarbonScope BIM AI - Local Kubernetes Setup Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 CarbonScope BIM AI - Local Kubernetes Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

command -v kubectl >/dev/null 2>&1 || {
  echo -e "${RED}❌ kubectl not found. Please install kubectl.${NC}"
  exit 1
}

command -v minikube >/dev/null 2>&1 || {
  echo -e "${RED}❌ minikube not found. Please install minikube.${NC}"
  exit 1
}

command -v kustomize >/dev/null 2>&1 || {
  echo -e "${RED}❌ kustomize not found. Please install kustomize.${NC}"
  exit 1
}

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Start minikube if not running
echo -e "${YELLOW}🔄 Starting minikube cluster...${NC}"
if minikube status | grep -q "Running"; then
  echo -e "${GREEN}✅ Minikube already running${NC}"
else
  minikube start --cpus=4 --memory=8192 --disk-size=50g
  echo -e "${GREEN}✅ Minikube started${NC}"
fi
echo ""

# Enable addons
echo -e "${YELLOW}🔌 Enabling minikube addons...${NC}"
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
echo -e "${GREEN}✅ Addons enabled${NC}"
echo ""

# Create secrets file if it doesn't exist
SECRETS_FILE="kubernetes/configs/secrets.yaml"
if [ ! -f "$SECRETS_FILE" ]; then
  echo -e "${YELLOW}🔐 Creating secrets file...${NC}"
  echo -e "${RED}⚠️  Please update kubernetes/configs/secrets.yaml with real API keys${NC}"
  cp kubernetes/configs/secrets.example.yaml "$SECRETS_FILE"
fi

# Apply secrets
echo -e "${YELLOW}🔐 Applying secrets...${NC}"
kubectl apply -f "$SECRETS_FILE"
echo -e "${GREEN}✅ Secrets applied${NC}"
echo ""

# Deploy using kustomize
echo -e "${YELLOW}📦 Deploying CarbonScope stack...${NC}"
kubectl apply -k kubernetes/overlays/local
echo -e "${GREEN}✅ Deployment initiated${NC}"
echo ""

# Wait for pods to be ready
echo -e "${YELLOW}⏳ Waiting for pods to be ready (this may take 2-3 minutes)...${NC}"
kubectl wait --for=condition=ready pod -l app=frontend -n carbonscope --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=backend -n carbonscope --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres -n carbonscope --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=redis -n carbonscope --timeout=300s || true
echo ""

# Display status
echo -e "${GREEN}✅ Local Kubernetes cluster ready!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Cluster Status:${NC}"
kubectl get pods -n carbonscope
echo ""
echo -e "${BLUE}🌐 Services:${NC}"
kubectl get svc -n carbonscope
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}kubectl port-forward -n carbonscope svc/local-frontend 3000:80${NC}"
echo -e "  Backend:  ${GREEN}kubectl port-forward -n carbonscope svc/local-backend 8000:80${NC}"
echo ""
echo -e "${BLUE}📊 View Dashboard:${NC}"
echo -e "  ${GREEN}minikube dashboard${NC}"
echo ""
echo -e "${BLUE}📝 View Logs:${NC}"
echo -e "  Frontend: ${GREEN}kubectl logs -f -n carbonscope deployment/local-frontend${NC}"
echo -e "  Backend:  ${GREEN}kubectl logs -f -n carbonscope deployment/local-backend${NC}"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to update kubernetes/configs/secrets.yaml with real API keys!${NC}"
