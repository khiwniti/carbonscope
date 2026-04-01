# Local Testing Guide - Frontend & Backend Compatibility

## ✅ Verified Compatible Setup

- **Backend**: `suna-init/backend/` (with Task 3 checkpointer fixes)
- **Frontend**: `suna-init/apps/frontend/`
- **Backend URL**: `http://localhost:8000/v1`
- **Frontend URL**: `http://localhost:3000`

## Quick Start

### Option 1: Manual Start (Recommended for development)

**Terminal 1 - Start Backend:**
```bash
./start-backend-local.sh
```

**Terminal 2 - Start Frontend:**
```bash
./start-frontend-local.sh
```

### Option 2: Start Individually

**Backend:**
```bash
cd suna-init/backend
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend:**
```bash
cd suna-init/apps/frontend
npm run dev
```

## Verification Steps

### 1. Test Backend Health

```bash
curl http://127.0.0.1:8000/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy" or "degraded",
  "agent_system": {
    "initialized": true,
    "checkpointer_connected": true,
    "active_agents": 12
  }
}
```

**Note**: Status may show "degraded" if Redis is not running locally. This is expected and non-blocking.

### 2. Test Frontend Connection

1. Open browser: `http://localhost:3000`
2. Check browser console for any 404 errors to `/v1/*` endpoints
3. Should NOT see errors like:
   - ❌ `GET http://localhost:8000/health 404` (missing /v1)
   - ✅ `GET http://localhost:8000/v1/health 200` (correct)

### 3. Test Agent System (if Redis available)

```bash
# Check if agents are loaded
curl http://127.0.0.1:8000/v1/agents
```

## Troubleshooting

### Backend won't start

**Error**: `Address already in use`
```bash
# Kill existing process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Error**: `No module named 'core'` or import errors
```bash
# Make sure you're in the right directory
cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/backend
# Check Python environment
python -c "import fastapi; print('FastAPI OK')"
```

### Frontend won't start

**Error**: `Port 3000 already in use`
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
```

**Error**: `NEXT_PUBLIC_BACKEND_URL not found`
```bash
# Check .env.local exists
cd suna-init/apps/frontend
cat .env.local | grep NEXT_PUBLIC_BACKEND_URL
# Should show: NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1
```

### Frontend shows 404 errors for API calls

**Issue**: Frontend calls are going to `/health` instead of `/v1/health`

**Fix**:
```bash
# Update frontend .env.local
cd suna-init/apps/frontend
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1" > .env.local
# Restart frontend
```

### Backend shows "degraded" status

**This is EXPECTED locally** if you don't have Redis running. The backend will still work for most features.

**To run Redis locally (optional):**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

Then update `suna-init/backend/.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=false
```

## Environment Variables Reference

### Backend (`suna-init/backend/.env`)

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (Supabase)

**Optional (for full functionality):**
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (default: empty)
- `REDIS_SSL` - Use SSL (default: false)

### Frontend (`suna-init/apps/frontend/.env.local`)

**Required:**
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/v1` ⚠️ Must include `/v1`
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Compatibility Checklist

Run this before starting:
```bash
./test-local-compatibility.sh
```

**All checks should pass:**
- ✅ Backend .env file exists
- ✅ DATABASE_URL configured
- ✅ Frontend .env.local exists
- ✅ Backend URL has /v1 prefix
- ✅ Port 8000 available
- ✅ Port 3000 available
- ✅ Backend configured with /v1 prefix
- ✅ Checkpointer has Task 3 fixes (3847 bytes)

## What's Different from Production?

| Feature | Local | Production (Azure) |
|---------|-------|-------------------|
| Backend URL | `http://localhost:8000/v1` | `https://carbonscope-backend.*.azurecontainerapps.io/v1` |
| Frontend URL | `http://localhost:3000` | `https://carbonscope-frontend.*.azurecontainerapps.io` |
| Redis | Optional (local or Docker) | Azure Cache for Redis (managed) |
| Database | Supabase (same) | Supabase (same) |
| HTTPS | No | Yes (automatic) |

## Next Steps After Local Testing

Once local testing confirms compatibility:

1. **Build production image:**
   ```bash
   cd suna-init/backend
   docker build -t carbonscopeacr.azurecr.io/backend:latest -f Dockerfile.production .
   ```

2. **Push to Azure:**
   ```bash
   docker push carbonscopeacr.azurecr.io/backend:latest
   ```

3. **Deploy:**
   ```bash
   az containerapp update \
     --name carbonscope-backend \
     --resource-group carbonscope-rg \
     --image carbonscopeacr.azurecr.io/backend:latest
   ```

4. **Verify production:**
   ```bash
   curl https://carbonscope-backend.wittybay-b8ab90d4.eastus.azurecontainerapps.io/v1/health
   ```

## Summary

✅ **Backend**: `suna-init/backend/` - Original code + Task 3 checkpointer fixes
✅ **Frontend**: `suna-init/apps/frontend/` - Built for this backend
✅ **Compatibility**: Verified - both use `/v1` API prefix
✅ **Testing**: Use provided scripts for easy local testing
✅ **Deployment**: Image `checkpointer-production` ready for Azure
