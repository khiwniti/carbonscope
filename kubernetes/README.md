# CarbonScope BIM AI - Kubernetes Production Setup

**Status**: Local-first design, production-ready architecture  
**Date**: 2026-04-04

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Ingress                              │
│                    (NGINX/Traefik)                           │
└────────────┬────────────────────────┬────────────────────────┘
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │   Frontend      │      │    Backend      │
    │  (Next.js)      │      │   (FastAPI)     │
    │  3 replicas     │      │   3 replicas    │
    └────────┬────────┘      └────────┬────────┘
             │                        │
             │                        ▼
             │               ┌─────────────────┐
             │               │   PostgreSQL    │
             │               │   (StatefulSet) │
             │               └─────────────────┘
             │                        │
             │                        ▼
             │               ┌─────────────────┐
             │               │     Redis       │
             │               │  (StatefulSet)  │
             └───────────────┴─────────────────┘
```

---

## Components

### 1. Frontend Service
- **Type**: Deployment (stateless)
- **Replicas**: 3 (HA)
- **Image**: `carbonscopeacr.azurecr.io/suna-frontend:latest`
- **Port**: 3000
- **Resources**: 512Mi-1Gi memory, 0.5-1 CPU
- **Health Checks**: `/api/health`

### 2. Backend Service
- **Type**: Deployment (stateless)
- **Replicas**: 3 (HA)
- **Image**: `carbonscopeacr.azurecr.io/suna-backend:latest`
- **Port**: 8000
- **Resources**: 1Gi-2Gi memory, 1-2 CPU
- **Health Checks**: `/health`, `/health/ready`

### 3. PostgreSQL Database
- **Type**: StatefulSet (persistent)
- **Replicas**: 1 (primary), optional read replicas
- **Storage**: 50Gi PersistentVolume
- **Backup**: Automated daily backups

### 4. Redis Cache
- **Type**: StatefulSet (persistent)
- **Replicas**: 1 master, 2 replicas
- **Storage**: 10Gi PersistentVolume
- **Persistence**: RDB + AOF

---

## Directory Structure

```
kubernetes/
├── README.md                    # This file
├── base/                        # Base Kustomize manifests
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── configmap.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── configmap.yaml
│   ├── database/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   ├── redis/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   └── ingress/
│       └── ingress.yaml
├── overlays/
│   ├── local/                   # Local development (minikube/kind)
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/                 # Staging environment
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/              # Production environment
│       ├── kustomization.yaml
│       └── patches/
├── configs/
│   ├── secrets.example.yaml    # Example secrets (NOT committed)
│   └── configmaps.yaml
└── scripts/
    ├── setup-local.sh          # Local cluster setup
    ├── deploy.sh               # Deployment script
    └── health-check.sh         # Health verification
```

---

## Local Development Setup

### Prerequisites
```bash
# Install kubectl
brew install kubectl  # macOS
# Or: sudo apt-get install kubectl  # Linux

# Install minikube (local Kubernetes)
brew install minikube  # macOS
# Or: curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install kustomize
brew install kustomize  # macOS

# Install helm (optional)
brew install helm
```

### Start Local Cluster
```bash
# Start minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### Deploy to Local
```bash
# Navigate to kubernetes directory
cd kubernetes

# Deploy using kustomize
kubectl apply -k overlays/local

# Check deployment status
kubectl get pods -n carbonscope
kubectl get svc -n carbonscope
kubectl get ingress -n carbonscope

# Port forward for local access (if needed)
kubectl port-forward -n carbonscope svc/frontend 3000:80
kubectl port-forward -n carbonscope svc/backend 8000:80

# Access dashboard
minikube dashboard
```

---

## Production Considerations

### 1. Security
- ✅ **Secrets Management**: Use Kubernetes Secrets + external vault (Azure Key Vault, HashiCorp Vault)
- ✅ **RBAC**: Role-Based Access Control for service accounts
- ✅ **Network Policies**: Restrict pod-to-pod communication
- ✅ **Pod Security Standards**: Enforce non-root containers
- ✅ **Image Scanning**: Scan container images for vulnerabilities

### 2. Reliability
- ✅ **High Availability**: 3+ replicas for stateless services
- ✅ **Pod Disruption Budgets**: Ensure minimum availability during updates
- ✅ **Health Checks**: Liveness + Readiness probes
- ✅ **Resource Limits**: Prevent resource exhaustion
- ✅ **Anti-Affinity**: Spread pods across nodes

### 3. Scalability
- ✅ **Horizontal Pod Autoscaler**: CPU/memory-based scaling
- ✅ **Cluster Autoscaler**: Add nodes when needed
- ✅ **Resource Requests/Limits**: Proper sizing
- ✅ **Connection Pooling**: Database connection management

### 4. Observability
- ✅ **Logging**: Centralized logging (Fluentd → Elasticsearch/Loki)
- ✅ **Metrics**: Prometheus + Grafana
- ✅ **Tracing**: Jaeger/Tempo for distributed tracing
- ✅ **Alerts**: PagerDuty/Opsgenie integration

### 5. Data Management
- ✅ **Persistent Volumes**: For stateful services
- ✅ **Backups**: Automated PostgreSQL backups (Velero)
- ✅ **Disaster Recovery**: Cross-region replication
- ✅ **Data Encryption**: At rest and in transit

---

## Deployment Strategies

### Rolling Update (Default)
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```
- Zero downtime
- Gradual rollout
- Easy rollback

### Blue-Green Deployment
- Deploy new version alongside old
- Switch traffic when ready
- Instant rollback capability

### Canary Deployment
- Route 10% traffic to new version
- Monitor metrics
- Gradually increase if healthy

---

## Resource Requirements

### Minimum Cluster (Local)
- **Nodes**: 1 (minikube)
- **CPU**: 4 cores
- **Memory**: 8GB RAM
- **Storage**: 50GB

### Production Cluster
- **Nodes**: 3-6 (multi-AZ)
- **CPU**: 16+ cores total
- **Memory**: 32GB+ total
- **Storage**: 500GB+

---

## Environment Variables

### Frontend
```yaml
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_URL
NODE_ENV
```

### Backend
```yaml
DATABASE_URL
REDIS_URL
SUPABASE_URL
SUPABASE_KEY
DAYTONA_API_KEY
COMPOSIO_API_KEY
TAVILY_API_KEY
ANTHROPIC_API_KEY
WORKERS
LOG_LEVEL
```

---

## Monitoring & Alerts

### Key Metrics
- **Frontend**: Response time, error rate, request/s
- **Backend**: API latency, worker count, memory usage
- **Database**: Connection pool, query time, replication lag
- **Redis**: Hit rate, memory usage, evictions

### Alert Rules
```yaml
- Frontend pods < 2 replicas
- Backend API latency > 500ms (p95)
- Database connections > 80%
- Redis memory > 90%
- Persistent volume > 85%
- Pod restart count > 5 in 10min
```

---

## Migration from Azure App Services

### Current State
- Frontend: Azure App Service
- Backend: Azure App Service
- Database: Azure PostgreSQL Flexible Server
- Cache: In-memory (needs Redis StatefulSet)
- Registry: Azure Container Registry (ACR)

### Migration Steps
1. **Keep ACR**: Continue using carbonscopeacr.azurecr.io
2. **Provision AKS**: Azure Kubernetes Service cluster
3. **Migrate Database**: 
   - Option A: Keep Azure PostgreSQL (connect via service endpoint)
   - Option B: Migrate to PostgreSQL StatefulSet in AKS
4. **Deploy Services**: Use blue-green strategy
5. **Switch DNS**: Update DNS to AKS Ingress
6. **Monitor**: Watch metrics for 24-48 hours
7. **Decommission**: Remove old App Services

---

## Cost Comparison

### Current (Azure App Services)
- Frontend App Service: ~$50/month
- Backend App Service: ~$70/month  
- PostgreSQL Flexible: ~$150/month
- **Total**: ~$270/month

### Kubernetes (AKS)
- 3-node cluster (Standard_D2s_v3): ~$210/month
- Load Balancer: ~$25/month
- Storage: ~$30/month
- **Total**: ~$265/month

**Benefit**: Similar cost, but more flexibility and scalability

---

## Next Steps

1. **Review this architecture** - Ensure it meets requirements
2. **Create base manifests** - Deploy, Service, ConfigMap, Secrets
3. **Set up local cluster** - Test with minikube
4. **Add monitoring** - Prometheus + Grafana
5. **Configure CI/CD** - GitHub Actions → AKS deployment
6. **Load testing** - Verify scalability
7. **Production deployment** - When ready

---

## Quick Commands

```bash
# Start local cluster
./scripts/setup-local.sh

# Deploy to local
kubectl apply -k overlays/local

# Check status
kubectl get all -n carbonscope

# View logs
kubectl logs -f -n carbonscope deployment/frontend
kubectl logs -f -n carbonscope deployment/backend

# Scale deployment
kubectl scale deployment/backend --replicas=5 -n carbonscope

# Update image
kubectl set image deployment/frontend frontend=carbonscopeacr.azurecr.io/suna-frontend:v2.0.5 -n carbonscope

# Rollback deployment
kubectl rollout undo deployment/backend -n carbonscope

# Access services locally
kubectl port-forward -n carbonscope svc/frontend 3000:80
kubectl port-forward -n carbonscope svc/backend 8000:80

# Delete everything
kubectl delete -k overlays/local
```

---

**Status**: Architecture designed, ready for implementation  
**Next**: Create Kubernetes manifests
