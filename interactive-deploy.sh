#!/bin/bash
set -e

echo "🚀 SUNA Production Deployment - Interactive Guide"
echo "=================================================="
echo ""

# Step 1: Check prerequisites
echo "Step 1/5: Checking prerequisites..."
echo ""

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi
echo "✅ Azure CLI installed"

# Check Azure authentication
if ! az account show &> /dev/null; then
    echo "❌ Not authenticated with Azure. Run: az login"
    exit 1
fi
echo "✅ Azure authenticated"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker installed"

if ! docker ps &> /dev/null; then
    echo "❌ Docker not running. Start Docker Desktop or daemon"
    exit 1
fi
echo "✅ Docker running"

echo ""
echo "All prerequisites met! ✅"
echo ""

# Step 2: Configure secrets
echo "Step 2/5: Configuring secrets..."
echo ""

read -p "Do you want to set up Azure Key Vault for secrets? (recommended) [y/n]: " SETUP_KV

if [ "$SETUP_KV" = "y" ]; then
    echo "Running Key Vault setup..."
    if [ -f "./azure-keyvault-setup.sh" ]; then
        chmod +x azure-keyvault-setup.sh
        ./azure-keyvault-setup.sh
    else
        echo "⚠️  azure-keyvault-setup.sh not found, skipping..."
    fi
else
    echo "Skipping Key Vault setup. You'll need to manually configure secrets."
fi

echo ""

# Step 3: Build and push images
echo "Step 3/5: Building and pushing Docker images..."
echo ""

read -p "Build and push images to ACR? [y/n]: " BUILD_IMAGES

if [ "$BUILD_IMAGES" = "y" ]; then
    if [ -f "./deploy-to-acr.sh" ]; then
        chmod +x deploy-to-acr.sh
        ./deploy-to-acr.sh
    else
        echo "❌ deploy-to-acr.sh not found"
        exit 1
    fi
else
    echo "⚠️  Skipping image build. Make sure images exist in ACR!"
    read -p "Press Enter to continue..."
fi

echo ""

# Step 4: Configure deployment
echo "Step 4/5: Configuring deployment..."
echo ""

if [ -f "azure-container-group-production.yaml" ]; then
    # Check for placeholders
    if grep -q "YOUR_" azure-container-group-production.yaml; then
        echo "⚠️  Found placeholder values in azure-container-group-production.yaml"
        echo ""
        echo "Required values to replace:"
        grep -n "YOUR_" azure-container-group-production.yaml | head -10
        echo ""
        read -p "Open file for editing? [y/n]: " EDIT_FILE
        
        if [ "$EDIT_FILE" = "y" ]; then
            ${EDITOR:-nano} azure-container-group-production.yaml
        fi
        
        # Verify again
        if grep -q "YOUR_" azure-container-group-production.yaml; then
            echo ""
            echo "⚠️  Placeholders still found. Please replace all YOUR_* values before deployment."
            read -p "Continue anyway? [y/n]: " CONTINUE
            if [ "$CONTINUE" != "y" ]; then
                echo "Deployment cancelled. Edit azure-container-group-production.yaml and run again."
                exit 1
            fi
        fi
    else
        echo "✅ No placeholders found in configuration"
    fi
else
    echo "❌ azure-container-group-production.yaml not found"
    exit 1
fi

echo ""

# Step 5: Deploy to Azure
echo "Step 5/5: Deploying to Azure..."
echo ""

read -p "Deploy to Azure Container Instances? [y/n]: " DEPLOY

if [ "$DEPLOY" = "y" ]; then
    if [ -f "./azure-deploy-production.sh" ]; then
        chmod +x azure-deploy-production.sh
        ./azure-deploy-production.sh
    else
        echo "❌ azure-deploy-production.sh not found"
        exit 1
    fi
else
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "Next steps:"
echo "1. Configure custom domain and SSL"
echo "2. Set up Application Insights monitoring"
echo "3. Run smoke tests"
echo "4. Configure alerts"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed post-deployment steps"
