# Fix: Production Showing Old Version

## Problem
- ✅ Port 3000 shows **correct new version**: http://20.55.21.69:3000
- ❌ Cloudflare domain shows **old version**: https://carbon-bim.ensimu.space

## Root Cause
**Cloudflare is serving cached content** from the previous deployment. The new version is running on the server, but Cloudflare's edge cache has the old HTML/JS/CSS files.

## Solution (3 Steps - 2 minutes)

### Step 1: Purge Cloudflare Cache (CRITICAL)

**Via Dashboard** (easiest):

1. Open **https://dash.cloudflare.com**
2. Click on domain: **ensimu.space**
3. In left sidebar, click **"Caching"**
4. Click **"Configuration"** tab
5. Scroll down to **"Purge Cache"** section
6. Click the orange **"Purge Everything"** button
7. In the modal, click **"Purge Everything"** again to confirm
8. Wait **30 seconds** for the purge to propagate globally

**Via API** (if you have credentials):
```bash
# Edit purge-cloudflare-cache.sh with your ZONE_ID and API_TOKEN
nano purge-cloudflare-cache.sh

# Run
./purge-cloudflare-cache.sh
```

### Step 2: Clear Browser Cache

**Hard Reload**:
- **Windows/Linux**: Press `Ctrl + Shift + R`
- **Mac**: Press `Cmd + Shift + R`

**Or use Incognito/Private Mode**:
- Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Safari: `Cmd+Shift+N`

### Step 3: Test New Version

Wait **30-60 seconds** after purging Cloudflare cache, then:

1. Open **https://carbon-bim.ensimu.space** in Incognito/Private mode
2. You should see the **new version** (same as port 3000)
3. If still old, wait another 30 seconds and try again

## Verification

To confirm you're seeing the new version:

```bash
# Check what's running on the server
curl -I http://20.55.21.69:3000

# Check what Cloudflare is serving
curl -I https://carbon-bim.ensimu.space

# Compare the dates/headers
```

## If Still Showing Old Version

### Option 1: Enable Development Mode

**In Cloudflare Dashboard**:
1. Go to **ensimu.space** domain
2. Click **"Caching"** in sidebar
3. Find **"Development Mode"** section
4. Toggle **ON** (bypasses cache for 3 hours)
5. Test immediately: https://carbon-bim.ensimu.space

**Note**: Development Mode temporarily disables caching. Remember to turn it OFF after verifying.

### Option 2: Purge by URL (Selective)

If "Purge Everything" doesn't work, try purging specific files:

**In Cloudflare Dashboard**:
1. Caching → Configuration → Purge Cache
2. Click **"Custom Purge"**
3. Select **"Purge by URL"**
4. Enter these URLs:
   ```
   https://carbon-bim.ensimu.space
   https://carbon-bim.ensimu.space/
   https://carbon-bim.ensimu.space/_next/*
   ```
5. Click **"Purge"**

### Option 3: Verify DNS is Correct

Check DNS is pointing to the correct server:

```bash
# Should return: 20.55.21.69
dig carbon-bim.ensimu.space +short
nslookup carbon-bim.ensimu.space
```

If it returns a different IP, update your Cloudflare DNS:
1. Cloudflare Dashboard → ensimu.space
2. DNS → Records
3. Find **carbon-bim** A record
4. Change Content to: **20.55.21.69**
5. Ensure Proxy Status is: **Proxied** (orange cloud)

### Option 4: Bypass Cloudflare (Testing)

Test the origin server directly by adding to your local `/etc/hosts`:

```bash
# Add this line to /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
20.55.21.69 carbon-bim.ensimu.space

# Then visit https://carbon-bim.ensimu.space
# (You'll get SSL warning - click "Advanced" → "Proceed")
```

If this shows the new version, the problem is **definitely Cloudflare cache**.

### Option 5: Force Cache Bust with Query Param

**Temporary workaround** - add `?v=2` to the URL:

```
https://carbon-bim.ensimu.space?v=2
```

This bypasses Cloudflare cache by making it a unique URL.

## Prevention (For Future Deployments)

### Method 1: Cloudflare Page Rules

Set cache TTL to be shorter for HTML:

1. Cloudflare → ensimu.space → Rules → Page Rules
2. Create rule for: `carbon-bim.ensimu.space/*`
3. Settings:
   - **Browser Cache TTL**: 4 hours
   - **Edge Cache TTL**: 2 hours
4. Save and Deploy

### Method 2: Set Cache Headers in Caddy

Edit `/etc/caddy/Caddyfile` on coder-vm:

```caddy
carbon-bim.ensimu.space {
    reverse_proxy localhost:3000

    # Don't cache HTML
    @html {
        path *.html /
    }
    header @html Cache-Control "no-cache, must-revalidate"

    # Cache static assets
    @static {
        path *.js *.css *.png *.jpg *.ico
    }
    header @static Cache-Control "public, max-age=31536000, immutable"
}
```

### Method 3: Auto-purge on Deploy

Add to your deployment script:

```bash
# After updating containers
./force-update-production.sh

# Automatically purge Cloudflare
./purge-cloudflare-cache.sh

# Done!
```

## Summary

**The issue**: Cloudflare is caching the old version
**The fix**: Purge Cloudflare cache + hard reload browser
**Time to fix**: 2 minutes

After purging Cloudflare cache and waiting 30 seconds, the new version should appear at:
**https://carbon-bim.ensimu.space**

## Still Need Help?

1. **Check server version**: `curl http://20.55.21.69:3000` (should work)
2. **Check Cloudflare version**: `curl https://carbon-bim.ensimu.space` (might be cached)
3. **Enable Development Mode** in Cloudflare (bypasses cache for 3 hours)
4. **Use Incognito mode** to test without browser cache
5. **Wait 2-5 minutes** for global Cloudflare edge cache to update

The new version is definitely running on your server (port 3000 works), so this is purely a caching issue that will resolve once Cloudflare cache is cleared.
