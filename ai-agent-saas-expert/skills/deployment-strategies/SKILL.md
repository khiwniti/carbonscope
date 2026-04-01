---
name: Deployment Strategies
description: This skill should be used when the user asks about "deploying AI agent SaaS", "VM deployment", "Docker deployment", "production deployment strategies", "environment variables", "scalable deployment", or "CI/CD for agent platforms". Provides comprehensive deployment patterns for AI agent SaaS applications with focus on flexible VM-based scalability.
version: 0.2.0
---

# Deployment Strategies for AI Agent SaaS

Production deployment patterns for AI agent chat SaaS applications optimized for flexible scalability via VM infrastructure.

## Overview

**Primary Strategy: VM + Docker** for flexible scalability and control:
- Self-hosted VMs (AWS EC2, Azure VMs, GCP Compute Engine)
- Docker containerization for consistency
- Kubernetes for orchestration at scale
- Full infrastructure control and customization

**Alternative Platforms:**
- Vercel (Next.js optimized, serverless - limited scalability)
- Railway (full-stack, Docker-based - quick deployment)

## VM + Docker Deployment (Recommended)

### Quick Start - VM Setup

**1. Provision VM (AWS EC2 Example):**
```bash
# Launch Ubuntu 22.04 LTS instance
# Recommended: t3.xlarge (4 vCPU, 16GB RAM) for production
# Minimum: t3.large (2 vCPU, 8GB RAM) for staging

# Connect to instance
ssh -i your-key.pem ubuntu@your-vm-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install monitoring tools
sudo apt install htop iotop nethogs -y
```

**2. Deploy Application:**
```bash
# Clone your repository
git clone https://github.com/your-org/ai-agent-saas.git
cd ai-agent-saas

# Set up environment variables
cp .env.example .env.production
nano .env.production  # Configure all secrets

# Build and start services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose ps
docker compose logs -f
```

**3. Configure Reverse Proxy (Nginx):**
```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/ai-agent-saas
```

**Nginx configuration:**
```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # SSL will be added via certbot
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ai-agent-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Environment Variables

**Development:**
```bash
# Pull from Vercel
vercel env pull .env.local

# Or create manually
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-...
EOF
```

**Production:**
```bash
# Add via CLI
vercel env add DATABASE_URL production
vercel env add ANTHROPIC_API_KEY production

# Or use dashboard
# https://vercel.com/dashboard → Project → Settings → Environment Variables
```

**Sensitive Variables:**
- Mark as "Sensitive" in dashboard (write-only)
- Never commit to git
- Use different values per environment

## Scaling Strategy

### Horizontal Scaling with Load Balancer

**Architecture:**
```
                    ┌──────────────┐
                    │ Load Balancer│
                    │   (Nginx)    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Frontend │       │Frontend │       │Frontend │
   │Instance1│       │Instance2│       │Instance3│
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Backend    │
                    │   Cluster    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Redis   │       │PostgreSQL│       │  Queue  │
   │ Cluster │       │ Primary/ │       │ Worker  │
   │         │       │ Replicas │       │ Pool    │
   └─────────┘       └──────────┘       └─────────┘
```

**Load Balancer Configuration (Nginx):**
```nginx
upstream frontend_cluster {
    least_conn;  # Route to server with fewest connections
    server frontend1.internal:3000 max_fails=3 fail_timeout=30s;
    server frontend2.internal:3000 max_fails=3 fail_timeout=30s;
    server frontend3.internal:3000 max_fails=3 fail_timeout=30s;
}

upstream backend_cluster {
    ip_hash;  # Session persistence via IP
    server backend1.internal:8000 max_fails=3 fail_timeout=30s;
    server backend2.internal:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend_cluster;
        # ... proxy headers
    }

    location /api/ {
        proxy_pass http://backend_cluster/;
        # ... proxy headers
    }
}
```

### Auto-Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack with auto-scaling
docker stack deploy -c docker-compose.swarm.yml ai-agent-saas

# Scale services dynamically
docker service scale ai-agent-saas_frontend=5
docker service scale ai-agent-saas_backend=3
```

**docker-compose.swarm.yml:**
```yaml
version: '3.8'

services:
  frontend:
    image: yourreg/ai-agent-frontend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    networks:
      - frontend_net
      - backend_net

  backend:
    image: yourreg/ai-agent-backend:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
    networks:
      - backend_net
      - db_net

  postgres:
    image: postgres:16-alpine
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - db_net

networks:
  frontend_net:
  backend_net:
  db_net:

volumes:
  postgres_data:
```

## Docker Production Configuration

### Multi-Service Architecture

**docker-compose.production.yml:**
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - redis
      - postgres

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### Frontend Dockerfile

```dockerfile
# Multi-stage build for Next.js
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
```

### Backend Dockerfile (Python)

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Run with gunicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "api:app", "--bind", "0.0.0.0:8000"]
```

### Kubernetes for Enterprise Scale

**Prerequisites:**
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Deployment manifests:**
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent-frontend
  template:
    metadata:
      labels:
        app: ai-agent-frontend
    spec:
      containers:
      - name: frontend
        image: yourreg/ai-agent-frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-agent-frontend
spec:
  selector:
    app: ai-agent-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**Horizontal Pod Autoscaler:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-agent-frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-agent-frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Deploy to Kubernetes:**
```bash
# Apply configurations
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/hpa.yml
kubectl apply -f k8s/ingress.yml

# Check status
kubectl get pods
kubectl get hpa
kubectl logs -f deployment/ai-agent-frontend

# Scale manually if needed
kubectl scale deployment ai-agent-frontend --replicas=5
```

## Alternative Platforms

### Railway (Quick Deployment)

Railway provides simple Docker-based deployment for staging/testing:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up

# Add managed databases
railway add --plugin postgresql
railway add --plugin redis
```

**railway.toml:**
```toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm run build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

**Note:** Railway is suitable for development/staging but limited for production scale compared to VM infrastructure.

### Vercel (Serverless Alternative)

For projects that don't require VM-level control, Vercel offers serverless deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link and deploy
vercel link
vercel --prod
```

**Limitations vs VM deployment:**
- ❌ Limited execution time (60s-300s vs unlimited on VMs)
- ❌ No persistent state or background workers
- ❌ Cold starts impact latency
- ❌ Vendor lock-in to Vercel infrastructure
- ❌ Higher costs at scale compared to dedicated VMs
- ✅ Zero infrastructure management
- ✅ Automatic scaling
- ✅ Global edge network

**Use Vercel when:**
- Project is small-scale (<1000 users)
- Zero DevOps desired
- Edge performance critical
- Serverless constraints acceptable

**Use VM deployment when:**
- Flexible scaling needed
- Long-running processes required
- Cost optimization at scale important
- Full infrastructure control desired
- Background workers/cron jobs essential

## Environment Management

### Multi-Environment Strategy

**Development (.env.local):**
```bash
NODE_ENV=development
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost/dev
REDIS_URL=redis://localhost:6379
```

**Staging (.env.staging):**
```bash
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_URL=https://staging.yourdomain.com
DATABASE_URL=${NEON_DATABASE_URL_STAGING}
REDIS_URL=${UPSTASH_REDIS_URL_STAGING}
```

**Production (.env.production):**
```bash
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_URL=https://yourdomain.com
DATABASE_URL=${NEON_DATABASE_URL}
REDIS_URL=${UPSTASH_REDIS_URL}
```

### Secrets Management

**Never Commit:**
```gitignore
.env
.env.local
.env.*.local
.vercel
```

**Use Environment Variable Services:**
- Vercel: Built-in env vars
- Railway: Built-in secrets
- AWS: Parameter Store / Secrets Manager
- Doppler: Centralized secrets management

## CI/CD Pipelines

### GitHub Actions (Vercel)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

### GitHub Actions (Docker)

```yaml
name: Docker Build and Push
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: yourusername/agent-saas:latest
```

## Health Checks & Monitoring

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    llm_provider: await checkLLM(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'healthy');

  return Response.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, { status: healthy ? 200 : 503 });
}
```

### Monitoring Setup

**Sentry (Error Tracking):**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Vercel Analytics:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Deployment Checklist

Before production deployment:

- [ ] Environment variables configured for all services
- [ ] Database migrations applied
- [ ] Health check endpoints responding
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Vercel Analytics, PostHog) integrated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Secrets not committed to git
- [ ] SSL/TLS certificates configured
- [ ] Domain DNS configured
- [ ] Backup strategy implemented
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured

## Additional Resources

### Reference Files

- **`references/vercel-advanced.md`** - Advanced Vercel configuration, ISR, edge functions
- **`references/docker-optimization.md`** - Multi-stage builds, layer caching, security
- **`references/ci-cd-patterns.md`** - Advanced CI/CD pipelines, testing strategies
- **`references/database-migrations.md`** - Migration strategies for Prisma, Drizzle, SQL

### Example Files

- **`examples/vercel.json`** - Complete Vercel configuration
- **`examples/docker-compose.production.yml`** - Production-ready Docker Compose
- **`examples/github-actions.yml`** - Complete CI/CD pipeline

## Key Principles

1. **Environment Parity**: Dev/staging/prod should be as similar as possible
2. **Immutable Deployments**: Deploy new instances, don't modify running ones
3. **Zero-Downtime**: Use blue-green or rolling deployments
4. **Automated**: CI/CD pipelines for all environments
5. **Observable**: Comprehensive logging and monitoring
6. **Reversible**: Easy rollback mechanisms
7. **Secure**: Secrets management, no hardcoded credentials

## When to Use This Skill

Use this skill when:
- Setting up initial deployment pipeline
- Migrating between hosting providers
- Implementing CI/CD automation
- Configuring multi-environment setups
- Debugging deployment issues
- Optimizing Docker builds
- Setting up monitoring and health checks
- Planning production deployment strategy
