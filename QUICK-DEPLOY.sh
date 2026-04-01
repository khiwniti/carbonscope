#!/bin/bash
# Quick deployment guide for Azure ACR

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Azure ACR Deployment - Quick Start Guide              ║"
echo "║   BKS cBIM AI Platform                                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Prerequisites Check:"
echo ""

# Check Azure CLI
if command -v az &> /dev/null; then
    echo "  ✅ Azure CLI installed ($(az version -o tsv | head -1))"
else
    echo "  ❌ Azure CLI not found"
    echo "     Install: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "  ✅ Docker installed ($(docker --version))"
else
    echo "  ❌ Docker not found"
    echo "     Install: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check Azure login
if az account show &> /dev/null; then
    SUBSCRIPTION=$(az account show --query name -o tsv)
    echo "  ✅ Logged into Azure (Subscription: $SUBSCRIPTION)"
else
    echo "  ⚠️  Not logged into Azure"
    echo "     Run: az login"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Deployment Steps:"
echo ""
echo "  Step 1: Build and push to Azure Container Registry"
echo "          → ./azure-acr-setup.sh"
echo ""
echo "  Step 2a: Deploy to Container Instances (Development)"
echo "           → ./azure-deploy-aci.sh"
echo "           Cost: ~\$0.10/hour per container"
echo ""
echo "  Step 2b: Deploy to App Service (Production)"
echo "           → ./azure-deploy-app-service.sh"
echo "           Cost: ~\$55/month (includes both apps)"
echo ""
echo "  Step 3: Set up CI/CD (Optional)"
echo "          → Configure GitHub Actions secrets"
echo "          → Push to main branch for auto-deployment"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   • AZURE-ACR-DEPLOYMENT.md - Complete guide"
echo "   • DEPLOYMENT-COMPLETE.md - Summary & checklist"
echo ""
echo "🆘 Support:"
echo "   • Troubleshooting: See AZURE-ACR-DEPLOYMENT.md"
echo "   • Test locally: docker-compose -f docker-compose.acr-test.yml up"
echo ""
echo "Ready to start? Run: ./azure-acr-setup.sh"
echo ""
