# ✅ Authentication Issue FIXED

**Date**: 2026-03-24  
**Issue**: Authentication redirecting to localhost Supabase (127.0.0.1:54321)  
**Status**: **RESOLVED** ✅

---

## 🔍 Root Cause

The production deployment was using a `.env.local` file with:

```bash
NEXT_PUBLIC_FORCE_LOCALHOST="true"  # ❌ WRONG for production!
```

This forced the frontend to use local Supabase (127.0.0.1:54321) instead of production Supabase.

---

## 🔧 Solution Applied

### Updated Production Environment Variables

Created correct `.env.local` on production VM:

```bash
# ✅ CORRECT Production Settings
NEXT_PUBLIC_ENV_MODE="production"
NEXT_PUBLIC_SUPABASE_URL="https://ujzsbwvurfyeuerxxeaz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_BACKEND_URL="http://backend:8000/v1"
NEXT_PUBLIC_URL="https://carbon-bim.ensimu.space"
NEXT_PUBLIC_FORCE_LOCALHOST="false"  # ✅ CRITICAL FIX!
```

### Container Restarted

Frontend container restarted to load new environment variables.

---

## ✅ Verification

### Before Fix
```
❌ Auth URL: http://127.0.0.1:54321/auth/v1/authorize?provider=google...
```

### After Fix
```
✅ Auth URL: https://ujzsbwvurfyeuerxxeaz.supabase.co/auth/v1/authorize?provider=google...
```

---

## 🧪 Test Authentication

1. **Go to**: https://carbon-bim.ensimu.space
2. **Click**: "Sign in with Google" (or any auth button)
3. **Verify**: URL should be `https://ujzsbwvurfyeuerxxeaz.supabase.co/auth/v1/authorize...`
4. **Complete**: Google OAuth flow
5. **Success**: Redirected back to `https://carbon-bim.ensimu.space/auth/callback?returnUrl=/dashboard`

---

## 🔍 How to Verify the Fix

### Check 1: Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Sign In"
4. Look for redirect URL in network requests
5. Should show: `https://ujzsbwvurfyeuerxxeaz.supabase.co` ✅

### Check 2: Console Logs
1. Open DevTools Console
2. Look for any Supabase initialization logs
3. Should NOT mention `127.0.0.1` or `54321`

### Check 3: Direct URL Inspection
When you click auth, the browser address bar will briefly show:
```
https://ujzsbwvurfyeuerxxeaz.supabase.co/auth/v1/authorize?...
```

NOT:
```
http://127.0.0.1:54321/auth/v1/authorize?...  ❌
```

---

## 📊 Current Configuration

### Production Environment

| Variable | Value | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_ENV_MODE` | "production" | ✅ Correct |
| `NEXT_PUBLIC_SUPABASE_URL` | https://ujzsbwvurfyeuerxxeaz.supabase.co | ✅ Correct |
| `NEXT_PUBLIC_BACKEND_URL` | http://backend:8000/v1 | ✅ Correct |
| `NEXT_PUBLIC_URL` | https://carbon-bim.ensimu.space | ✅ Correct |
| `NEXT_PUBLIC_FORCE_LOCALHOST` | "false" | ✅ Fixed! |

### Services Status

| Service | Status | Port | Health |
|---------|--------|------|--------|
| Frontend | ✅ Running | 80 | Healthy |
| Backend | ✅ Running | 8000 | Healthy |
| GraphDB | ✅ Running | 7200 | Healthy |
| Redis | ✅ Running | 6379 | Healthy |

---

## 🚀 Production URLs

### Frontend
- **HTTPS**: https://carbon-bim.ensimu.space
- **HTTP**: http://20.55.21.69

### Authentication Flow
1. User clicks "Sign in with Google"
2. Frontend redirects to: `https://ujzsbwvurfyeuerxxeaz.supabase.co/auth/v1/authorize`
3. Google OAuth login
4. Supabase callback to: `https://carbon-bim.ensimu.space/auth/callback`
5. App redirects to dashboard

---

## 🐛 Common Issues & Troubleshooting

### Issue: Still seeing 127.0.0.1
**Solution**: Hard refresh your browser
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or use Incognito/Private mode

### Issue: Auth callback fails
**Possible Causes**:
1. Supabase redirect URLs not configured
2. Backend not accessible
3. Session cookie issues

**Check Supabase Dashboard**:
1. Go to: https://supabase.com/dashboard
2. Select project: ujzsbwvurfyeuerxxeaz
3. Go to Authentication → URL Configuration
4. Verify Redirect URLs include:
   - `https://carbon-bim.ensimu.space/auth/callback`
   - `http://20.55.21.69/auth/callback` (optional)

### Issue: Environment variables not loading
**Solution**: Rebuild frontend container
```bash
./force-update-production.sh
```

---

## 📝 Prevention for Future Deployments

### 1. Separate Environment Files

Create distinct files for each environment:

```bash
# Development
apps/frontend/.env.local
NEXT_PUBLIC_FORCE_LOCALHOST="true"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"

# Production
apps/frontend/.env.production
NEXT_PUBLIC_FORCE_LOCALHOST="false"
NEXT_PUBLIC_SUPABASE_URL="https://ujzsbwvurfyeuerxxeaz.supabase.co"
```

### 2. Environment Variable Validation

Add runtime check in your app:

```typescript
// lib/supabase.ts
if (
  process.env.NODE_ENV === 'production' && 
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1')
) {
  throw new Error('Production should not use localhost Supabase!');
}
```

### 3. Docker Build Args

Pass environment at build time:

```dockerfile
# Dockerfile
ARG NEXT_PUBLIC_ENV_MODE=production
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
```

### 4. Deployment Checklist

Before deploying to production:

- [ ] `NEXT_PUBLIC_FORCE_LOCALHOST="false"`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to production Supabase
- [ ] `NEXT_PUBLIC_URL` is production domain
- [ ] `NEXT_PUBLIC_BACKEND_URL` is correct
- [ ] No `127.0.0.1` or `localhost` in production env vars

---

## 🎯 Current Status

- ✅ Frontend environment variables updated
- ✅ Container restarted with new config
- ✅ Auth URL now points to production Supabase
- ✅ No more localhost redirects
- ✅ Production authentication ready to test

---

## 🧪 Test Checklist

Run through this checklist to verify everything works:

1. [ ] Visit https://carbon-bim.ensimu.space
2. [ ] Click "Sign In" button
3. [ ] Verify redirect URL contains `ujzsbwvurfyeuerxxeaz.supabase.co`
4. [ ] Complete Google OAuth login
5. [ ] Verify callback to `carbon-bim.ensimu.space/auth/callback`
6. [ ] Verify redirect to dashboard
7. [ ] Check user is logged in
8. [ ] Test logout
9. [ ] Test login again

---

**Problem**: Auth redirecting to localhost (127.0.0.1:54321)  
**Root Cause**: `NEXT_PUBLIC_FORCE_LOCALHOST="true"` in production  
**Solution**: Updated `.env.local` with correct production settings  
**Status**: **RESOLVED** ✅

**Your authentication is now configured correctly!**
