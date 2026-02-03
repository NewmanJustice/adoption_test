# Understanding - Project Scaffold Feature

## Summary

The Project Scaffold feature establishes the foundational technical infrastructure for the Adoption Digital Platform. This is a developer-facing infrastructure feature that creates the monorepo structure, development environment, and baseline components upon which all future business features will be built.

**Key Point:** This is NOT a business feature. It does not implement adoption case management, user journeys, or domain logic. It creates the technical foundation that enables those features to be built.

---

## Key Behaviours

### 1. Developer Environment Setup
- Repository provides a complete monorepo structure with `/client`, `/server`, `/shared`, and `/docker` directories
- npm workspaces enable coordinated dependency management across packages
- Docker Compose provides local PostgreSQL database
- Development servers start with hot-reload capability
- Environment variables are documented via `.env.example` files
- Missing environment variables cause clear startup failures

### 2. Server Foundation
- Express.js server provides API infrastructure
- Health endpoint (`GET /api/health`) verifies system status
- Health endpoint reports database connectivity status
- Server returns appropriate HTTP responses (JSON format, CORS headers)
- Unknown routes return 404 with JSON error
- Unhandled errors return 500 without exposing sensitive details

### 3. Client Foundation
- React application with GOV.UK Design System integration
- Landing page displays Header, Phase Banner (ALPHA), and Footer
- Page is accessible (keyboard navigable, skip link, semantic HTML)
- No WCAG 2.1 AA violations detected by automated tools

### 4. Database Foundation
- PostgreSQL container starts via Docker Compose
- Migrations infrastructure allows systematic schema changes
- Initial schema includes `audit_log` and `sessions` tables
- Data persists between container restarts
- Connection pooling is configured

### 5. Test Infrastructure
- Jest configured for client, server, and shared packages
- Example tests demonstrate patterns (API, component, accessibility, utility)
- Coverage reporting available
- TypeScript tests compile and run
- Test suite completes within 30 seconds

### 6. Shared Code Infrastructure
- Shared package provides TypeScript types, constants, and utilities
- Both client and server can import from shared package
- TypeScript strict mode enforced across all packages
- Changes to shared code trigger rebuilds in development

---

## Initial Assumptions

### A1: File System Structure Assumption
The test will assume the repository root is the current working directory when tests run. Paths are relative to the repository root.

### A2: Environment Variable Validation Behaviour
When testing for missing environment variables, the application should exit with a non-zero exit code and output a message containing the names of missing variables. The exact format of the message is not prescribed.

### A3: Health Endpoint Response Format
The health endpoint response structure follows the exact JSON format specified in the Feature Spec and Story documentation:
```json
{
  "status": "healthy" | "degraded",
  "timestamp": "<ISO 8601 string>",
  "services": {
    "database": "connected" | "disconnected"
  }
}
```

### A4: GOV.UK Design System Classes
Testing for GOV.UK styling will verify the presence of appropriate CSS class names (e.g., `govuk-header`, `govuk-footer`, `govuk-phase-banner`) rather than visual appearance.

### A5: Database Availability for Tests
Tests that require database connectivity assume the PostgreSQL container is running. Tests should be skipped or marked as pending if the database is unavailable, rather than failing catastrophically.

### A6: Jest as Test Framework
All tests use Jest with appropriate extensions:
- `supertest` for HTTP API testing
- `@testing-library/react` for component testing
- `jest-axe` for accessibility testing

### A7: TypeScript Compilation
Source files are written in TypeScript. Tests verify that the compiled JavaScript (or ts-node/ts-jest execution) works correctly. Type-level tests are out of scope for executable test files.

---

## Ambiguities Identified

### Q1: Hot-reload Verification
**AC-7 (Dev Environment):** "change is detected and the application reloads within 2 seconds"
- **Ambiguity:** How should automated tests verify hot-reload functionality?
- **Proposed Interpretation:** Hot-reload is difficult to test automatically. This will be noted as a manual verification item in the test plan.

### Q2: Database "Disconnected" Scenario
**AC-3 (Server Foundation):** Health endpoint should return "degraded" when database unavailable
- **Ambiguity:** How is this tested? Stop the container? Use an invalid connection string?
- **Proposed Interpretation:** Test by configuring an invalid DATABASE_URL and verifying the health endpoint still responds with degraded status.

### Q3: Docker Startup Timeout (60 seconds)
**AC-9 (Dev Environment):** Services ready within 60 seconds
- **Ambiguity:** Not suitable for unit/integration test suite - requires actual Docker operations
- **Proposed Interpretation:** Document as a manual verification item; automated tests will mock or assume Docker services.

### Q4: "Standard Development Machine" Definition
**AC-14 (Test Infrastructure):** Tests complete within 30 seconds on "standard development machine"
- **Ambiguity:** What constitutes a standard development machine?
- **Proposed Interpretation:** Use 30 seconds as a soft target. Jest can be configured with a timeout, but the actual duration depends on the environment.

### Q5: Phase Banner Feedback Link
**AC-3 (Client Foundation):** "banner includes feedback link text"
- **Ambiguity:** What URL should the feedback link point to? What is the link text?
- **Proposed Interpretation:** Test for presence of a link element with visible text; specific URL is not prescribed.

---

## Constraints

### C1: TDD Approach
Tests are written BEFORE implementation. This means:
- Tests should initially fail (as the implementation does not exist)
- Tests should be clear enough that Codey (the developer) can implement to pass them
- Tests define the contract, not the implementation details

### C2: No Business Logic
This feature must NOT include:
- Authentication implementation (mock only)
- Business domain entities (Case, Party, Document)
- AI integration
- Production deployment configuration

### C3: Accessibility Compliance
All UI components must pass WCAG 2.1 AA automated checks. Manual accessibility testing is out of scope for automated tests.

### C4: Environment Isolation
Tests should not depend on:
- External network access
- Specific port availability (beyond defaults)
- Pre-existing data in the database

---

## Risk Areas

### R1: Integration Test Reliability
Testing real database connectivity and Docker containers can be flaky. Tests should be designed with:
- Appropriate timeouts
- Retry logic where appropriate
- Clear skip conditions when infrastructure is unavailable

### R2: GOV.UK Frontend Changes
GOV.UK Frontend package may update CSS class names or structure. Tests should:
- Use semantic queries where possible (roles, labels)
- Document which version of govuk-frontend is assumed

### R3: Cross-Platform Compatibility
The scaffold must work on macOS, Windows (WSL2), and Linux. Automated tests run in one environment; cross-platform verification is manual.

---

## Stories Covered

| Story | Summary | Key Test Focus |
|-------|---------|----------------|
| Developer Environment Setup | Monorepo structure, npm workspaces, Docker, env vars | Directory structure, package.json validation, env file presence |
| Server Foundation | Express server, health endpoint, error handling | API responses, status codes, JSON format |
| Client Foundation | React app, GOV.UK styling, accessibility | Component rendering, semantic HTML, a11y checks |
| Database Foundation | PostgreSQL, migrations, initial schema | Database connectivity, schema verification |
| Test Infrastructure | Jest config, example tests, coverage | Test execution, coverage generation |
| Shared Code Infrastructure | TypeScript types, utilities, cross-package imports | Package structure, export availability |
