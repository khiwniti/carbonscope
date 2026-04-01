#!/bin/bash
set -e

# BIM Agent SaaS - Azure VM Deployment Script
# This script creates an Azure B1s VM with retry logic across multiple regions

echo "🚀 BIM Agent SaaS - Azure Free Tier Deployment"
echo "=============================================="

# Configuration
RESOURCE_GROUP="bim-agent-rg"
VM_NAME="bim-agent-vm"
VM_SIZE="Standard_B1s"
VM_IMAGE="Ubuntu2204"
ADMIN_USERNAME="azureuser"

# Regions to try (ordered by proximity to Thailand)
REGIONS=("japaneast" "koreacentral" "eastus" "westeurope")

# Function to create VM in a specific region
create_vm_in_region() {
    local region=$1
    local rg_name="${RESOURCE_GROUP}-${region}"

    echo ""
    echo "📍 Trying region: $region"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Create resource group
    echo "Creating resource group: $rg_name"
    az group create \
        --name "$rg_name" \
        --location "$region" \
        --output none

    # Try to create VM
    echo "Creating VM: $VM_NAME (this may take 2-3 minutes)..."
    if az vm create \
        --resource-group "$rg_name" \
        --name "$VM_NAME" \
        --image "$VM_IMAGE" \
        --size "$VM_SIZE" \
        --admin-username "$ADMIN_USERNAME" \
        --generate-ssh-keys \
        --public-ip-sku Standard \
        --public-ip-address-allocation static \
        --output json > /tmp/vm-create-output.json 2>&1; then

        # Success! Extract IP
        VM_IP=$(cat /tmp/vm-create-output.json | python3 -c "import sys, json; print(json.load(sys.stdin)['publicIpAddress'])")

        echo ""
        echo "✅ VM Created Successfully!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Region: $region"
        echo "Resource Group: $rg_name"
        echo "VM Name: $VM_NAME"
        echo "Public IP: $VM_IP"
        echo ""

        # Open ports
        echo "Opening ports 80 and 443..."
        az vm open-port --resource-group "$rg_name" --name "$VM_NAME" --port 80 --priority 1000 --output none
        az vm open-port --resource-group "$rg_name" --name "$VM_NAME" --port 443 --priority 1001 --output none

        # Save configuration
        cat > ../vm-info.txt << EOF
VM_IP=$VM_IP
VM_RESOURCE_GROUP=$rg_name
VM_REGION=$region
VM_NAME=$VM_NAME
VM_USERNAME=$ADMIN_USERNAME
EOF

        echo "📝 VM information saved to: azure-deployment/vm-info.txt"
        echo ""
        echo "🔑 SSH Connection:"
        echo "   ssh $ADMIN_USERNAME@$VM_IP"
        echo ""
        echo "📋 Next Steps:"
        echo "   1. Connect to VM: ssh $ADMIN_USERNAME@$VM_IP"
        echo "   2. Run setup script: ./scripts/setup-vm.sh"
        echo ""

        return 0
    else
        echo "❌ Failed to create VM in $region"
        cat /tmp/vm-create-output.json 2>/dev/null | grep -i "error\|message" | head -5

        # Clean up failed resource group
        echo "Cleaning up resource group..."
        az group delete --name "$rg_name" --yes --no-wait --output none

        return 1
    fi
}

# Main execution
echo "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

echo "✅ Authenticated to Azure"
echo ""

# Try each region until one succeeds
for region in "${REGIONS[@]}"; do
    if create_vm_in_region "$region"; then
        echo "🎉 Deployment Complete!"
        exit 0
    fi
    echo ""
    echo "Trying next region..."
    sleep 2
done

echo ""
echo "❌ Failed to create VM in all regions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Alternatives:"
echo "   1. Try larger VM size: Standard_B1ms or Standard_B2s"
echo "   2. Use Azure App Service instead of VM"
echo "   3. Contact Azure support to increase quota"
echo ""
exit 1
