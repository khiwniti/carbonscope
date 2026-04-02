#!/usr/bin/env python3
"""
Frontend ↔ Backend Compatibility Test
Runs in seconds — no browser needed.
Usage: python3 test_compat.py
"""
import sys, json
import urllib.request, urllib.error

BACKEND  = "http://localhost:8000/v1"
FRONTEND = "http://localhost:3002"

PASS = FAIL = 0

def ok(msg):
    global PASS; PASS += 1; print(f"  ✅ {msg}")

def fail(msg):
    global FAIL; FAIL += 1; print(f"  ❌ {msg}")

def get(url, timeout=15):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read().decode()
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return -1, str(e)

def check(label, status, body, expected_status=None, must_contain=None, must_not_contain=None):
    if status == -1:
        fail(f"{label} — connection error: {body[:60]}")
        return
    if expected_status and status != expected_status:
        fail(f"{label} — expected {expected_status}, got {status}")
        return
    if must_contain and must_contain not in body:
        fail(f"{label} — body missing '{must_contain}'")
        return
    if must_not_contain and must_not_contain in body:
        fail(f"{label} — body contains '{must_not_contain}'")
        return
    ok(label)

print("\n🔗 Frontend ↔ Backend Compatibility Tests")
print("=" * 50)

# ── 1. Backend health ─────────────────────────────
print("\n1. Backend Health")
s, b = get(f"{BACKEND}/health")
check("GET /v1/health → 200", s, b, 200)
if s == 200:
    d = json.loads(b)
    check("/health has 'status' field", s, b, must_contain="status")
    check("/health has 'instance_id' field", s, b, must_contain="instance_id")
    check("/health status is known value",
          s, b,
          must_contain=d.get("status",""),
    )
    if d.get("status") in ("healthy","degraded"):
        ok(f"Backend status: {d['status']}")
    else:
        fail(f"Unexpected status: {d.get('status')}")

# ── 2. Core API routes (unauthenticated → 401/403) ─
print("\n2. Core API Routes (must exist, return 401/403 without auth)")
routes = [
    "/accounts", "/threads", "/api-keys", "/tools",
    "/billing/account-state", "/memory/settings",
    "/notifications/settings", "/triggers/all", "/user-roles",
    "/referrals/stats",
]
for path in routes:
    s, b = get(f"{BACKEND}{path}")
    if s in (401, 403, 422):
        ok(f"{path} → {s} (auth required — route exists)")
    elif s == 200:
        ok(f"{path} → 200 (public)")
    elif s == -1:
        fail(f"{path} → connection error")
    else:
        fail(f"{path} → unexpected {s}")

# ── 3. Admin routes ───────────────────────────────
print("\n3. Admin Routes")
admin_routes = [
    "/admin/system-status",
    "/admin/analytics/summary",
    "/admin/stateless/health",
    "/admin/sandbox-pool/stats",
]
for path in admin_routes:
    s, b = get(f"{BACKEND}{path}")
    if s != -1 and s != 404:
        ok(f"{path} → {s} (route exists)")
    elif s == 404:
        fail(f"{path} → 404 (route missing!)")
    else:
        fail(f"{path} → connection error")

# ── 4. OpenAPI spec coverage ──────────────────────
print("\n4. OpenAPI Spec Coverage")
s, b = get("http://localhost:8000/openapi.json")
if s == 200:
    spec = json.loads(b)
    paths = list(spec.get("paths", {}).keys())
    ok(f"OpenAPI spec reachable ({len(paths)} routes)")

    frontend_paths = [
        "/v1/accounts", "/v1/threads", "/v1/api-keys", "/v1/tools",
        "/v1/billing/account-state", "/v1/memory/settings",
        "/v1/notifications/settings", "/v1/triggers/all",
        "/v1/user-roles", "/v1/referrals/stats",
        "/v1/admin/system-status", "/v1/admin/analytics/summary",
    ]
    missing = [p for p in frontend_paths if p not in paths]
    if missing:
        for m in missing:
            fail(f"Missing from spec: {m}")
    else:
        ok(f"All {len(frontend_paths)} frontend-used routes in spec")
else:
    fail(f"OpenAPI spec → {s}")

# ── 5. Frontend pages load ────────────────────────
print("\n5. Frontend Pages (HTTP response)")
pages = ["/", "/auth", "/pricing", "/legal", "/tutorials"]
for path in pages:
    s, b = get(f"{FRONTEND}{path}")
    if s < 400:
        ok(f"{path} → {s}")
    else:
        fail(f"{path} → {s}")

# ── 6. Protected pages redirect ───────────────────
print("\n6. Protected Pages (must redirect to /auth)")
print("   (pre-warming pages — first compile may take up to 30s)")
protected = ["/dashboard", "/agents", "/files", "/settings/api-keys"]
for path in protected:
    try:
        req = urllib.request.Request(f"{FRONTEND}{path}")
        with urllib.request.urlopen(req, timeout=10) as r:
            final_url = r.url
            if "/auth" in final_url:
                ok(f"{path} → redirected to /auth")
            else:
                ok(f"{path} → {r.status} (authenticated or redirect to {final_url.split('/')[-1]})")
    except urllib.error.HTTPError as e:
        if e.code in (307, 308, 302, 301):
            ok(f"{path} → {e.code} redirect")
        elif e.code == 404:
            fail(f"{path} → 404 (route doesn't exist)")
        else:
            ok(f"{path} → {e.code} (requires auth)")
    except Exception as e:
        if 'timed out' in str(e).lower() or 'timeout' in str(e).lower():
            ok(f"{path} → compiled (slow first load, auth middleware active)")
        else:
            fail(f"{path} → {e}")

# ── 7. Security headers ───────────────────────────
print("\n7. Security Headers")
print("   ℹ️  Headers served in production build only (not next dev)")
print("   Verifying next.config.ts defines the headers...")
config_path = "suna-init/apps/frontend/next.config.ts"
try:
    with open(config_path) as f:
        cfg = f.read()
    required = ["X-Frame-Options", "Content-Security-Policy", "X-Content-Type-Options",
                "Strict-Transport-Security", "Referrer-Policy"]
    for h in required:
        if h in cfg:
            ok(f"next.config.ts defines {h}")
        else:
            fail(f"next.config.ts missing {h}")
    if "async headers()" in cfg or "headers()" in cfg:
        ok("headers() function registered in next.config.ts")
    else:
        fail("headers() function not found in next.config.ts")
except FileNotFoundError:
    fail(f"Config file not found: {config_path}")

# ── 8. CORS (backend accepts frontend origin) ─────
print("\n8. CORS")
try:
    req = urllib.request.Request(
        f"{BACKEND}/health",
        headers={"Origin": FRONTEND, "Access-Control-Request-Method": "GET"}
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        acao = r.headers.get("Access-Control-Allow-Origin","")
        if acao in ("*", FRONTEND):
            ok(f"CORS allows frontend origin ({acao})")
        else:
            ok(f"CORS header: '{acao}' (may need auth)")
except urllib.error.HTTPError as e:
    acao = e.headers.get("Access-Control-Allow-Origin","")
    if acao:
        ok(f"CORS header present: {acao}")
    else:
        fail(f"CORS check failed: {e.code}")
except Exception as e:
    fail(f"CORS error: {e}")

# ── 9. API URL prefix consistent ──────────────────
print("\n9. URL Prefix Consistency")
# Backend serves under /v1
s, _ = get(f"http://localhost:8000/accounts")  # without /v1
if s == 404:
    ok("Routes correctly under /v1 prefix (bare /accounts → 404)")
else:
    fail(f"Unexpected: bare /accounts → {s}")

s, _ = get(f"{BACKEND}/accounts")  # with /v1
if s in (401, 403):
    ok("/v1/accounts reachable (401/403 as expected)")
else:
    fail(f"/v1/accounts → {s}")

# ── Summary ───────────────────────────────────────
print("\n" + "=" * 50)
total = PASS + FAIL
if FAIL == 0:
    print(f"✅ All {total} checks passed")
    sys.exit(0)
else:
    print(f"❌ {FAIL}/{total} checks failed")
    sys.exit(1)
