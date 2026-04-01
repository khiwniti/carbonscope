# Cloudflare Cache Clear - Step-by-Step Guide

## Problem
- **Direct IP access** (http://20.55.21.69:3000) shows **correct new version** ✅
- **Production domain** (https://carbon-bim.ensimu.space) shows **old cached version** ❌

This proves the server is working correctly - it's purely a Cloudflare CDN cache issue.

---

## Solution 1: Dashboard Purge (Recommended)

### Step 1: Login to Cloudflare Dashboard
1. Go to: **https://dash.cloudflare.com**
2. Login with your Cloudflare account

### Step 2: Select Domain
1. Click on domain: **ensimu.space**
2. You should see the overview page

### Step 3: Navigate to Caching
1. In the left sidebar, scroll down and click **"Caching"**
2. Click the **"Configuration"** tab at the top

### Step 4: Purge Everything
1. Scroll down to the **"Purge Cache"** section
2. Click the **"Purge Everything"** button (orange button)
3. A confirmation popup will appear
4. Click **"Purge Everything"** again to confirm
5. Wait for success message

### Step 5: Wait for Propagation
1. **Wait 30-60 seconds** for the purge to propagate globally
2. Do NOT reload the page immediately

### Step 6: Hard Refresh Browser
1. **Windows/Linux**: Press `Ctrl + Shift + R`
2. **Mac**: Press `Cmd + Shift + R`
3. **Alternative**: Open Incognito/Private browsing mode

### Step 7: Verify
1. Go to: https://carbon-bim.ensimu.space
2. You should now see the new version

---

## Solution 2: Development Mode (Temporary Bypass)

If purging doesn't work immediately, try Development Mode:

1. Go to **Cloudflare Dashboard** → **ensimu.space**
2. Click **"Caching"** in sidebar
3. Click **"Configuration"** tab
4. Find **"Development Mode"** section
5. Toggle **ON** (it will auto-disable after 3 hours)
6. Wait 30 seconds
7. Hard refresh browser: `Ctrl + Shift + R`

**Development Mode bypasses ALL caching** - changes show immediately.

---

## Solution 3: API Purge (Advanced)

### Prerequisites
You need a Cloudflare API token:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit zone DNS"** or create custom with:
   - Permission: **Zone → Cache Purge → Purge**
   - Zone Resources: **Include → Specific zone → ensimu.space**
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** (you won't see it again!)

### Run the Script

```bash
# Set your API token
export CLOUDFLARE_API_TOKEN="paste_your_token_here"

# Run purge script
./purge-cloudflare-cache.sh
```

The script will:
- Auto-detect your zone ID
- Purge all cache
- Show success/failure message

---

## Solution 4: Selective URL Purge

If "Purge Everything" seems too aggressive:

1. Go to **Cloudflare Dashboard** → **ensimu.space** → **Caching** → **Configuration**
2. In **"Purge Cache"** section, click **"Custom Purge"**
3. Select **"URL"** tab
4. Enter these URLs (one per line):
   ```
   https://carbon-bim.ensimu.space/
   https://carbon-bim.ensimu.space/_next/static/*
   https://carbon-bim.ensimu.space/favicon.ico
   ```
5. Click **"Purge"**

---

## Troubleshooting

### Still Shows Old Version After Purging?

**Check 1: Browser Cache**
- Hard refresh: `Ctrl + Shift + R`
- Or try Incognito/Private mode
- Or clear browser cache completely

**Check 2: DNS Propagation**
```bash
# Check what IP the domain points to
nslookup carbon-bim.ensimu.space

# Should show: 20.55.21.69
```

**Check 3: Cloudflare Proxy Status**
1. Dashboard → **ensimu.space** → **DNS** → **Records**
2. Find record for **carbon-bim** subdomain
3. Ensure **"Proxied"** toggle is **ON** (orange cloud icon)
4. If it's **OFF** (gray cloud), click to enable proxy

**Check 4: Multiple Cache Layers**
- Browser cache (clear it)
- Cloudflare cache (purge it)
- Service Worker cache (open DevTools → Application → Service Workers → Unregister)

**Check 5: Verify Server is Serving New Version**
```bash
# This should show NEW version
curl -s http://20.55.21.69:3000 | grep -o '<title>[^<]*</title>'

# This might show OLD version (if Cloudflare cached)
curl -s https://carbon-bim.ensimu.space | grep -o '<title>[^<]*</title>'
```

---

## Prevention for Future Deployments

### Option 1: Disable Caching for Next.js Pages
Add Cloudflare Page Rule:
1. Dashboard → **ensimu.space** → **Rules** → **Page Rules**
2. Create rule:
   - URL: `carbon-bim.ensimu.space/*`
   - Setting: **Cache Level** → **Bypass**
3. Save

**Warning**: This disables CDN caching benefits.

### Option 2: Use Cache-Control Headers
Next.js automatically sets cache headers. You can customize in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Option 3: Automate Cache Purge in Deployment
Add to your deployment script:

```bash
# After successful deployment
./force-update-production.sh

# Automatically purge Cloudflare
./purge-cloudflare-cache.sh
```

---

## Quick Verification Checklist

Run these commands to verify the issue:

```bash
# 1. Check VM is serving new version (should be NEW)
curl -sI http://20.55.21.69:3000 | grep -i "x-powered-by\|server"

# 2. Check domain response (might be OLD if cached)
curl -sI https://carbon-bim.ensimu.space | grep -i "cf-cache-status"

# 3. Check DNS
nslookup carbon-bim.ensimu.space
```

Expected output:
- VM: Serving new version ✅
- Domain: May show `cf-cache-status: HIT` (cached) or `MISS` (fresh)
- DNS: Should point to 20.55.21.69

---

## Summary

**Root Cause**: Cloudflare CDN serving cached HTML/CSS/JS from old deployment

**Proof Server is Fine**: Direct IP access shows correct version

**Solution**: Purge Cloudflare cache using Dashboard or API

**If Nothing Works**: Enable Development Mode for 3 hours while investigating

---

**Need More Help?**

1. Share output of: `curl -sI https://carbon-bim.ensimu.space`
2. Share screenshot of Cloudflare DNS records page
3. Confirm you see "Purge successful" message after purging
