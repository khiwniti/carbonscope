---
name: Next.js App Router Guide
description: This skill should be used when the user asks about "Next.js App Router", "Next.js routing", "route groups", "dynamic routes", "parallel routes", "intercepting routes", "middleware", "proxy.ts", or when implementing Next.js routing patterns for AI agent SaaS. Provides comprehensive App Router patterns.
version: 0.1.0
---

# Next.js App Router Guide for AI Agent SaaS

Comprehensive routing patterns for Next.js 15-16+ App Router in AI agent chat SaaS applications.

## Route Structure

### Basic Organization

```
app/
├── (home)/              # Marketing route group
│   ├── layout.tsx       # Marketing layout
│   ├── page.tsx         # Landing page /
│   ├── about/           # /about
│   ├── pricing/         # /pricing
│   └── blog/            # /blog
│
├── (dashboard)/         # App route group
│   ├── layout.tsx       # Dashboard layout
│   ├── dashboard/       # /dashboard
│   ├── agents/          # /agents
│   └── settings/        # /settings
│
└── api/                 # API routes
    ├── chat/            # /api/chat
    ├── agents/          # /api/agents
    └── webhooks/        # /api/webhooks
```

### Route Groups

Use parentheses for organizing without affecting URLs:

```tsx
// app/(home)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      {children}
      <Footer />
    </div>
  );
}

// app/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs/server';

export default async function DashboardLayout({ children }) {
  await auth.protect(); // Require authentication

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Dynamic Routes

### Basic Dynamic Segment

```tsx
// app/agents/[agentId]/page.tsx
export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params; // Next.js 16: params is async

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  return <AgentDetails agent={agent} />;
}

// Generate static paths (SSG)
export async function generateStaticParams() {
  const agents = await prisma.agent.findMany();
  return agents.map(agent => ({ agentId: agent.id }));
}
```

### Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/'); // ['intro', 'getting-started'] → 'intro/getting-started'

  const doc = await getDocByPath(path);
  return <DocContent doc={doc} />;
}
```

### Optional Catch-All

```tsx
// app/shop/[[...slug]]/page.tsx
// Matches: /shop, /shop/electronics, /shop/electronics/phones
export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  if (!slug) {
    return <ShopHome />;
  }

  return <CategoryPage category={slug} />;
}
```

## Parallel Routes

### Multi-Panel Dashboard

```
app/dashboard/
├── layout.tsx
├── page.tsx
├── @team/
│   └── page.tsx
├── @analytics/
│   └── page.tsx
└── @recent/
    └── page.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  team,
  analytics,
  recent,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
  recent: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">{children}</div>
      <div>{team}</div>
      <div>{analytics}</div>
      <div className="col-span-2">{recent}</div>
    </div>
  );
}
```

## Intercepting Routes

### Modal Pattern

```
app/
├── agents/
│   └── [agentId]/
│       └── page.tsx
└── @modal/
    └── (.)agents/
        └── [agentId]/
            └── page.tsx
```

```tsx
// app/@modal/(.)agents/[agentId]/page.tsx
import { Modal } from '@/components/modal';

export default async function AgentModal({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const agent = await getAgent(agentId);

  return (
    <Modal>
      <AgentDetails agent={agent} />
    </Modal>
  );
}
```

## Middleware / Proxy (Next.js 16)

### proxy.ts (Next.js 16+)

```typescript
// proxy.ts (at project root or in src/)
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    await auth.protect();
  }

  // Redirect to dashboard if authenticated user visits home
  const { userId } = await auth();
  if (userId && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### middleware.ts (Next.js 13-15)

For Next.js 13-15, use `middleware.ts` instead of `proxy.ts`:

```typescript
// middleware.ts
import { createMiddleware } from '@supabase/ssr';

export default createMiddleware({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});
```

## API Routes

### Basic Route Handler

```typescript
// app/api/agents/route.ts
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const { userId } = await auth(req);

  const agents = await prisma.agent.findMany({
    where: { user_id: userId },
  });

  return Response.json({ agents });
}

export async function POST(req: Request) {
  const { userId } = await auth(req);
  const body = await req.json();

  const agent = await prisma.agent.create({
    data: {
      ...body,
      user_id: userId,
    },
  });

  return Response.json({ agent }, { status: 201 });
}
```

### Dynamic API Routes

```typescript
// app/api/agents/[agentId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ agent });
}
```

### Streaming Response

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

## Server Actions

### Form Handling

```tsx
// app/agents/new/page.tsx
import { createAgent } from './actions';

export default function NewAgentPage() {
  return (
    <form action={createAgent}>
      <input name="name" placeholder="Agent name" required />
      <select name="model">
        <option value="claude-sonnet-4.6">Claude Sonnet 4.6</option>
        <option value="gpt-5.4">GPT-5.4</option>
      </select>
      <button type="submit">Create Agent</button>
    </form>
  );
}

// app/agents/new/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createAgent(formData: FormData) {
  const { userId } = await auth();

  const agent = await prisma.agent.create({
    data: {
      name: formData.get('name') as string,
      model: formData.get('model') as string,
      user_id: userId,
    },
  });

  revalidatePath('/agents');
  return { success: true, agentId: agent.id };
}
```

### Progressive Enhancement

```tsx
'use client';

import { useActionState } from 'react';
import { createAgent } from './actions';

export function AgentForm() {
  const [state, formAction, isPending] = useActionState(createAgent, null);

  return (
    <form action={formAction}>
      <input name="name" required disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

## Data Fetching

### Server Components (Default)

```tsx
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  // Fetch data directly in component
  const stats = await prisma.stat.findMany();
  const agents = await prisma.agent.findMany();

  return (
    <div>
      <Stats data={stats} />
      <AgentList agents={agents} />
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useState, useEffect } from 'react';

export function ClientAgentList() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents));
  }, []);

  return <div>{agents.map(agent => <AgentCard key={agent.id} {...agent} />)}</div>;
}
```

## Caching & Revalidation

### Time-Based Revalidation (ISR)

```tsx
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return <PostContent post={post} />;
}
```

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { path, tag } = await req.json();

  if (path) {
    revalidatePath(path);
  }

  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}
```

### Cache Components (Next.js 16)

```tsx
'use cache';

async function CachedAgentList({ userId }: { userId: string }) {
  const agents = await prisma.agent.findMany({
    where: { user_id: userId },
  });

  return <div>{agents.map(agent => <AgentCard key={agent.id} {...agent} />)}</div>;
}

export const cacheLife = 3600; // Cache for 1 hour
```

## Additional Resources

### Reference Files

- **`references/advanced-routing.md`** - Advanced routing patterns, parallel intercepting routes
- **`references/caching-strategies.md`** - ISR, cache components, revalidation patterns
- **`references/migration-guide.md`** - Migrating from Pages Router to App Router

### Example Files

- **`examples/dashboard-layout.tsx`** - Complete dashboard with nested layouts
- **`examples/api-routes.ts`** - RESTful API route handlers

## Key Principles

1. **Server Components by Default**: Only add 'use client' when needed
2. **Route Groups**: Organize without affecting URLs
3. **Async Params**: In Next.js 16, params are async Promises
4. **Proxy.ts**: Use proxy.ts (Next.js 16) or middleware.ts (Next.js 13-15)
5. **Server Actions**: Prefer over API routes for mutations
6. **Caching**: Use ISR, cache components, and revalidation strategies

## When to Use This Skill

Use when implementing Next.js routing, migrating to App Router, optimizing route organization, or debugging routing issues in AI agent SaaS applications.
