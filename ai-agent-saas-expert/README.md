# AI Agent SaaS Expert Plugin

**Professional AI agent team specialized in building production-ready AI agent chat SaaS applications**

This Claude Code plugin provides a comprehensive expert team that audits, validates, and improves AI agent chat SaaS applications. Based on analysis of production systems like Kortix/AgentPress, it covers architecture, security, performance, sandbox integration, deployment patterns, **and frontend agent UI** (streaming chat, tool-call rendering, Zustand/TanStack Query state, SSE/WebSocket UX).

---

## 🎯 What This Plugin Does

The **AI Agent SaaS Expert** plugin provides **10 specialized agents** and **11 knowledge skills** that help you:

✅ **Audit architecture** - Validate monorepo structure, routing patterns, database design
✅ **Ensure production readiness** - Check security, monitoring, error handling, scaling
✅ **Verify sandbox integration** - Validate Docker/Daytona setup, health checks
✅ **Optimize routing** - Analyze Next.js App Router patterns, dynamic/static routes
✅ **Harden security** - Audit auth, API security, input validation
✅ **Tune performance** - Cache strategies, database optimization, bundle size
✅ **Validate integrations** - Check LLM providers, APIs, webhooks
✅ **Audit frontend agent UI** - Streaming chat, tool-call cards, status badges, accessibility
✅ **Build agent UI components** - Production-ready StreamingText, ToolCallCard, ChatInput, FileUploadZone
✅ **Design frontend state** - Zustand stores, TanStack Query, optimistic updates, SSE reconnection

---

## 🚀 Quick Start

### Installation

```bash
# Install plugin globally
cc plugin install ai-agent-saas-expert

# Or use locally for a specific project
cd your-ai-agent-saas-project
cc --plugin-dir /path/to/ai-agent-saas-expert
```

### Usage

#### **Invoke Agents:**

```bash
# Architecture audit
Ask Claude: "I need an architecture review of my AI agent SaaS project"

# Production readiness check
Ask Claude: "Is my project production-ready?"

# Security audit
Ask Claude: "Review my authentication and API security"

# Performance analysis
Ask Claude: "Analyze performance and caching strategies"
```

#### **Access Skills:**

Skills are automatically loaded when relevant topics are discussed:
- Mention "deployment" → `deployment-strategies` skill loads
- Mention "sandbox" → `sandbox-integration-guide` skill loads
- Mention "routing" → `nextjs-app-router-guide` skill loads

---

## 🤖 Specialized Agents

### 1. **architecture-auditor**
Reviews monorepo structure, workspace dependencies, routing patterns, database architecture.

**When to use:**
- After setting up project structure
- Before major architectural changes
- During code reviews

**Example:**
```
User: "Review my monorepo architecture"
Agent: *Analyzes package.json, tsconfig, workspace structure, generates report with recommendations*
```

### 2. **production-readiness**
Comprehensive production checklist: security, monitoring, error handling, scaling.

**When to use:**
- Before deployment
- After major features
- Quarterly reviews

**Example:**
```
User: "Is my project ready for production?"
Agent: *Checks env vars, error boundaries, logging, rate limiting, generates checklist*
```

### 3. **sandbox-integration-validator**
Verifies sandbox integration (Daytona/Docker), health checks, resource allocation.

**When to use:**
- After sandbox setup
- When sandbox issues occur
- Before scaling sandbox infrastructure

### 4. **nextjs-routing-optimizer**
Analyzes Next.js App Router patterns, dynamic/static routing, middleware.

**When to use:**
- When adding new routes
- Performance optimization
- After Next.js upgrades

### 5. **security-hardening**
Audits authentication, API security, input validation, SQL injection prevention.

**When to use:**
- Before security reviews
- After auth changes
- Before handling sensitive data

### 6. **performance-tuning**
Analyzes caching strategies, database optimization, bundle size, Core Web Vitals.

**When to use:**
- Slow page loads
- High database latency
- Poor Core Web Vitals scores

### 7. **sandbox-validator**
Validates sandbox container health, service status, and resource utilization.

**When to use:**
- Troubleshooting sandbox issues
- Monitoring container health
- Optimizing resource allocation

### 8. **integration-validator**
Verifies LLM integrations, external APIs, webhooks, third-party services.

**When to use:**
- After adding integrations
- When webhook failures occur
- Before going live with new providers

### 9. **frontend-agent-ui-auditor** ✨ New
Comprehensive audit of the agent chat frontend: streaming rendering health, tool-call visualisation, sandbox status UI, Zustand state design, TanStack Query patterns, file-upload UX, accessibility, and re-render performance.

**When to use:**
- Before shipping a new chat UI
- When streaming text flickers or lags
- When tool-call output looks raw/broken
- Before accessibility review

**Example:**
```
User: "Our streaming chat flickers badly and tool outputs look ugly"
Agent: *Audits MessageBubble, ToolCallCard, StreamingText, Zustand selectors;
        generates prioritised fix list with before/after code*
```

### 10. **agent-ui-component-optimizer** ✨ New
Designs, implements, and optimises individual React components for agent UIs — `StreamingText`, `ToolCallCard`, `SandboxStatusBadge`, `ChatInput`, `AgentThinkingIndicator`, `ConnectionBanner`, `FileUploadZone`, `ThreadSidebar`.

**When to use:**
- Building a new agent chat UI from scratch
- Refactoring an existing component
- Adding a missing component (e.g. tool-call card, status badge)
- Fixing layout shift or re-render performance

---

## 📚 Knowledge Skills

### 1. **ai-agent-saas-patterns**
Architecture patterns for AI agent platforms, monorepo structure, agent runtime design.

### 2. **deployment-strategies**
Vercel deployment, Docker containerization, Railway/cloud deployment, env management.

### 3. **security-checklist**
Auth patterns, API security, input validation, secrets management.

### 4. **sandbox-integration-guide**
Daytona setup, Docker health checks, service orchestration, VNC integration.

### 5. **nextjs-app-router-guide**
Route groups, dynamic vs static routes, server actions, middleware patterns.

### 6. **database-architecture**
Multi-database patterns (PostgreSQL + Graph + Redis), query optimization, migrations.

### 7. **llm-integration-patterns**
LiteLLM setup, multi-provider fallbacks, streaming responses, error handling.

### 8. **production-checklist**
Pre-deployment checklist, monitoring setup, error tracking, performance optimization.

### 9. **agent-chat-ui-patterns** ✨ New
Parts-based message rendering architecture, `MessageBubble`, `ToolCallCard`, `MessageRenderer`, virtualised `MessageList` with `@tanstack/react-virtual`, `FileUploadZone`, `ChatInput`, full chat page layout. Includes ARIA accessibility patterns for streaming text.

### 10. **agent-state-management** ✨ New
Zustand store-per-concern design (`threadStore`, `uiStore`, `agentBuilderStore`), granular selector memoisation for streaming performance, TanStack Query patterns for agent/thread data, optimistic thread creation with rollback, `useInfiniteQuery` for paginated thread history, `useAgentThread` composite hook.

### 11. **agent-streaming-ux** ✨ New
`useSSEStream` hook with exponential back-off reconnection, `useSandboxStatus` WebSocket hook, streaming phase state machine (idle → thinking → streaming → done → error), abort/stop-generation button, `ScrollAnchor` with jump-to-bottom, network-aware offline banner, `X-Accel-Buffering: no` for Nginx. Includes a streaming performance checklist (flicker, re-renders, markdown parsing timing).

---

## ⚙️ Configuration

Create `.claude/ai-agent-saas-expert.local.md` in your project:

```markdown
# AI Agent SaaS Expert Configuration

## Deployment Target
- Primary: Self-hosted VM (AWS EC2/Azure VM/GCP Compute)
- Container: Docker + Docker Compose
- Orchestration: Docker Swarm / Kubernetes (for scale)
- Load Balancer: Nginx
- SSL: Let's Encrypt (certbot)

## Infrastructure
- VM Size: t3.xlarge (4 vCPU, 16GB RAM) for production
- Scaling: Horizontal with load balancer
- Monitoring: Prometheus + Grafana
- Logging: ELK Stack / Loki

## Sandbox Provider
- Provider: Docker containers
- Health Check Endpoint: /health
- Isolation: Container-level

## Databases
- PostgreSQL: Self-hosted or managed (RDS/Azure Database)
- Graph: Neo4j self-hosted
- Cache: Redis self-hosted or managed (ElastiCache/Azure Cache)

## LLM Providers
- Primary: Anthropic (Claude) via LiteLLM
- Fallback: OpenAI (GPT-4) via LiteLLM
- Router: LiteLLM (self-hosted)
- Alternative: AI Gateway (if using Vercel for frontend)

## Security Requirements
- Compliance: GDPR, SOC 2
- Auth: Supabase Auth or Auth.js
- Rate Limiting: Redis-based (ioredis-mock for dev)
- Firewall: UFW / Security Groups

## Performance Targets
- Core Web Vitals: ≥90
- API Response: <200ms p95
- Database Query: <50ms p95
- Auto-scaling: CPU >70% triggers scale-up
```

---

## 🏗️ Architecture Patterns

This plugin is designed for AI agent SaaS applications with:

- **Monorepo structure** (pnpm/npm workspaces)
- **Next.js App Router** (15+)
- **Multi-database architecture** (PostgreSQL + Graph + Redis)
- **Sandbox integration** (Daytona, E2B, Docker)
- **LLM providers** (Anthropic, OpenAI, multi-provider)
- **Real-time features** (WebSocket, streaming)

---

## 🤝 Contributing

Contributions welcome! This plugin is based on production patterns from real AI agent SaaS platforms.

### Adding Industry-Specific Skills

Create skills for specific industries:
- `healthcare-compliance` - HIPAA, patient data handling
- `finance-security` - PCI DSS, transaction security
- `education-privacy` - FERPA, student privacy

### Extending Agent Capabilities

Add specialized agents for:
- Accessibility auditing
- Multi-tenancy validation
- API versioning strategies
- Internationalization (i18n)

---

## 📄 License

MIT License - feel free to use in your projects!

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Platform](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LiteLLM Documentation](https://docs.litellm.ai)
- [Daytona Documentation](https://daytona.io/docs)

---

**Ready to build production-ready AI agent SaaS applications?** 🚀

Install the plugin and start getting expert guidance on architecture, security, performance, and more!
