# 🛡️ Rate Limiting Implementation Guide

**Time to Complete**: 6 hours  
**Priority**: P0 - BLOCKING  
**Impact**: Prevents DoS, brute force, API abuse, runaway LLM costs

---

## 🎯 What We're Building

A **multi-tier rate limiting system** for BKS cBIM AI:

1. **Global rate limit** (per IP): 100 requests/minute
2. **API endpoint limits** (per IP): 10 requests/10 seconds
3. **LLM endpoint limits** (per user): 20 requests/hour
4. **Authentication limits** (per IP): 5 attempts/15 minutes

**Tech Stack**: @upstash/ratelimit + @upstash/redis (serverless Redis)

---

## 📦 Step 1: Setup Upstash Redis (15 min)

### Option A: Upstash Cloud (Recommended - Free Tier)

```bash
# 1. Sign up at https://upstash.com (free tier: 10,000 requests/day)

# 2. Create a Redis database
#    - Name: bks-cbim-ratelimit
#    - Region: Choose closest to your deployment (e.g., us-east-1)
#    - Type: Regional (for lower latency)

# 3. Get credentials from Dashboard → Database → REST API
#    Copy these values:
#    - UPSTASH_REDIS_REST_URL
#    - UPSTASH_REDIS_REST_TOKEN
```

### Option B: Local Redis (Development Only)

```bash
# Install Redis locally
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Linux

# Start Redis
redis-server

# Redis will run on localhost:6379
```

---

## 🔧 Step 2: Install Rate Limiting Package (5 min)

```bash
cd suna/apps/frontend

# Install Upstash packages
pnpm add @upstash/ratelimit @upstash/redis

# Verify installation
pnpm list @upstash/ratelimit
```

---

## 🔐 Step 3: Configure Environment Variables (10 min)

### Add to `.env.local` (Development)

```bash
# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Alternative: Use connection string
REDIS_URL=redis://default:your-password@your-db.upstash.io:6379
```

### Add to Vercel/Azure (Production)

**Vercel**:
```bash
vercel env add UPSTASH_REDIS_REST_URL production
# Paste: https://your-db.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN production --sensitive
# Paste: your-token-here

# Pull to local
vercel env pull .env.local
```

**Azure**:
```bash
# Azure Key Vault
az keyvault secret set \
  --vault-name bks-cbim-keyvault \
  --name UPSTASH-REDIS-REST-URL \
  --value "https://your-db.upstash.io"

az keyvault secret set \
  --vault-name bks-cbim-keyvault \
  --name UPSTASH-REDIS-REST-TOKEN \
  --value "your-token-here"
```

---

## 📝 Step 4: Create Rate Limit Utilities (30 min)

### 4.1 Core Rate Limiter (`lib/rate-limit/core.ts`)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit configurations
export const rateLimiters = {
  // Global: 100 requests per minute per IP
  global: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:global",
  }),

  // API: 10 requests per 10 seconds per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "ratelimit:api",
  }),

  // LLM: 20 requests per hour per user
  llm: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
    prefix: "ratelimit:llm",
  }),

  // Auth: 5 attempts per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // File upload: 10 uploads per hour per user
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:upload",
  }),
};

// Identifier extraction
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  const ip = 
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  
  return `ip:${ip}`;
}
```

---

### 4.2 Rate Limit Middleware (`lib/rate-limit/middleware.ts`)

```typescript
import { rateLimiters, getIdentifier } from "./core";
import type { Ratelimit } from "@upstash/ratelimit";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  response?: Response;
}

export async function checkRateLimit(
  request: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<RateLimitResult> {
  const id = identifier || getIdentifier(request);
  
  const { success, limit, remaining, reset } = await limiter.limit(id);
  
  if (!success) {
    const resetDate = new Date(reset);
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
      response: new Response(
        JSON.stringify({
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          limit,
          reset: resetDate.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      ),
    };
  }
  
  return { success: true, limit, remaining, reset };
}

// Helper: Add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-RateLimit-Limit", result.limit.toString());
  newHeaders.set("X-RateLimit-Remaining", result.remaining.toString());
  newHeaders.set("X-RateLimit-Reset", result.reset.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
```

---

### 4.3 Reusable Rate Limit Wrapper (`lib/rate-limit/wrapper.ts`)

```typescript
import { rateLimiters, getIdentifier } from "./core";
import { checkRateLimit, addRateLimitHeaders } from "./middleware";
import { NextRequest } from "next/server";

export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  options: {
    limiter?: keyof typeof rateLimiters;
    userId?: string;
  } = {}
): Promise<Response> {
  const limiter = rateLimiters[options.limiter || "api"];
  const identifier = options.userId || getIdentifier(request);
  
  // Check rate limit
  const result = await checkRateLimit(request, limiter, identifier);
  
  if (!result.success) {
    return result.response!;
  }
  
  // Execute handler
  const response = await handler();
  
  // Add rate limit headers
  return addRateLimitHeaders(response, result);
}
```

---

## 🔌 Step 5: Apply to API Routes (2-3 hours)

### 5.1 Standard API Route Pattern

```typescript
// app/api/v1/agents/route.ts
import { withRateLimit } from "@/lib/rate-limit/wrapper";
import { rateLimiters } from "@/lib/rate-limit/core";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      // Your existing logic
      const agents = await fetchAgents();
      return Response.json(agents);
    },
    { limiter: "api" }
  );
}

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const body = await request.json();
      const agent = await createAgent(body);
      return Response.json(agent, { status: 201 });
    },
    { limiter: "api" }
  );
}
```

---

### 5.2 LLM/Agent Chat Routes (Stricter Limits)

```typescript
// app/api/v1/agents/chat/route.ts
import { withRateLimit } from "@/lib/rate-limit/wrapper";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  return withRateLimit(
    request,
    async () => {
      // Your LLM chat logic
      const { message } = await request.json();
      const response = await callLLM(message);
      return Response.json(response);
    },
    {
      limiter: "llm",
      userId: session?.user?.id, // Per-user limit
    }
  );
}
```

---

### 5.3 Authentication Routes (Brute Force Protection)

```typescript
// app/api/auth/signin/route.ts
import { withRateLimit } from "@/lib/rate-limit/wrapper";

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const { email, password } = await request.json();
      
      // Your auth logic
      const result = await signIn(email, password);
      
      if (!result.success) {
        return Response.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
      
      return Response.json(result);
    },
    { limiter: "auth" }
  );
}
```

---

### 5.4 File Upload Routes

```typescript
// app/api/v1/files/upload/route.ts
import { withRateLimit } from "@/lib/rate-limit/wrapper";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  return withRateLimit(
    request,
    async () => {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      
      // Upload logic
      const uploadedFile = await uploadFile(file);
      return Response.json(uploadedFile);
    },
    {
      limiter: "upload",
      userId: session?.user?.id,
    }
  );
}
```

---

## 🧪 Step 6: Testing Rate Limits (1 hour)

### 6.1 Manual Testing with curl

```bash
# Test API rate limit (10 requests per 10 seconds)
for i in {1..15}; do
  echo "Request $i:"
  curl -i http://localhost:3000/api/v1/agents
  echo "\n"
  sleep 0.5
done

# Expected:
# - Requests 1-10: 200 OK
# - Requests 11+: 429 Too Many Requests
```

---

### 6.2 Automated Test Script

```typescript
// scripts/test-rate-limit.ts
async function testRateLimit() {
  const endpoint = "http://localhost:3000/api/v1/agents";
  const requests = 15;
  
  console.log(`Testing rate limit with ${requests} requests...\n`);
  
  const results = { success: 0, ratelimited: 0 };
  
  for (let i = 1; i <= requests; i++) {
    const res = await fetch(endpoint);
    const headers = {
      limit: res.headers.get("x-ratelimit-limit"),
      remaining: res.headers.get("x-ratelimit-remaining"),
      reset: res.headers.get("x-ratelimit-reset"),
    };
    
    console.log(`Request ${i}: ${res.status} - Remaining: ${headers.remaining}`);
    
    if (res.status === 200) results.success++;
    if (res.status === 429) results.ratelimited++;
    
    await new Promise(r => setTimeout(r, 500)); // 500ms delay
  }
  
  console.log(`\nResults:`, results);
  console.log(`✅ Rate limiting ${results.ratelimited > 0 ? "WORKING" : "NOT WORKING"}`);
}

testRateLimit();
```

Run with:
```bash
npx tsx scripts/test-rate-limit.ts
```

---

### 6.3 Load Testing with k6

```javascript
// k6/rate-limit-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5, // 5 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/agents');
  
  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has rate limit headers': (r) => r.headers['X-Ratelimit-Limit'] !== undefined,
  });
  
  if (res.status === 429) {
    console.log('Rate limited! Remaining:', res.headers['X-Ratelimit-Remaining']);
  }
  
  sleep(0.1);
}
```

Run with:
```bash
k6 run k6/rate-limit-test.js
```

---

## 📊 Step 7: Monitoring & Analytics (30 min)

### 7.1 View Rate Limit Analytics (Upstash Dashboard)

```bash
# 1. Go to https://console.upstash.com
# 2. Select your database
# 3. Click "Analytics" tab
# 4. View:
#    - Total requests
#    - Rate limited requests
#    - Top IPs (potential attackers)
```

---

### 7.2 Custom Monitoring with Logs

```typescript
// lib/rate-limit/middleware.ts (updated)
import { logger } from "@/lib/logger";

export async function checkRateLimit(
  request: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<RateLimitResult> {
  const id = identifier || getIdentifier(request);
  const { success, limit, remaining, reset } = await limiter.limit(id);
  
  // Log rate limit events
  if (!success) {
    logger.warn("Rate limit exceeded", {
      identifier: id,
      endpoint: new URL(request.url).pathname,
      limit,
      reset: new Date(reset).toISOString(),
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
  }
  
  // Log analytics every 100 requests
  if (remaining % 100 === 0) {
    logger.info("Rate limit status", {
      identifier: id,
      remaining,
      limit,
    });
  }
  
  // ... rest of function
}
```

---

### 7.3 Sentry Integration

```typescript
// lib/rate-limit/middleware.ts
import * as Sentry from "@sentry/nextjs";

if (!success) {
  // Report to Sentry with low severity
  Sentry.captureMessage("Rate limit exceeded", {
    level: "warning",
    tags: {
      type: "rate_limit",
      identifier: id,
    },
    extra: {
      endpoint: new URL(request.url).pathname,
      limit,
      reset,
    },
  });
}
```

---

## 🚨 Step 8: Handle Edge Cases (30 min)

### 8.1 Whitelist Trusted IPs

```typescript
// lib/rate-limit/whitelist.ts
const WHITELISTED_IPS = new Set([
  "127.0.0.1",              // Localhost
  "::1",                    // IPv6 localhost
  process.env.ADMIN_IP,     // Admin IP
  // Add monitoring service IPs
]);

export function isWhitelisted(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return ip ? WHITELISTED_IPS.has(ip) : false;
}

// Updated middleware
export async function checkRateLimit(
  request: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<RateLimitResult> {
  // Skip rate limiting for whitelisted IPs
  if (isWhitelisted(request)) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: Date.now() + 60000,
    };
  }
  
  // ... existing logic
}
```

---

### 8.2 Graceful Degradation

```typescript
// lib/rate-limit/wrapper.ts (updated)
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  options = {}
): Promise<Response> {
  try {
    const result = await checkRateLimit(request, limiter, identifier);
    
    if (!result.success) {
      return result.response!;
    }
    
    const response = await handler();
    return addRateLimitHeaders(response, result);
    
  } catch (error) {
    // If rate limiting fails, allow request through
    // (better than blocking all traffic)
    logger.error("Rate limit check failed", { error });
    
    // Still execute handler
    return handler();
  }
}
```

---

### 8.3 Dynamic Rate Limits (Based on User Tier)

```typescript
// lib/rate-limit/dynamic.ts
import { rateLimiters, redis } from "./core";
import { Ratelimit } from "@upstash/ratelimit";

export function getUserRateLimit(userTier: "free" | "pro" | "enterprise"): Ratelimit {
  const limits = {
    free: { requests: 10, window: "1 h" },
    pro: { requests: 100, window: "1 h" },
    enterprise: { requests: 1000, window: "1 h" },
  };
  
  const config = limits[userTier];
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:llm:${userTier}`,
  });
}

// Usage
const session = await getServerSession();
const userTier = session.user.subscription.tier;
const limiter = getUserRateLimit(userTier);
```

---

## ✅ Step 9: Deployment Checklist (15 min)

```markdown
### Before Deploying

- [ ] Upstash Redis database created
- [ ] Environment variables set in production
- [ ] All API routes have rate limiting
- [ ] Rate limits tested locally
- [ ] Monitoring configured (logs, Sentry)
- [ ] Whitelist configured (if needed)
- [ ] Documentation updated

### After Deploying

- [ ] Monitor Upstash dashboard for first 24 hours
- [ ] Check for false positives (legitimate users blocked)
- [ ] Verify rate limit headers in production
- [ ] Test from different IPs/regions
- [ ] Monitor application logs for rate limit events
```

---

## 📈 Expected Results

**Before Rate Limiting:**
- DoS risk: HIGH 🔴
- API abuse: Possible
- Brute force: Vulnerable
- LLM cost control: None

**After Rate Limiting:**
- DoS risk: LOW 🟢
- API abuse: Blocked after 10 requests
- Brute force: Limited to 5 attempts per 15 min
- LLM cost control: Max 20 requests/hour/user

**Cost Impact:**
- Upstash Free Tier: $0/month (10K requests/day)
- Upstash Paid: $0.20 per 100K requests
- LLM cost protection: Unlimited → Capped

---

## 🔧 Troubleshooting

### Issue: "Redis connection failed"

```typescript
// Check environment variables
console.log({
  url: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 20) + "...",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ? "✓ Set" : "✗ Missing",
});

// Test Redis connection
import { redis } from "@/lib/rate-limit/core";
await redis.ping(); // Should return "PONG"
```

---

### Issue: "Too many 429 errors"

```typescript
// Increase rate limits
const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 s"), // Increased from 10
  // ...
});
```

---

### Issue: "Rate limiting slow"

```typescript
// Use fixed window (faster, less accurate)
limiter: Ratelimit.fixedWindow(10, "10 s"), // Instead of slidingWindow
```

---

## 📚 Next Steps

After completing rate limiting:

1. **Security Headers** (1 hour) - Add CSP, HSTS, X-Frame-Options
2. **CORS Restriction** (1 hour) - Limit to production domain
3. **Input Validation** (8 hours) - Add Zod schemas
4. **Azure Key Vault** (2 hours) - Migrate secrets

---

## 🎓 Key Learnings

**Rate Limiting Best Practices:**
1. ✅ Use sliding window (more fair than fixed)
2. ✅ Return 429 with Retry-After header
3. ✅ Rate limit by user ID when authenticated
4. ✅ More restrictive limits for expensive operations (LLM calls)
5. ✅ Include rate limit headers in all responses
6. ✅ Monitor and adjust limits based on real usage
7. ✅ Graceful degradation if Redis fails

---

**Implementation Complete!** 🎉

Total time: ~6 hours  
Protection level: HIGH  
Cost: $0-$20/month  
Ready for production: YES ✅
