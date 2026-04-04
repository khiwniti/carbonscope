#!/bin/bash

# CarbonScope BIM AI - Kubernetes Health Check Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE="${1:-carbonscope}"

echo -e "${BLUE}🏥 CarbonScope Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check namespace exists
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  echo -e "${RED}❌ Namespace '$NAMESPACE' not found${NC}"
  exit 1
fi

echo -e "${BLUE}📦 Checking Pods:${NC}"
kubectl get pods -n "$NAMESPACE"
echo ""

# Check each component
components=("frontend" "backend" "postgres" "redis")
all_healthy=true

for component in "${components[@]}"; do
  echo -e "${YELLOW}Checking $component...${NC}"

  # Get pod count
  ready=$(kubectl get pods -n "$NAMESPACE" -l app="$component" -o jsonpath='{.items[*].status.containerStatuses[0].ready}' 2>/dev/null | grep -o "true" | wc -l)
  total=$(kubectl get pods -n "$NAMESPACE" -l app="$component" --no-headers 2>/dev/null | wc -l)

  if [ "$total" -eq 0 ]; then
    echo -e "${RED}  ❌ No pods found for $component${NC}"
    all_healthy=false
  elif [ "$ready" -eq "$total" ]; then
    echo -e "${GREEN}  ✅ $component: $ready/$total pods ready${NC}"
  else
    echo -e "${YELLOW}  ⚠️  $component: $ready/$total pods ready${NC}"
    all_healthy=false
  fi
done

echo ""
echo -e "${BLUE}🔍 Service Endpoints:${NC}"
kubectl get svc -n "$NAMESPACE"
echo ""

# Test health endpoints if pods are ready
if kubectl get pods -n "$NAMESPACE" -l app=frontend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null | grep -q "true"; then
  echo -e "${BLUE}🌐 Frontend Health:${NC}"
  kubectl exec -n "$NAMESPACE" deployment/frontend -- wget -q -O- http://localhost:3000/api/health 2>/dev/null && echo -e "${GREEN}  ✅ Healthy${NC}" || echo -e "${RED}  ❌ Not responding${NC}"
  echo ""
fi

if kubectl get pods -n "$NAMESPACE" -l app=backend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null | grep -q "true"; then
  echo -e "${BLUE}🔧 Backend Health:${NC}"
  kubectl exec -n "$NAMESPACE" deployment/backend -- wget -q -O- http://localhost:8000/health 2>/dev/null && echo -e "${GREEN}  ✅ Healthy${NC}" || echo -e "${RED}  ❌ Not responding${NC}"
  echo ""
fi

# Overall status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$all_healthy" = true ]; then
  echo -e "${GREEN}✅ All components healthy${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some components need attention${NC}"
  exit 1
fi
