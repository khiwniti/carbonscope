# Vercel Deployment Instructions

**Status**: ⚠️ Manual Configuration Required

---

## Issue Summary

The BKS cBIM AI platform has a nested directory structure:
```
comprehensive-bks-cbim-ai-agent/  (repository root)
└── suna/
    └── apps/
        └── frontend/          (Next.js app location)
            ├── package.json
            ├── next.config.ts
            └── ... (Next.js files)
```

Vercel's auto-detection cannot find the Next.js app because it's nested 3 levels deep.

---

## ✅ Solution: Configure Root Directory

### Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/getintheqs-projects/comprehensive-bks-cbim-ai-agent/settings/general

2. Scroll to **"Build & Development Settings"**

3. Set **"Root Directory"**: `suna/apps/frontend`

4. Set **"Install Command"**: `pnpm install --no-frozen-lockfile`

5. Leave **"Build Command"** empty (use default: `pnpm run build`)

6. Click **"Save"**

7. Trigger a new deployment (push to main or click "Redeploy")

###Via Vercel CLI (Alternative)

```bash
cd /teamspace/studios/this_studio/comprehensive-bks-cbim-ai-agent

# Update project settings
vercel project --scope getintheqs-projects comprehensive-bks-cbim-ai-agent \
  --root-directory suna/apps/frontend \
  --install-command "pnpm install --no-frozen-lockfile"

# Trigger deployment
vercel --prod --scope getintheqs-projects
```

### Via API (Advanced)

```bash
curl -X PATCH \
  "https://api.vercel.com/v9/projects/prj_DvGEq3TTlPbwFhvWF66QiTJPDgAy" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "nextjs",
    "rootDirectory": "suna/apps/frontend",
    "buildCommand": null,
    "installCommand": "pnpm install --no-frozen-lockfile"
  }'
```

---

## Environment Variables (After Root Directory Fix)

Once the root directory is configured, add these environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# When prompted, enter: https://ujzsbwvurfyeuerxxeaz.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
# When prompted, enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add NEXT_PUBLIC_ENV_MODE preview
# When prompted, enter: staging

vercel env add NEXT_PUBLIC_BACKEND_URL preview
# When prompted, enter: http://localhost:8000/v1
# (Later: update to actual backend URL)
```

---

## Expected Result

After configuring the root directory:

```
✅ Build starts from suna/apps/frontend/
✅ pnpm finds package.json
✅ Dependencies install successfully
✅ Next.js builds successfully
✅ Preview URL: https://comprehensive-bks-cbim-ai-agent-*.vercel.app
```

---

## Alternative: Restructure Repository

If manual configuration is not preferred, restructure the repository:

```bash
# Option 1: Move frontend to root
mv suna/apps/frontend/* ./
rm -rf suna/

# Option 2: Use monorepo with Turborepo
# (Vercel has excellent monorepo support)
```

---

## Current Deployment Errors

All deployments are failing at ~3-4 seconds with:
- **Duration**: 3-4s (too fast to be real build)
- **Status**: Error
- **Root Cause**: Vercel can't find `package.json` at repository root

**Recent Deployments**:
1. `comprehensive-bks-cbim-ai-agent-jdtspst4j-*` - 15s ago - ❌ Error (3s)
2. `comprehensive-bks-cbim-ai-agent-rc7y3xdls-*` - 3m ago - ❌ Error (4s)
3. `comprehensive-bks-cbim-ai-agent-lqjvyd8gx-*` - 8m ago - ❌ Error (3s)

---

## Quick Fix Action

**RIGHT NOW**: Visit the Vercel Dashboard and set Root Directory:

🔗 **Dashboard Link**:
https://vercel.com/getintheqs-projects/comprehensive-bks-cbim-ai-agent/settings/general

1. Root Directory: `suna/apps/frontend`
2. Install Command: `pnpm install --no-frozen-lockfile`
3. Save
4. Redeploy

⏱️ **Est. Time**: 2 minutes to configure, 2-3 minutes to build

---

**Last Updated**: 2026-03-24 11:15 UTC
**Next Step**: Configure root directory in Vercel Dashboard (manual step required)
