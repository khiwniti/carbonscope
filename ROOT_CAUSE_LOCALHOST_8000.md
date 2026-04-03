# Root Cause Analysis: localhost:8000 API Calls in Production

**Date**: 2026-04-02  
**Issue**: Production site (carbonscope.ensimu.space) making API calls to `http://localhost:8000` instead of Azure backend

---

## Symptom

Browser console errors:
```
GET http://localhost:8000/v1/health net::ERR_CONNECTION_REFUSED
GET http://localhost:8000/v1/accounts net::ERR_CONNECTION_REFUSED
GET http://localhost:8000/v1/agents net::ERR_CONNECTION_REFUSED
```

## Root Cause

**File**: `suna-init/apps/frontend/.env.local` (Line 5)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1
```

**Next.js Environment Variable Priority** (High → Low):
1. `.env.local` ← **WINNER** (development config with localhost:8000)
2. `.env.production` ← Has correct Azure URLs but LOSES

## Data Flow Trace

```
Local Build Process
├─ Next.js reads .env.local (localhost:8000/v1)
├─ Next.js reads .env.production (suna-backend-app.azurewebsites.net)
├─ .env.local has HIGHER priority
└─ JavaScript bundle baked with localhost:8000

Docker Build
├─ COPY .next/standalone (already contains localhost:8000)
├─ .dockerignore blocks *.env files (doesn't matter - already built)
└─ Image contains bundle with localhost:8000 hardcoded

Azure Deployment
├─ Environment variables set correctly at runtime
├─ BUT client-side JavaScript already has localhost:8000 baked in
└─ Browser executes code → localhost:8000 → ERR_CONNECTION_REFUSED
```

## Why It Happened

1. **`.env.local` exists**: Created for local development (correct)
2. **Build ran locally**: Next.js build executed outside Docker
3. **Priority override**: `.env.local` takes precedence over `.env.production`
4. **Client-side baking**: `NEXT_PUBLIC_*` variables are baked into JavaScript at build time
5. **Runtime vars don't help**: Azure environment variables only affect server-side code

## Evidence

### Source Code
```typescript
// suna-init/apps/frontend/src/lib/api-client.ts:5
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
```

### Environment Files
```bash
# .env.local (WINS - higher priority)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1

# .env.production (LOSES - lower priority)
NEXT_PUBLIC_BACKEND_URL=https://suna-backend-app.azurewebsites.net
```

### Docker Configuration
```dockerfile
# .dockerignore (Line 12-13)
*.env        # Blocks .env.local from being copied
env.*        # But build already happened - too late!
```

## Fix Applied

### Step 1: Delete .env.local
```bash
rm suna-init/apps/frontend/.env.local
```

### Step 2: Verify .env.production
```bash
# .env.production now wins (only env file present)
NEXT_PUBLIC_BACKEND_URL=https://suna-backend-app.azurewebsites.net
NEXT_PUBLIC_API_URL=https://suna-backend-app.azurewebsites.net
NEXT_PUBLIC_APP_URL=https://carbonscope.ensimu.space
```

### Step 3: Clean Build
```bash
cd suna-init/apps/frontend
rm -rf .next
bunx --bun next build
```

### Step 4: Build Docker Image
```bash
docker build -t sunabimacr.azurecr.io/carbonscope-frontend:v1.0.4 \
  -f suna-init/apps/frontend/Dockerfile .
```

### Step 5: Deploy
```bash
docker push sunabimacr.azurecr.io/carbonscope-frontend:v1.0.4
az webapp config container set --name suna-frontend-app \
  --resource-group suna-bim-rg \
  --docker-custom-image-name sunabimacr.azurecr.io/carbonscope-frontend:v1.0.4
az webapp restart --name suna-frontend-app --resource-group suna-bim-rg
```

## Prevention

### Recommendation 1: Build Inside Docker
```dockerfile
# Multi-stage Dockerfile (prevents local env interference)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_BACKEND_URL=https://suna-backend-app.azurewebsites.net
RUN npm run build

FROM node:20-alpine AS runner
COPY --from=builder /app/.next/standalone ./
CMD ["node", "server.js"]
```

### Recommendation 2: .gitignore .env.local
```bash
# .gitignore (already present)
.env.local  # Never commit local development config
```

### Recommendation 3: CI/CD Pipeline
Build in clean CI/CD environment (GitHub Actions, Azure DevOps) to avoid local environment contamination.

### Recommendation 4: Verify Build Output
```bash
# Check what's baked into the bundle
grep -r "localhost:8000" .next/static/*.js
# Should return nothing for production builds
```

## Lessons Learned

1. **Environment priority matters**: `.env.local` always wins over `.env.production`
2. **Build-time vs Runtime**: `NEXT_PUBLIC_*` vars are baked at build time, not runtime
3. **Azure env vars limitation**: Runtime environment variables don't override client-side JavaScript
4. **Docker isn't magic**: If build happens before Docker, it's too late
5. **Systematic debugging works**: Traced data flow from browser → bundle → build → env files

## Related Issues

- ThreadComponent infinite loop (fixed in v1.0.3)
- AnnouncementDialog not rendering (fixed in v1.0.3)
- Backend URL configuration (fixed in v1.0.4)

## Files Changed

- ❌ Deleted: `suna-init/apps/frontend/.env.local`
- ✅ Preserved: `suna-init/apps/frontend/.env.production`
- 🔨 Rebuilt: `suna-init/apps/frontend/.next/`

---

**Status**: ✅ FIXED in v1.0.4

**Verification**: Browser console should show API calls to `https://suna-backend-app.azurewebsites.net` instead of `http://localhost:8000`
