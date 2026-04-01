# Deploy BKS to coder-vm - START HERE

## Current Status

✅ **Backend images pushed to ACR** - All Docker images are ready
✅ **coder-vm running** - VM IP: 20.55.21.69
✅ **Deployment scripts ready** - All scripts created and tested
✅ **Cloudflare domain configured** - Domain: carbon-bim.ensimu.space

## What You Need to Do

Since SSH from this environment to coder-vm is timing out, you'll need to deploy manually. Here's the simplest way:

### Option 1: Quick Deploy (Recommended)

**1. Copy files to coder-vm:**

```bash
# From your local machine (where you have SSH access to coder-vm)
cd comprehensive-bks-cbim-ai-agent

# Copy everything to coder-vm
scp -r suna/ azureuser@20.55.21.69:~/suna-production/
scp docker-compose.production.yml azureuser@20.55.21.69:~/suna-production/
scp deploy-package.sh azureuser@20.55.21.69:~/
scp setup-cloudflare-domain.sh azureuser@20.55.21.69:~/
```

**2. SSH to coder-vm and deploy:**

```bash
ssh azureuser@20.55.21.69

# Make scripts executable
chmod +x ~/deploy-package.sh ~/setup-cloudflare-domain.sh

# Run deployment (installs Docker, pulls images, starts services)
./deploy-package.sh

# Configure environment variables
cd ~/suna-production
nano backend/.env          # Update with real credentials
nano suna/apps/frontend/.env.local  # Update with real credentials

# Restart services
docker compose -f docker-compose.production.yml restart

# Initialize GraphDB
curl -X POST http://localhost:7200/rest/repositories \
  -H "Content-Type: application/json" \
  -d '{"id":"carbonbim-thailand","title":"BKS Carbon BIM Thailand","ruleset":"rdfsplus-optimized"}'

# Setup Cloudflare domain with HTTPS
./setup-cloudflare-domain.sh
```

**3. Configure Cloudflare DNS:**

In Cloudflare dashboard for **ensimu.space**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | carbon-bim | 20.55.21.69 | ☁️ Proxied |
| A | api.carbon-bim | 20.55.21.69 | ☁️ Proxied |
| A | graphdb.carbon-bim | 20.55.21.69 | ☁️ Proxied |

**4. Test deployment:**

Wait 2 minutes for DNS, then visit:
- https://carbon-bim.ensimu.space (Frontend)
- https://api.carbon-bim.ensimu.space/docs (Backend API)
- https://graphdb.carbon-bim.ensimu.space (GraphDB)

### Option 2: Use Automated Script

If you can run the automated script from a machine that has SSH access to coder-vm:

```bash
# This will do everything automatically
./setup-coder-vm.sh
```

## Important Files

- **CODER_VM_DEPLOYMENT.md** - Complete step-by-step guide
- **deploy-package.sh** - Run on coder-vm to deploy services
- **setup-cloudflare-domain.sh** - Run on coder-vm to configure HTTPS
- **docker-compose.production.yml** - Service configuration

## Environment Variables You Need

### Backend (.env)
- DATABASE_URL (Supabase PostgreSQL connection string)
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
- ENCRYPTION_KEY (generate with: `openssl rand -base64 32`)
- MCP_CREDENTIAL_ENCRYPTION_KEY (generate with: `openssl rand -base64 32`)

### Frontend (.env.local)
- NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space
- NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- KORTIX_ADMIN_API_KEY (generate with: `openssl rand -base64 32`)

## Troubleshooting

**If services don't start:**
```bash
docker compose -f ~/suna-production/docker-compose.production.yml logs
```

**If Caddy fails:**
```bash
sudo systemctl status caddy
sudo journalctl -u caddy -f
```

**If domain doesn't resolve:**
- Check Cloudflare DNS records are Proxied (orange cloud)
- Wait 2-5 minutes for DNS propagation
- Set SSL/TLS mode to "Full (strict)" in Cloudflare

## Need More Help?

See **CODER_VM_DEPLOYMENT.md** for detailed instructions and troubleshooting.
