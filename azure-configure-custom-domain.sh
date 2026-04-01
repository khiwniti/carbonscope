#!/bin/bash
# Configure Custom Domain for Azure App Service
# Usage: ./azure-configure-custom-domain.sh carbonscope.ensimu.space

set -e

CUSTOM_DOMAIN="${1:-carbonscope.ensimu.space}"
RESOURCE_GROUP="suna-bim-rg"
FRONTEND_APP="suna-frontend-app"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Custom Domain Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo
echo -e "${BLUE}Domain:${NC} $CUSTOM_DOMAIN"
echo -e "${BLUE}App Service:${NC} $FRONTEND_APP"
echo

# Step 1: Get verification information
echo -e "${YELLOW}[1/5]${NC} Getting domain verification information..."
VERIFICATION_INFO=$(az webapp config hostname get-external-ip \
    --webapp-name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" 2>/dev/null || echo "")

if [ -n "$VERIFICATION_INFO" ]; then
    echo -e "${GREEN}[✓]${NC} Verification information retrieved"
    echo
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  DNS Configuration Required${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo
    echo "Add the following records in Cloudflare DNS:"
    echo
    echo -e "${BLUE}1. CNAME Record:${NC}"
    echo "   Type: CNAME"
    echo "   Name: carbonscope"
    echo "   Target: suna-frontend-app.azurewebsites.net"
    echo "   Proxy: 🟠 DNS only (disable proxy initially)"
    echo
    echo -e "${BLUE}2. TXT Record for verification:${NC}"
    echo "   Type: TXT"
    echo "   Name: asuid.carbonscope"
    echo "   Content: (check Azure portal for verification code)"
    echo
else
    echo -e "${RED}[✗]${NC} Could not retrieve verification information"
fi

# Step 2: Wait for DNS propagation
echo
echo -e "${YELLOW}[2/5]${NC} Checking DNS propagation..."
echo -e "${YELLOW}[i]${NC} Waiting for DNS records to propagate (this may take 5-60 minutes)..."
echo

MAX_ATTEMPTS=60
ATTEMPT=0
DNS_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    CNAME_RESULT=$(dig +short "$CUSTOM_DOMAIN" CNAME 2>/dev/null || echo "")

    if [[ "$CNAME_RESULT" == *"azurewebsites.net"* ]]; then
        echo -e "${GREEN}[✓]${NC} DNS CNAME record propagated successfully"
        DNS_READY=true
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $((ATTEMPT % 10)) -eq 0 ]; then
        echo -e "${YELLOW}[i]${NC} Still waiting... ($ATTEMPT/$MAX_ATTEMPTS attempts)"
    fi
    sleep 10
done

if [ "$DNS_READY" = false ]; then
    echo -e "${YELLOW}[!]${NC} DNS not fully propagated yet. You can:"
    echo "   1. Wait longer and retry this script"
    echo "   2. Continue manually once DNS propagates"
    echo "   3. Check DNS: dig $CUSTOM_DOMAIN CNAME"
    echo
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Add custom domain to App Service
echo
echo -e "${YELLOW}[3/5]${NC} Adding custom domain to App Service..."

if az webapp config hostname add \
    --webapp-name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --hostname "$CUSTOM_DOMAIN" 2>/dev/null; then
    echo -e "${GREEN}[✓]${NC} Custom domain added successfully"
else
    echo -e "${RED}[✗]${NC} Failed to add custom domain"
    echo
    echo "Common issues:"
    echo "  1. DNS records not propagated yet (wait longer)"
    echo "  2. TXT verification record missing or incorrect"
    echo "  3. Domain already added to another App Service"
    echo
    echo "Manual verification:"
    echo "  Check DNS: dig $CUSTOM_DOMAIN CNAME"
    echo "  Check TXT: dig asuid.${CUSTOM_DOMAIN#*.} TXT"
    echo
    exit 1
fi

# Step 4: Enable HTTPS with managed certificate
echo
echo -e "${YELLOW}[4/5]${NC} Enabling HTTPS with managed certificate..."
echo -e "${YELLOW}[i]${NC} This may take 5-10 minutes..."

if az webapp config ssl bind \
    --name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --certificate-thumbprint auto \
    --ssl-type SNI 2>/dev/null; then
    echo -e "${GREEN}[✓]${NC} SSL certificate bound successfully"
else
    echo -e "${YELLOW}[!]${NC} SSL binding may need more time"
    echo "   You can retry with: az webapp config ssl bind --name $FRONTEND_APP --resource-group $RESOURCE_GROUP --certificate-thumbprint auto --ssl-type SNI"
fi

# Step 5: Force HTTPS redirect
echo
echo -e "${YELLOW}[5/5]${NC} Forcing HTTPS redirect..."

if az webapp update \
    --name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --https-only true \
    --output none 2>/dev/null; then
    echo -e "${GREEN}[✓]${NC} HTTPS-only mode enabled"
else
    echo -e "${YELLOW}[!]${NC} Could not enable HTTPS-only mode"
fi

# Summary
echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Configuration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "${BLUE}Custom Domain:${NC} https://$CUSTOM_DOMAIN"
echo -e "${BLUE}SSL Status:${NC} Managed certificate provisioning (may take 5-10 min)"
echo -e "${BLUE}HTTPS Redirect:${NC} Enabled"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Wait 5-10 minutes for SSL certificate to provision"
echo "  2. Test your domain: https://$CUSTOM_DOMAIN"
echo "  3. Enable Cloudflare proxy (orange cloud) for CDN benefits"
echo "  4. Set Cloudflare SSL/TLS mode to 'Full (strict)'"
echo
echo -e "${BLUE}Verification:${NC}"
echo "  curl -I https://$CUSTOM_DOMAIN"
echo "  az webapp config ssl list --resource-group $RESOURCE_GROUP"
echo

# Show current custom domains
echo -e "${YELLOW}[i]${NC} Current custom domains:"
az webapp config hostname list \
    --webapp-name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[].name" \
    --output tsv

echo
echo -e "${GREEN}[✓]${NC} Done!"
