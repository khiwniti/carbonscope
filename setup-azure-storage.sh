#!/bin/bash
set -e

# =============================================================================
# Azure Storage Account Setup for GraphDB Persistence
# =============================================================================
# GraphDB needs persistent storage for its data. This script creates an Azure
# Storage Account with File Shares for GraphDB data and work directories.
# =============================================================================

RESOURCE_GROUP="carbon-bim-rg"
LOCATION="southeastasia"
STORAGE_ACCOUNT_NAME="sunagraphdb${RANDOM}"
SKU="Standard_LRS"  # Locally redundant storage

echo "🗄️  Setting up Azure Storage for GraphDB Persistence"
echo "====================================================="
echo ""

# Create Storage Account
echo "📦 Creating Storage Account: ${STORAGE_ACCOUNT_NAME}"
az storage account create \
  --name ${STORAGE_ACCOUNT_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --location ${LOCATION} \
  --sku ${SKU} \
  --kind StorageV2 \
  --https-only true \
  --min-tls-version TLS1_2

# Get storage account key
echo ""
echo "🔑 Retrieving storage account key..."
STORAGE_KEY=$(az storage account keys list \
  --resource-group ${RESOURCE_GROUP} \
  --account-name ${STORAGE_ACCOUNT_NAME} \
  --query '[0].value' -o tsv)

# Create file shares for GraphDB
echo ""
echo "📁 Creating file shares for GraphDB..."

az storage share create \
  --name graphdb-data \
  --account-name ${STORAGE_ACCOUNT_NAME} \
  --account-key ${STORAGE_KEY} \
  --quota 50

az storage share create \
  --name graphdb-work \
  --account-name ${STORAGE_ACCOUNT_NAME} \
  --account-key ${STORAGE_KEY} \
  --quota 10

echo ""
echo "✅ Azure Storage setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "   Storage Account: ${STORAGE_ACCOUNT_NAME}"
echo "   Resource Group: ${RESOURCE_GROUP}"
echo "   Location: ${LOCATION}"
echo "   File Shares:"
echo "     - graphdb-data (50 GB)"
echo "     - graphdb-work (10 GB)"
echo ""
echo "🔐 Storage Account Key (save this securely):"
echo "${STORAGE_KEY}"
echo ""
echo "📝 Update azure-container-group-production-with-graphdb.yaml with:"
echo "   storageAccountName: ${STORAGE_ACCOUNT_NAME}"
echo "   storageAccountKey: ${STORAGE_KEY}"
echo ""
echo "💾 Credentials saved to: .azure-storage-credentials.txt"
cat > .azure-storage-credentials.txt << EOF
STORAGE_ACCOUNT_NAME=${STORAGE_ACCOUNT_NAME}
STORAGE_ACCOUNT_KEY=${STORAGE_KEY}
RESOURCE_GROUP=${RESOURCE_GROUP}
LOCATION=${LOCATION}
EOF

echo ""
echo "⚠️  IMPORTANT: Add .azure-storage-credentials.txt to .gitignore!"
echo "   Never commit this file to version control."
