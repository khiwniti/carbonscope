# BKS Production Deployment Checklist

## 🔐 Security & Secrets Management

### Phase 1: Secret Generation
- [ ] Run `./azure-keyvault-setup.sh` to create Azure Key Vault
- [ ] Generate encryption keys: `openssl rand -base64 32`
- [ ] Store all secrets in Azure Key Vault (never in git)
- [ ] Create strong Redis password (32+ characters)
- [ ] Generate admin API key (32+ characters, random)

### Phase 2: Database Security
- [ ] Enable Supabase SSL/TLS connections
- [ ] Configure database connection pooling
- [ ] Enable Row Level Security (RLS) policies
- [ ] Set up database backups (daily minimum)
- [ ] Configure database firewall rules

### Phase 3: Application Security
- [ ] Enable CORS only for production domain
- [ ] Configure rate limiting on backend API
- [ ] Enable helmet.js security headers
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure CSP (Content Security Policy)

## 🏗️ Infrastructure Setup

### Azure Resources
- [ ] ACR (Azure Container Registry) created and configured
- [ ] Azure Key Vault created with secrets
- [ ] Managed Identity created and assigned
- [ ] Resource Group with proper RBAC
- [ ] Application Insights for monitoring
- [ ] Log Analytics Workspace configured

### Networking
- [ ] Custom domain configured (suna.yourdomain.com)
- [ ] SSL/TLS certificate obtained (Let's Encrypt or Azure)
- [ ] Azure CDN configured for frontend static assets
- [ ] DNS records properly configured
- [ ] Load balancer health checks configured

## 🐳 Container Configuration

### Build & Push Images
- [ ] Frontend build completes without errors
- [ ] Backend build completes without errors
- [ ] Images tagged with version numbers (not just :latest)
- [ ] Image sizes optimized (use multi-stage builds)
- [ ] Security scan passed (trivy or similar)

### Environment Variables
- [ ] All `YOUR_*` placeholders replaced in YAML
- [ ] Production Supabase credentials configured
- [ ] Backend API URL points to production
- [ ] Redis password configured and matches
- [ ] Analytics keys configured (PostHog, GTM)

## 📊 Monitoring & Observability

### Application Monitoring
- [ ] Health check endpoints working (/health, /api/health)
- [ ] Application Insights connected
- [ ] Custom metrics and events configured
- [ ] Error tracking configured (Sentry optional)
- [ ] Performance monitoring enabled

### Infrastructure Monitoring
- [ ] Container CPU/memory alerts configured
- [ ] Redis memory usage alerts
- [ ] Disk space alerts
- [ ] Network throughput monitoring
- [ ] Cost monitoring alerts

### Logging
- [ ] Centralized logging configured (Log Analytics)
- [ ] Log retention policy set
- [ ] Error logs aggregated and searchable
- [ ] Access logs enabled
- [ ] Audit logs configured

## 🚀 Deployment Process

### Pre-Deployment
- [ ] Code freeze announced to team
- [ ] All tests passing (unit, integration, e2e)
- [ ] Staging environment tested end-to-end
- [ ] Database migrations tested
- [ ] Rollback plan documented

### Deployment Steps
1. [ ] Build images: `./deploy-to-acr.sh`
2. [ ] Verify images pushed to ACR
3. [ ] Update `azure-container-group-production.yaml` with:
   - [ ] Managed identity resource ID
   - [ ] All environment variables
   - [ ] Redis password
   - [ ] Database credentials
4. [ ] Deploy: `./azure-deploy-aci-production.sh`
5. [ ] Wait for all containers to be running
6. [ ] Verify health checks passing

### Post-Deployment Verification
- [ ] Frontend accessible at https://suna.yourdomain.com
- [ ] Backend API responding at /api/v1
- [ ] Login/authentication working
- [ ] Database connections working
- [ ] Redis caching working
- [ ] External API integrations working
- [ ] Analytics events firing

## 🔄 Backup & Recovery

### Data Backups
- [ ] Database automated backups configured
- [ ] Redis persistence enabled (AOF + RDB)
- [ ] File storage backups (if applicable)
- [ ] Backup retention policy: 30 days minimum
- [ ] Backup restoration tested successfully

### Disaster Recovery
- [ ] Runbook documented for common failures
- [ ] Rollback procedure tested
- [ ] Database restore procedure tested
- [ ] Contact list for emergency response
- [ ] SLA and RTO/RPO defined

## 📈 Performance Optimization

### Frontend
- [ ] Next.js bundle analysis completed
- [ ] Images optimized (WebP, lazy loading)
- [ ] Critical CSS inlined
- [ ] Third-party scripts loaded async
- [ ] CDN cache headers configured

### Backend
- [ ] Database queries optimized (indexes)
- [ ] API response caching enabled
- [ ] Connection pooling configured
- [ ] Gunicorn workers tuned (2 * CPU cores)
- [ ] Async endpoints for long operations

### Redis
- [ ] Memory limit configured
- [ ] Eviction policy set (allkeys-lru)
- [ ] Connection pooling enabled
- [ ] Persistence strategy chosen (RDB vs AOF)

## 🧪 Testing

### Pre-Production Testing
- [ ] Load testing completed (expected peak load + 50%)
- [ ] Security penetration testing passed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Accessibility testing (WCAG 2.1 AA)

### Smoke Tests
- [ ] User registration works
- [ ] User login works
- [ ] Core workflows tested end-to-end
- [ ] Payment processing (if applicable)
- [ ] Email notifications sending

## 📋 Documentation

### Technical Documentation
- [ ] Architecture diagram updated
- [ ] API documentation published
- [ ] Environment variable reference
- [ ] Deployment runbook complete
- [ ] Troubleshooting guide created

### Operational Documentation
- [ ] Monitoring dashboard links
- [ ] On-call rotation schedule
- [ ] Escalation procedures
- [ ] SLA commitments documented
- [ ] Change management process

## ✅ Final Go-Live Checklist

### T-24 Hours
- [ ] All checklist items above completed
- [ ] Staging environment matches production config
- [ ] Team briefed on deployment plan
- [ ] Communication plan ready (users/stakeholders)
- [ ] Rollback plan reviewed

### T-1 Hour
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] Monitoring dashboards open
- [ ] Team on standby
- [ ] Status page ready

### T-0 (Go-Live)
- [ ] Execute deployment
- [ ] Monitor health checks
- [ ] Verify smoke tests
- [ ] Monitor error rates
- [ ] Monitor performance metrics

### T+1 Hour (Post-Deploy)
- [ ] All services healthy
- [ ] No critical errors
- [ ] Performance within SLA
- [ ] User traffic normal
- [ ] Communication sent to stakeholders

### T+24 Hours
- [ ] Post-mortem scheduled (if issues)
- [ ] Metrics reviewed
- [ ] Documentation updated
- [ ] Lessons learned documented
- [ ] Celebrate success! 🎉

---

## 🆘 Emergency Contacts

- **DevOps Lead**: [Name] - [Contact]
- **Backend Lead**: [Name] - [Contact]
- **Frontend Lead**: [Name] - [Contact]
- **Database Admin**: [Name] - [Contact]
- **Azure Support**: [Support Plan Details]

## 📞 Incident Response

### Severity Levels
- **P0 (Critical)**: Service down, data loss, security breach
- **P1 (High)**: Major feature broken, performance degraded
- **P2 (Medium)**: Minor feature broken, workaround available
- **P3 (Low)**: Cosmetic issue, enhancement request

### Response Times
- P0: Immediate response, 1-hour resolution target
- P1: 2-hour response, 4-hour resolution target
- P2: 8-hour response, 24-hour resolution target
- P3: Best effort, backlog prioritization
