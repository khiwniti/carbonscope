# User Acceptance Testing (UAT) Scenarios

## Overview
This document defines 6 UAT scenarios for testing the CarbonBIM platform with Thai construction professionals.

## Participant Requirements
- Role: Architect, Construction Engineer, Sustainability Consultant, or Project Manager
- Experience: 2+ years in Thai construction industry
- Language: Fluent in Thai (primary), English proficiency (optional)
- Computer skills: Comfortable with Excel and web applications

## Pre-Session Setup
- [ ] Staging environment accessible at: https://staging.carbonbim.example.com
- [ ] Test user account created (username + password)
- [ ] Sample BOQ files available (3 different projects)
- [ ] Screen recording software ready
- [ ] Consent form signed (video recording, data usage)

## Scenario 1: BOQ File Upload & Parsing

### Objective
Test the user's ability to upload a Thai BOQ Excel file and verify material extraction accuracy.

### Pre-conditions
- User is logged in
- User is on the Dashboard page

### Steps
1. Navigate to "Upload BOQ" section
2. Click "Browse" or drag-and-drop zone
3. Select sample BOQ file: `BOQ_Sample_Condo_Project_TH.xlsx`
4. Click "Upload" button
5. Wait for processing to complete
6. Review extracted materials list

### Expected Results
- [ ] File upload succeeds (progress bar shows 100%)
- [ ] Processing completes within 30 seconds
- [ ] Materials list displays with Thai names
- [ ] Quantities and units extracted correctly
- [ ] Any errors/warnings clearly displayed

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Did user understand where to upload?
- Was drag-and-drop intuitive?
- Were error messages (if any) clear?
- Did Thai text render correctly?

---

## Scenario 2: Carbon Analysis Review

### Objective
Test the user's ability to interpret carbon footprint results and understand the breakdown.

### Pre-conditions
- BOQ file has been successfully uploaded and processed (from Scenario 1)
- User is on the Analysis Results page

### Steps
1. Review total carbon footprint (kgCO2e)
2. Examine carbon distribution pie chart (by category)
3. View category breakdown table
4. Click on "Concrete" category to see detailed breakdown
5. Review top 5 highest-emission materials
6. Check calculation methodology explanation
7. Download audit trail Excel file

### Expected Results
- [ ] Total carbon footprint displayed prominently
- [ ] Pie chart loads and is interactive (hover shows details)
- [ ] Category breakdown table sortable and filterable
- [ ] Detailed material breakdown shows emission factors
- [ ] Methodology section explains TGO factors + Brightway2
- [ ] Excel download contains complete audit trail

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Did user understand the charts?
- Was the carbon unit (kgCO2e) clear?
- Did user find the emission factors credible?
- Was Thai terminology accurate?

---

## Scenario 3: Material Alternative Exploration

### Objective
Test the user's ability to explore and compare alternative materials to reduce carbon footprint.

### Pre-conditions
- Analysis results available (from Scenario 2)
- User is on the Material Alternatives page

### Steps
1. Navigate to "Material Alternatives" tab
2. Filter materials by category: "Concrete"
3. Select a specific material: "ปูนซิเมนต์ปอร์ตแลนด์ประเภท 1" (Portland Cement Type 1)
4. View recommended alternatives (e.g., blended cement with fly ash)
5. Compare carbon reduction percentages
6. Check cost implications (if available)
7. Click "Apply Alternative" for one material
8. View updated carbon footprint

### Expected Results
- [ ] Alternatives list loads with 3-5 options per material
- [ ] Carbon reduction % clearly displayed (e.g., -25%)
- [ ] Cost delta shown (e.g., +5% or -10%)
- [ ] Material properties compared (strength, durability)
- [ ] "Apply" button functional
- [ ] Updated carbon footprint recalculates immediately

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Did user trust the alternative recommendations?
- Was carbon vs. cost trade-off clear?
- Did user understand material property implications?
- Were Thai material names accurate?

---

## Scenario 4: What-If Scenario Analysis

### Objective
Test the user's ability to create custom scenarios by substituting multiple materials and comparing outcomes.

### Pre-conditions
- Material alternatives explored (from Scenario 3)
- User is on the Scenarios page

### Steps
1. Navigate to "Scenarios" tab
2. Click "Create New Scenario"
3. Name scenario: "Low Carbon Strategy A"
4. Select 3 materials to substitute:
   - Replace Portland Cement with Blended Cement (30% fly ash)
   - Replace standard steel with recycled steel
   - Replace virgin aggregates with recycled aggregates
5. Save scenario
6. View scenario comparison table (Baseline vs. Strategy A)
7. Review carbon reduction summary
8. Generate scenario comparison report (PDF)

### Expected Results
- [ ] Scenario creation interface intuitive
- [ ] Material substitutions apply correctly
- [ ] Comparison table shows side-by-side metrics
- [ ] Carbon reduction % calculated accurately
- [ ] PDF report generates with scenario comparison
- [ ] Can create multiple scenarios (Strategy B, C, etc.)

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Was scenario creation workflow logical?
- Did user understand the comparison table?
- Was the carbon reduction % impactful?
- Did PDF report meet expectations?

---

## Scenario 5: Report Generation

### Objective
Test the user's ability to generate professional PDF and Excel reports with bilingual support.

### Pre-conditions
- Analysis completed (from Scenario 2)
- At least one scenario created (from Scenario 4)
- User is on the Reports page

### Steps
1. Navigate to "Reports" tab
2. Select report type: "Carbon Footprint Assessment"
3. Choose language: Thai (ภาษาไทย)
4. Select sections to include:
   - Executive Summary
   - Carbon Breakdown
   - Material Recommendations
   - TREES/EDGE Status
5. Click "Generate PDF Report"
6. Wait for generation (5-10 seconds)
7. Preview PDF in browser
8. Download PDF
9. Open PDF in local PDF viewer (Adobe, Foxit, etc.)
10. Verify Thai fonts render correctly
11. Generate Excel audit trail report
12. Open Excel file and review sheets

### Expected Results
- [ ] Report generation completes in <10 seconds
- [ ] PDF preview loads in browser
- [ ] Thai fonts (Noto Sans Thai) render correctly
- [ ] Charts/graphs embedded properly
- [ ] CarbonBIM branding present (logo, colors)
- [ ] Excel file contains multiple sheets (Summary, Materials, Calculations)
- [ ] Excel formulas functional (can recalculate)

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Was report professional quality?
- Did Thai text render without issues?
- Were charts clear and insightful?
- Would user share this with clients?

---

## Scenario 6: TREES/EDGE Certification Check

### Objective
Test the user's ability to check TREES and EDGE certification status and understand gap analysis.

### Pre-conditions
- Carbon analysis completed (from Scenario 2)
- User is on the Certification page

### Steps
1. Navigate to "Certification" tab
2. View TREES NC 1.1 score breakdown
3. Check current MR (Materials & Resources) credits: X/10
4. Review "Path to Gold" recommendations (50 points target)
5. Click "View Detailed Gap Analysis"
6. Examine specific actions needed for Gold certification
7. Switch to EDGE tab
8. View baseline vs. actual carbon footprint
9. Check current reduction %: X%
10. Review "Path to 20%" recommendations
11. Generate TREES/EDGE certification report (PDF)

### Expected Results
- [ ] TREES score displayed with category breakdown
- [ ] MR credits calculated from material selections
- [ ] "Path to Gold" shows clear action items
- [ ] Gap analysis detailed and actionable
- [ ] EDGE baseline calculation explained
- [ ] Current reduction % accurate
- [ ] Recommendations practical and specific
- [ ] Certification report generates successfully

### Success Criteria
- Task completion: Yes/No
- Time to complete: _____ minutes
- Errors encountered: _____
- User satisfaction: 1-5

### Observation Notes
- Did user understand TREES scoring system?
- Were MR credits calculation credible?
- Did gap analysis provide actionable insights?
- Was EDGE 20% reduction clear?
- Would user use this for real projects?

---

## Post-Session Survey

### Quantitative Ratings (1-5 scale)
1 = Strongly Disagree, 5 = Strongly Agree

1. The system was easy to use. [ ]
2. The information was clear and understandable. [ ]
3. This tool would be valuable for my work. [ ]
4. I would recommend this tool to colleagues. [ ]
5. The Thai language support was accurate and natural. [ ]
6. The carbon calculations appeared credible. [ ]
7. The material recommendations were practical. [ ]
8. The reports were professional quality. [ ]

### Qualitative Feedback

**What did you like most about the platform?**
_________________________________

**What was most confusing or frustrating?**
_________________________________

**What features are missing that you would need?**
_________________________________

**How much would you pay for this tool? (per project or monthly subscription)**
- [ ] Would not pay
- [ ] THB 500-1,000 per project
- [ ] THB 1,500-3,000 per project
- [ ] THB 5,000-10,000 per project
- [ ] THB 1,000-2,000/month subscription
- [ ] THB 3,000-5,000/month subscription

**Would you use this tool for real projects?**
- [ ] Yes, immediately
- [ ] Yes, after some improvements (specify: _________)
- [ ] Maybe, need to see more features
- [ ] No, not useful for my work

**Any other comments or suggestions?**
_________________________________

---

## Session Summary Template

**Participant ID:** [Anonymous ID]
**Date:** [YYYY-MM-DD]
**Duration:** [HH:MM]
**Facilitator:** [Name]

### Overall Results
- Tasks completed: X/6
- Average time per task: X.X minutes
- Total errors: X
- Average satisfaction: X.X/5.0

### Critical Issues Found
1. [Issue description, severity, screenshot]
2. [Issue description, severity, screenshot]

### Positive Highlights
1. [What worked well]
2. [User praised features]

### Recommendations for Improvement
1. [Priority 1 - Must fix before launch]
2. [Priority 2 - Important but not blocking]
3. [Priority 3 - Nice to have]

### Video Recording
- File: `UAT_[ParticipantID]_[Date].mp4`
- Timestamps of key moments: [00:00 - Description]

---

## Facilitator Guidelines

### Before Session
1. Test all scenarios yourself to ensure they work
2. Prepare backup BOQ files in case of upload issues
3. Have technical support on standby
4. Set up screen recording (with participant consent)

### During Session
1. Explain that you're testing the software, not the participant
2. Encourage "think aloud" protocol (verbalize thoughts)
3. Do not help unless participant is completely stuck (>3 min)
4. Take notes on confusion points, hesitations, errors
5. Remain neutral - don't lead with suggestions

### After Session
1. Thank participant and provide compensation
2. Backup recording and notes immediately
3. Document critical issues within 24 hours
4. Share findings with development team

### Red Flags (Stop session and escalate)
- Data loss or corruption
- Complete system crash
- Security issues (exposed credentials, unauthorized access)
- Offensive content or inappropriate translations
