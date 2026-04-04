# Kubernetes Quick Start Guide

**CarbonScope BIM AI** - Local Kubernetes Development Setup

---

## 🎯 What You Have

Production-ready Kubernetes manifests with:
- ✅ **3-replica HA** for Frontend and Backend (stateless)
- ✅ **StatefulSets** for PostgreSQL and Redis (persistent)
- ✅ **Auto-scaling** (HPA) for production workloads
- ✅ **Health checks** and graceful shutdown
- ✅ **Multi-environment** support (local/staging/production)
- ✅ **Kustomize** for configuration management

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Prerequisites

**macOS:**
```bash
brew install kubectl minikube kustomize
```

**Linux:**
```bash
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/
```

### 2. Configure Secrets

```bash
cd kubernetes/configs
cp secrets.example.yaml secrets.yaml
# Edit secrets.yaml with your real API keys
nano secrets.yaml  # or vim, code, etc.
```

**Required secrets:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_KEY` (service role)
- `ANTHROPIC_API_KEY`
- `POSTGRES_PASSWORD`

### 3. Start Local Cluster

```bash
cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent
./kubernetes/scripts/setup-local.sh
```

This script will:
1. Start minikube with 4 CPUs, 8GB RAM
2. Enable ingress, metrics-server, dashboard
3. Apply secrets
4. Deploy entire CarbonScope stack
5. Wait for all pods to be ready

### 4. Access Services

**Port Forward:**
```bash
# Frontend (Next.js)
kubectl port-forward -n carbonscope svc/local-frontend 3000:80

# Backend (FastAPI)
kubectl port-forward -n carbonscope svc/local-backend 8000:80
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/health
- Backend API: http://localhost:8000/v1

---

## 📊 Verify Deployment

### Health Check
```bash
./kubernetes/scripts/health-check.sh
```

### Manual Checks
```bash
# Check all pods
kubectl get pods -n carbonscope

# Check services
kubectl get svc -n carbonscope

# Check logs
kubectl logs -f -n carbonscope deployment/local-frontend
kubectl logs -f -n carbonscope deployment/local-backend

# Check database
kubectl exec -it -n carbonscope postgres-0 -- psql -U carbonscope -c "\dt"

# Check Redis
kubectl exec -it -n carbonscope redis-0 -- redis-cli ping
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Ingress                              │
│                    (NGINX/Traefik)                           │
└────────────┬────────────────────────┬────────────────────────┘
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │   Frontend      │      │    Backend      │
    │  (Next.js)      │      │   (FastAPI)     │
    │  1 replica      │      │   1 replica     │
    │  (local)        │      │   (local)       │
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

**Local Resources:**
- Frontend: 256Mi-512Mi RAM, 250m-500m CPU
- Backend: 512Mi-1Gi RAM, 500m-1000m CPU
- PostgreSQL: 512Mi-2Gi RAM, 500m-2000m CPU
- Redis: 256Mi-1Gi RAM, 250m-1000m CPU

---

## 📂 Directory Structure

```
kubernetes/
├── README.md                    # Architecture documentation
├── QUICKSTART.md               # This file
├── .gitignore                  # Ignore secrets
├── base/                       # Base manifests
│   ├── namespace.yaml
│   ├── kustomization.yaml
│   ├── frontend/
│   │   ├── deployment.yaml    # 3 replicas, health checks
│   │   ├── service.yaml       # ClusterIP service
│   │   ├── hpa.yaml          # Auto-scaling
│   │   └── configmap.yaml    # Environment config
│   ├── backend/
│   │   ├── deployment.yaml    # 3 replicas, health checks
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── configmap.yaml
│   ├── database/
│   │   ├── statefulset.yaml   # PostgreSQL
│   │   └── service.yaml
│   ├── redis/
│   │   ├── statefulset.yaml   # Redis with persistence
│   │   └── service.yaml
│   └── ingress/
│       └── ingress.yaml        # NGINX ingress
├── overlays/
│   ├── local/                  # Local dev (1 replica)
│   │   └── kustomization.yaml
│   ├── staging/                # Staging (2 replicas)
│   │   └── kustomization.yaml
│   └── production/             # Production (3 replicas)
│       ├── kustomization.yaml
│       └── pdb.yaml           # Pod disruption budgets
├── configs/
│   ├── secrets.example.yaml   # Template
│   └── secrets.yaml           # Real secrets (gitignored)
└── scripts/
    ├── setup-local.sh         # Automated setup
    └── health-check.sh        # Health verification
```

---

## 🔧 Common Operations

### Scale Services
```bash
# Manual scaling
kubectl scale deployment/local-backend --replicas=2 -n carbonscope

# HPA will auto-scale based on CPU/memory
kubectl get hpa -n carbonscope
```

### Update Images
```bash
# Frontend
kubectl set image deployment/local-frontend \
  frontend=carbonscopeacr.azurecr.io/suna-frontend:v2.0.0 \
  -n carbonscope

# Backend
kubectl set image deployment/local-backend \
  backend=carbonscopeacr.azurecr.io/suna-backend:v3.0.0 \
  -n carbonscope
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/local-backend -n carbonscope

# Check rollout status
kubectl rollout status deployment/local-backend -n carbonscope

# View rollout history
kubectl rollout history deployment/local-backend -n carbonscope
```

### Database Operations
```bash
# Connect to PostgreSQL
kubectl exec -it -n carbonscope postgres-0 -- psql -U carbonscope

# Backup database
kubectl exec -n carbonscope postgres-0 -- pg_dump -U carbonscope carbonscope > backup.sql

# Restore database
cat backup.sql | kubectl exec -i -n carbonscope postgres-0 -- psql -U carbonscope carbonscope
```

### Redis Operations
```bash
# Connect to Redis
kubectl exec -it -n carbonscope redis-0 -- redis-cli

# Check memory usage
kubectl exec -n carbonscope redis-0 -- redis-cli INFO memory

# Flush cache (careful!)
kubectl exec -n carbonscope redis-0 -- redis-cli FLUSHALL
```

---

## 🌐 Environment Overlays

### Local Development
```bash
kubectl apply -k kubernetes/overlays/local
```
- 1 replica per service
- Reduced resource limits
- No auto-scaling
- Local ingress

### Staging
```bash
kubectl apply -k kubernetes/overlays/staging
```
- 2 replicas per service
- Moderate resource limits
- Auto-scaling 2-5 replicas
- Staging domain

### Production
```bash
kubectl apply -k kubernetes/overlays/production
```
- 3 replicas per service
- Full resource limits
- Auto-scaling 3-10 replicas
- Pod disruption budgets
- Production domain
- Prometheus metrics

---

## 🐛 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n carbonscope

# Describe pod for events
kubectl describe pod <pod-name> -n carbonscope

# Check logs
kubectl logs <pod-name> -n carbonscope

# Common issues:
# - Image pull errors → Check ACR credentials
# - Secrets missing → Apply secrets.yaml
# - Resource limits → Increase minikube resources
```

### Service Not Accessible
```bash
# Check service endpoints
kubectl get svc -n carbonscope

# Check ingress
kubectl get ingress -n carbonscope

# Port forward directly to pod
kubectl port-forward pod/<pod-name> 3000:3000 -n carbonscope
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
kubectl logs -n carbonscope postgres-0

# Verify connection from backend
kubectl exec -it -n carbonscope deployment/local-backend -- \
  wget -q -O- http://postgres:5432 || echo "Not accessible"

# Check DATABASE_URL secret
kubectl get secret backend-secrets -n carbonscope -o yaml
```

---

## 🧹 Cleanup

### Delete Everything
```bash
# Delete all resources
kubectl delete -k kubernetes/overlays/local

# Or delete namespace (removes everything)
kubectl delete namespace carbonscope

# Stop minikube
minikube stop

# Delete minikube cluster
minikube delete
```

### Reset and Restart
```bash
# Delete deployment
kubectl delete -k kubernetes/overlays/local

# Wait 30 seconds
sleep 30

# Redeploy
./kubernetes/scripts/setup-local.sh
```

---

## 📈 Next Steps

### Add Monitoring
```bash
# Install Prometheus + Grafana
kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
```

### Add CI/CD
Configure GitHub Actions to:
1. Build Docker images
2. Push to ACR
3. Update Kubernetes manifests
4. Apply to cluster

### Production Deployment (Azure AKS)
```bash
# Create AKS cluster
az aks create \
  --resource-group suna-bim-rg \
  --name carbonscope-aks \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --enable-addons monitoring

# Get credentials
az aks get-credentials --resource-group suna-bim-rg --name carbonscope-aks

# Deploy production
kubectl apply -k kubernetes/overlays/production
```

---

## 📚 Resources

- **Kubernetes Docs**: https://kubernetes.io/docs/
- **Kustomize Guide**: https://kustomize.io/
- **Minikube Docs**: https://minikube.sigs.k8s.io/docs/
- **Azure AKS**: https://docs.microsoft.com/en-us/azure/aks/

---

**Status**: ✅ Ready for local development  
**Next**: Test locally, then plan production migration to AKS
