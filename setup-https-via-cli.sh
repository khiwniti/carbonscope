#!/bin/bash
# =============================================================================
# Setup HTTPS with Caddy via Azure CLI
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔒 Setting up HTTPS with Caddy..."
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'SETUPHTTPS'
#!/bin/bash
set -e

# Install Caddy
if ! command -v caddy &> /dev/null; then
    echo "Installing Caddy..."
    apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install -y caddy
fi

# Create Caddyfile
cat > /etc/caddy/Caddyfile << 'CADDYFILE'
carbon-bim.ensimu.space {
    reverse_proxy localhost:3000
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
    log {
        output file /var/log/caddy/carbon-bim.log
    }
}

api.carbon-bim.ensimu.space {
    reverse_proxy localhost:8000
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
    log {
        output file /var/log/caddy/api.carbon-bim.log
    }
}

graphdb.carbon-bim.ensimu.space {
    reverse_proxy localhost:7200
    encode gzip
    log {
        output file /var/log/caddy/graphdb.carbon-bim.log
    }
}
CADDYFILE

# Create log directory
mkdir -p /var/log/caddy
chown -R caddy:caddy /var/log/caddy

# Reload Caddy
systemctl reload caddy
systemctl status caddy --no-pager

echo ""
echo "✅ HTTPS configured with Caddy!"

SETUPHTTPS
) --query "value[0].message" -o tsv

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "📝 Next: Configure Cloudflare DNS"
echo "   Go to: https://dash.cloudflare.com"
echo "   Domain: ensimu.space"
echo "   Add these A records (all Proxied):"
echo ""
echo "   Type | Name               | Content"
echo "   -----|--------------------|--------------"
echo "   A    | carbon-bim         | 20.55.21.69"
echo "   A    | api.carbon-bim     | 20.55.21.69"
echo "   A    | graphdb.carbon-bim | 20.55.21.69"
echo ""
echo "   SSL/TLS: Set to 'Full (strict)'"
echo ""
echo "🌐 After DNS propagation (2-5 minutes), access at:"
echo "   https://carbon-bim.ensimu.space"
echo "   https://api.carbon-bim.ensimu.space"
echo "   https://graphdb.carbon-bim.ensimu.space"
echo ""
