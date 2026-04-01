# 🚀 Start Deployment - Read This First

## Current Status

✅ **All Docker images pushed to ACR**
- Backend, Frontend, Redis all ready

✅ **coder-vm is running**
- IP: 20.55.21.69
- Location: eastus

✅ **All scripts ready**
- Deployment automation complete

✅ **SSH Key available**
- VM Key.pem is in this directory

## Start Deployment Now

### From This Environment (Doesn't work - SSH times out)

Unfortunately, SSH from this environment to coder-vm times out due to network restrictions.

### From Your Local Machine (Recommended)

**Download this entire directory** to your local machine, then:

```bash
cd comprehensive-bks-cbim-ai-agent

# Run the automated deployment
./deploy-now.sh
```

That's it! The script will:
1. ✅ Test SSH connection
2. ✅ Copy all files to coder-vm
3. ✅ Deploy all services (Frontend, Backend, Redis, GraphDB)
4. ✅ Show you the next steps

## Alternative: Manual Deployment

If the automated script doesn't work, follow **DEPLOY_COMMANDS.txt** which has all the commands to copy and paste.

## What Happens After Deployment

Once `deploy-now.sh` completes, you need to:

1. **Update environment variables** (5 minutes)
   - Database credentials
   - Encryption keys
   - API keys

2. **Restart services** (30 seconds)
   ```bash
   docker compose -f docker-compose.production.yml restart
   ```

3. **Initialize GraphDB** (30 seconds)
   ```bash
   curl -X POST http://localhost:7200/rest/repositories ...
   ```

4. **Setup HTTPS** (2 minutes)
   ```bash
   ./setup-cloudflare-domain.sh
   ```

5. **Configure Cloudflare DNS** (2 minutes)
   - Add 3 DNS records in Cloudflare dashboard

## Your Production URLs

After completing all steps:

- **Frontend**: https://carbon-bim.ensimu.space
- **Backend API**: https://api.carbon-bim.ensimu.space/docs
- **GraphDB**: https://graphdb.carbon-bim.ensimu.space

## Files You Need

All in this directory:
- ✅ `deploy-now.sh` - Automated deployment (run this)
- ✅ `VM Key.pem` - SSH key for coder-vm
- ✅ `DEPLOY_COMMANDS.txt` - Manual step-by-step commands
- ✅ `CODER_VM_DEPLOYMENT.md` - Complete guide
- ✅ All deployment scripts and configuration files

## Troubleshooting

If deployment fails, see:
- **CODER_VM_DEPLOYMENT.md** - Complete troubleshooting guide
- **CLEAR_CACHES.md** - If showing old version
- Run `./check-version.sh` on coder-vm to see what's running

## Quick Start Commands

```bash
# 1. Run automated deployment
./deploy-now.sh

# 2. SSH to coder-vm
ssh -i "VM Key.pem" azureuser@20.55.21.69

# 3. Update environment variables
cd ~/suna-production
nano backend/.env
nano suna/apps/frontend/.env.local

# 4. Restart services
docker compose -f docker-compose.production.yml restart

# 5. Initialize GraphDB
curl -X POST http://localhost:7200/rest/repositories \
  -H 'Content-Type: application/json' \
  -d '{"id":"carbonbim-thailand","title":"BKS","ruleset":"rdfsplus-optimized"}'

# 6. Setup HTTPS
./setup-cloudflare-domain.sh

# 7. Configure Cloudflare DNS (in browser)
# https://dash.cloudflare.com
```

## Need Help?

- Check the logs: `docker compose logs -f`
- View service status: `./check-version.sh`
- Force update: `./force-update.sh`
- Read detailed guides: CODER_VM_DEPLOYMENT.md

---

**Ready to deploy?** Run `./deploy-now.sh` from your local machine!
