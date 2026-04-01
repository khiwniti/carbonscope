#!/bin/bash
set -e

echo "================================"
echo "Frontend-Backend Compatibility Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_DIR="/teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/backend"
FRONTEND_DIR="/teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/apps/frontend"

echo "1. Checking backend environment variables..."
cd "$BACKEND_DIR"
if [ -f .env ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓ DATABASE_URL configured${NC}"
    else
        echo -e "${RED}✗ DATABASE_URL missing${NC}"
    fi
else
    echo -e "${RED}✗ Backend .env file missing${NC}"
fi

echo ""
echo "2. Checking frontend environment variables..."
cd "$FRONTEND_DIR"
if [ -f .env.local ]; then
    echo -e "${GREEN}✓ Frontend .env.local exists${NC}"
    BACKEND_URL=$(grep NEXT_PUBLIC_BACKEND_URL .env.local | cut -d '=' -f2)
    echo "   Backend URL: $BACKEND_URL"
    if [[ "$BACKEND_URL" == *"/v1"* ]] || [[ "$BACKEND_URL" == *"/v1" ]]; then
        echo -e "${GREEN}✓ Backend URL has /v1 prefix${NC}"
    else
        echo -e "${YELLOW}⚠ Backend URL missing /v1 prefix${NC}"
        echo "   Should be: http://localhost:8000/v1"
    fi
else
    echo -e "${RED}✗ Frontend .env.local missing${NC}"
fi

echo ""
echo "3. Checking if ports are available..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 8000 already in use${NC}"
    lsof -i:8000
else
    echo -e "${GREEN}✓ Port 8000 available${NC}"
fi

if lsof -i:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 already in use${NC}"
    lsof -i:3000
else
    echo -e "${GREEN}✓ Port 3000 available${NC}"
fi

echo ""
echo "4. Checking backend API routes..."
cd "$BACKEND_DIR"
if grep -q 'prefix="/v1"' api.py; then
    echo -e "${GREEN}✓ Backend configured with /v1 prefix${NC}"
else
    echo -e "${RED}✗ Backend missing /v1 prefix${NC}"
fi

echo ""
echo "5. Checking if checkpointer fixes are present..."
if [ -f "$BACKEND_DIR/core/agents/checkpointer.py" ]; then
    SIZE=$(wc -c < "$BACKEND_DIR/core/agents/checkpointer.py")
    if [ "$SIZE" -gt 3000 ]; then
        echo -e "${GREEN}✓ Checkpointer has Task 3 fixes (${SIZE} bytes)${NC}"
    else
        echo -e "${RED}✗ Checkpointer is old version (${SIZE} bytes, should be ~3847)${NC}"
    fi
else
    echo -e "${RED}✗ Checkpointer file missing${NC}"
fi

echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo ""
echo "To start backend:"
echo "  cd $BACKEND_DIR"
echo "  python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload"
echo ""
echo "To start frontend:"
echo "  cd $FRONTEND_DIR"
echo "  npm run dev"
echo ""
echo "Then test compatibility:"
echo "  curl http://127.0.0.1:8000/v1/health"
echo "  open http://localhost:3000"
echo ""
