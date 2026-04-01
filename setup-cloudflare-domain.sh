#!/bin/bash
set -e

# =============================================================================
# Setup Cloudflare Domain with Caddy Reverse Proxy
# =============================================================================
# Run this ON the coder-vm after services are deployed
# Domain: https://carbon-bim.ensimu.space
# =============================================================================

DOMAIN="carbon-bim.ensimu.space"

echo "🌐 Setting up Cloudflare domain: ${DOMAIN}"
echo "============================================"
echo ""

# Install Caddy (modern web server with automatic HTTPS)
echo "📦 Installing Caddy..."
if ! command -v caddy &> /dev/null; then
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install -y caddy
    echo "✅ Caddy installed"
else
    echo "✅ Caddy already installed"
fi

# Create Caddyfile
echo "📝 Creating Caddyfile..."
sudo tee /etc/caddy/Caddyfile > /dev/null << 'EOF'
# Main domain - Frontend
carbon-bim.ensimu.space {
    # Frontend (Next.js)
    reverse_proxy localhost:3000

    # Enable compression
    encode gzip

    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Prevent content-type sniffing
        X-Content-Type-Options "nosniff"
        # XSS protection
        X-XSS-Protection "1; mode=block"
        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Logs
    log {
        output file /var/log/caddy/carbon-bim.log
        format console
    }
}

# API subdomain - Backend
api.carbon-bim.ensimu.space {
    # Backend (FastAPI)
    reverse_proxy localhost:8000

    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    log {
        output file /var/log/caddy/api.carbon-bim.log
        format console
    }
}

# GraphDB subdomain - GraphDB Workbench
graphdb.carbon-bim.ensimu.space {
    # GraphDB
    reverse_proxy localhost:7200

    encode gzip

    # Basic auth for security (optional)
    # basicauth {
    #     admin $2a$14$hashed_password
    # }

    log {
        output file /var/log/caddy/graphdb.carbon-bim.log
        format console
    }
}
EOF

# Create log directory
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy

# Reload Caddy
echo "🔄 Reloading Caddy..."
sudo systemctl reload caddy

# Check Caddy status
echo ""
echo "📊 Caddy Status:"
sudo systemctl status caddy --no-pager

echo ""
echo "✅ Cloudflare domain configured!"
echo ""
echo "🌐 Your services are now available at:"
echo "   Frontend: https://carbon-bim.ensimu.space"
echo "   Backend API: https://api.carbon-bim.ensimu.space"
echo "   GraphDB: https://graphdb.carbon-bim.ensimu.space"
echo ""
echo "📝 Cloudflare DNS Configuration:"
echo "   Add these DNS records in your Cloudflare dashboard:"
echo ""
echo "   Type  | Name     | Content (VM IP)"
echo "   ------|----------|------------------"
echo "   A     | @        | 20.55.21.69"
echo "   A     | api      | 20.55.21.69"
echo "   A     | graphdb  | 20.55.21.69"
echo ""
echo "   Proxy Status: ✅ Proxied (orange cloud) - Cloudflare will provide DDoS protection"
echo ""
echo "🔒 SSL Certificates:"
echo "   Caddy will automatically obtain and renew Let's Encrypt certificates"
echo "   This happens on first request to each domain"
echo ""
echo "⚠️  Important:"
echo "   1. Make sure Cloudflare DNS records are set to 'Proxied' (orange cloud)"
echo "   2. In Cloudflare SSL/TLS settings, set to 'Full' or 'Full (strict)'"
echo "   3. Update frontend .env.local:"
echo "      NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space"
echo "      NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space"
echo ""
