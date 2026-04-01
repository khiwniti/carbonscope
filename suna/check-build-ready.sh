#!/bin/bash
# Auto-checker for build readiness

echo "🔍 Checking pnpm install status..."
echo ""

cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna

# Check if pnpm install is still running
PNPM_RUNNING=$(ps aux | grep "pnpm install" | grep -v grep | wc -l)

if [ $PNPM_RUNNING -gt 0 ]; then
    echo "⏳ pnpm install is still running..."
    echo "   Packages being installed: $(ls node_modules/.pnpm 2>/dev/null | wc -l)"
    echo ""
    echo "💡 You can:"
    echo "   1. Wait for it to complete (may take 3-5 more minutes)"
    echo "   2. Run this script again later: ./check-build-ready.sh"
    echo "   3. Check status manually: ps aux | grep pnpm"
    exit 0
fi

echo "✅ pnpm install completed!"
echo ""

# Check if node_modules exists in frontend
if [ -d "apps/frontend/node_modules" ] || [ -L "apps/frontend/node_modules" ]; then
    echo "✅ Frontend node_modules ready"
else
    echo "❌ Frontend node_modules not found"
    exit 1
fi

echo ""
echo "🚀 Ready to test build!"
echo ""
echo "Run these commands:"
echo "   cd apps/frontend"
echo "   NODE_ENV=production pnpm build"
echo ""
echo "Or run automatically:"
read -p "Test build now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/frontend
    echo "🔨 Building..."
    NODE_ENV=production pnpm build
fi
