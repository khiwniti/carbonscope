#!/bin/bash
set -e

# =============================================================================
# Azure Key Vault Setup for SUNA Production Secrets
# =============================================================================
# This script creates an Azure Key Vault and stores all production secrets
# =============================================================================

RESOURCE_GROUP="carbon-bim-rg"
LOCATION="southeastasia"
KEYVAULT_NAME="suna-secrets-${RANDOM}"
ACR_NAME="carbonbimbc6740962ecd"

echo "🔐 Setting up Azure Key Vault for SUNA"
echo "======================================"

# Create Key Vault
echo ""
echo "📦 Creating Key Vault: ${KEYVAULT_NAME}"
az keyvault create \
  --name ${KEYVAULT_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --location ${LOCATION} \
  --enable-rbac-authorization false

# Generate encryption keys
echo ""
echo "🔑 Generating encryption keys..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
MCP_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Store secrets in Key Vault
echo ""
echo "💾 Storing secrets in Key Vault..."

# Backend secrets
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "ENCRYPTION-KEY" --value "${ENCRYPTION_KEY}"
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "MCP-CREDENTIAL-ENCRYPTION-KEY" --value "${MCP_ENCRYPTION_KEY}"

# Prompt for manual secrets
echo ""
echo "📝 Please provide the following secrets:"
echo ""

read -p "Supabase URL: " SUPABASE_URL
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "SUPABASE-URL" --value "${SUPABASE_URL}"

read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "SUPABASE-ANON-KEY" --value "${SUPABASE_ANON_KEY}"

read -sp "Supabase Service Role Key: " SUPABASE_SERVICE_KEY
echo ""
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "SUPABASE-SERVICE-ROLE-KEY" --value "${SUPABASE_SERVICE_KEY}"

read -sp "Database URL: " DATABASE_URL
echo ""
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "DATABASE-URL" --value "${DATABASE_URL}"

read -sp "Redis Password: " REDIS_PASSWORD
echo ""
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "REDIS-PASSWORD" --value "${REDIS_PASSWORD}"

read -p "Daytona API Key (optional): " DAYTONA_KEY
if [ ! -z "${DAYTONA_KEY}" ]; then
  az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "DAYTONA-API-KEY" --value "${DAYTONA_KEY}"
fi

read -p "Admin API Key: " ADMIN_KEY
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name "KORTIX-ADMIN-API-KEY" --value "${ADMIN_KEY}"

# Create managed identity for container access
echo ""
echo "🆔 Creating managed identity..."
IDENTITY_NAME="suna-container-identity"
az identity create \
  --name ${IDENTITY_NAME} \
  --resource-group ${RESOURCE_GROUP}

IDENTITY_ID=$(az identity show --name ${IDENTITY_NAME} --resource-group ${RESOURCE_GROUP} --query id -o tsv)
IDENTITY_CLIENT_ID=$(az identity show --name ${IDENTITY_NAME} --resource-group ${RESOURCE_GROUP} --query clientId -o tsv)

# Grant Key Vault access to managed identity
echo ""
echo "🔓 Granting Key Vault access..."
az keyvault set-policy \
  --name ${KEYVAULT_NAME} \
  --object-id $(az identity show --name ${IDENTITY_NAME} --resource-group ${RESOURCE_GROUP} --query principalId -o tsv) \
  --secret-permissions get list

echo ""
echo "✅ Key Vault setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "   Key Vault Name: ${KEYVAULT_NAME}"
echo "   Managed Identity: ${IDENTITY_NAME}"
echo "   Identity Client ID: ${IDENTITY_CLIENT_ID}"
echo ""
echo "🎯 Next steps:"
echo "   1. Update azure-container-group.yaml with managed identity"
echo "   2. Reference secrets using Key Vault URIs"
echo "   3. Deploy containers with: ./azure-deploy-aci.sh"
echo ""
echo "💡 To retrieve a secret:"
echo "   az keyvault secret show --vault-name ${KEYVAULT_NAME} --name SECRET-NAME --query value -o tsv"
