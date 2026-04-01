# Test Credentials - BKS cBIM AI Platform

**Environment**: Development (localhost)
**Created**: 2026-03-24 09:45 UTC

---

## Authentication Methods

### Method 1: Password Login (Recommended for Testing)
**URL**: http://localhost:3000/auth/password
**Use these accounts** - they have pre-configured passwords in the seed data:

### Method 2: Magic Link (Email OTP)
**URL**: http://localhost:3000/auth
**Email**: Any email address
**Password**: N/A (passwordless)
**Flow**: Enter email → Receive 6-digit code OR magic link → Enter code or click link

### Method 3: Google OAuth
**URL**: http://localhost:3000/auth
**Flow**: Click "Continue with Google" → OAuth flow
**Note**: Requires Google OAuth credentials configured

---

## Pre-Configured Test Accounts (Use with Method 1 - Password Login)

**Admin User**
- Email: admin@carbonbim.com
- Password: password123
- Role: admin
- Organization: CarbonBIM
- Access: Full admin panel, all features

**Construction Engineer**
- Email: engineer@example.com
- Password: password123
- Role: engineer
- Organization: Example Construction Co.
- Access: BOQ upload, carbon analysis, reports

**Sustainability Consultant**
- Email: consultant@example.com
- Password: password123
- Role: consultant
- Organization: Green Building Consultants
- Access: Analysis, TREES/EDGE certification, recommendations

---

## Google OAuth (Dev)
**Status**: Configured but requires Google OAuth credentials
**Alternative**: Use magic link or test accounts above

---

## API Access

### Backend API
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health (returns 404, use /docs instead)

### Admin API Key
- **Generated**: Auto-generated on backend startup
- **Location**: Check backend logs for `KORTIX_ADMIN_API_KEY`
- **Usage**: For administrative API calls

---

## Database Access

### Supabase (Local)
- **URL**: http://127.0.0.1:54321
- **Service Role Key**: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`
- **Anon Key**: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Database**: PostgreSQL at localhost:54322
- **User**: postgres
- **Password**: postgres

---

## Quick Test Commands

```bash
# Test authentication (magic link)
curl -X POST http://localhost:8000/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@carbonbim.com"}'

# Test with admin credentials
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@carbonbim.com", "password": "password123"}'

# Access API docs
open http://localhost:8000/docs

# Test frontend (password login)
open http://localhost:3000/auth/password

# Test frontend (magic link)
open http://localhost:3000/auth
```

---

## Sample Data

### Test Project
- **Name**: Bangkok Residential Tower
- **Type**: Residential
- **Floor Area**: 12,000 m²
- **Location**: Bangkok, Thailand

### Test Materials
1. **Portland Cement** - 50,000 kg
2. **Ready-Mix Concrete** - 800 m³
3. **Steel Rebar** - 120,000 kg
4. **Ceramic Floor Tiles** - 3,000 m²
5. **Aluminum Window Frames** - 2,500 kg

---

## Security Notes

⚠️ **IMPORTANT**: These are development/test credentials only!

- **Never use in production**
- Default password (`password123`) is intentionally weak for testing
- Change all passwords before deployment
- Rotate API keys for production
- Use environment variables for all credentials

---

## Resetting Test Data

```bash
# Re-seed database
make db-seed

# Or manually:
cd /teamspace/studios/this_studio/comprehensive-bks-cbim-ai-agent
python scripts/seed_database.py
```

---

**For Production**:
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Enable 2FA where available
- Use secure password manager
- Rotate credentials regularly
- Monitor for unauthorized access
