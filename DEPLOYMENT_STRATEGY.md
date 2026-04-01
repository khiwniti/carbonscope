# BKS cBIM AI Deployment Strategy

**Date**: 2026-03-24
**Environment**: Staging
**Platform**: Vercel

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Platform                      │
├──────────────────────────┬──────────────────────────────┤
│   Frontend Service       │   Backend Service            │
│   (Next.js 15)           │   (FastAPI + Python 3.12)    │
│                          │                              │
│   Domain:                │   Domain:                    │
│   bks-cbim-ai.vercel.app    │   bks-cbim-ai-api.vercel.app    │
│                          │                              │
│   Port: 443 (HTTPS)      │   Port: 443 (HTTPS)          │
│   Framework: Next.js     │   Runtime: Python 3.12       │
│   Build: Turbopack       │   Framework: FastAPI         │
└──────────────────────────┴──────────────────────────────┘
              ▲                          ▲
              │                          │
              └──────── CORS ────────────┘
```

---

## Deployment Plan

### Phase 1: Backend Deployment (API)

**Project**: `bks-cbim-ai-backend`
**Directory**: `backend/`
**Runtime**: Python 3.12 (Fluid Compute)

**Files needed**:
- `vercel.json` → Python runtime configuration
- `requirements.txt` → Python dependencies
- `api/index.py` or `api.py` → FastAPI entry point

**Environment Variables**:
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://ujzsbwvurfyeuerxxeaz.supabase.co
SUPABASE_KEY=...

# GraphDB (TGO)
GRAPHDB_URL=http://...
GRAPHDB_USERNAME=...
GRAPHDB_PASSWORD=...

# Redis
REDIS_URL=redis://...

# API Keys
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

**Deployment Command**:
```bash
cd backend
vercel --prod
```

---

### Phase 2: Frontend Deployment (UI)

**Project**: `bks-cbim-ai-frontend`
**Directory**: `suna/apps/frontend/`
**Framework**: Next.js 15

**Files needed**:
- `vercel.json` → Next.js configuration (already created)
- `next.config.ts` → Dynamic backend URL resolution (already exists)

**Environment Variables**:
```env
# Backend URL (points to Phase 1 deployment)
NEXT_PUBLIC_BACKEND_URL=https://bks-cbim-ai-api.vercel.app/v1

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ujzsbwvurfyeuerxxeaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Environment
NEXT_PUBLIC_ENV_MODE=staging
NEXT_PUBLIC_URL=https://bks-cbim-ai.vercel.app

# Optional
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_POSTHOG_KEY=
```

**Deployment Command**:
```bash
cd suna/apps/frontend
vercel --prod
```

---

## Current Status

### ✅ Completed
- [x] Vercel project linked (`comprehensive-bks-cbim-ai-agent`)
- [x] Frontend `vercel.json` configured
- [x] `.vercelignore` created
- [x] Backend URL resolution logic verified (`next.config.ts`)

### 🔄 In Progress
- [ ] Backend vercel.json configuration
- [ ] Backend deployment to Vercel
- [ ] Environment variable setup (backend)
- [ ] Frontend deployment to Vercel
- [ ] Environment variable setup (frontend)
- [ ] CORS configuration
- [ ] Health checks and verification

### ⏳ Pending
- [ ] Custom domain setup (optional)
- [ ] Monitoring and observability
- [ ] Load testing
- [ ] Production deployment

---

## Technical Considerations

### Backend (FastAPI on Vercel)

**Vercel Python Support**:
- Python 3.12+ supported via Fluid Compute
- WSGI/ASGI compatible (FastAPI works natively)
- Default timeout: 300s (suitable for agent workflows)
- No cold starts (Fluid Compute reuses instances)

**File Structure Requirements**:
```
backend/
├── api/
│   └── index.py          # Must be here for Vercel
├── requirements.txt      # Dependencies
├── vercel.json          # Configuration
└── ... (rest of backend code)
```

**vercel.json for Python**:
```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### Frontend (Next.js 15)

**Already Configured**:
- Turbopack bundler (default in Next.js 15)
- Dynamic backend URL resolution based on `VERCEL_ENV`
- Image optimization
- SSR + ISR support

**Backend URL Logic** (from `next.config.ts`):
```typescript
// Production → https://api.cbim.com/v1
// Preview → https://staging-api.cbim.com/v1
// Or NEXT_PUBLIC_BACKEND_URL if explicitly set
```

---

## Next Steps

1. **Create backend vercel.json**
2. **Deploy backend first** (get API URL)
3. **Set frontend NEXT_PUBLIC_BACKEND_URL** (point to backend)
4. **Deploy frontend**
5. **Test end-to-end**
6. **Update TEST_CREDENTIALS.md** with staging URLs

---

## Commands Reference

```bash
# Backend deployment
cd backend
vercel link --yes --scope getintheqs-projects
vercel env add DATABASE_URL production
vercel --prod

# Frontend deployment
cd suna/apps/frontend
vercel link --yes --scope getintheqs-projects
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel --prod

# Check deployment status
vercel ls
vercel inspect <deployment-url>
vercel logs <deployment-url>
```
