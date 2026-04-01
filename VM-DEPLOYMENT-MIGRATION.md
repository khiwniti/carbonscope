# BIM Agent SaaS - VM Deployment Migration Guide

**Architecture**: Hybrid deployment with Vercel frontend + VM backend for flexible scalability

---

## 🎯 Architecture Overview

```
Frontend (Vercel)          Backend (VM)               Infrastructure
─────────────────         ────────────────           ──────────────
Next.js 16                FastAPI + LiteLLM          PostgreSQL
AI Elements UI            BIM Processing             Redis
3D BIM Viewer      ←────→ IFC Parser                 Docker
shadcn/ui                 TGO Carbon Calculator      Nginx
                          Thai Building Codes
```

---

## 📅 3-Day Migration Plan

### **Day 1: Backend VM Setup**

#### Step 1: Provision VM
```bash
# AWS EC2 Ubuntu 22.04 LTS
# Recommended: t3.xlarge (4 vCPU, 16GB RAM)

# Connect
ssh -i your-key.pem ubuntu@<vm-ip>

# Update and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install monitoring
sudo apt install htop iotop nethogs -y
```

#### Step 2: Clone and Configure Backend
```bash
# Clone your project
git clone <your-repo> bim-agent-saas
cd bim-agent-saas

# Create production environment file
cat > backend/.env.production << 'EOF'
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bim_agent
REDIS_URL=redis://localhost:6379

# LLM Providers
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
LITELLM_NUM_RETRIES=3
LITELLM_REQUEST_TIMEOUT=1800

# BIM Services
TGO_EMISSION_FACTORS_PATH=/app/data/tgo_factors.json
IFC_PARSER_MAX_SIZE_MB=100

# Security
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
EOF
```

#### Step 3: Create Production Docker Compose
```bash
cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    container_name: bim-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - backend/.env.production
    volumes:
      - ./backend/data:/app/data
      - ./backend/uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    container_name: bim-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: bim_agent
      POSTGRES_USER: bim_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: bim-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    container_name: bim-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
EOF
```

#### Step 4: Create Backend Dockerfile
```bash
mkdir -p backend
cat > backend/Dockerfile.production << 'EOF'
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for BIM processing
RUN apt-get update && apt-get install -y \
    build-essential \
    libgeos-dev \
    libproj-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /app/uploads /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with gunicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", \
     "api:app", "--bind", "0.0.0.0:8000", "--timeout", "300"]
EOF
```

#### Step 5: Configure Nginx Reverse Proxy
```bash
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name api.yourdomain.com;

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # API routes
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Timeouts for BIM processing
            proxy_read_timeout 600s;
            proxy_connect_timeout 75s;
            proxy_send_timeout 600s;
        }

        # File upload size for IFC files
        client_max_body_size 100M;
    }
}
EOF
```

#### Step 6: Deploy Backend
```bash
# Build and start services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose ps
docker compose logs -f backend

# Test health endpoint
curl http://localhost:8000/health
```

#### Step 7: SSL Certificate
```bash
# Install certbot
sudo apt install certbot -y

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d api.yourdomain.com

# Restart nginx
docker compose up -d nginx

# Verify SSL
curl https://api.yourdomain.com/health
```

---

### **Day 2: Frontend Setup + AI Integration**

#### Step 1: Upgrade Next.js to v16
```bash
cd apps/frontend

# Run async request API codemod
npx @next/codemod@latest next-async-request-api .

# Upgrade dependencies
pnpm add next@latest react@latest react-dom@latest

# Install AI SDK v6
pnpm add ai @ai-sdk/react

# Install AI Elements
bunx ai-elements@latest
```

#### Step 2: Configure Backend API Connection
```bash
# apps/frontend/.env.local
cat > .env.local << 'EOF'
# Backend API (your VM)
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF
```

#### Step 3: Create AI Chat Route (Frontend → VM Backend)
```bash
mkdir -p apps/frontend/app/api/chat
cat > apps/frontend/app/api/chat/route.ts << 'EOF'
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Forward to VM backend
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  // Stream response from backend
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
EOF
```

#### Step 4: Update Backend to Use LiteLLM
```bash
# Update backend/core/services/llm.py
cat > backend/core/services/llm.py << 'EOF'
from litellm import acompletion, Router
import os

# Configure LiteLLM router
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
    fallbacks=[{"claude-primary": ["gpt-fallback"]}],
    num_retries=3,
    timeout=600,
)

async def stream_chat_response(messages: list, tools: dict = None):
    """Stream chat response using LiteLLM with BIM context"""

    system_prompt = """You are a Thai BIM expert specializing in:
    - Carbon emission analysis using TGO emission factors
    - Thai building codes compliance
    - IFC file interpretation
    - Sustainable construction recommendations
    """

    messages_with_system = [
        {"role": "system", "content": system_prompt},
        *messages
    ]

    response = await router.acompletion(
        model="claude-primary",
        messages=messages_with_system,
        tools=tools,
        stream=True,
    )

    async for chunk in response:
        yield chunk
EOF
```

#### Step 5: Create Chat UI with AI Elements
```bash
cat > apps/frontend/components/chat.tsx << 'EOF'
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from '@ai-sdk/react';
import { Message } from '@/components/ai-elements/message';
import { PromptInput } from '@/components/ai-elements/prompt-input';
import { Conversation } from '@/components/ai-elements/conversation';

export function BIMChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    }),
  });

  return (
    <div className="flex flex-col h-screen">
      <Conversation messages={messages} className="flex-1 overflow-auto" />

      <div className="border-t p-4">
        <PromptInput
          onSubmit={(text) => sendMessage({ text })}
          disabled={status === 'streaming'}
          placeholder="Ask about carbon analysis, building codes, or IFC data..."
        />
      </div>
    </div>
  );
}
EOF
```

---

### **Day 3: Production Deployment + Testing**

#### Step 1: Deploy Frontend to Vercel
```bash
cd apps/frontend

# Install Vercel CLI
npm i -g vercel

# Link project
vercel link --yes

# Add environment variables
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: https://api.yourdomain.com

vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy to production
vercel --prod
```

#### Step 2: Configure CORS on Backend
```python
# backend/api.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.vercel.app",
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Step 3: Test End-to-End
```bash
# 1. Test backend health
curl https://api.yourdomain.com/health

# 2. Test LLM streaming
curl -X POST https://api.yourdomain.com/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What are Thai building codes?"}]}'

# 3. Test frontend
open https://yourdomain.vercel.app
```

#### Step 4: Set Up Monitoring
```bash
# Install Prometheus + Grafana on VM
docker compose -f docker-compose.monitoring.yml up -d

# Configure backend metrics
# backend/core/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest

llm_requests = Counter('llm_requests_total', 'Total LLM requests')
llm_latency = Histogram('llm_request_duration_seconds', 'LLM request latency')
```

---

## 🔄 Scaling Strategy

### Horizontal Scaling
```bash
# Add more backend instances
docker compose up -d --scale backend=3

# Update nginx upstream
upstream backend {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

### Auto-Scaling with Kubernetes (Optional)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bim-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bim-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## ✅ Post-Migration Checklist

- [ ] Backend deployed on VM with Docker
- [ ] LiteLLM configured with provider API keys
- [ ] PostgreSQL and Redis running
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Frontend deployed to Vercel
- [ ] AI Elements installed and configured
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] End-to-end chat tested
- [ ] BIM processing tools verified
- [ ] Monitoring set up
- [ ] Backup strategy implemented

---

## 📊 Cost Comparison

**VM Deployment (Hybrid)**:
- AWS t3.xlarge: ~$120/month
- Vercel Pro: $20/month
- **Total: ~$140/month**

**vs Vercel-Only**:
- Vercel Pro + Functions: $200-500/month (at scale)
- No control over execution limits

**Winner: VM Hybrid** ✅
- Lower cost at scale
- Full backend control
- Unlimited execution time for BIM processing
