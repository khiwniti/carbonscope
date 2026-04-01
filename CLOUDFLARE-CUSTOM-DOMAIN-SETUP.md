# Cloudflare Custom Domain Setup Guide

## Overview

Configure `carbonscope.ensimu.space` to point to your Azure-deployed BKS cBIM AI application.

## Prerequisites

- ✅ Application deployed to Azure App Service
  - Frontend: `suna-frontend-app.azurewebsites.net`
  - Backend: `suna-backend-app.azurewebsites.net`
- Access to Cloudflare DNS management for `ensimu.space`
- Azure CLI access (for domain verification)

## Step 1: Add Custom Domain to Azure App Service

### 1.1 Get App Service IP (Optional - for A record)

```bash
# Get the IP address of your frontend app
az webapp show \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --query "outboundIpAddresses" \
  --output tsv
```

### 1.2 Add Custom Domain to App Service

```bash
# Add custom domain to frontend app
az webapp config hostname add \
  --webapp-name suna-frontend-app \
  --resource-group suna-bim-rg \
  --hostname carbonscope.ensimu.space
```

**Note**: This command may initially fail with a domain verification error. That's expected - we'll configure DNS next.

## Step 2: Configure DNS in Cloudflare

### Option A: CNAME Record (Recommended)

Log into Cloudflare → Select `ensimu.space` domain → DNS Records

**Add CNAME Record**:
- **Type**: CNAME
- **Name**: `carbonscope`
- **Target**: `suna-frontend-app.azurewebsites.net`
- **TTL**: Auto
- **Proxy status**: 🟠 DNS only (click the cloud icon to disable proxy)

**Why DNS only?**: Azure App Service needs to see the original hostname for SSL certificate binding. Once SSL is configured, you can enable Cloudflare proxy for CDN benefits.

### Option B: A Record (Alternative)

If you prefer an A record:

1. Get your App Service IP:
   ```bash
   az webapp show \
     --name suna-frontend-app \
     --resource-group suna-bim-rg \
     --query "defaultHostName" \
     --output tsv
   ```

2. Resolve to IP:
   ```bash
   nslookup suna-frontend-app.azurewebsites.net
   ```

3. Add A Record in Cloudflare:
   - **Type**: A
   - **Name**: `carbonscope`
   - **IPv4 address**: [IP from step 2]
   - **TTL**: Auto
   - **Proxy status**: 🟠 DNS only

### 2.1 Add Domain Verification TXT Record

Azure requires a TXT record for domain ownership verification:

1. Get verification code:
   ```bash
   az webapp config hostname get-external-ip \
     --webapp-name suna-frontend-app \
     --resource-group suna-bim-rg
   ```

2. The verification domain will be shown. Add this TXT record in Cloudflare:
   - **Type**: TXT
   - **Name**: `asuid.carbonscope`
   - **Content**: [Verification code from Azure]
   - **TTL**: Auto

## Step 3: Wait for DNS Propagation

DNS changes can take 5-60 minutes to propagate globally. Check propagation status:

```bash
# Check CNAME propagation
dig carbonscope.ensimu.space CNAME +short

# Check TXT record propagation
dig asuid.carbonscope.ensimu.space TXT +short

# Test from different DNS servers
nslookup carbonscope.ensimu.space 8.8.8.8  # Google DNS
nslookup carbonscope.ensimu.space 1.1.1.1  # Cloudflare DNS
```

## Step 4: Complete Domain Addition in Azure

Once DNS propagates, retry adding the custom domain:

```bash
# Add custom domain (should succeed now)
az webapp config hostname add \
  --webapp-name suna-frontend-app \
  --resource-group suna-bim-rg \
  --hostname carbonscope.ensimu.space
```

## Step 5: Enable HTTPS with Managed Certificate

Azure provides free managed SSL certificates for custom domains:

```bash
# Create managed certificate binding
az webapp config ssl bind \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Enable HTTPS redirect
az webapp update \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --https-only true
```

**Certificate provisioning takes 5-10 minutes**. Azure will automatically validate domain ownership and issue a certificate.

## Step 6: Update Environment Variables

Update your frontend app to use the custom domain:

```bash
# Update environment variables
az webapp config appsettings set \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --settings \
    NEXT_PUBLIC_API_URL="https://suna-backend-app.azurewebsites.net" \
    NEXT_PUBLIC_APP_URL="https://carbonscope.ensimu.space" \
    NODE_ENV=production
```

## Step 7: Configure Backend CORS (If Needed)

If your frontend and backend are on different domains, configure CORS on the backend:

```bash
az webapp cors add \
  --name suna-backend-app \
  --resource-group suna-bim-rg \
  --allowed-origins "https://carbonscope.ensimu.space"
```

## Step 8: Optional - Enable Cloudflare Proxy

Once SSL is working on Azure, you can enable Cloudflare's proxy for additional benefits:

1. Go to Cloudflare DNS settings
2. Click the cloud icon next to `carbonscope` CNAME record
3. Change from 🟠 DNS only to 🟧 Proxied

**Benefits**:
- DDoS protection
- CDN caching
- Page rules and firewall
- Analytics

**Note**: Ensure SSL/TLS mode in Cloudflare is set to "Full (strict)" for end-to-end encryption.

## Verification

### Test the Domain

```bash
# Check DNS resolution
dig carbonscope.ensimu.space

# Test HTTPS
curl -I https://carbonscope.ensimu.space

# Test in browser
# Visit: https://carbonscope.ensimu.space
```

### Expected Results

- ✅ DNS resolves to App Service
- ✅ HTTPS certificate is valid
- ✅ Application loads correctly
- ✅ No mixed content warnings
- ✅ API calls work (check browser console)

## Troubleshooting

### "Domain verification failed"

**Solution**:
1. Verify TXT record is present: `dig asuid.carbonscope.ensimu.space TXT`
2. Wait longer for DNS propagation (up to 48 hours in rare cases)
3. Try removing and re-adding the domain

### "Certificate provisioning failed"

**Solutions**:
1. Ensure CNAME/A record points directly to Azure (not proxied through Cloudflare)
2. Verify domain verification TXT record exists
3. Wait 10-15 minutes and check again
4. Check App Service logs for detailed error messages

### "502 Bad Gateway" on custom domain

**Solutions**:
1. Verify App Service is running: Visit `suna-frontend-app.azurewebsites.net` directly
2. Check application logs: `az webapp log tail --name suna-frontend-app --resource-group suna-bim-rg`
3. Restart the app: `az webapp restart --name suna-frontend-app --resource-group suna-bim-rg`

### "Mixed content" warnings

**Solution**:
- Ensure all internal links use `https://`
- Update API URL environment variable to use HTTPS
- Check for hardcoded HTTP URLs in code

### Cloudflare "Too many redirects"

**Solution**:
1. In Cloudflare SSL/TLS settings, set mode to "Full (strict)"
2. Ensure Azure App Service has `--https-only true` enabled
3. Clear browser cache and cookies

## Quick Command Reference

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name suna-frontend-app \
  --resource-group suna-bim-rg \
  --hostname carbonscope.ensimu.space

# Enable SSL
az webapp config ssl bind \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Force HTTPS
az webapp update \
  --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --https-only true

# List custom domains
az webapp config hostname list \
  --webapp-name suna-frontend-app \
  --resource-group suna-bim-rg

# View SSL certificates
az webapp config ssl list \
  --resource-group suna-bim-rg
```

## Security Best Practices

1. **Always use HTTPS**: Enable `--https-only true`
2. **HTTP/2 Support**: Automatically enabled with SSL
3. **Security Headers**: Configure in `web.config` or Next.js headers
4. **Rate Limiting**: Use Cloudflare's rate limiting features
5. **DDoS Protection**: Enable Cloudflare proxy after SSL setup
6. **Firewall Rules**: Configure Azure App Service IP restrictions if needed

## Backend Custom Domain (Optional)

If you want a custom domain for the backend API:

```bash
# Add api.carbonscope.ensimu.space for backend
az webapp config hostname add \
  --webapp-name suna-backend-app \
  --resource-group suna-bim-rg \
  --hostname api.carbonscope.ensimu.space
```

Add CNAME in Cloudflare:
- **Name**: `api.carbonscope`
- **Target**: `suna-backend-app.azurewebsites.net`

## Next Steps

1. ✅ Configure DNS in Cloudflare
2. ✅ Add custom domain to Azure
3. ✅ Enable SSL certificate
4. ✅ Test HTTPS access
5. ⏳ Enable Cloudflare proxy (optional)
6. ⏳ Configure monitoring alerts
7. ⏳ Set up custom error pages
8. ⏳ Configure CDN caching rules

## Support Resources

- [Azure Custom Domains](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain)
- [Azure Managed Certificates](https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate)
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [Cloudflare SSL](https://developers.cloudflare.com/ssl/)
