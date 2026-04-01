# Clear All Caches - Show New Version

If your production site is still showing the old version after deployment, follow these steps to clear all caches.

## Step 1: Force Update on coder-vm

**SSH to coder-vm** and run:

```bash
ssh azureuser@20.55.21.69

# Copy the force update script (if not already there)
# Or create it directly:
nano force-update.sh
# Paste the content from force-update.sh, save and exit

chmod +x force-update.sh check-version.sh

# Check current version
./check-version.sh

# Force update (stops services, removes old images, pulls fresh, restarts)
./force-update.sh
```

This will:
- Stop all containers
- Remove old Docker images
- Pull fresh images from ACR
- Start containers with `--force-recreate`
- Show running versions

## Step 2: Clear Cloudflare Cache

**In Cloudflare Dashboard** (https://dash.cloudflare.com):

1. Select your domain: **ensimu.space**
2. Go to **Caching** > **Configuration**
3. Click **Purge Everything** button
4. Confirm the purge
5. Wait 30 seconds for purge to complete

**Or use Cloudflare API**:

```bash
# Get your Cloudflare credentials
ZONE_ID="your-zone-id"
API_TOKEN="your-api-token"

# Purge everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Step 3: Clear Browser Cache

### Chrome/Edge/Brave
1. Open DevTools: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

Or:
1. Go to Settings > Privacy and Security > Clear browsing data
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

### Firefox
1. Open DevTools: `F12`
2. Go to Network tab
3. Check "Disable Cache"
4. Hard reload: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

### Safari
1. Safari > Preferences > Advanced
2. Check "Show Develop menu in menu bar"
3. Develop > Empty Caches
4. Hard reload: `Cmd+Option+R`

### Quick Method (All Browsers)
**Hard Reload**:
- Windows/Linux: `Ctrl+Shift+R` or `Ctrl+F5`
- Mac: `Cmd+Shift+R`

## Step 4: Verify Update

**Check the version is new**:

### On coder-vm
```bash
ssh azureuser@20.55.21.69
cd ~/suna-production

# Check running images
docker compose -f docker-compose.production.yml images

# Check when images were pulled
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep carbonbim
```

### In Browser
1. Open **https://carbon-bim.ensimu.space**
2. Open DevTools (F12)
3. Go to **Network** tab
4. Check "Disable cache"
5. Reload the page
6. Look at the response headers:
   - `X-Powered-By` or `Server` headers
   - Check the HTML content

### Test API Version
```bash
# Check backend version
curl https://api.carbon-bim.ensimu.space/v1/health

# Should show current timestamp and version
```

## Step 5: Clear Next.js Build Cache (If Needed)

If you're building on the server (not recommended for production), clear Next.js cache:

```bash
ssh azureuser@20.55.21.69
cd ~/suna-production/suna/apps/frontend

# Remove Next.js cache
rm -rf .next

# Rebuild (only if building on server)
npm run build
```

**Better approach**: Always build images locally and push to ACR, as we're doing.

## Step 6: Restart Caddy (If HTTPS Issues)

If HTTPS is not working or showing old content:

```bash
ssh azureuser@20.55.21.69

# Restart Caddy
sudo systemctl restart caddy

# Check Caddy status
sudo systemctl status caddy

# View Caddy logs
sudo journalctl -u caddy -f
```

## Troubleshooting

### Images Not Updating

**Check if new images exist in ACR**:
```bash
# From local machine
az acr repository show-tags \
  --name carbonbimbc6740962ecd \
  --repository backend \
  --orderby time_desc \
  --output table

az acr repository show-tags \
  --name carbonbimbc6740962ecd \
  --repository frontend \
  --orderby time_desc \
  --output table
```

**Verify ACR credentials on coder-vm**:
```bash
ssh azureuser@20.55.21.69

# Test ACR login
docker login carbonbimbc6740962ecd.azurecr.io

# If fails, login with admin credentials
echo "CJ2d8MU5RnJ2iQZrqb7CR2e3dhm3TGWaBSewh9v6jKuPQIqXu4TPJQQJ99CCACqBBLyEqg7NAAACAZCR52al" | \
  docker login carbonbimbc6740962ecd.azurecr.io \
  --username carbonbimbc6740962ecd \
  --password-stdin
```

### Services Not Restarting

**Check Docker logs**:
```bash
ssh azureuser@20.55.21.69
cd ~/suna-production

# View all logs
docker compose -f docker-compose.production.yml logs

# View specific service
docker compose -f docker-compose.production.yml logs frontend
docker compose -f docker-compose.production.yml logs backend
```

**Force remove and recreate**:
```bash
# Nuclear option - removes everything and starts fresh
docker compose -f docker-compose.production.yml down -v
docker compose -f docker-compose.production.yml up -d --force-recreate
```

### Still Showing Old Version

**Check if you're hitting the right server**:
```bash
# From local machine
dig carbon-bim.ensimu.space
nslookup carbon-bim.ensimu.space

# Should show: 20.55.21.69
```

**Check Cloudflare is pointing to correct IP**:
1. Cloudflare Dashboard > ensimu.space
2. DNS > Records
3. Verify carbon-bim, api.carbon-bim, graphdb.carbon-bim all point to 20.55.21.69
4. Verify proxy status is **Proxied** (orange cloud)

**Bypass Cloudflare to test origin**:
```bash
# Add to /etc/hosts (local machine)
20.55.21.69 carbon-bim.ensimu.space

# Or test directly with IP
curl http://20.55.21.69:3000
```

## Quick Reference Commands

```bash
# On coder-vm

# Force update everything
./force-update.sh

# Check current version
./check-version.sh

# View logs
docker compose -f ~/suna-production/docker-compose.production.yml logs -f

# Restart services
docker compose -f ~/suna-production/docker-compose.production.yml restart

# Nuclear option (start completely fresh)
docker compose -f ~/suna-production/docker-compose.production.yml down
docker compose -f ~/suna-production/docker-compose.production.yml up -d --force-recreate
```

## Cache Hierarchy

Understanding the cache layers (from client to server):

1. **Browser Cache** - Client-side caching (clear with Ctrl+Shift+R)
2. **Cloudflare Cache** - Edge CDN cache (purge in dashboard)
3. **Caddy Cache** - Reverse proxy cache (restart Caddy)
4. **Docker Containers** - Running application instances (restart containers)
5. **Docker Images** - Container images (pull fresh from ACR)

Clear caches from **top to bottom** to see your changes.

## Prevention

To avoid this in future:

1. **Use versioned tags**: Instead of `:latest`, use `:20260324-150210`
2. **Set cache headers**: Configure proper cache headers in Caddy
3. **Disable cache in development**: Set Cloudflare Development Mode when testing
4. **Use CI/CD**: Automate deployment to ensure images are always pulled fresh

## Need Help?

If still showing old version after all steps:
1. Check all logs: `docker compose logs -f`
2. Verify images: `docker compose images`
3. Test directly on VM: `curl http://localhost:3000`
4. Check DNS: `dig carbon-bim.ensimu.space`
5. Review Cloudflare settings
