# System Specification — Adoption Digital Platform

## 1. Purpose & Intent

**Why this system exists.**

The Adoption Digital Platform exists to digitise and streamline the end-to-end journey of adoption cases in England & Wales, replacing paper-heavy legacy processes with a modern, AI-assisted digital solution.

### Problem Being Solved
- Administrative burden on social workers, legal teams, and judiciary consumes time that could be spent on casework
- Case progression is slow due to manual document handling and fragmented systems
- Data quality issues arise from re-keying information across agencies
- Limited visibility into case status and compliance with statutory timelines
- Legacy applications are costly to maintain and do not support modern ways of working

### Who It Exists For
- **Primary:** HMCTS case officers, judges, legal advisers, Cafcass officers, Local Authority social workers, voluntary adoption agency workers
- **Secondary:** Prospective adopters (limited, guided access)
- **Indirect beneficiaries:** Children awaiting adoption, birth parents (through trauma-informed design)

### What Success Looks Like
- Reduced time-to-decision for adoption cases
- Improved statutory compliance (e.g., 10-week placement requirements)
- Higher data quality through single digital case records
- Enhanced safeguarding through AI-assisted risk flagging
- Seamless multi-agency collaboration
- Successful decommissioning of legacy applications

### What Must Not Be Compromised
- **Child welfare** must remain paramount in all system design decisions
- **Safeguarding** protocols must never be weakened for efficiency
- **Human decision-making** for legal and care decisions must never be replaced by AI
- **Data security** and privacy for vulnerable individuals
- **Judicial independence** and discretion

---

## 2. Business & Domain Context

**Grounded in `.business_context`.**

### Legislative & Policy Framework
- **Adoption and Children Act 2002** (Section 21 - placement orders)
- **Family Procedure Rules Part 14** (court directions and procedures)
- **Hague Convention** on intercountry adoption
- **GDPR and Data Protection Act** requirements
- **Ministry of Justice Security Standards**

### Domain Constraints
- Adoption proceedings are sensitive family court matters with strict confidentiality requirements
- Multiple agency types (Local Authorities, voluntary agencies, Cafcass, HMCTS) have different systems and data standards
- Statutory timelines must be tracked (e.g., minimum 10-week placement before adoption order application)
- Consent handling has legal implications - must track whether consent is given, refused, or dispensed with by court
- Birth parent information must be protected from adopters in certain views

### External Pressures
- Judicial acceptance of AI-generated insights requires trust-building
- Cultural resistance to automating historically paper-heavy processes
- Legacy Local Authority systems have varying integration capabilities
- High safeguarding risk demands careful design

### Assumptions
- Gov.UK One Login will be available for identity verification
- Local Authorities will provide API access to their case management systems (or alternative integration paths)
- HMCTS Reform platform integration is feasible
- Judiciary will accept AI summaries as decision-support (not decision-making) tools
- Phased rollout allows iterative learning and adjustment

---

## 3. System Boundaries

### In Scope
- **Case Management:** Single digital case record creation and management for all adoption types
- **Document Handling:** Ingestion, OCR, classification, and storage of adoption documents
- **Court Process Support:** Application, directions, consent handling, bundle generation, order recording
- **AI Decision-Support:** Document summarisation, risk flagging, matching support, compliance monitoring
- **Digital Journeys:** Guided application processes for different adoption pathways
- **Multi-Agency Collaboration:** Secure information sharing between HMCTS, Cafcass, LAs, and voluntary agencies
- **Reporting & Analytics:** Dashboards, case progression tracking, compliance reporting

### Out of Scope
- **Care proceedings** (separate system - placement orders may feed into this system)
- **Adoption panel decision-making** (remains with agencies)
- **Post-adoption support services** (beyond recording contact arrangements)
- **Birth records amendment** (handled by General Register Office)
- **Adopter assessment and approval** (remains with adoption agencies, though reports are ingested)
- **Automated legal decision-making** (explicitly prohibited)

---

## 4. Actors & Roles

### HMCTS Case Officers
- **Description:** Court administrative staff managing adoption case files and scheduling
- **Primary Goals:** Process applications efficiently, ensure compliance with court rules, maintain accurate records
- **Authority:** Create/update case records, schedule hearings, issue notices, generate bundles

### Judges / Legal Advisers
- **Description:** Judicial officers making legal determinations on adoption applications
- **Primary Goals:** Make child-welfare-centred decisions based on complete, accurate information
- **Authority:** Grant or refuse orders, issue directions, dispense with consent, determine contact arrangements
- **Constraints:** Must retain full discretion; AI outputs are advisory only

### Cafcass Officers
- **Description:** Children and Family Court Advisory and Support Service officers
- **Primary Goals:** Represent children's interests, verify consent, report to court
- **Authority:** Submit reports, witness consents, represent child's views in proceedings

### Local Authority Social Workers
- **Description:** Social workers managing children in care and prospective adopter assessments
- **Primary Goals:** Ensure child safety, prepare thorough assessments, support placements
- **Authority:** Submit reports, request placement orders, manage matching process

### Voluntary Adoption Agency Workers
- **Description:** Staff from non-LA adoption agencies managing adopter recruitment and assessment
- **Primary Goals:** Assess and prepare adopters, facilitate matches
- **Authority:** Submit adopter assessments and reports

### Adopters
- **Description:** Prospective or approved adoptive parents
- **Primary Goals:** Navigate adoption process, submit required documentation, understand case status
- **Authority:** Limited, guided access; submit applications and documents; view own case status
- **Constraints:** Cannot see birth family identifying information; view is redacted appropriately

---

## 5. Core Domain Concepts

### Case
- **Definition:** A single adoption matter tracked through the system from application to order (or withdrawal/refusal)
- **Key Attributes:** Case number, case type, current status, assigned court, parties, key dates
- **Lifecycle:** Application received -> Directions -> Hearings -> Final Hearing -> Order/Outcome

### Adoption Type
- **Definition:** The category of adoption pathway being followed
- **Types:** Agency Adoption, Step-Parent Adoption, Intercountry Adoption, Non-Agency Adoption (including Relative, Special Guardian, Private), Foster-to-Adopt, Adoption Following Placement Order
- **Significance:** Determines required documents, workflow steps, and compliance rules

### Placement Order
- **Definition:** A court order authorising a Local Authority to place a child for adoption
- **Key Attributes:** Order date, issuing court, child details, LA reference
- **Significance:** Prerequisite for many adoption applications; triggers 10-week minimum placement period

### Consent
- **Definition:** Legal agreement from a person with parental responsibility for the adoption to proceed
- **States:** Given, Refused, Dispensed With (by court)
- **Key Attributes:** Consenting party, date, witnessing officer, consent form reference

### Party
- **Definition:** An individual or organisation involved in adoption proceedings
- **Types:** Applicant (adopter), Child, Birth Parent, Local Authority, Cafcass, Respondent
- **Key Attributes:** Role, contact details, legal representation, party status

### Document
- **Definition:** Any evidence, report, form, or order associated with a case
- **Types:** Form A58, PAR (Prospective Adopters Report), Health Assessments, Court Orders, Consent Forms, Cafcass Reports, Identity Documents
- **Key Attributes:** Document type, upload date, source, classification, version

### Hearing
- **Definition:** A scheduled court event for the case
- **Types:** Directions Hearing, Final Hearing
- **Key Attributes:** Date, time, venue, participants, outcome

### Bundle
- **Definition:** A compiled set of documents prepared for a court hearing
- **Key Attributes:** Hearing reference, included documents, generation date, AI summaries (where applicable)

### Adoption Order
- **Definition:** The final court order granting adoption
- **Key Attributes:** Order date, court reference, conditions, contact arrangements
- **Significance:** Permanently transfers parental responsibility; legally severs ties to birth parents (except step-parent cases)

---

## 6. High-Level Lifecycle & State Model

### Case Lifecycle Phases

1. **Pre-Application**
   - Eligibility checking, document gathering (may occur outside system for some adoption types)

2. **Application**
   - Form A58 submission, fee payment, initial document upload
   - Entry: Application received by court
   - Exit: Application accepted and case created

3. **Directions**
   - Case allocated, parties notified, directions issued
   - Compliance tracking for submissions and deadlines
   - Entry: Case created
   - Exit: All directions complied with or hearing scheduled

4. **Consent & Reporting**
   - Cafcass officer assigned, consent witnessed or dispensation sought
   - Agency reports submitted
   - Entry: Directions issued for consent/reports
   - Exit: Consent status determined, reports received

5. **Final Hearing**
   - Bundle generated, hearing conducted, decision made
   - Entry: Final hearing scheduled
   - Exit: Order made or application refused/withdrawn

6. **Post-Order**
   - Order recorded, contact arrangements documented, case archived
   - Entry: Order granted
   - Exit: Case closed and archived

### Terminal States
- **Order Granted:** Adoption order made; case archived
- **Application Refused:** Court refuses to make order; case closed
- **Application Withdrawn:** Applicant withdraws; case closed

### Non-Terminal States
- **On Hold:** Awaiting external input or linked proceedings
- **Adjourned:** Hearing adjourned; awaiting new date

---

## 7. Governing Rules & Invariants

### Statutory Rules
- **10-Week Placement Rule:** An adoption order application cannot be made until the child has lived with the applicants for at least 10 weeks following placement
- **Consent Requirement:** Adoption cannot proceed without consent from all persons with parental responsibility, OR court order dispensing with consent
- **Form A58 Mandatory:** All adoption order applications must be submitted via Form A58

### Business Rules
- **Single Case Record:** Each adoption matter must have exactly one case record in the system
- **Document Completeness:** Application cannot progress to final hearing without all mandatory documents
- **AI Advisory Only:** AI outputs must never automatically trigger legal actions; human review is always required
- **Redaction Enforcement:** Birth family identifying information must be redacted from adopter views

### Audit & Compliance Rules
- **Full Audit Trail:** Every action on a case must be logged with user, timestamp, and action details
- **AI Explainability:** Every AI output must be traceable, inspectable, and include confidence scoring
- **Override Recording:** Any AI recommendation that is overridden must record the human decision and rationale

### Access Rules
- **Need-to-Know:** Users can only access cases where they have a legitimate role
- **Role-Based Views:** Information displayed is filtered based on user role and data sensitivity

---

## 8. Cross-Cutting Concerns

### Multi-Party Behaviour
- Cases involve multiple agencies (HMCTS, Cafcass, LA, voluntary agencies) who must see consistent, appropriate views
- Secure messaging between parties must be logged and auditable
- Handoffs between agencies must not result in data loss or duplication

### Divergence & Convergence
- Different adoption types follow different pathways but converge on common court processes
- System must handle pathway-specific requirements while maintaining unified case management

### Auditability
- Complete history of all case actions, document versions, and AI interactions
- Ability to reconstruct case state at any point in time
- Support for judicial review and appeals

### Transparency
- Users must understand what data the system holds about them
- AI reasoning must be explainable to non-technical users
- Case status and next steps must be clearly communicated to all parties

### Accessibility
- WCAG 2.1 AA compliance required
- Plain English throughout
- Mobile-responsive for field workers and adopters

### Trauma-Informed Design
- Sensitive handling of interactions with adopters and birth parents
- Clear, compassionate language
- Appropriate pacing of information disclosure

### Observability
- System health monitoring
- Performance metrics tracking
- Error detection and alerting

### Resilience
- Graceful degradation if AI services unavailable
- Data integrity protection
- Recovery procedures documented

---

## 9. Non-Functional Expectations (System-Level)

### Performance
- Case creation: < 2 seconds
- Document upload: < 10 seconds per file
- AI document summary: available within 60 seconds
- System must remain responsive under normal multi-agency concurrent access

### Availability
- 99% uptime excluding planned maintenance
- Resilient to individual component failure
- Planned maintenance windows communicated in advance

### Security
- Ministry of Justice Security Standards compliance
- Data encryption at rest and in transit
- No sensitive data exposure to external or non-permitted AI models
- Anonymisation where possible for AI processing

### Scalability
- Support national caseload across England & Wales
- Handle peak periods (e.g., post-holiday application surges)
- Variable concurrent access from multiple agencies

### Usability
- Plain English, avoiding legal jargon where possible
- Guided journeys reduce user error
- Mobile-responsive for social workers in the field

---

## 10. Known Gaps, Risks & Open Questions

### Open Questions
1. **LA Integration Approach:** What API standards do Local Authority systems support? What is the fallback for systems without API access?
2. **Cafcass System Integration:** What is the current state of Cafcass digital capabilities and integration readiness?
3. **AI Model Selection:** Which AI models will be used for document intelligence and summarisation? How will they be validated for this sensitive domain?
4. **Consent Dispensation Workflow:** What is the detailed workflow when birth parent consent must be dispensed with? How does this interact with linked care proceedings?
5. **Legacy Data Migration:** Will historical cases be migrated? If so, what data quality and format issues exist?
6. **Intercountry Adoption Complexity:** The file for digital tool mapping appears truncated - need full requirements for Hague Convention compliance tracking

### Identified Risks
1. **Data Sensitivity:** High safeguarding risk requires careful access control and audit; any breach would have severe consequences
2. **Multi-Agency Misalignment:** Different agencies have different systems, processes, and priorities; coordination is challenging
3. **Legacy System Integration:** LA systems vary widely; some may not support modern integration patterns
4. **Judicial AI Acceptance:** Judges may be sceptical of AI-generated summaries; trust must be built gradually
5. **Cultural Resistance:** Staff accustomed to paper processes may resist digital change

### Design Gaps Requiring Resolution
1. **Post-Adoption Contact:** How are ongoing contact arrangements tracked and managed after case closure?
2. **Appeals Process:** How are appeals against adoption orders handled in the system?
3. **Linked Proceedings:** How does the system handle cases linked to ongoing care proceedings or other family matters?
4. **Agency-Specific Workflows:** The business context describes digital tools per adoption type but does not fully specify which agency owns which workflow steps

---

## 12. Technical Architecture

### 12.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React.js with GOV.UK Design System | Modern component-based UI aligned with government standards; `govuk-frontend` npm package provides accessible, tested components |
| **Backend** | Node.js with Express.js | JavaScript full-stack enables code sharing; Express provides lightweight, flexible API framework |
| **Database** | PostgreSQL | Robust relational database suitable for complex case data, audit trails, and transactional integrity |
| **API Style** | REST | Well-understood, stateless architecture suitable for multi-agency integration |

### 12.2 Project Structure (Monorepo)

```
/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API client functions
│   │   └── styles/         # GOV.UK overrides and custom styles
│   └── public/
├── server/                 # Express backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic controllers
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # External service integrations
│   │   └── utils/          # Helper functions
│   └── migrations/         # Database migrations
├── shared/                 # Shared code between client and server
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Shared constants
│   └── utils/              # Shared utility functions
└── docker/                 # Docker configuration files
```

**State Management:**
- **Server State:** React Query for data fetching, caching, and synchronisation
- **UI State:** React Context for application-level UI state (user preferences, navigation)

### 12.3 Environment Configuration

| Environment | Purpose | Database | AI Integration |
|-------------|---------|----------|----------------|
| **Development** | Local development | Local PostgreSQL (Docker) | Anthropic API (dev key) |
| **Test** | Automated testing | Test PostgreSQL instance | Mocked AI responses |
| **Production** | Live service | Azure Database for PostgreSQL | Anthropic API (prod key) |

**Environment Variables:**
```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# API Keys
ANTHROPIC_API_KEY=sk-...

# Authentication
AUTH_MODE=mock|govuk-one-login
GOVUK_ONE_LOGIN_CLIENT_ID=...
GOVUK_ONE_LOGIN_CLIENT_SECRET=...

# Feature Flags
FEATURE_AI_SUMMARISATION=true|false
FEATURE_AI_RISK_FLAGGING=true|false

# Application
NODE_ENV=development|test|production
PORT=3000
```

**Secrets Management:** Environment variables for local development; Azure Key Vault for production secrets.

### 12.4 Authentication Strategy

**Phase 1 (MVP):** Mock authentication for development and internal testing.
- Simple username/role selection for testing different user journeys
- No real credential validation
- Role-based access control enforced at API level

**Phase 2 (Production):** Gov.UK One Login integration.
- OAuth 2.0 / OpenID Connect flow
- Identity verification levels appropriate to user role
- Session management with secure, httpOnly cookies
- Designed to support multiple identity providers if required

**Authorisation Model:**
- Role-based access control (RBAC) aligned with Section 4 Actors
- Case-level permissions (users only see cases they are assigned to)
- Document-level redaction based on user role

### 12.5 AI Integration Approach

**Provider:** Anthropic Claude API

**Use Cases:**
| Capability | Description | Human Oversight |
|------------|-------------|-----------------|
| Document Summarisation | Generate summaries of uploaded documents for case bundles | Review before inclusion |
| Risk Flagging | Identify potential safeguarding concerns in submitted documents | Always requires human review |
| Compliance Monitoring | Flag cases approaching statutory deadlines | Advisory notifications only |

**Integration Pattern:**
- Asynchronous processing via job queue
- Results stored with confidence scores and full audit trail
- Feature flags to enable/disable AI features per environment
- Graceful degradation if AI service unavailable

**Safeguards:**
- No sensitive personal data sent to AI without anonymisation
- All AI outputs clearly labelled as machine-generated
- Human override recording for any rejected AI recommendations
- AI never triggers automated legal actions

### 12.6 Data Storage

**Primary Database:** PostgreSQL
- Relational schema for cases, parties, documents, hearings
- Full audit logging via database triggers
- Soft deletes to preserve audit trail

**File Storage:**
| Phase | Storage | Purpose |
|-------|---------|---------|
| **Development** | Local filesystem | Simple setup for development |
| **Production** | Azure Blob Storage | Scalable, secure document storage |

**Document Handling:**
- Documents stored with metadata in database, binary content in file storage
- Version control for all document updates
- Virus scanning on upload
- Encryption at rest

### 12.7 Testing Strategy

| Test Type | Tool | Scope |
|-----------|------|-------|
| **Unit Tests (Backend)** | Jest | Controllers, services, utilities |
| **Unit Tests (Frontend)** | Jest + React Testing Library | Components, hooks, utilities |
| **API Integration Tests** | Jest + Supertest | API endpoints, middleware |
| **Component Tests** | React Testing Library | UI component behaviour |
| **Accessibility Tests** | jest-axe, Pa11y | WCAG 2.1 AA compliance |

**Coverage Targets:**
- Minimum 80% code coverage for business logic
- All API endpoints have integration tests
- All GOV.UK Design System components have accessibility tests

### 12.8 Deployment Pipeline

**Local Development:**
```
docker-compose up    # Starts PostgreSQL, app servers
npm run dev          # Hot-reloading development mode
```

**CI/CD Pipeline:**
1. **Build:** Compile TypeScript, bundle frontend assets
2. **Test:** Run unit tests, integration tests, accessibility checks
3. **Security Scan:** Dependency vulnerability scanning
4. **Deploy to Staging:** Azure App Services (staging slot)
5. **Smoke Tests:** Automated sanity checks
6. **Deploy to Production:** Azure App Services (production slot)

**Target Infrastructure:**
| Component | Service |
|-----------|---------|
| Frontend | Azure App Service (Static Web App) |
| Backend | Azure App Service |
| Database | Azure Database for PostgreSQL |
| File Storage | Azure Blob Storage |
| Secrets | Azure Key Vault |
| Monitoring | Azure Application Insights |

### 12.9 GOV.UK Design System Integration

**Package:** `govuk-frontend` v5.14.0 (npm)

**Implementation Approach:**
- Use GOV.UK Design System components as base
- React wrapper components for GOV.UK patterns
- Typography, spacing, and colour from GOV.UK Frontend
- Progressive enhancement: core functionality works without JavaScript
- **Rebrand enabled:** Uses the 2024 GOV.UK rebrand with blue header and Tudor Crown

**Sass Configuration:**
```scss
// client/src/styles/index.scss
@use 'govuk-frontend' as *;
```

**HTML Configuration:**
```html
<!-- client/index.html -->
<html lang="en" class="govuk-template govuk-template--rebranded">
```

**Asset Requirements:**
- Copy `node_modules/govuk-frontend/dist/govuk/assets/` to `client/public/assets/`
- Includes: fonts (GDS Transport woff/woff2), images (favicon, crown, icons), manifest.json

**Header Component Requirements:**
- Must include Tudor Crown SVG inline (not loaded from CSS)
- Must include GOV.UK logotype SVG with raised dot (`govuk-logo-dot` class)
- SVG viewBox: `0 0 324 60`, dimensions: 162x30

**Key Components:**
- GOV.UK Header with Tudor Crown and blue background (rebrand)
- GOV.UK Footer
- Phase Banner (ALPHA/BETA indicators)
- Skip Link for accessibility
- Form components (text inputs, radios, checkboxes, date inputs)
- Error summary and validation patterns
- Task list pattern for multi-step journeys
- Summary list for case information display
- Notification banners for status updates

**Accessibility Compliance:**
- WCAG 2.1 AA as minimum standard
- Semantic HTML structure
- Keyboard navigation support
- Screen reader testing with NVDA/VoiceOver
- Colour contrast ratios meeting AA standards
- Focus states clearly visible

**Design Principles Alignment:**
- "Start with user needs" - research-driven feature development
- "Do the hard work to make it simple" - hide system complexity from users
- "This is for everyone" - accessibility-first approach
- "Be consistent, not uniform" - GOV.UK patterns adapted to adoption domain

---

## 13. Change Log (System-Level)

| Date | Change | Reason | Approved By |
|------|--------|--------|-------------|
| 2026-02-03 | Initial system specification created | Baseline system design from business context | Pending Review |
| 2026-02-03 | Added Technical Architecture section (Section 12) | Define technology stack, project structure, and implementation approach | Pending Review |
| 2026-02-03 | Updated Section 12.9 with GOV.UK Frontend v5 details | Document rebrand class, asset requirements, and Header SVG requirements after v5 upgrade | Pending Review |
