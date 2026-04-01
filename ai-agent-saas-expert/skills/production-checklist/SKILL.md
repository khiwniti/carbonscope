---
name: Production Checklist
description: This skill should be used when the user asks "is my project ready for production", "production deployment checklist", "pre-launch checklist", or when preparing AI agent SaaS for production deployment. Provides comprehensive production readiness validation.
version: 0.1.0
---

# Production Checklist for AI Agent SaaS

Comprehensive pre-deployment checklist for AI agent chat SaaS applications.

## 🛡️ Security (30%)

### Authentication & Authorization
- [ ] Authentication provider configured (Supabase/Clerk/Auth0)
- [ ] Session management with secure cookies
- [ ] Password requirements enforced (if applicable)
- [ ] Multi-factor authentication available
- [ ] OAuth providers configured correctly
- [ ] JWT tokens with appropriate expiration
- [ ] Authorization checks on all protected routes
- [ ] API key rotation strategy in place

### API Security
- [ ] Rate limiting configured (per-user, per-IP)
- [ ] CORS properly configured (not `*` in production)
- [ ] API versioning strategy
- [ ] Webhook signature verification
- [ ] Request size limits enforced
- [ ] Timeout limits configured
- [ ] Input validation on all endpoints

### Data Security
- [ ] Secrets stored in environment variables
- [ ] No hardcoded credentials in code
- [ ] Database encryption at rest
- [ ] TLS/HTTPS enforced everywhere
- [ ] Sensitive data masked in logs
- [ ] Regular security audits scheduled

## 📡 Observability (20%)

### Error Tracking
- [ ] Sentry (or equivalent) configured
- [ ] Error boundaries in React components
- [ ] API error logging
- [ ] Custom error pages (404, 500)
- [ ] Error notification alerts setup

### Monitoring
- [ ] Application performance monitoring (APM)
- [ ] Database query performance monitoring
- [ ] API response time tracking
- [ ] LLM provider latency monitoring
- [ ] System resource monitoring (CPU, memory)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

### Logging
- [ ] Structured logging configured
- [ ] Log aggregation service (DataDog, LogDNA)
- [ ] Request/response logging
- [ ] Security event logging
- [ ] Log retention policy defined

### Analytics
- [ ] Vercel Analytics / Google Analytics
- [ ] User behavior tracking (PostHog, Mixpanel)
- [ ] Conversion funnel tracking
- [ ] Custom event tracking for key actions

## 🔄 Error Resilience (20%)

### Error Handling
- [ ] Global error handlers configured
- [ ] Graceful degradation for external services
- [ ] Retry logic for transient failures
- [ ] Circuit breakers for unstable services
- [ ] Fallback strategies for LLM providers

### Data Validation
- [ ] Input validation with schemas (Zod)
- [ ] Type safety with TypeScript
- [ ] Database constraints enforced
- [ ] API response validation

### Recovery
- [ ] Database backup strategy
- [ ] Point-in-time recovery available
- [ ] Rollback procedures documented
- [ ] Disaster recovery plan

## ⚡ Performance (15%)

### Frontend Performance
- [ ] Core Web Vitals optimized (LCP, FID, CLS)
- [ ] Images optimized (next/image)
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Bundle size < 300KB gzipped
- [ ] Font optimization (next/font)
- [ ] Critical CSS inlined

### Caching
- [ ] Redis caching for expensive queries
- [ ] CDN configured for static assets
- [ ] Browser caching headers set
- [ ] API response caching where appropriate
- [ ] LLM response caching

### Database
- [ ] Query optimization completed
- [ ] Indexes created for frequent queries
- [ ] Connection pooling configured
- [ ] N+1 query detection

## 📈 Scalability (10%)

### Infrastructure
- [ ] Horizontal scaling configured
- [ ] Load balancing setup
- [ ] Auto-scaling policies defined
- [ ] Database read replicas (if needed)
- [ ] CDN for global distribution

### LLM Provider Strategy
- [ ] Multiple LLM providers configured
- [ ] Automatic failover implemented
- [ ] Provider quota monitoring
- [ ] Cost tracking per provider

### Resource Management
- [ ] Function timeout limits
- [ ] Memory limits configured
- [ ] Request size limits
- [ ] Concurrent request limits

## 🚢 Deployment (5%)

### Configuration
- [ ] Environment variables documented
- [ ] Separate dev/staging/production configs
- [ ] Feature flags for gradual rollouts
- [ ] Database migrations automated
- [ ] Deployment scripts tested

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Load testing completed
- [ ] Security testing (OWASP)

### Documentation
- [ ] API documentation current
- [ ] Deployment runbook created
- [ ] Incident response procedures
- [ ] Team onboarding guide

## 🔍 Compliance & Legal

### Privacy
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent (if EU traffic)
- [ ] Data processing agreements (DPA)
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy

### Compliance
- [ ] SOC 2 requirements (if enterprise)
- [ ] HIPAA compliance (if healthcare)
- [ ] PCI-DSS compliance (if payments)
- [ ] Regular compliance audits

## ✅ Pre-Launch Final Checks

### 24 Hours Before
- [ ] Staging environment mirrors production
- [ ] All environment variables set in production
- [ ] Database migrations tested
- [ ] DNS records configured
- [ ] SSL certificates valid
- [ ] CDN configured and tested
- [ ] Monitoring dashboards created
- [ ] Alert recipients configured
- [ ] Support team briefed
- [ ] Rollback plan documented

### Launch Day
- [ ] Health check endpoints responding
- [ ] Error tracking active
- [ ] Analytics tracking verified
- [ ] Backup strategy confirmed
- [ ] Team on standby
- [ ] Communication plan ready

### Post-Launch (First Week)
- [ ] Monitor error rates daily
- [ ] Track performance metrics
- [ ] Review security logs
- [ ] Check cost/usage patterns
- [ ] Gather user feedback
- [ ] Optimize based on real traffic

## Scoring

Calculate readiness percentage:

**Critical Blockers (Must Fix):**
- No authentication
- Secrets in code
- No error tracking
- No backups
- No HTTPS

**High Priority (Should Fix):**
- Missing rate limiting
- No monitoring
- Poor performance
- No rollback plan
- Missing documentation

**Medium Priority (Nice to Have):**
- Advanced caching
- Multiple regions
- A/B testing
- Advanced analytics

**Production Ready Score:**
- **90-100%**: Excellent - ready for production
- **75-89%**: Good - address high priority items
- **60-74%**: Fair - significant work needed
- **<60%**: Not ready - critical issues remain

## Quick Validation

Run these commands to check readiness:

```bash
# Check for secrets in code
git secrets --scan

# Test build
pnpm run build

# Run tests
pnpm run test

# Check bundle size
pnpm run build && du -sh .next

# Verify environment variables
vercel env pull .env.production.local
cat .env.production.local | grep -v "^#" | wc -l

# Test health endpoint
curl https://your-domain.com/api/health

# Check SSL
curl -I https://your-domain.com | grep -i "strict-transport"
```

## Additional Resources

### Reference Files

- **`references/compliance-detailed.md`** - GDPR, SOC 2, HIPAA checklists
- **`references/performance-optimization.md`** - Detailed performance tuning
- **`references/security-hardening.md`** - Advanced security patterns

## When to Use

Use this checklist:
- Before initial production deployment
- Quarterly production health reviews
- After major feature releases
- Before security audits
- When investigating production issues
