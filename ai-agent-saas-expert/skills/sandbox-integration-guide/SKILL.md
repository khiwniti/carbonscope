---
name: Sandbox Integration Guide
description: This skill should be used when the user asks about "sandbox integration", "Daytona setup", "E2B integration", "Docker sandbox", "agent code execution", "sandbox health checks", or when implementing isolated code execution for AI agents. Provides comprehensive sandbox integration patterns.
version: 0.1.0
---

# Sandbox Integration Guide for AI Agents

Comprehensive patterns for integrating sandbox environments for secure AI agent code execution.

## Sandbox Provider Comparison

### Daytona (Recommended for Full-Stack)

**Pros:**
- Complete development environment
- VNC preview support
- Resource allocation controls
- Multi-service orchestration
- Production-ready

**Use When:**
- Need full Linux environment
- Multi-service applications
- VNC preview required
- Long-running processes

### E2B (Recommended for Code Execution)

**Pros:**
- Fast startup (< 1s)
- Simple API
- Code interpreter focus
- Managed infrastructure

**Use When:**
- Quick code execution
- Python/JavaScript runtime
- Stateless execution
- Cost optimization

### Docker (Self-Hosted)

**Pros:**
- Full control
- No vendor lock-in
- Custom configurations
- Cost-effective at scale

**Use When:**
- Self-hosted infrastructure
- Custom requirements
- High volume execution
- Compliance needs

## Daytona Integration

### Setup

```bash
# Install Daytona CLI
curl -sf https://get.daytona.io/install.sh | sh

# Create workspace
daytona create my-agent-workspace

# Configure resources
daytona config set cpu 4
daytona config set memory 8192
daytona config set disk 50
```

### Health Check System

```typescript
// Unified sandbox status
type SandboxStatus =
  | 'LIVE'      // Daytona started + all services healthy
  | 'STARTING'  // Transitioning or services starting
  | 'OFFLINE'   // Intentionally stopped/archived
  | 'FAILED'    // Started but services degraded
  | 'UNKNOWN';  // Cannot determine state

interface SandboxState {
  status: SandboxStatus;
  sandbox_id: string;
  project_id: string;
  daytona_state: 'started' | 'stopped' | 'archived' | 'archiving';
  services_health?: {
    status: 'healthy' | 'starting' | 'degraded' | 'unhealthy';
    services: Record<string, 'running' | 'stopped' | 'starting' | 'error'>;
    critical_services: string[];
  };
  vnc_preview?: string;
  sandbox_url?: string;
  resources: { cpu: number; memory: number; disk: number };
  last_checked: string;
}

// Derive unified status from Daytona state + service health
function deriveSandboxStatus(
  daytonaState: string,
  servicesHealth?: ServicesHealth
): SandboxStatus {
  if (daytonaState === 'stopped' || daytonaState === 'archived') {
    return 'OFFLINE';
  }

  if (daytonaState === 'archiving' || daytonaState === 'stopping') {
    return 'STARTING';
  }

  if (daytonaState === 'started') {
    if (!servicesHealth) return 'STARTING';

    switch (servicesHealth.status) {
      case 'healthy': return 'LIVE';
      case 'starting': return 'STARTING';
      case 'degraded':
      case 'unhealthy': return 'FAILED';
      default: return 'UNKNOWN';
    }
  }

  return 'UNKNOWN';
}
```

### Backend API

```python
# backend/api/sandbox.py
from daytona import DaytonaClient

class SandboxManager:
    def __init__(self):
        self.client = DaytonaClient(api_key=os.getenv("DAYTONA_API_KEY"))

    async def get_status(self, project_id: str) -> SandboxState:
        workspace = await self.client.get_workspace(project_id)

        # Check Daytona state
        daytona_state = workspace.state

        # Check service health if started
        services_health = None
        if daytona_state == "started":
            services_health = await self.check_services_health(workspace)

        return {
            "status": self.derive_status(daytona_state, services_health),
            "sandbox_id": workspace.id,
            "project_id": project_id,
            "daytona_state": daytona_state,
            "services_health": services_health,
            "vnc_preview": workspace.vnc_url,
            "sandbox_url": workspace.url,
            "resources": {
                "cpu": workspace.cpu,
                "memory": workspace.memory,
                "disk": workspace.disk
            },
            "last_checked": datetime.now().isoformat()
        }

    async def check_services_health(self, workspace) -> dict:
        # Poll sandbox /health endpoint
        try:
            response = await httpx.get(f"{workspace.url}/health", timeout=5.0)
            return response.json()
        except Exception:
            return {
                "status": "unhealthy",
                "services": {},
                "error": "Health check failed"
            }
```

## E2B Integration

### Setup

```bash
npm install @e2b/code-interpreter
```

### Code Execution

```typescript
import { CodeInterpreter } from '@e2b/code-interpreter';

export async function executeCode(code: string, language: 'python' | 'javascript') {
  const sandbox = await CodeInterpreter.create();

  try {
    const result = await sandbox.notebook.execCell(code);

    return {
      success: !result.error,
      output: result.text,
      error: result.error,
      logs: result.logs,
      results: result.results,
    };
  } finally {
    await sandbox.close();
  }
}
```

### File System Access

```typescript
// Upload files to sandbox
await sandbox.files.write('/workspace/data.csv', csvContent);

// Execute code that uses the file
const result = await sandbox.notebook.execCell(`
import pandas as pd
df = pd.read_csv('/workspace/data.csv')
print(df.head())
`);

// Download results
const output = await sandbox.files.read('/workspace/output.json');
```

## Docker Integration

### Docker Compose Setup

```yaml
# docker-compose.sandbox.yml
services:
  sandbox:
    build: ./sandbox
    environment:
      - MAX_EXECUTION_TIME=30000
      - MAX_MEMORY_MB=512
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
    networks:
      - isolated
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

networks:
  isolated:
    driver: bridge
    internal: true
```

### Sandbox Dockerfile

```dockerfile
FROM python:3.13-slim

# Security hardening
RUN useradd -m -u 1000 sandbox && \
    chmod 755 /home/sandbox

USER sandbox
WORKDIR /home/sandbox

# Install dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Health check endpoint
COPY health.py .

ENV PATH="/home/sandbox/.local/bin:${PATH}"

CMD ["python", "health.py"]
```

## Service Health Checks

### Health Endpoint Pattern

```typescript
// Sandbox container - health.py or health.ts
export async function GET() {
  const services = {
    backend: await checkService('http://backend:8000/health'),
    redis: await checkService('http://redis:6379/ping'),
    database: await checkDatabase(),
  };

  const criticalServices = ['backend', 'database'];
  const allCriticalHealthy = criticalServices.every(
    name => services[name] === 'running'
  );

  const status = allCriticalHealthy ? 'healthy' :
                 Object.values(services).some(s => s === 'running') ? 'degraded' :
                 'unhealthy';

  return Response.json({
    status,
    services,
    critical_services: criticalServices,
    timestamp: new Date().toISOString(),
  });
}
```

### Polling Pattern (Frontend)

```typescript
// Poll sandbox status
const useSandboxStatus = (projectId: string) => {
  const [status, setStatus] = useState<SandboxState | null>(null);

  useEffect(() => {
    const poll = async () => {
      const response = await fetch(`/api/projects/${projectId}/sandbox/status`);
      const data = await response.json();
      setStatus(data);

      // Adjust polling interval based on status
      const interval = data.status === 'STARTING' ? 2000 : 10000;
      setTimeout(poll, interval);
    };

    poll();
  }, [projectId]);

  return status;
};
```

## Security Best Practices

### Resource Limits

```typescript
// Enforce limits
const sandboxConfig = {
  cpu: { max: 2, shares: 1024 },
  memory: { limit: '512MB', reservation: '256MB' },
  disk: { size: '10GB', iops: 1000 },
  network: { bandwidth: '100Mbps' },
  execution: {
    timeout: 30000, // 30 seconds
    maxProcesses: 10,
  },
};
```

### Network Isolation

```yaml
# Restrict outbound access
networks:
  sandbox:
    driver: bridge
    internal: true  # No internet access
    ipam:
      config:
        - subnet: 172.28.0.0/16

# Allow specific domains via proxy
http_proxy: http://proxy:3128
https_proxy: http://proxy:3128
no_proxy: localhost,127.0.0.1
```

### File System Restrictions

```bash
# Read-only root filesystem
docker run --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --tmpfs /var/tmp:rw,noexec,nosuid,size=100m \
  sandbox-image
```

## Monitoring & Observability

### Metrics to Track

```typescript
interface SandboxMetrics {
  execution_count: number;
  avg_execution_time_ms: number;
  success_rate: number;
  error_rate: number;
  timeout_rate: number;
  cpu_utilization: number;
  memory_utilization: number;
  disk_utilization: number;
  network_bytes_in: number;
  network_bytes_out: number;
}
```

### Logging

```typescript
// Structured logging
logger.info('Sandbox execution started', {
  sandbox_id,
  project_id,
  language,
  code_length: code.length,
});

logger.info('Sandbox execution completed', {
  sandbox_id,
  duration_ms,
  success: !error,
  output_length: output.length,
});
```

## Additional Resources

### Reference Files

- **`references/daytona-advanced.md`** - Advanced Daytona configuration and troubleshooting
- **`references/e2b-patterns.md`** - E2B code interpreter patterns and limitations
- **`references/docker-security.md`** - Docker sandbox security hardening

### Example Files

- **`examples/sandbox-health-check.ts`** - Complete health check implementation
- **`examples/docker-compose.sandbox.yml`** - Production-ready Docker Compose

## When to Use This Skill

Use when implementing or debugging sandbox integration, setting up agent code execution, or optimizing sandbox performance and security.
