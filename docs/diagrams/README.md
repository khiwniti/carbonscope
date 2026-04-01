# BKS cBIM AI: Project Diagrams

This directory contains comprehensive Excalidraw diagrams documenting the BKS cBIM AI project from business value through production deployment. Each diagram follows Cole Medin's "diagrams that argue, not display" philosophy - the structure alone communicates the concept.

## 📊 Diagram Catalog

### 1. Business Value & User Journey
**File:** `01-business-value-user-journey.excalidraw`

**What it shows:**
- Stakeholder pain points (Architects, Contractors, Building Owners)
- Current manual processes and their inefficiencies
- BKS cBIM AI solution as a central hub
- Key benefits (99.9% faster, 100% accurate, AI-powered)
- ROI impact (70% cost savings, certification-ready)

**Visual structure:** Journey map with problem-solution-benefit flow
**Color coding:** 🟡 Stakeholders, 🔴 Pain points, 🟢 Solution, 🟣 Benefits, 🟠 ROI

**Use this for:** Business presentations, stakeholder alignment, value proposition pitches

---

### 2. 12-Agent Orchestration Architecture
**File:** `02-agent-orchestration.excalidraw`

**What it shows:**
- Supervisor Router as central hub (capability-based routing)
- 12 specialized agents arranged radially
- Agent types: Core Analysis (Material, Carbon, Sustainability, Compliance)
- Data Processing agents (BOQ, Certification)
- External services (Visualization, Recommendation, Validation)
- Infrastructure agents (Export, Notification, Analytics)
- Performance metrics: 100% routing accuracy, <0.1s recalculation

**Visual structure:** Hub-and-spoke pattern
**Color coding:** 🔵 Hub, 🟡 Core agents, 🟢 Data agents, 🟣 Services, 🔴 Infrastructure

**Use this for:** Technical architecture discussions, agent orchestration explanation, LangGraph system design

---

### 3. Full-Stack System Architecture
**File:** `03-system-architecture.excalidraw`

**What it shows:**
- 4-layer architecture: Presentation → API → Intelligence → Data
- Frontend: Next.js 14+, React 18+, TypeScript, TailwindCSS
- API: FastAPI, REST + GraphQL, JWT Auth
- Intelligence: LangGraph, 12 agents, OpenAI GPT-4
- Data: PostgreSQL, Redis, GraphDB
- Cross-cutting concerns: Authentication, Logging

**Visual structure:** Layered architecture with vertical separation
**Color coding:** 🔵 Frontend, 🟢 API, 🟠 Intelligence, 🟣 Data, 🔴 Cross-cutting

**Use this for:** System design reviews, technical documentation, architecture decisions

---

### 4. Data Flow & Certification Workflow
**File:** `04-data-flow-certification.excalidraw`

**What it shows:**
- 6-step sequential workflow from BOQ upload to certification
- Step 1: BOQ Upload (Excel/CSV/PDF parsing)
- Step 2: Material Matching (GraphDB queries)
- Step 3: Carbon Calculation (Quantity × Emission Factor)
- Step 4: AI Optimization (Pareto 80/20 analysis)
- Step 5: Compliance Check (TREES/EDGE validation)
- Step 6: Certificate Generation (PDF/JSON export)
- Decision points (material not found, non-compliant)
- Real-time progress updates via WebSocket
- Redis caching for <0.1s recalculation

**Visual structure:** Vertical sequence diagram with decision branches
**Color coding:** 🔵 Input, 🟡 Processing, 🟢 Calculation, 🟣 Optimization, 🔴 Validation, ✅ Output

**Use this for:** User flow documentation, certification process explanation, data transformation pipeline

---

### 5. Technology Stack & Integrations
**File:** `05-technology-stack.excalidraw`

**What it shows:**
- 6 technology domains with detailed tool lists
- Frontend: Next.js, React, TypeScript, TailwindCSS, Redux
- Backend: Python 3.12+, FastAPI, Pydantic, SQLAlchemy
- AI/ML: LangGraph, LangChain, OpenAI GPT-4, spaCy
- Data: PostgreSQL 15+, Redis 7+, GraphDB, SPARQL
- DevOps: Docker, GitHub Actions, Nginx, AWS/Azure
- Testing: pytest, Playwright, Jest, 248+ tests passed
- External integrations: OpenAI API, TREES API, EDGE API

**Visual structure:** Component-based grid layout with integration arrows
**Color coding:** 🔵 Frontend, 🟢 Backend, 🟠 AI/ML, 🔴 Data, 🟣 DevOps, 🔵 Testing

**Use this for:** Technology selection, dependency documentation, stack overview for developers

---

### 6. Deployment & Production Infrastructure
**File:** `06-deployment-production.excalidraw`

**What it shows:**
- CI/CD pipeline: Git → GitHub Actions → Docker → Production (<5min deploy)
- Load balancer (Traefik/Nginx) with SSL/TLS, rate limiting, auto-scaling
- Container orchestration: Frontend (3 replicas), Backend (3 replicas), AI (2 replicas)
- Resource allocation (CPU, memory, auto-scale limits)
- Database cluster: PostgreSQL (master-slave), Redis (cluster), GraphDB (RDF)
- Monitoring stack: CloudWatch, Sentry, Prometheus, Grafana (99.9%+ uptime)
- Security: SSL/TLS, JWT, RBAC, rate limiting, DDoS protection, encryption

**Visual structure:** Multi-tier deployment diagram with service mesh
**Color coding:** 🔵 CI/CD, 🟢 Load Balancer, 🔵 Frontend, 🟢 Backend, 🟠 AI, 🔴 Databases, 🟣 Monitoring

**Use this for:** Deployment planning, infrastructure documentation, DevOps setup, scaling strategies

---

## 🎨 Viewing & Editing

### View Online
1. Go to [Excalidraw.com](https://excalidraw.com)
2. Click "Open" in the top menu
3. Select one of the `.excalidraw` files from this directory
4. The diagram will load with full interactivity

### Edit Diagrams
1. Open at Excalidraw.com (as above)
2. Make your changes
3. Export via "Save to..." → ".excalidraw" format
4. Replace the file in this directory

### Export to Other Formats
From Excalidraw.com, you can export to:
- **PNG** - High-resolution raster image
- **SVG** - Vector format for scaling
- **PDF** - Document embedding
- **Excalidraw + embedded scene** - Self-contained HTML

## 📐 Design Philosophy

These diagrams follow **isomorphism testing**: the structure alone should communicate the concept without reading text labels. Each diagram uses:

1. **Semantic color coding** - Consistent colors represent specific types across all diagrams
2. **Spatial relationships** - Position conveys hierarchy and data flow
3. **Visual patterns** - Hub-and-spoke, layers, sequences are immediately recognizable
4. **Minimal text** - Labels supplement, not replace, visual structure
5. **Production-ready** - Complete enough for business and technical audiences

## 🔄 Keeping Diagrams Updated

When updating the BKS cBIM AI system:
- **Architecture changes** → Update diagram 2 (agents) and 3 (layers)
- **New technologies** → Update diagram 5 (stack)
- **Workflow changes** → Update diagram 4 (data flow)
- **Deployment changes** → Update diagram 6 (infrastructure)
- **Business metrics** → Update diagram 1 (ROI/benefits)

## 📚 Related Documentation

- Main project README: `/README.md`
- API documentation: `/docs/api/`
- Agent documentation: `/backend/agents/README.md`
- Deployment guide: `/docs/deployment/`

---

**Last Updated:** 2026-03-25
**Diagram Format:** Excalidraw v2
**Total Diagrams:** 6
**Coverage:** Business → Technical → Production
