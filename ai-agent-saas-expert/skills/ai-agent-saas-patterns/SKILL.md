---
name: AI Agent SaaS Patterns
description: This skill should be used when the user asks about "AI agent architecture", "agent SaaS patterns", "monorepo structure for agents", "multi-platform agent apps", or when building AI agent chat platforms. Provides comprehensive architectural patterns for production AI agent SaaS applications.
version: 0.1.0
---

# AI Agent SaaS Architecture Patterns

Architecture patterns and best practices for building production-ready AI agent chat SaaS applications.

## Overview

AI agent SaaS applications require sophisticated architecture to handle:
- Multi-platform deployment (web, mobile, desktop)
- Real-time agent interactions with streaming responses
- Sandbox environments for code execution
- Multi-database patterns for different data types
- LLM provider integration with failover
- Agent runtime isolation and security

## Monorepo Structure

### Recommended Organization

Use pnpm/npm workspaces with clear separation:

```
your-agent-saas/
├── apps/
│   ├── frontend/          # Next.js web app
│   ├── mobile/            # React Native app
│   └── desktop/           # Electron app (optional)
├── packages/
│   ├── shared/            # Shared types, utils, components
│   │   ├── src/
│   │   │   ├── types/     # TypeScript types
│   │   │   ├── utils/     # Shared utilities
│   │   │   └── components/ # Reusable UI components
│   │   └── design-system/ # Design tokens, themes
│   └── api-client/        # API client library
├── backend/
│   ├── api/               # FastAPI/Express backend
│   ├── agents/            # Agent runtime logic
│   └── workers/           # Background jobs
├── infra/                 # Infrastructure as code
├── sdk/                   # Public SDK for developers
└── supabase/             # Database migrations, functions
```

### Workspace Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Root package.json:**
```json
{
  "name": "agent-saas-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:mobile": "pnpm --filter mobile dev",
    "build:all": "turbo run build",
    "test": "turbo run test"
  }
}
```

Use Turborepo for build orchestration and caching.

## Multi-Platform Architecture

### Platform-Specific Considerations

**Web (Next.js):**
- App Router for file-system routing
- Server Components for AI interactions
- Real-time streaming via Server-Sent Events
- Middleware for auth and routing

**Mobile (React Native):**
- Expo for development workflow
- Native modules for platform features
- Offline-first with local storage
- Push notifications for agent updates

**Desktop (Electron - Optional):**
- Native OS integration
- Local file system access
- System tray for quick access
- Auto-updates

### Shared Code Strategy

Extract maximum code to `packages/shared`:

```typescript
// packages/shared/src/types/agent.ts
export interface Agent {
  id: string;
  name: string;
  model: string;
  tools: string[];
  config: AgentConfig;
}

export interface Thread {
  id: string;
  agent_id: string;
  messages: Message[];
  metadata: Record<string, any>;
}
```

Platform-specific implementations import from shared packages.

## Agent Runtime Architecture

### Sandbox Integration

Isolate agent code execution in sandboxes for security:

**Patterns:**
1. **Docker Containers**: Full isolation, resource limits
2. **Daytona/E2B**: Managed sandbox providers
3. **V8 Isolates**: Lightweight JavaScript isolation
4. **WebAssembly**: Sandboxed compiled code

**Health Check Pattern:**
```typescript
// Unified status system
type SandboxStatus =
  | 'LIVE'      // Fully operational
  | 'STARTING'  // Transitioning
  | 'OFFLINE'   // Intentionally stopped
  | 'FAILED'    // Degraded/unhealthy
  | 'UNKNOWN';  // Cannot determine

interface SandboxState {
  status: SandboxStatus;
  sandbox_id: string;
  daytona_state: string;
  services_health?: ServicesHealth;
  vnc_preview?: string;
  resources: { cpu: number; memory: number; disk: number };
}
```

### Agent Execution Models

**Stateless Agents:**
- Each request creates new agent instance
- No memory between requests
- Fast, scalable, simple

**Stateful Agents:**
- Maintain conversation context
- Persist state in database
- Resume from checkpoints
- More complex but necessary for long-running tasks

**Durable Agents (Recommended for Production):**
- Survive crashes and deployments
- Built-in retry and error handling
- Observable and debuggable
- Use Workflow DevKit or similar

## Multi-Database Architecture

### Pattern: PostgreSQL + Graph + Redis

**PostgreSQL (Neon, Supabase):**
- User accounts, authentication
- Projects, agents, threads
- Transactional data, metadata
- CRUD operations

**Graph Database (Neo4j, Cosmos Gremlin):**
- Complex relationships (BIM data, knowledge graphs)
- Hierarchical structures
- Path queries and traversals
- Specialized domain data

**Redis (Upstash):**
- Session storage
- LLM response caching
- Rate limiting counters
- Background job queues
- Real-time pub/sub

### Data Flow Example

```typescript
// 1. Create project in PostgreSQL
const project = await db.projects.create({
  user_id: userId,
  name: 'AI Assistant',
});

// 2. Create knowledge graph in Neo4j
await neo4j.run(`
  CREATE (p:Project {id: $projectId})
  CREATE (a:Agent {id: $agentId})
  CREATE (p)-[:HAS_AGENT]->(a)
`, { projectId: project.id, agentId });

// 3. Cache in Redis
await redis.set(`project:${project.id}`, JSON.stringify(project), 'EX', 3600);
```

## LLM Integration Patterns

### Multi-Provider Strategy

Use LiteLLM or AI Gateway for unified interface:

```typescript
// Single interface, multiple providers
const response = await generateText({
  model: 'anthropic/claude-sonnet-4.6', // AI Gateway format
  messages,
  tools,
});

// Automatic failover
const config = {
  providers: [
    { model: 'anthropic/claude-sonnet-4.6', priority: 1 },
    { model: 'openai/gpt-4', priority: 2 },
  ],
  retry: { attempts: 3, backoff: 'exponential' },
};
```

### Streaming Architecture

**Server-Side:**
```typescript
// Next.js Route Handler
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

**Client-Side:**
```typescript
// React component
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});
```

## Real-Time Features

### WebSocket vs Server-Sent Events

**Server-Sent Events (Recommended for AI Streaming):**
- One-directional (server → client)
- Built into Next.js/HTTP
- Automatic reconnection
- Simple implementation

**WebSocket (For Bidirectional):**
- Real-time collaboration
- Multi-user interactions
- Live agent status updates

### Implementation Pattern

```typescript
// SSE for AI streaming
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI with streaming tokens
};

// WebSocket for presence
const ws = new WebSocket('wss://api/presence');
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'agent_status') {
    updateAgentStatus(data);
  }
};
```

## Additional Resources

### Reference Files

For detailed implementation patterns and advanced topics:

- **`references/monorepo-setup.md`** - Complete monorepo configuration with Turborepo
- **`references/sandbox-providers.md`** - Comparison of Daytona, E2B, Docker, and custom sandboxes
- **`references/database-patterns.md`** - Multi-database strategies and data synchronization
- **`references/scaling-strategies.md`** - Horizontal scaling, load balancing, and performance optimization

### Example Files

Working examples from production systems:

- **`examples/package-json-structure.json`** - Complete monorepo package.json
- **`examples/workspace-config.yaml`** - Turborepo and pnpm workspace configuration
- **`examples/agent-runtime.ts`** - Complete agent execution pattern
- **`examples/multi-db-service.ts`** - Service layer coordinating multiple databases

## Key Principles

1. **Separation of Concerns**: Clear boundaries between apps, packages, and backend
2. **Progressive Enhancement**: Start with web, add mobile/desktop as needed
3. **Shared Code**: Maximize code reuse through workspace packages
4. **Isolated Execution**: Sandbox agent code for security
5. **Multi-Database**: Use the right database for each data type
6. **Provider Agnostic**: Abstract LLM providers for flexibility
7. **Real-Time First**: Design for streaming and live updates
8. **Observable**: Instrument everything for debugging and monitoring
9. **Scalable**: Architecture that grows from prototype to production

## When to Use This Skill

Use this skill when:
- Designing architecture for new AI agent SaaS platform
- Migrating from single-app to monorepo structure
- Adding mobile/desktop platforms to existing web app
- Implementing sandbox integration for agent execution
- Setting up multi-database architecture
- Integrating multiple LLM providers
- Building real-time agent interaction features
- Scaling from MVP to production

For deployment strategies, see `deployment-strategies` skill.
For security patterns, see `security-checklist` skill.
For specific Next.js routing, see `nextjs-app-router-guide` skill.
