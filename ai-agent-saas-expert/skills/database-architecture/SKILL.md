---
name: Database Architecture
description: This skill should be used when the user asks about "database architecture", "multi-database patterns", "PostgreSQL setup", "Neo4j integration", "Redis caching", "database optimization", or when designing data layer for AI agent SaaS. Provides comprehensive multi-database architecture patterns.
version: 0.1.0
---

# Database Architecture for AI Agent SaaS

Comprehensive multi-database architecture patterns for AI agent chat SaaS applications.

## Multi-Database Pattern

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │   Graph DB      │     │      Redis      │
│  (Neon/Supabase)│     │  (Neo4j/Cosmos) │     │    (Upstash)    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • Users         │     │ • Relationships │     │ • Sessions      │
│ • Projects      │     │ • Knowledge     │     │ • LLM cache     │
│ • Agents        │     │ • Hierarchies   │     │ • Rate limits   │
│ • Threads       │     │ • Graph queries │     │ • Job queues    │
│ • Auth          │     │ • BIM data      │     │ • Pub/Sub       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Database Responsibilities

**PostgreSQL**: Structured relational data
- User accounts and authentication
- Projects, agents, threads
- Transactional data
- Metadata and settings
- CRUD operations

**Graph Database**: Complex relationships
- Knowledge graphs
- Hierarchical structures (BIM, org charts)
- Path queries and traversals
- Recommendation engines
- Network analysis

**Redis**: Caching and real-time
- Session storage
- LLM response caching
- Rate limiting
- Background job queues
- Real-time pub/sub

## PostgreSQL Setup

### Prisma Schema

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar_url    String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  projects      Project[]
  agents        Agent[]
  threads       Thread[]

  @@index([email])
}

model Project {
  id            String    @id @default(cuid())
  user_id       String
  name          String
  description   String?
  building_ids  Json?     // Reference to graph DB
  created_at    DateTime  @default(now())

  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  threads       Thread[]

  @@index([user_id])
}

model Agent {
  id            String    @id @default(cuid())
  user_id       String
  name          String
  model         String
  tools         Json?
  config        Json?
  created_at    DateTime  @default(now())

  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  threads       Thread[]

  @@index([user_id])
}

model Thread {
  id            String    @id @default(cuid())
  user_id       String
  agent_id      String
  project_id    String?
  messages      Json      @default("[]")
  metadata      Json?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  agent         Agent     @relation(fields: [agent_id], references: [id], onDelete: Cascade)
  project       Project?  @relation(fields: [project_id], references: [id], onDelete: SetNull)

  @@index([user_id])
  @@index([agent_id])
  @@index([project_id])
}
```

### Connection Pooling

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Query Optimization

```typescript
// ❌ N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const projects = await prisma.project.findMany({ where: { user_id: user.id } });
}

// ✅ Use include to fetch related data
const users = await prisma.user.findMany({
  include: {
    projects: true,
    agents: true,
  },
});

// ✅ Or use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    projects: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

## Neo4j Integration

### Connection Setup

```typescript
// lib/neo4j.ts
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

export async function runQuery<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(record => record.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  await driver.close();
}
```

### Graph Queries

```typescript
// Create knowledge graph
await runQuery(`
  CREATE (b:Building {id: $buildingId, name: $name})
  CREATE (f:Floor {id: $floorId, name: $floorName, level: $level})
  CREATE (e:Element {id: $elementId, type: $type})
  CREATE (b)-[:CONTAINS]->(f)
  CREATE (f)-[:CONTAINS]->(e)
`, { buildingId, name, floorId, floorName, level, elementId, type });

// Traverse hierarchy
const hierarchy = await runQuery(`
  MATCH (b:Building {id: $buildingId})-[:CONTAINS*]->(e:Element)
  RETURN b.name as building, collect(e.type) as elements
`, { buildingId });

// Path queries
const paths = await runQuery(`
  MATCH path = (start:Element {id: $startId})-[*1..5]-(end:Element {id: $endId})
  RETURN path
`, { startId, endId });
```

## Redis Integration

### Setup

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// Type-safe helpers
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);
    return data as T | null;
  },

  set: async <T>(key: string, value: T, expiresIn?: number) => {
    if (expiresIn) {
      await redis.setex(key, expiresIn, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  },

  del: async (key: string) => {
    await redis.del(key);
  },
};
```

### LLM Response Caching

```typescript
import { cache } from '@/lib/redis';
import crypto from 'crypto';

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

async function getCachedLLMResponse(prompt: string) {
  const key = `llm:${hashPrompt(prompt)}`;

  // Check cache
  const cached = await cache.get<{ text: string }>(key);
  if (cached) return cached;

  // Generate response
  const result = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: [{ role: 'user', content: prompt }],
  });

  // Cache for 1 hour
  await cache.set(key, { text: result.text }, 3600);

  return { text: result.text };
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  return { remaining, reset };
}
```

## Data Coordination

### Cross-Database Operations

```typescript
async function createProject(userId: string, data: ProjectData) {
  // 1. Create in PostgreSQL
  const project = await prisma.project.create({
    data: {
      user_id: userId,
      name: data.name,
      description: data.description,
    },
  });

  // 2. Create knowledge graph in Neo4j
  await runQuery(`
    CREATE (p:Project {id: $projectId, name: $name})
    RETURN p
  `, { projectId: project.id, name: data.name });

  // 3. Cache project ID
  await cache.set(`project:${project.id}`, project, 3600);

  return project;
}
```

### Transactional Consistency

```typescript
async function deleteProject(projectId: string) {
  try {
    // 1. Delete from PostgreSQL (cascades to threads)
    await prisma.project.delete({ where: { id: projectId } });

    // 2. Delete from Neo4j
    await runQuery(`
      MATCH (p:Project {id: $projectId})
      DETACH DELETE p
    `, { projectId });

    // 3. Clear cache
    await cache.del(`project:${projectId}`);
  } catch (error) {
    // Rollback logic if needed
    console.error('Failed to delete project:', error);
    throw error;
  }
}
```

## Performance Optimization

### Database Indexes

```sql
-- PostgreSQL indexes
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_agent_id ON threads(agent_id);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_threads_user_agent ON threads(user_id, agent_id);

-- Partial index for active threads
CREATE INDEX idx_threads_active ON threads(user_id) WHERE updated_at > NOW() - INTERVAL '7 days';
```

### Query Analysis

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## Migrations

### Prisma Migrations

```bash
# Create migration
npx prisma migrate dev --name add_threads_table

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Neo4j Schema Migrations

```typescript
// migrations/001_create_constraints.ts
await runQuery(`
  CREATE CONSTRAINT project_id IF NOT EXISTS
  FOR (p:Project) REQUIRE p.id IS UNIQUE
`);

await runQuery(`
  CREATE INDEX element_type IF NOT EXISTS
  FOR (e:Element) ON (e.type)
`);
```

## Backup Strategy

### PostgreSQL Backups

```bash
# Neon provides automatic backups
# Point-in-time recovery available

# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Neo4j Backups

```bash
# Neo4j Aura provides automatic backups
# Manual export
neo4j-admin database dump <database-name>

# Import
neo4j-admin database load <database-name>
```

## Additional Resources

### Reference Files

- **`references/prisma-advanced.md`** - Advanced Prisma patterns, custom types
- **`references/neo4j-cypher.md`** - Cypher query language guide
- **`references/redis-patterns.md`** - Advanced Redis patterns, pub/sub

### Example Files

- **`examples/schema.prisma`** - Complete Prisma schema
- **`examples/neo4j-queries.ts`** - Common Neo4j query patterns

## Key Principles

1. **Right Tool for Job**: Use each database for its strengths
2. **Denormalization**: Acceptable in graph and cache layers
3. **Consistency**: Maintain data integrity across databases
4. **Caching**: Cache expensive queries and computations
5. **Indexing**: Create indexes for frequent queries
6. **Monitoring**: Track query performance and slow queries
7. **Backups**: Regular backups with tested restore procedures

## When to Use This Skill

Use when designing database architecture, optimizing queries, implementing multi-database patterns, or debugging data layer issues in AI agent SaaS applications.
