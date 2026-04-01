---
name: LLM Integration Patterns
description: This skill should be used when the user asks about "LLM integration", "AI SDK setup", "multi-provider LLM", "streaming responses", "tool calling", "Anthropic integration", "OpenAI integration", or when implementing LLM features in AI agent SaaS. Provides comprehensive LLM integration patterns.
version: 0.1.0
---

# LLM Integration Patterns for AI Agent SaaS

Comprehensive patterns for integrating multiple LLM providers with failover, streaming, and tool calling.

## Multi-Provider Strategy

### LiteLLM (Recommended for VM Deployments)

For self-hosted, flexible LLM routing with full control:

```python
# backend/core/services/llm.py
from litellm import completion, acompletion
import os

# Configure LiteLLM
os.environ["ANTHROPIC_API_KEY"] = os.getenv("ANTHROPIC_API_KEY")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Synchronous completion
response = completion(
    model="claude-sonnet-4.6",
    messages=messages,
    fallbacks=[
        {"model": "gpt-5.4"},
        {"model": "gpt-4"},
    ],
    num_retries=3,
    timeout=180,
)

# Async completion (recommended for FastAPI)
async def get_llm_response(messages):
    response = await acompletion(
        model="claude-sonnet-4.6",
        messages=messages,
        fallbacks=[
            {"model": "gpt-5.4"},
            {"model": "gpt-4"},
        ],
        stream=True,
    )

    async for chunk in response:
        yield chunk
```

**Benefits:**
- ✅ Full control over routing logic
- ✅ Self-hosted (no vendor lock-in)
- ✅ Custom fallback strategies
- ✅ Supports 100+ LLM providers
- ✅ Built-in caching and retry logic
- ✅ Cost tracking and logging
- ✅ Works with any hosting environment

**LiteLLM Configuration:**
```python
# backend/core/services/llm_config.py
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "claude-primary",
            "litellm_params": {
                "model": "claude-sonnet-4.6",
                "api_key": os.getenv("ANTHROPIC_API_KEY"),
            },
        },
        {
            "model_name": "gpt-fallback",
            "litellm_params": {
                "model": "gpt-5.4",
                "api_key": os.getenv("OPENAI_API_KEY"),
            },
        },
    ],
    fallbacks=[
        {"claude-primary": ["gpt-fallback"]}
    ],
    num_retries=2,
    timeout=300,
)

# Use the router
response = await router.acompletion(
    model="claude-primary",
    messages=messages
)
```

### AI Gateway (Alternative for Vercel Frontends)

If using Vercel for frontend with Next.js:

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

// AI Gateway routing (requires Vercel account)
const response = await streamText({
  model: 'anthropic/claude-sonnet-4.6', // AI Gateway format
  messages,
  tools,
});
```

**Benefits:**
- Automatic failover between providers
- Unified billing and cost tracking
- < 20ms routing latency
- No manual API key management (OIDC)

**Limitations:**
- Requires Vercel account
- Limited to Vercel-hosted frontends
- Less control over routing logic
- Vendor lock-in to Vercel ecosystem

**Use AI Gateway when:**
- Frontend is deployed on Vercel
- Zero LLM infrastructure management desired
- Edge performance critical

**Use LiteLLM when:**
- Backend is self-hosted on VMs
- Full control over routing needed
- Cost optimization important
- Multi-cloud strategy desired
```

## Streaming Implementation

### Server-Side (Next.js Route Handler)

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: convertToModelMessages(messages),
    temperature: 0.7,
    maxTokens: 4096,
  });

  return result.toUIMessageStreamResponse();
}
```

### Client-Side (React)

```typescript
// components/Chat.tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from '@ai-sdk/react';
import { Message } from '@/components/ai-elements/message';

export function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  return (
    <div>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
      <PromptInput
        onSubmit={(text) => sendMessage({ text })}
        disabled={status === 'streaming'}
      />
    </div>
  );
}
```

## Tool Calling

### Define Tools

```typescript
import { z } from 'zod';
import { tool } from 'ai';

const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City and country'),
    units: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    humidity: z.number(),
  }),
  execute: async ({ location, units = 'celsius' }) => {
    const data = await fetchWeather(location, units);
    return data;
  },
});

const searchTool = tool({
  description: 'Search the web for information',
  inputSchema: z.object({
    query: z.string(),
    maxResults: z.number().optional().default(5),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
  execute: async ({ query, maxResults }) => {
    const results = await searchWeb(query, maxResults);
    return { results };
  },
});
```

### Use Tools in Agent

```typescript
import { streamText } from 'ai';
import { stopWhen, stepCountIs } from 'ai';

const result = await streamText({
  model: 'anthropic/claude-sonnet-4.6',
  messages,
  tools: {
    weather: weatherTool,
    search: searchTool,
  },
  stopWhen: stepCountIs(10), // Max 10 tool calls
  temperature: 0.2, // Lower for tool use
});
```

### Render Tool Calls (AI Elements)

```typescript
import { Message } from '@/components/ai-elements/message';

// AI Elements automatically renders tool calls
<Message message={message} />

// message.parts includes:
// - { type: 'text', content: '...' }
// - { type: 'tool-call', toolCallId, toolName, args }
// - { type: 'tool-result', toolCallId, result }
```

## Structured Output

### Extract Structured Data

```typescript
import { generateText, Output } from 'ai';
import { z } from 'zod';

const extractionSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  interests: z.array(z.string()),
});

const result = await generateText({
  model: 'anthropic/claude-sonnet-4.6',
  messages: [
    { role: 'user', content: userInput },
  ],
  output: Output.object({
    schema: extractionSchema,
  }),
});

// Type-safe structured output
const data: z.infer<typeof extractionSchema> = result.object;
```

## Agent Class

### Multi-Step Reasoning

```typescript
import { Agent, stopWhen, stepCountIs } from 'ai';

const agent = new Agent({
  model: 'anthropic/claude-sonnet-4.6',
  instructions: 'You are a helpful research assistant.',
  tools: {
    search: searchTool,
    calculator: calculatorTool,
  },
  stopWhen: stopWhen(
    ({ result }) => result.finishReason === 'stop',
    stepCountIs(20)
  ),
});

// Stream agent execution
const stream = await agent.stream({
  messages: [{ role: 'user', content: 'Research quantum computing' }],
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

## Durable Agents (Production)

### Workflow DevKit Integration

```typescript
'use workflow';

import { DurableAgent } from '@workflow/ai/agent';

export async function researchWorkflow({ input }: { input: { query: string } }) {
  const agent = new DurableAgent({
    model: 'anthropic/claude-sonnet-4.6',
    instructions: 'Research assistant',
    tools: { search: searchTool },
  });

  const result = await agent.generate({
    messages: [{ role: 'user', content: input.query }],
  });

  return { findings: result.text };
}
```

**Benefits:**
- Survives crashes and redeployments
- Observable execution steps
- Automatic retry on failure
- Pause/resume support

## Error Handling & Retry

### Retry Logic

```typescript
import { generateText } from 'ai';
import { sleep } from 'workflow';

async function callLLMWithRetry(messages: Message[], attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateText({
        model: 'anthropic/claude-sonnet-4.6',
        messages,
      });
    } catch (error) {
      if (i === attempts - 1) throw error;

      // Exponential backoff
      await sleep(2 ** i * 1000);
    }
  }
}
```

### Provider Failover

```typescript
const providers = [
  'anthropic/claude-sonnet-4.6',
  'openai/gpt-5.4',
  'openai/gpt-4',
];

async function callWithFailover(messages: Message[]) {
  for (const model of providers) {
    try {
      return await generateText({ model, messages });
    } catch (error) {
      console.error(`Provider ${model} failed:`, error);
      continue;
    }
  }

  throw new Error('All providers failed');
}
```

## Caching Strategies

### Redis Caching

```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

async function getCachedResponse(prompt: string) {
  const cacheKey = `llm:${hashPrompt(prompt)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string);

  // Generate response
  const result = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: [{ role: 'user', content: prompt }],
  });

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(result));

  return result;
}

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}
```

## Cost Tracking

### Token Counting

```typescript
const result = await generateText({
  model: 'anthropic/claude-sonnet-4.6',
  messages,
});

console.log('Usage:', {
  promptTokens: result.usage.promptTokens,
  completionTokens: result.usage.completionTokens,
  totalTokens: result.usage.totalTokens,
});

// Estimate cost
const costPerToken = {
  'claude-sonnet-4.6': { input: 0.003 / 1000, output: 0.015 / 1000 },
  'gpt-4': { input: 0.01 / 1000, output: 0.03 / 1000 },
};

const cost =
  result.usage.promptTokens * costPerToken['claude-sonnet-4.6'].input +
  result.usage.completionTokens * costPerToken['claude-sonnet-4.6'].output;
```

### Database Tracking

```typescript
// Store LLM usage in database
await prisma.llmUsage.create({
  data: {
    user_id: userId,
    thread_id: threadId,
    model: 'anthropic/claude-sonnet-4.6',
    prompt_tokens: result.usage.promptTokens,
    completion_tokens: result.usage.completionTokens,
    cost: estimatedCost,
    latency_ms: latencyMs,
    success: true,
    timestamp: new Date(),
  },
});
```

## Rate Limiting

### User-Based Limits

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 d'), // 100 requests per day
  analytics: true,
});

export async function POST(req: Request) {
  const { userId } = await auth(req);

  const { success } = await ratelimit.limit(`llm:${userId}`);

  if (!success) {
    return Response.json(
      { error: 'Daily limit exceeded' },
      { status: 429 }
    );
  }

  // Process request
}
```

## Additional Resources

### Reference Files

- **`references/ai-sdk-advanced.md`** - Advanced AI SDK patterns (agents, workflows)
- **`references/provider-comparison.md`** - Feature comparison across LLM providers
- **`references/cost-optimization.md`** - Strategies for reducing LLM costs

### Example Files

- **`examples/chat-implementation.tsx`** - Complete chat UI with streaming
- **`examples/tool-definitions.ts`** - Common tool implementations
- **`examples/agent-workflow.ts`** - Durable agent with workflow

## When to Use This Skill

Use when implementing LLM features, setting up multi-provider routing, building chat interfaces, implementing tool calling, or optimizing LLM cost and performance.
