# Auth Redirect Fix - Production URL Configuration

## Problem
Authentication redirects were pointing to `127.0.0.1` instead of the production domain `https://carbon-bim.ensimu.space`.

## Root Cause
The `.env` file had localhost configuration:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# Missing: NEXT_PUBLIC_URL
# Missing: NEXT_PUBLIC_FORCE_LOCALHOST=false
```

## Solution Applied

### 1. Created Production Environment File
**File**: `suna/apps/frontend/.env.production`

**Key Settings**:
```bash
NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space/v1
NEXT_PUBLIC_SUPABASE_URL=https://ujzsbwvurfyeuerxxeaz.supabase.co
NEXT_PUBLIC_FORCE_LOCALHOST=false  # Critical!
```

### 2. Updated Site Configuration
**File**: `suna/apps/frontend/src/lib/site-config.ts`

- Changed branding from "Kortix" to "BKS cBIM AI"
- Updated URLs to use `process.env.NEXT_PUBLIC_URL`
- Changed contact email to `support@bks-cbim.com`
- Updated GitHub links to point to BKS repository

## Production Deployment Steps

### Option 1: Using .env.production (Recommended)
The `.env.production` file will be automatically used when deploying with `NODE_ENV=production`:

```bash
# Build for production
cd suna/apps/frontend
NODE_ENV=production pnpm build

# Start production server
NODE_ENV=production pnpm start
```

### Option 2: Set Environment Variables on Server
If deploying to Azure VM or similar, set these environment variables:

```bash
export NEXT_PUBLIC_URL=https://carbon-bim.ensimu.space
export NEXT_PUBLIC_BACKEND_URL=https://api.carbon-bim.ensimu.space/v1
export NEXT_PUBLIC_SUPABASE_URL=https://ujzsbwvurfyeuerxxeaz.supabase.co
export NEXT_PUBLIC_FORCE_LOCALHOST=false
export NEXT_PUBLIC_ENV_MODE=production
```

### Option 3: Vercel Deployment
If deploying to Vercel, add these environment variables in the Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add each `NEXT_PUBLIC_*` variable
3. Set scope to "Production"
4. Redeploy

## Supabase Configuration

### Update Redirect URLs in Supabase
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add production URLs:
   - Site URL: `https://carbon-bim.ensimu.space`
   - Redirect URLs:
     - `https://carbon-bim.ensimu.space/auth/callback`
     - `https://carbon-bim.ensimu.space/api/auth/callback`

### CORS Configuration
Ensure Supabase allows requests from production domain:
- Dashboard → Settings → API → CORS: Add `https://carbon-bim.ensimu.space`

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads at `https://carbon-bim.ensimu.space`
- [ ] Login redirects to `https://carbon-bim.ensimu.space/auth/callback` (not 127.0.0.1)
- [ ] Auth callbacks work correctly
- [ ] Backend API calls go to `https://api.carbon-bim.ensimu.space`
- [ ] No console errors about CORS or mixed content
- [ ] Site config shows "BKS cBIM AI" branding (not "Kortix")

## Local Development

For local development, keep using `.env` with localhost settings:
```bash
# .env (for development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FORCE_LOCALHOST=true
```

The `.env.production` file will only be used in production builds.

## Troubleshooting

### Still seeing 127.0.0.1 redirects?
1. Check `NEXT_PUBLIC_FORCE_LOCALHOST` is set to `false`
2. Verify you're using production build: `NODE_ENV=production`
3. Clear browser cache and cookies
4. Check Supabase redirect URLs include production domain

### Auth callback fails?
1. Verify Supabase redirect URLs match exactly
2. Check CORS settings in Supabase
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project
4. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### Mixed content warnings?
1. Ensure all URLs use `https://` (not `http://`)
2. Check `NEXT_PUBLIC_BACKEND_URL` uses HTTPS
3. Verify Supabase URL uses HTTPS

## Next Steps

1. **Test locally** with production URLs (update `.env` temporarily)
2. **Deploy to staging** first to verify configuration
3. **Update Supabase** redirect URLs before production deploy
4. **Deploy to production** with verified .env.production settings
5. **Monitor** auth flows in production for any issues

## Files Changed

- ✅ `suna/apps/frontend/.env.production` (created)
- ✅ `suna/apps/frontend/src/lib/site-config.ts` (updated branding)
- ⏳ `suna/apps/frontend/.env` (keep for local dev)

## Security Notes

- `.env.production` contains production secrets - **DO NOT commit to git**
- Add to `.gitignore`: `.env.production`, `.env.production.local`
- Use Azure Key Vault or Vercel Environment Variables for secrets management
- Rotate keys if accidentally committed

---

**Status**: ✅ Configuration files created and ready for production deployment
**Next**: Update Supabase redirect URLs and deploy to production
