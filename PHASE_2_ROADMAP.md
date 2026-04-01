# Phase 2: Frontend Integration & User Acceptance Testing

## Status: 🚀 READY TO START

**Prerequisites:** ✅ Phase 1 Foundation Complete (30/30 tasks)  
**Start Date:** March 24, 2026 (estimated)  
**Duration:** 4-6 weeks (estimated)  
**Team:** Frontend developers + Thai BIM consultants

---

## Phase 2 Objectives

1. **Build Web UI** for BOQ upload and carbon calculation
2. **User Acceptance Testing** with Thai construction consultants
3. **Production Deployment** with monitoring and backups
4. **Documentation** for end users and administrators

---

## Wave 1: Frontend Development (2-3 weeks)

### Task 1.1: UI/UX Design
**Description:** Design user interface mockups for all screens

**Deliverables:**
- Wireframes (Figma/Sketch)
- User flow diagrams
- Component library (shadcn/ui or Ant Design)
- Design system documentation

**Screens to Design:**
1. Dashboard (project overview)
2. BOQ upload (drag-drop CSV/Excel)
3. Material matching (search, fuzzy match, Thai input)
4. Carbon calculation results
5. EDGE certification check
6. TREES certification check
7. Report generation
8. Project history
9. Settings/configuration

**Success Criteria:**
- Mobile-responsive design
- Thai language support
- Accessible (WCAG 2.1 AA)
- Consultant-friendly UX

---

### Task 1.2: Frontend Framework Setup
**Description:** Initialize frontend application with Next.js/React

**Technology Stack:**
- **Framework:** Next.js 15+ (App Router)
- **UI Library:** shadcn/ui or Ant Design Thailand
- **State Management:** React Context or Zustand
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query (React Query)
- **Charts:** Recharts or Chart.js
- **i18n:** next-intl (Thai + English)

**File Structure:**
```
bks-cbim-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx (home)
│   │   ├── projects/
│   │   ├── boq-upload/
│   │   ├── calculations/
│   │   └── reports/
│   └── api/
│       ├── carbon/route.ts
│       ├── materials/route.ts
│       └── certifications/route.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── forms/
│   ├── charts/
│   └── layouts/
├── lib/
│   ├── api.ts (backend API client)
│   ├── types.ts
│   └── utils.ts
└── public/
    └── locales/ (Thai + English)
```

**Success Criteria:**
- Clean project structure
- TypeScript strict mode
- ESLint + Prettier configured
- i18n working (Thai + English)

---

### Task 1.3: BOQ Upload Interface
**Description:** Build drag-drop interface for BOQ file upload

**Features:**
- Drag-drop or click to upload
- Support formats: CSV, Excel (.xlsx, .xls)
- File validation (size, format, schema)
- Column mapping (user maps CSV columns to required fields)
- Preview before processing
- Error handling with clear messages

**Required Fields:**
- Material name (Thai or English)
- Quantity
- Unit (m³, kg, ton, m², etc.)
- Optional: Category, description, cost

**API Integration:**
```typescript
// POST /api/boq/upload
interface BOQUploadRequest {
  file: File;
  projectName: string;
  buildingType: string;
  grossFloorArea: number;
}

interface BOQUploadResponse {
  projectId: string;
  materials: Array<{
    id: string;
    name: string;
    nameTh: string;
    quantity: number;
    unit: string;
    matched: boolean;
    confidence?: number;
  }>;
  warnings: string[];
}
```

**Success Criteria:**
- <5s upload for 100-line BOQ
- Thai text displays correctly
- Clear error messages
- Mobile-friendly

---

### Task 1.4: Material Matching Interface
**Description:** Build UI for material search and confirmation

**Features:**
- Search box with autocomplete (Thai + English)
- Fuzzy matching with confidence scores
- Show TGO emission factors
- Allow manual selection from alternatives
- Batch approval ("Accept all high-confidence")
- Flag unmatched materials for review

**Components:**
```typescript
<MaterialSearch
  query={string}
  language="th" | "en"
  onSelect={(material) => void}
/>

<MaterialMatchReview
  materials={UnmatchedMaterial[]}
  onApprove={(materialId, tgoMaterialId) => void}
  onReject={(materialId) => void}
/>
```

**API Integration:**
```typescript
// GET /api/materials/search?q={query}&lang={th|en}
interface MaterialSearchResponse {
  materials: Array<{
    id: string;
    name: string;
    nameTh: string;
    category: string;
    emissionFactor: string; // Decimal as string
    unit: string;
    confidence: number; // 0-1
  }>;
}
```

**Success Criteria:**
- <200ms search latency
- Thai autocomplete works
- Top 5 matches shown
- Confidence scores visible

---

### Task 1.5: Carbon Calculation Results
**Description:** Display calculation results with charts and breakdowns

**Components:**
1. **Summary Card**
   - Total carbon (kgCO2e, tonCO2e)
   - Carbon intensity (kgCO2e/m²)
   - Comparison to Thai average

2. **Category Pie Chart**
   - Concrete, Steel, Glass, etc.
   - Percentage breakdown
   - Click to drill down

3. **Material Table**
   - Sortable by carbon, quantity, name
   - Filter by category
   - Export to CSV/Excel

4. **Hotspot Analysis**
   - Top 10 highest-carbon materials
   - Recommendations for alternatives

**API Integration:**
```typescript
// POST /api/carbon/calculate
interface CalculateRequest {
  projectId: string;
  boq: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
}

interface CalculateResponse {
  totalCarbonKgCO2e: string; // Decimal
  totalCarbonTonCO2e: string;
  carbonIntensity: string; // per m²
  breakdownByCategory: {
    [category: string]: {
      carbon: string;
      percentage: number;
    };
  };
  breakdownByMaterial: Array<{
    materialName: string;
    quantity: number;
    unit: string;
    emissionFactor: string;
    carbonKgCO2e: string;
  }>;
  dataQuality: {
    matchedMaterials: number;
    unmatchedMaterials: number;
    confidenceScore: number;
  };
}
```

**Success Criteria:**
- Real-time calculation (<2s)
- Charts render smoothly
- Thai labels display correctly
- Export works

---

### Task 1.6: EDGE Certification Check
**Description:** Display EDGE certification level and requirements

**Features:**
1. **Baseline Calculation**
   - Estimate baseline using building type
   - Show assumptions clearly
   - Allow manual baseline override

2. **Savings Calculation**
   - (Baseline - Project) / Baseline × 100%
   - Show savings in kgCO2e and percentage
   - Visualize with progress bar

3. **Certification Level**
   - EDGE Certified (20-39%)
   - EDGE Advanced (40-99%)
   - Zero Carbon (≥100%)
   - Show badge/certificate

4. **Gap Analysis**
   - If not certified, show gap to next level
   - Suggest material swaps to reach goal
   - Show impact of each swap

**API Integration:**
```typescript
// POST /api/certifications/edge
interface EDGECheckRequest {
  projectId: string;
  projectCarbon: string;
  buildingType: string;
  grossFloorArea: number;
}

interface EDGECheckResponse {
  baselineCarbon: string;
  projectCarbon: string;
  savingsPercent: number;
  certificationLevel: "Not Certified" | "EDGE Certified" | "EDGE Advanced" | "Zero Carbon";
  gapToNextLevel?: number;
  recommendations: Array<{
    materialId: string;
    currentMaterial: string;
    suggestedMaterial: string;
    carbonSaved: string;
    costImpact?: string;
  }>;
}
```

**Success Criteria:**
- Clear certification status
- Visual progress indicator
- Actionable recommendations
- Thai language support

---

### Task 1.7: TREES Certification Check
**Description:** Display TREES NC 1.1 MR category scoring

**Features:**
1. **MR1 Criterion (Green-Labeled Materials)**
   - Calculate % of materials with green labels
   - Target: 30% by cost
   - Max points: 10
   - Show which materials qualify

2. **MR3 Criterion (Reused Materials)**
   - Calculate % of reused materials
   - Target: 5-10% by cost
   - Max points: 5
   - Show which materials qualify

3. **Total MR Score**
   - MR1 + MR3 points
   - Max 15 points
   - Progress bar

4. **Certification Level**
   - Gold: 60+ total points (assume 45 from other categories)
   - Platinum: 80+ total points
   - Show badge

**API Integration:**
```typescript
// POST /api/certifications/trees
interface TREESCheckRequest {
  projectId: string;
  materials: Array<{
    materialId: string;
    cost: number; // THB
    isGreenLabeled: boolean;
    isReused: boolean;
  }>;
}

interface TREESCheckResponse {
  mr1: {
    percentGreenLabeled: number;
    points: number;
    maxPoints: 10;
    qualifyingMaterials: string[];
  };
  mr3: {
    percentReused: number;
    points: number;
    maxPoints: 5;
    qualifyingMaterials: string[];
  };
  totalMRPoints: number;
  certificationLevel: "Not Certified" | "Certified" | "Gold" | "Platinum";
}
```

**Success Criteria:**
- Clear points breakdown
- Material eligibility shown
- Thai language labels
- Recommendations

---

### Task 1.8: Report Generation
**Description:** Generate PDF/Word reports for consultants

**Features:**
- Project summary (name, type, GFA)
- Carbon calculation results
- Category breakdown (chart + table)
- Material hotspots
- EDGE certification status
- TREES certification status
- Recommendations
- Audit trail (who, when, what)

**Export Formats:**
- PDF (A4, Thai fonts supported)
- Excel (detailed breakdown)
- CSV (raw data)

**Components:**
```typescript
<ReportGenerator
  projectId={string}
  format="pdf" | "excel" | "csv"
  onGenerate={(url) => void}
/>
```

**API Integration:**
```typescript
// POST /api/reports/generate
interface ReportRequest {
  projectId: string;
  format: "pdf" | "excel" | "csv";
  includeSections: string[]; // ["summary", "breakdown", "edge", "trees", "recommendations"]
}

interface ReportResponse {
  reportId: string;
  downloadUrl: string;
  expiresAt: string; // ISO 8601
}
```

**Success Criteria:**
- Thai text renders correctly in PDF
- Charts included
- Professional formatting
- <10s generation time

---

## Wave 2: Backend API Development (1-2 weeks)

### Task 2.1: REST API Endpoints
**Description:** Build FastAPI or Flask backend connecting frontend to knowledge graph

**Endpoints to Implement:**
```
POST /api/boq/upload
GET  /api/projects/{projectId}
GET  /api/materials/search
POST /api/carbon/calculate
POST /api/certifications/edge
POST /api/certifications/trees
POST /api/reports/generate
GET  /api/reports/{reportId}/download
GET  /api/audit/{projectId}
```

**Technology Stack:**
- **Framework:** FastAPI (async) or Flask
- **Validation:** Pydantic models
- **Database:** PostgreSQL (project metadata)
- **Cache:** Redis (search results)
- **Auth:** JWT tokens
- **CORS:** Configure for frontend

**Integration:**
- GraphDB client (existing)
- Carbon calculator (existing)
- Material matcher (existing)
- Audit logger (existing)

**Success Criteria:**
- <200ms response time (p95)
- Input validation
- Error handling
- API documentation (Swagger)

---

### Task 2.2: Authentication & Authorization
**Description:** Implement user login and role-based access control

**User Roles:**
- **Guest:** View demo projects only
- **Consultant:** Create projects, run calculations
- **Admin:** Manage users, view all projects

**Features:**
- User registration (email + password)
- Login with JWT tokens
- Password reset flow
- Role-based permissions
- Session management

**Technology:**
- FastAPI security utilities
- Bcrypt for password hashing
- JWT for tokens
- PostgreSQL for user data

**Success Criteria:**
- Secure password storage
- Token expiration
- Role enforcement
- Thai language support

---

### Task 2.3: Database Schema
**Description:** Design PostgreSQL schema for project metadata

**Tables:**
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- 'guest', 'consultant', 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  building_type VARCHAR(100),
  gross_floor_area DECIMAL(10,2),
  location VARCHAR(255),
  status VARCHAR(50), -- 'draft', 'calculated', 'certified'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BOQ Items
CREATE TABLE boq_items (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  material_name VARCHAR(255),
  material_name_th VARCHAR(255),
  tgo_material_id VARCHAR(255), -- from GraphDB
  quantity DECIMAL(15,4),
  unit VARCHAR(50),
  emission_factor DECIMAL(15,6),
  carbon_kgco2e DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calculation Results
CREATE TABLE calculation_results (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  total_carbon_kgco2e DECIMAL(15,2),
  total_carbon_tonco2e DECIMAL(15,2),
  carbon_intensity DECIMAL(15,2),
  edge_level VARCHAR(50),
  edge_savings_percent DECIMAL(5,2),
  trees_mr_points DECIMAL(5,2),
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  action VARCHAR(100), -- 'create', 'calculate', 'certify', 'export'
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Migrations:**
- Use Alembic (SQLAlchemy) or similar
- Version-controlled migrations

**Success Criteria:**
- Normalized schema
- Indexes on foreign keys
- Audit trail complete

---

### Task 2.4: Caching Layer
**Description:** Implement Redis cache for performance

**Cache Strategy:**
- **Material search results:** 1 hour TTL
- **Emission factors:** 1 day TTL (refresh from GraphDB daily)
- **Calculation results:** 24 hours (invalidate on project update)
- **User sessions:** 30 minutes (sliding expiration)

**Cache Keys:**
```
material:search:{query}:{lang}
emission_factor:{material_id}
calculation:{project_id}:{version}
session:{user_id}
```

**Invalidation:**
- On GraphDB data update
- On project BOQ change
- On user logout

**Success Criteria:**
- Cache hit rate >70%
- <10ms cache read latency
- Automatic expiration

---

## Wave 3: User Acceptance Testing (1-2 weeks)

### Task 3.1: Recruit Thai Consultants
**Description:** Find 5-10 Thai BIM consultants for UAT

**Criteria:**
- Experience with EDGE and/or TREES certification
- Familiar with BOQ formats
- Willing to test prototype
- Provide feedback

**Recruitment:**
- Contact Thai Green Building Institute (TGBI)
- EDGE Experts in Thailand
- Architecture firms in Bangkok
- University faculty (Chulalongkorn, KMUTT)

**Compensation:**
- Free access to platform (1 year)
- Certificate of participation
- Acknowledgment in docs

---

### Task 3.2: Prepare Test Scenarios
**Description:** Create realistic test cases for consultants

**Test Scenarios:**
1. **Small Residential** (150 m² house)
   - 50-line BOQ
   - Mix of Thai/English material names
   - EDGE Certified target

2. **Medium Commercial** (2,000 m² office)
   - 150-line BOQ
   - Thai-only material names
   - EDGE Advanced target

3. **Large Mixed-Use** (10,000 m² condo + retail)
   - 300-line BOQ
   - Complex material categories
   - Zero Carbon target

4. **Industrial** (5,000 m² warehouse)
   - 100-line BOQ
   - Steel-heavy
   - TREES Gold target

**For Each Scenario:**
- Provide BOQ CSV/Excel file
- Expected results (manually calculated)
- EDGE/TREES targets
- Testing checklist

---

### Task 3.3: UAT Sessions
**Description:** Run testing sessions with consultants

**Format:**
- 2-hour sessions per consultant
- Screen share + observation
- Think-aloud protocol
- Record feedback

**Testing Checklist:**
- [ ] BOQ upload works (CSV, Excel)
- [ ] Thai text displays correctly
- [ ] Material matching is accurate
- [ ] Carbon calculation matches expectations
- [ ] EDGE certification check is correct
- [ ] TREES certification check is correct
- [ ] Report generation works
- [ ] Export to PDF/Excel works
- [ ] Thai language throughout
- [ ] Mobile-responsive (if tested)

**Feedback Collection:**
- Post-session survey
- Bug reports (GitHub issues)
- Feature requests
- Usability ratings (1-5 scale)

---

### Task 3.4: Iterate Based on Feedback
**Description:** Fix bugs and improve UX based on UAT feedback

**Common Issues (anticipated):**
- Material matching false negatives (add more TGO materials)
- Thai font rendering issues
- Unclear error messages
- Missing material categories
- Performance slow on large BOQs

**Prioritization:**
- P0: Blocking issues (crashes, data loss)
- P1: Major usability issues (confusing UX)
- P2: Minor issues (cosmetic, nice-to-have)
- P3: Feature requests (backlog)

**Iteration:**
- Fix P0 bugs immediately
- Address P1 in 1 week
- P2 in next release
- P3 in backlog

---

## Wave 4: Production Deployment (1 week)

### Task 4.1: Infrastructure Setup
**Description:** Set up production servers and databases

**Architecture:**
```
┌─────────────┐
│   Vercel    │ Frontend (Next.js)
└──────┬──────┘
       │
┌──────▼──────┐
│  AWS/Azure  │ Backend (FastAPI)
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│  GraphDB  │  PostgreSQL  │  Redis
│ (Docker)  │  (RDS)       │  (ElastiCache)
└──────────────────────────────┘
```

**Services:**
- **Frontend:** Vercel (automatic deployments)
- **Backend:** AWS EC2 or Azure VM (Docker containers)
- **GraphDB:** Docker on separate instance (8GB RAM)
- **PostgreSQL:** AWS RDS or Azure Database
- **Redis:** AWS ElastiCache or Azure Cache
- **Storage:** S3 or Azure Blob (reports, uploads)

**Domain:**
- sunabim.com or sunabim.co.th
- SSL certificate (Let's Encrypt)
- CDN for static assets

**Success Criteria:**
- 99.9% uptime
- Auto-scaling (backend)
- Database backups (daily)
- Monitoring (Datadog or New Relic)

---

### Task 4.2: CI/CD Pipeline
**Description:** Automate testing and deployment

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest backend/
      - name: Check coverage
        run: pytest --cov=backend/ --cov-fail-under=90

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  deploy-staging:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: ./deploy-staging.sh

  deploy-production:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./deploy-production.sh
```

**Environments:**
- **Development:** localhost
- **Staging:** staging.sunabim.com
- **Production:** app.sunabim.com

**Success Criteria:**
- Automated tests on every PR
- Deploy to staging on merge to develop
- Deploy to production on merge to main
- Rollback capability

---

### Task 4.3: Monitoring & Logging
**Description:** Set up monitoring and alerting

**Metrics to Track:**
- Request latency (p50, p95, p99)
- Error rate
- Database query time
- GraphDB query time
- Cache hit rate
- User signups
- Projects created
- Calculations run
- Report exports

**Tools:**
- **Application:** Datadog, New Relic, or Sentry
- **Infrastructure:** AWS CloudWatch or Azure Monitor
- **Logs:** Elasticsearch + Kibana or Loggly
- **Uptime:** UptimeRobot or Pingdom

**Alerts:**
- Error rate >5% (Slack + email)
- API latency >2s (Slack)
- Database CPU >80% (email)
- Disk space <10GB (email)
- GraphDB down (Slack + SMS)

**Success Criteria:**
- <5min time to detect issues
- Dashboards accessible to team
- Historical data retention (1 year)

---

### Task 4.4: Backup & Disaster Recovery
**Description:** Implement backup and recovery procedures

**Backup Strategy:**
- **GraphDB:** Daily full backup (RDF dump) → S3
- **PostgreSQL:** Automated RDS backups (every 6 hours)
- **Redis:** Snapshots every hour → S3
- **User uploads:** Stored in S3 (versioning enabled)

**Retention:**
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

**Disaster Recovery:**
- GraphDB restore: <1 hour (from RDF dump)
- PostgreSQL restore: <30 minutes (RDS snapshot)
- Redis restore: <15 minutes (snapshot)
- Full system restore: <2 hours

**Testing:**
- Quarterly DR drills
- Document recovery procedures
- Test restores

**Success Criteria:**
- RPO (Recovery Point Objective): 6 hours
- RTO (Recovery Time Objective): 2 hours
- Automated backups
- Tested restores

---

## Wave 5: Documentation & Training (1 week)

### Task 5.1: User Documentation
**Description:** Write end-user guides in Thai and English

**Guides:**
1. **Quick Start** (5 minutes)
   - Register account
   - Upload first BOQ
   - View results

2. **BOQ Upload Guide**
   - Supported formats
   - Column mapping
   - Error troubleshooting

3. **Material Matching Guide**
   - Search tips
   - How fuzzy matching works
   - When to override

4. **Carbon Calculation Guide**
   - How calculations work
   - Interpreting results
   - Category breakdown

5. **EDGE Certification Guide**
   - Baseline calculation
   - Certification levels
   - Gap analysis

6. **TREES Certification Guide**
   - MR1 criterion
   - MR3 criterion
   - Material eligibility

7. **Report Generation Guide**
   - Export formats
   - Customizing reports
   - Sharing with clients

**Format:**
- Online help center (Notion, GitBook, or Docusaurus)
- PDF downloads
- Video tutorials (Thai voiceover)
- Screenshots with annotations

**Success Criteria:**
- Bilingual (Thai + English)
- Searchable
- Mobile-friendly
- Up-to-date

---

### Task 5.2: Admin Documentation
**Description:** Write admin guides for system maintenance

**Topics:**
1. **User Management**
   - Creating accounts
   - Resetting passwords
   - Role assignments

2. **TGO Data Updates**
   - Quarterly update procedure
   - Loading new materials
   - Version management

3. **System Monitoring**
   - Dashboards overview
   - Interpreting metrics
   - Responding to alerts

4. **Backup & Restore**
   - Backup schedules
   - Restore procedures
   - DR testing

5. **Troubleshooting**
   - Common issues
   - Log analysis
   - Escalation paths

**Format:**
- Internal wiki (Confluence or Notion)
- Runbooks for operations
- Contact information

**Success Criteria:**
- Step-by-step procedures
- Screenshots
- Regularly updated

---

### Task 5.3: Training Sessions
**Description:** Train consultants and admin staff

**Consultant Training (2 hours):**
- System overview
- BOQ upload demo
- Material matching demo
- Certification checking
- Report generation
- Q&A

**Admin Training (4 hours):**
- Architecture overview
- User management
- Data updates
- Monitoring
- Backups
- Troubleshooting

**Format:**
- In-person or Zoom
- Record sessions
- Provide handouts
- Issue certificates

**Success Criteria:**
- All key users trained
- Training materials available
- Feedback collected

---

## Success Criteria for Phase 2

### Functional Requirements
✅ BOQ upload working (CSV, Excel)
✅ Material matching accurate (>85% auto-match)
✅ Carbon calculation matches consultants (±2%)
✅ EDGE certification correct
✅ TREES certification correct
✅ Reports generate successfully
✅ Thai language support complete
✅ Mobile-responsive design

### Performance Requirements
✅ Page load time <2s (p95)
✅ Carbon calculation <3s (p95)
✅ Search latency <200ms (p95)
✅ Report generation <10s
✅ 99.9% uptime
✅ Support 100 concurrent users

### User Acceptance
✅ 5+ consultants tested
✅ Usability score ≥4/5
✅ All P0 bugs fixed
✅ All P1 bugs fixed
✅ User documentation complete
✅ Training completed

### Production Readiness
✅ CI/CD pipeline working
✅ Monitoring active
✅ Backups running
✅ DR tested
✅ Security audit passed
✅ Load testing passed

---

## Budget Estimate (Phase 2)

**Development:**
- Frontend developer: 3 weeks × $5,000/week = $15,000
- Backend developer: 2 weeks × $5,000/week = $10,000
- UI/UX designer: 1 week × $4,000/week = $4,000

**Infrastructure:**
- AWS/Azure: $500/month × 2 months = $1,000
- Vercel: $20/month × 2 months = $40
- Monitoring: $100/month × 2 months = $200

**Testing:**
- Consultant honorariums: 10 consultants × $200 = $2,000

**Total: ~$32,240 USD (~1,128,400 THB)**

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Material matching accuracy low | High | Medium | Add more TGO materials, improve fuzzy matching |
| Thai fonts not rendering | Medium | Low | Test thoroughly, use web fonts |
| Performance slow on large BOQs | Medium | Medium | Optimize queries, implement caching |
| Consultants unavailable for UAT | High | Low | Recruit early, offer incentives |
| GraphDB crashes in production | High | Low | Implement auto-restart, monitoring, backups |
| Budget overrun | Medium | Medium | Prioritize features, MVP first |

---

## Timeline Summary

| Wave | Duration | Start | End |
|------|----------|-------|-----|
| 1. Frontend Development | 2-3 weeks | Week 1 | Week 3 |
| 2. Backend API | 1-2 weeks | Week 2 | Week 3 |
| 3. User Acceptance Testing | 1-2 weeks | Week 4 | Week 5 |
| 4. Production Deployment | 1 week | Week 6 | Week 6 |
| 5. Documentation & Training | 1 week | Week 6 | Week 6 |

**Total Duration:** 6 weeks (can overlap some waves)

---

## Next Steps (Immediate)

1. **Assemble Team:**
   - Frontend developer (React/Next.js)
   - Backend developer (Python/FastAPI)
   - UI/UX designer
   - Project manager

2. **Kickoff Meeting:**
   - Review Phase 1 deliverables
   - Discuss Phase 2 roadmap
   - Assign tasks
   - Set milestones

3. **Design Phase:**
   - UI/UX mockups (Week 1)
   - User flow validation
   - Component library setup

4. **Development Sprint 1:**
   - BOQ upload interface
   - Material matching UI
   - Backend API skeleton

---

## Conclusion

Phase 2 will transform the Phase 1 Foundation into a user-facing web application that Thai BIM consultants can use for real projects. The focus is on:

- **Usability:** Clean, intuitive UI in Thai
- **Accuracy:** ±2% vs manual calculations
- **Performance:** Fast, responsive (<2s page loads)
- **Reliability:** 99.9% uptime, automated backups

With Phase 1 complete, the technical foundation is solid. Phase 2 is all about delivering value to end users.

---

**Ready to start Phase 2?** Let's build! 🚀

---
