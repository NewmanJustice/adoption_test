# Feature Specification — Project Scaffold

## 1. Feature Intent
**Why this feature exists.**

The Project Scaffold feature establishes the foundational technical infrastructure for the Adoption Digital Platform. Before any business features can be developed, the system requires a consistent, well-structured codebase with appropriate tooling, configuration, and baseline components.

### Problem Being Addressed
- Development cannot begin without a defined project structure and tooling
- Inconsistent setup across environments leads to "works on my machine" problems
- Business features require shared infrastructure (API server, database, frontend framework) to build upon
- Without baseline configuration, each subsequent feature would need to solve infrastructure concerns, creating duplication and inconsistency

### User or System Need
- **Developers** need a consistent, reproducible local development environment
- **The system** needs a monorepo structure that enables code sharing between client and server
- **Quality assurance** needs a test framework established from the start
- **Operations** needs containerised deployment from day one

### How This Supports the System Purpose
This feature directly implements Section 12 (Technical Architecture) of the System Specification, establishing:
- The React/Express/PostgreSQL technology stack
- The monorepo structure with `/client`, `/server`, `/shared` directories
- GOV.UK Design System integration for accessibility compliance
- Docker-based local development mirroring the target Azure deployment

> **Alignment confirmed:** This feature is purely infrastructure-enabling and does not introduce business logic. It creates the foundation upon which all Section 3 (In Scope) capabilities will be built.

---

## 2. Scope

### In Scope
- **Monorepo structure:** `/client`, `/server`, `/shared`, `/docker` directories as per System Spec Section 12.2
- **Package configuration:** Root and workspace `package.json` files with appropriate dependencies
- **Docker configuration:** `docker-compose.yml` for local PostgreSQL and application services
- **Environment setup:** `.env.example` files with documented environment variables per Section 12.3
- **Express server baseline:** Health check endpoint (`GET /api/health`) demonstrating server functionality
- **React application baseline:** GOV.UK-styled landing page demonstrating frontend functionality
- **Database setup:** Initial PostgreSQL schema with migrations infrastructure
- **Test configuration:** Jest setup for both client and server with example tests
- **TypeScript configuration:** Shared type definitions and compiler settings
- **Development tooling:** ESLint, Prettier configuration aligned with GOV.UK standards

### Out of Scope
- **Authentication implementation:** Mock auth is referenced but not implemented (separate feature)
- **Business domain models:** Case, Party, Document entities are not created here
- **AI integration:** Anthropic API integration is not configured here
- **CI/CD pipeline:** Azure deployment pipeline configuration (separate infrastructure feature)
- **Gov.UK One Login integration:** Deferred to authentication feature
- **File storage configuration:** Azure Blob Storage setup deferred
- **Production environment configuration:** This feature focuses on local development only

---

## 3. Actors Involved

### Developer
- **What they can do:** Clone repository, run `docker-compose up` and `npm run dev` to start local environment, run tests, make code changes with hot-reloading
- **What they cannot do:** Deploy to any environment (no CI/CD in this feature)

### Technical Lead / Architect
- **What they can do:** Review project structure for alignment with System Spec Section 12, verify GOV.UK Design System integration, confirm test coverage infrastructure
- **What they cannot do:** N/A - oversight role only

> **Note:** End users (HMCTS Case Officers, Judges, Social Workers, etc.) do not interact with this feature. It is purely developer-facing infrastructure.

---

## 4. Behaviour Overview

### Happy-Path Behaviour
1. **Developer clones repository** and finds a complete monorepo structure
2. **Developer runs `docker-compose up`** which starts:
   - PostgreSQL database container with initial schema
   - Express server on port 3001 (or configured PORT)
   - React development server on port 3000
3. **Developer visits `http://localhost:3000`** and sees a GOV.UK-styled landing page with:
   - GOV.UK Header with service name "Adoption Digital Platform"
   - Phase banner indicating ALPHA status
   - Simple welcome content
   - GOV.UK Footer
4. **Developer visits `http://localhost:3001/api/health`** and receives:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-02-03T10:00:00.000Z",
     "services": {
       "database": "connected"
     }
   }
   ```
5. **Developer runs `npm test`** and sees passing test suites for:
   - Server health endpoint test
   - Client component rendering test
   - Shared utility function test

### Key Alternatives or Branches
- **Database unavailable:** Health endpoint returns `"database": "disconnected"` with overall status `"degraded"`
- **Missing environment variables:** Application fails to start with clear error message listing required variables
- **Port conflicts:** Docker compose uses configurable ports with sensible defaults

### User-Visible Outcomes
- A working local development environment
- Confidence that the technical stack is correctly configured
- A foundation for building business features

---

## 5. State & Lifecycle Interactions

This feature does not interact with the Case lifecycle defined in System Spec Section 6.

### Infrastructure State
- **State created:** "Development environment ready"
- **State created:** "Database schema initialised"
- **State created:** "Test framework operational"

This feature is **state-creating** for the development infrastructure, but does not create, transition, or constrain any business domain states.

### Database Schema State
The initial schema should include:
- Migrations table (for tracking applied migrations)
- Audit log table (foundation for Section 7 audit requirements)
- Session table (foundation for authentication feature)

No business entity tables are created in this feature.

---

## 6. Rules & Decision Logic

### R1: Environment Variable Validation
- **Description:** Application must not start if required environment variables are missing
- **Inputs:** Environment variables at startup
- **Outputs:** Application starts, OR clear error message listing missing variables
- **Deterministic:** Yes

### R2: Health Check Database Probe
- **Description:** Health endpoint must verify database connectivity
- **Inputs:** Database connection attempt
- **Outputs:** "connected" | "disconnected" status
- **Deterministic:** Yes

### R3: GOV.UK Design System Compliance
- **Description:** All UI components must use GOV.UK Design System patterns
- **Inputs:** React component implementation
- **Outputs:** Accessible, GOV.UK-styled interface
- **Deterministic:** Yes (via component library)

### R4: Test Coverage Baseline
- **Description:** Test framework must be configured with coverage reporting
- **Inputs:** Test execution
- **Outputs:** Coverage report (no minimum threshold enforced in scaffold)
- **Deterministic:** Yes

---

## 7. Dependencies

### System Components
- None (this is the foundational feature)

### External Systems
| Dependency | Purpose | Fallback |
|------------|---------|----------|
| **npm registry** | Package installation | Cached packages |
| **Docker Hub** | PostgreSQL image | Pre-pulled images |
| **GOV.UK Frontend npm package** | Design system components | Bundled with project |

### Technical Dependencies
| Package | Version Constraint | Purpose |
|---------|-------------------|---------|
| `react` | ^18.x | Frontend framework |
| `express` | ^4.x | Backend framework |
| `pg` | ^8.x | PostgreSQL client |
| `govuk-frontend` | ^5.x | GOV.UK Design System |
| `typescript` | ^5.x | Type safety |
| `jest` | ^29.x | Test framework |
| `@testing-library/react` | ^14.x | React component testing |

### Policy or Legislative Dependencies
- **WCAG 2.1 AA:** GOV.UK Design System provides compliance baseline
- **GDS Service Standard:** Project structure follows government digital standards

### Operational Dependencies
- Docker installed on developer machine
- Node.js LTS version (20.x) available
- Port 3000, 3001, 5432 available (or configurable alternatives)

---

## 8. Non-Functional Considerations

### Performance Sensitivity
- Local development hot-reload should respond within 2 seconds
- Docker compose startup should complete within 60 seconds
- Test suite should execute within 30 seconds

### Audit/Logging Needs
- Establish logging infrastructure (but no business audit events in this feature)
- Console logging for development, structured JSON logging available

### Error Tolerance
- Missing database should not crash server (degraded mode acceptable)
- Clear error messages for misconfiguration

### Security Implications
- `.env` files must be in `.gitignore`
- No secrets committed to repository
- `.env.example` contains only placeholder values
- Database container should not expose ports externally in production-like mode

### Accessibility Foundation
- GOV.UK Design System integration ensures WCAG 2.1 AA baseline
- jest-axe configured for automated accessibility testing
- Semantic HTML structure enforced

---

## 9. Assumptions & Open Questions

### Assumptions
1. **A1:** Developers have Docker Desktop (or equivalent) installed locally
2. **A2:** Node.js LTS (v20.x) is the target runtime
3. **A3:** npm is the package manager (not yarn or pnpm)
4. **A4:** PostgreSQL 15.x is acceptable for local development
5. **A5:** TypeScript strict mode is desired from the start
6. **A6:** Monorepo approach does not require separate versioning (no lerna/nx initially)

### Open Questions
1. **Q1:** Should we use npm workspaces or a monorepo tool like Turborepo?
   - *Recommendation:* npm workspaces for simplicity; can evolve later
2. **Q2:** What Node.js version should be enforced?
   - *Recommendation:* Node 20 LTS with `.nvmrc` file
3. **Q3:** Should we include Storybook for component development?
   - *Recommendation:* Defer to a separate developer-tooling feature
4. **Q4:** Is hot module replacement (HMR) required for the server?
   - *Recommendation:* Yes, using nodemon or tsx --watch

### Areas Needing Confirmation
- Confirmation that Docker-based development is acceptable for all team members
- Confirmation of TypeScript strict mode preference
- Confirmation that Jest (not Vitest or other) is the preferred test framework

---

## 10. Impact on System Specification

### Alignment Assessment
This feature **reinforces existing system assumptions** from Section 12:
- Technology stack exactly as specified (React, Express, PostgreSQL)
- Project structure matches Section 12.2 diagram
- Environment configuration matches Section 12.3 patterns
- Testing strategy aligns with Section 12.7

### No Contradictions Identified
This feature is a direct implementation of the Technical Architecture section. No tensions or contradictions exist.

### Potential System Spec Refinements
The following details are implemented here but could be added to Section 12 for completeness:
- Specific Node.js version requirement (20 LTS)
- npm workspaces configuration approach
- Hot-reload tooling selection
- Logging framework selection

> **Recommendation:** After this feature is implemented, Alex may propose a minor system spec update to Section 12 documenting these implementation decisions.

---

## 11. Handover to BA (Cass)

### Story Themes
Cass should derive stories around the following themes:

1. **Developer Environment Setup**
   - Stories covering repository clone, dependency installation, environment start
   - Acceptance: developer can run the application locally within 10 minutes

2. **Server Foundation**
   - Stories covering Express server, health endpoint, database connectivity
   - Acceptance: health check returns appropriate status

3. **Client Foundation**
   - Stories covering React app, GOV.UK integration, baseline page
   - Acceptance: accessible landing page renders correctly

4. **Database Foundation**
   - Stories covering PostgreSQL setup, migrations infrastructure, initial schema
   - Acceptance: migrations can be run and rolled back

5. **Test Infrastructure**
   - Stories covering Jest configuration, example tests, coverage reporting
   - Acceptance: test suite runs and produces coverage report

6. **Shared Code Infrastructure**
   - Stories covering TypeScript types, shared utilities, workspace configuration
   - Acceptance: types are shared between client and server

### Expected Story Boundaries
- Each story should be independently deployable/demonstrable
- Stories should not include business domain logic
- Stories should not include authentication (separate feature)
- Stories should focus on "can a developer work effectively?" outcomes

### Areas Needing Careful Story Framing
- **GOV.UK Design System integration:** Must demonstrate accessibility compliance without over-engineering the baseline page
- **Database schema:** Must establish patterns (migrations, audit tables) without creating business entities
- **Docker configuration:** Must work cross-platform (macOS, Windows WSL2, Linux)

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-03 | Initial feature specification created | Establish technical foundation before business features | Alex |
