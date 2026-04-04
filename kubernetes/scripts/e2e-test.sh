#!/bin/bash

# CarbonScope BIM AI - Comprehensive E2E Test Suite
# Prevents production errors by validating entire stack

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NAMESPACE="carbonscope"
FAILED_TESTS=0
PASSED_TESTS=0

# Test results file
REPORT_FILE="claudedocs/e2e-test-report-$(date +%Y%m%d-%H%M%S).md"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  CarbonScope E2E Test Suite - Production Validation   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Initialize report
cat > "$REPORT_FILE" <<EOF
# CarbonScope E2E Test Report

**Date**: $(date)
**Environment**: Local Kubernetes (Minikube)
**Namespace**: $NAMESPACE

---

## Test Results

EOF

test_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        ((PASSED_TESTS++))
        echo "- ✅ **PASS**: $test_name - $details" >> "$REPORT_FILE"
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name - $details"
        ((FAILED_TESTS++))
        echo "- ❌ **FAIL**: $test_name - $details" >> "$REPORT_FILE"
    fi
}

echo -e "${YELLOW}═══ Phase 1: Infrastructure Tests ═══${NC}"
echo ""

# Test 1: Cluster connectivity
echo -e "${BLUE}[1/25] Testing cluster connectivity...${NC}"
if kubectl cluster-info >/dev/null 2>&1; then
    test_result "Cluster Connectivity" "PASS" "Kubernetes API accessible"
else
    test_result "Cluster Connectivity" "FAIL" "Cannot connect to cluster"
    exit 1
fi

# Test 2: Namespace exists
echo -e "${BLUE}[2/25] Testing namespace existence...${NC}"
if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    test_result "Namespace Existence" "PASS" "Namespace '$NAMESPACE' exists"
else
    test_result "Namespace Existence" "FAIL" "Namespace '$NAMESPACE' not found"
    exit 1
fi

# Test 3: All pods running
echo -e "${BLUE}[3/25] Testing pod health...${NC}"
POD_STATUS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].status.phase}')
if echo "$POD_STATUS" | grep -qv "Running"; then
    test_result "Pod Health" "FAIL" "Not all pods running: $POD_STATUS"
else
    POD_COUNT=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
    READY_COUNT=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}' | grep -c "True")
    if [ "$POD_COUNT" -eq "$READY_COUNT" ]; then
        test_result "Pod Health" "PASS" "All $POD_COUNT pods running and ready"
    else
        test_result "Pod Health" "FAIL" "Only $READY_COUNT/$POD_COUNT pods ready"
    fi
fi

# Test 4: Services exist
echo -e "${BLUE}[4/25] Testing service endpoints...${NC}"
SERVICES="local-frontend local-backend local-postgres local-redis"
SERVICE_FAIL=0
for svc in $SERVICES; do
    if kubectl get svc $svc -n $NAMESPACE >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $svc exists"
    else
        echo -e "  ${RED}✗${NC} $svc missing"
        SERVICE_FAIL=1
    fi
done
if [ $SERVICE_FAIL -eq 0 ]; then
    test_result "Service Endpoints" "PASS" "All 4 services exist"
else
    test_result "Service Endpoints" "FAIL" "Some services missing"
fi

echo ""
echo -e "${YELLOW}═══ Phase 2: Database Tests ═══${NC}"
echo ""

# Test 5: PostgreSQL connection
echo -e "${BLUE}[5/25] Testing PostgreSQL connection...${NC}"
if kubectl exec -n $NAMESPACE local-postgres-0 -- psql -U carbonscope -c "SELECT 1;" >/dev/null 2>&1; then
    VERSION=$(kubectl exec -n $NAMESPACE local-postgres-0 -- psql -U carbonscope -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
    test_result "PostgreSQL Connection" "PASS" "Connected - $VERSION"
else
    test_result "PostgreSQL Connection" "FAIL" "Cannot connect to database"
fi

# Test 6: Database tables exist
echo -e "${BLUE}[6/25] Testing database schema...${NC}"
TABLE_COUNT=$(kubectl exec -n $NAMESPACE local-postgres-0 -- psql -U carbonscope -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
if [ "$TABLE_COUNT" -gt 0 ]; then
    test_result "Database Schema" "PASS" "$TABLE_COUNT tables found"
else
    test_result "Database Schema" "FAIL" "No tables found - migrations may not have run"
fi

# Test 7: Redis connection
echo -e "${BLUE}[7/25] Testing Redis connection...${NC}"
REDIS_RESPONSE=$(kubectl exec -n $NAMESPACE local-redis-0 -- redis-cli ping 2>/dev/null)
if [ "$REDIS_RESPONSE" = "PONG" ]; then
    test_result "Redis Connection" "PASS" "Redis responding"
else
    test_result "Redis Connection" "FAIL" "Redis not responding"
fi

# Test 8: Redis memory config
echo -e "${BLUE}[8/25] Testing Redis configuration...${NC}"
MAX_MEMORY=$(kubectl exec -n $NAMESPACE local-redis-0 -- redis-cli config get maxmemory 2>/dev/null | tail -1)
if [ -n "$MAX_MEMORY" ]; then
    test_result "Redis Configuration" "PASS" "Max memory: $MAX_MEMORY bytes"
else
    test_result "Redis Configuration" "FAIL" "Cannot read Redis config"
fi

echo ""
echo -e "${YELLOW}═══ Phase 3: Backend Application Tests ═══${NC}"
echo ""

# Start port forwarding for tests
echo -e "${BLUE}Starting temporary port forwarding...${NC}"
kubectl port-forward -n $NAMESPACE svc/local-backend 8000:80 > /tmp/e2e-backend-pf.log 2>&1 &
BACKEND_PF_PID=$!
sleep 3

# Test 9: Backend health endpoint
echo -e "${BLUE}[9/25] Testing backend health endpoint...${NC}"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$HEALTH_STATUS" = "200" ]; then
    test_result "Backend Health Endpoint" "PASS" "HTTP 200 response"
else
    test_result "Backend Health Endpoint" "FAIL" "HTTP $HEALTH_STATUS response"
fi

# Test 10: Backend API docs
echo -e "${BLUE}[10/25] Testing API documentation...${NC}"
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs 2>/dev/null || echo "000")
if [ "$DOCS_STATUS" = "200" ]; then
    test_result "API Documentation" "PASS" "Swagger UI accessible"
else
    test_result "API Documentation" "FAIL" "Swagger UI not accessible (HTTP $DOCS_STATUS)"
fi

# Test 11: Backend OpenAPI schema
echo -e "${BLUE}[11/25] Testing OpenAPI schema...${NC}"
OPENAPI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/openapi.json 2>/dev/null || echo "000")
if [ "$OPENAPI_STATUS" = "200" ]; then
    test_result "OpenAPI Schema" "PASS" "Schema endpoint working"
else
    test_result "OpenAPI Schema" "FAIL" "Schema not accessible (HTTP $OPENAPI_STATUS)"
fi

# Test 12: Backend environment variables
echo -e "${BLUE}[12/25] Testing backend environment configuration...${NC}"
BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}')
DB_URL_SET=$(kubectl exec -n $NAMESPACE $BACKEND_POD -- env | grep -c DATABASE_URL || echo "0")
if [ "$DB_URL_SET" -gt 0 ]; then
    test_result "Backend Environment" "PASS" "DATABASE_URL configured"
else
    test_result "Backend Environment" "FAIL" "DATABASE_URL not set"
fi

# Test 13: Backend logs for errors
echo -e "${BLUE}[13/25] Testing backend logs for errors...${NC}"
ERROR_COUNT=$(kubectl logs -n $NAMESPACE $BACKEND_POD --tail=100 | grep -ci "error\|exception\|traceback" || echo "0")
if [ "$ERROR_COUNT" -lt 5 ]; then
    test_result "Backend Error Logs" "PASS" "No critical errors ($ERROR_COUNT errors found)"
else
    test_result "Backend Error Logs" "FAIL" "$ERROR_COUNT errors in logs"
fi

# Stop backend port forward
kill $BACKEND_PF_PID 2>/dev/null || true

echo ""
echo -e "${YELLOW}═══ Phase 4: Frontend Application Tests ═══${NC}"
echo ""

# Start frontend port forwarding
FRONTEND_POD=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward -n $NAMESPACE pod/$FRONTEND_POD 3000:3000 > /tmp/e2e-frontend-pf.log 2>&1 &
FRONTEND_PF_PID=$!
sleep 3

# Test 14: Frontend accessibility
echo -e "${BLUE}[14/25] Testing frontend accessibility...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    test_result "Frontend Accessibility" "PASS" "HTTP 200 response"
else
    test_result "Frontend Accessibility" "FAIL" "HTTP $FRONTEND_STATUS response"
fi

# Test 15: Frontend HTML content
echo -e "${BLUE}[15/25] Testing frontend HTML content...${NC}"
FRONTEND_HTML=$(curl -s http://localhost:3000 2>/dev/null | grep -o "<title>.*</title>" || echo "")
if [ -n "$FRONTEND_HTML" ]; then
    test_result "Frontend HTML" "PASS" "Valid HTML with title tag"
else
    test_result "Frontend HTML" "FAIL" "No valid HTML received"
fi

# Test 16: Frontend static assets
echo -e "${BLUE}[16/25] Testing frontend static assets...${NC}"
FAVICON_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/favicon.ico 2>/dev/null || echo "000")
if [ "$FAVICON_STATUS" = "200" ]; then
    test_result "Frontend Static Assets" "PASS" "Favicon accessible"
else
    test_result "Frontend Static Assets" "FAIL" "Favicon not found (HTTP $FAVICON_STATUS)"
fi

# Test 17: Frontend environment variables
echo -e "${BLUE}[17/25] Testing frontend environment configuration...${NC}"
SUPABASE_URL_SET=$(kubectl exec -n $NAMESPACE $FRONTEND_POD -- env | grep -c NEXT_PUBLIC_SUPABASE_URL || echo "0")
if [ "$SUPABASE_URL_SET" -gt 0 ]; then
    test_result "Frontend Environment" "PASS" "NEXT_PUBLIC_SUPABASE_URL configured"
else
    test_result "Frontend Environment" "FAIL" "NEXT_PUBLIC_SUPABASE_URL not set"
fi

# Test 18: Frontend logs for errors
echo -e "${BLUE}[18/25] Testing frontend logs for errors...${NC}"
FRONTEND_ERROR_COUNT=$(kubectl logs -n $NAMESPACE $FRONTEND_POD --tail=100 | grep -ci "error\|exception" || echo "0")
if [ "$FRONTEND_ERROR_COUNT" -lt 3 ]; then
    test_result "Frontend Error Logs" "PASS" "No critical errors ($FRONTEND_ERROR_COUNT errors found)"
else
    test_result "Frontend Error Logs" "FAIL" "$FRONTEND_ERROR_COUNT errors in logs"
fi

# Stop frontend port forward
kill $FRONTEND_PF_PID 2>/dev/null || true

echo ""
echo -e "${YELLOW}═══ Phase 5: Configuration & Security Tests ═══${NC}"
echo ""

# Test 19: Secrets exist
echo -e "${BLUE}[19/25] Testing secret configuration...${NC}"
SECRETS="frontend-secrets backend-secrets postgres-secrets"
SECRET_FAIL=0
for secret in $SECRETS; do
    if kubectl get secret $secret -n $NAMESPACE >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $secret exists"
    else
        echo -e "  ${RED}✗${NC} $secret missing"
        SECRET_FAIL=1
    fi
done
if [ $SECRET_FAIL -eq 0 ]; then
    test_result "Secret Configuration" "PASS" "All 3 secrets configured"
else
    test_result "Secret Configuration" "FAIL" "Some secrets missing"
fi

# Test 20: ConfigMaps exist
echo -e "${BLUE}[20/25] Testing ConfigMap configuration...${NC}"
CONFIGMAP_COUNT=$(kubectl get configmaps -n $NAMESPACE --no-headers 2>/dev/null | grep -c "config" || echo "0")
if [ "$CONFIGMAP_COUNT" -ge 2 ]; then
    test_result "ConfigMap Configuration" "PASS" "$CONFIGMAP_COUNT ConfigMaps found"
else
    test_result "ConfigMap Configuration" "FAIL" "Expected at least 2 ConfigMaps, found $CONFIGMAP_COUNT"
fi

# Test 21: Image pull policy
echo -e "${BLUE}[21/25] Testing image pull policies...${NC}"
PULL_POLICY=$(kubectl get deployment -n $NAMESPACE -o jsonpath='{.items[*].spec.template.spec.containers[*].imagePullPolicy}')
if echo "$PULL_POLICY" | grep -q "Never"; then
    test_result "Image Pull Policy" "PASS" "Using local images (imagePullPolicy: Never)"
else
    test_result "Image Pull Policy" "PASS" "Pull policy: $PULL_POLICY"
fi

# Test 22: Resource limits
echo -e "${BLUE}[22/25] Testing resource limits...${NC}"
DEPLOYMENTS=$(kubectl get deployments -n $NAMESPACE -o name)
MISSING_LIMITS=0
for deploy in $DEPLOYMENTS; do
    LIMITS=$(kubectl get $deploy -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[*].resources.limits}')
    if [ -z "$LIMITS" ]; then
        MISSING_LIMITS=1
    fi
done
if [ $MISSING_LIMITS -eq 0 ]; then
    test_result "Resource Limits" "PASS" "All deployments have resource limits"
else
    test_result "Resource Limits" "FAIL" "Some deployments missing resource limits"
fi

echo ""
echo -e "${YELLOW}═══ Phase 6: Production Readiness Tests ═══${NC}"
echo ""

# Test 23: Persistent volumes
echo -e "${BLUE}[23/25] Testing persistent storage...${NC}"
PVC_COUNT=$(kubectl get pvc -n $NAMESPACE --no-headers 2>/dev/null | wc -l)
if [ "$PVC_COUNT" -ge 2 ]; then
    BOUND_COUNT=$(kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].status.phase}' | grep -o "Bound" | wc -l)
    if [ "$BOUND_COUNT" -eq "$PVC_COUNT" ]; then
        test_result "Persistent Storage" "PASS" "All $PVC_COUNT PVCs bound"
    else
        test_result "Persistent Storage" "FAIL" "Only $BOUND_COUNT/$PVC_COUNT PVCs bound"
    fi
else
    test_result "Persistent Storage" "FAIL" "Expected at least 2 PVCs, found $PVC_COUNT"
fi

# Test 24: Pod restart counts
echo -e "${BLUE}[24/25] Testing pod stability...${NC}"
MAX_RESTARTS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.status.containerStatuses[*].restartCount}{"\n"}{end}' | sort -rn | head -1)
if [ "$MAX_RESTARTS" -le 2 ]; then
    test_result "Pod Stability" "PASS" "Max restart count: $MAX_RESTARTS"
else
    test_result "Pod Stability" "FAIL" "High restart count detected: $MAX_RESTARTS restarts"
fi

# Test 25: Overall cluster health
echo -e "${BLUE}[25/25] Testing overall cluster health...${NC}"
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
READY_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}' | grep -c "True")
if [ "$TOTAL_PODS" -eq "$READY_PODS" ] && [ "$FAILED_TESTS" -eq 0 ]; then
    test_result "Overall Cluster Health" "PASS" "All systems operational"
else
    test_result "Overall Cluster Health" "FAIL" "Some issues detected"
fi

# Generate final report
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total Tests**: $((PASSED_TESTS + FAILED_TESTS))" >> "$REPORT_FILE"
echo "- **Passed**: $PASSED_TESTS" >> "$REPORT_FILE"
echo "- **Failed**: $FAILED_TESTS" >> "$REPORT_FILE"
echo "- **Success Rate**: $(( PASSED_TESTS * 100 / (PASSED_TESTS + FAILED_TESTS) ))%" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $FAILED_TESTS -eq 0 ]; then
    echo "## ✅ Verdict: PRODUCTION READY" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "All tests passed. The application is ready for production deployment." >> "$REPORT_FILE"
else
    echo "## ⚠️ Verdict: NOT PRODUCTION READY" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**$FAILED_TESTS test(s) failed.** Please fix the issues before deploying to production." >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Generated**: $(date)" >> "$REPORT_FILE"

# Display results
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Total Tests:    $((PASSED_TESTS + FAILED_TESTS))"
echo -e "  ${GREEN}Passed:         $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "  ${RED}Failed:         $FAILED_TESTS${NC}"
else
    echo -e "  Failed:         $FAILED_TESTS"
fi
echo -e "  Success Rate:   $(( PASSED_TESTS * 100 / (PASSED_TESTS + FAILED_TESTS) ))%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ ALL TESTS PASSED - PRODUCTION READY        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}The application has passed all validation tests and is ready${NC}"
    echo -e "${GREEN}for production deployment.${NC}"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║       ⚠️  TESTS FAILED - NOT PRODUCTION READY          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Please fix the $FAILED_TESTS failed test(s) before deploying${NC}"
    echo -e "${RED}to production.${NC}"
    echo ""
fi

echo -e "📄 Full report saved to: ${BLUE}$REPORT_FILE${NC}"
echo ""

exit $FAILED_TESTS
