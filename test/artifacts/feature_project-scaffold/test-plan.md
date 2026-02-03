# Test Plan - Project Scaffold Feature

## 1. Scope and Objectives

### Purpose
Verify that the Project Scaffold feature provides a fully functional development environment for the Adoption Digital Platform. This includes verifying project structure, server and client foundation, database connectivity, test infrastructure, and shared code capabilities.

### Objectives
1. Confirm monorepo structure matches specification
2. Verify server health endpoint functions correctly
3. Verify client renders accessible GOV.UK-styled landing page
4. Verify database connectivity and migrations infrastructure
5. Verify test framework is correctly configured
6. Verify shared code is importable across packages

### Test Approach
- **TDD (Test-Driven Development):** Tests are written before implementation
- **Behaviour-focused:** Tests verify observable behaviour, not implementation details
- **Contract-driven:** Tests define the contract for the developer (Codey) to implement against

---

## 2. In Scope

### Automated Tests
| Area | What Will Be Tested |
|------|---------------------|
| **Project Structure** | Directory existence, package.json configuration, env file presence |
| **Server API** | Health endpoint responses, error handling, JSON formatting |
| **Client Rendering** | Component rendering, GOV.UK elements, accessibility |
| **Database** | Connection verification via health endpoint, schema tables existence |
| **Test Framework** | Test execution, coverage generation capability |
| **Shared Package** | Export availability, type definitions presence |

### Manual Verification Items
These items are documented but not automated:
- Hot-reload functionality (AC-7, Dev Environment)
- Docker Compose startup time < 60 seconds (AC-9, Dev Environment)
- Cross-platform compatibility (macOS, Windows WSL2, Linux)
- Full keyboard navigation user experience

---

## 3. Out of Scope

| Item | Reason |
|------|--------|
| Authentication | Separate feature |
| Business domain entities | Not part of scaffold |
| AI integration | Separate feature |
| CI/CD pipeline | Separate infrastructure feature |
| Production configuration | Scaffold is dev-only |
| Visual regression testing | Not in scaffold scope |
| End-to-end browser tests | Not in scaffold scope |
| Performance benchmarks | Beyond scaffold scope |

---

## 4. Test Types

### 4.1 Structure Tests (Unit-level)
- Verify file system structure
- Verify package.json configuration
- Verify TypeScript configuration
- Verify presence of required files

### 4.2 API Integration Tests
- HTTP tests against Express server endpoints
- Uses `supertest` for HTTP assertions
- Requires server to be running or app instance exported

### 4.3 Component Tests
- React component rendering tests
- Uses `@testing-library/react`
- DOM assertions for GOV.UK elements

### 4.4 Accessibility Tests
- Automated WCAG 2.1 AA checks
- Uses `jest-axe`
- Tests rendered component output

### 4.5 Database Tests
- Verify connection through health endpoint
- Verify schema tables exist (when DB available)
- Conditional execution based on DB availability

---

## 5. Test Environment Requirements

### Prerequisites for Test Execution
| Requirement | Notes |
|-------------|-------|
| Node.js 20 LTS | As specified in .nvmrc |
| npm | Package manager |
| Docker (optional) | For database tests requiring real PostgreSQL |
| Jest | Test runner |

### Environment Variables for Tests
```
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/adoption_test
PORT=3001
```

### Test Database
- Tests requiring database should work with or skip gracefully without database
- Integration tests may use a test database container

---

## 6. Test Categories by Story

### Story 1: Developer Environment Setup
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-ENV-1 | Directory structure exists | Structure | High |
| T-ENV-2 | npm workspaces configured | Structure | High |
| T-ENV-3 | .env.example files exist | Structure | High |
| T-ENV-4 | .nvmrc specifies Node 20 | Structure | Medium |
| T-ENV-5 | engines field in package.json | Structure | Medium |
| T-ENV-6 | npm scripts available | Structure | High |

### Story 2: Server Foundation
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-SRV-1 | Health endpoint returns 200 | API | High |
| T-SRV-2 | Health response has correct structure | API | High |
| T-SRV-3 | Health shows degraded when DB down | API | High |
| T-SRV-4 | Server directory structure | Structure | Medium |
| T-SRV-5 | Unknown routes return 404 | API | High |
| T-SRV-6 | Response is JSON format | API | High |
| T-SRV-7 | CORS headers present | API | Medium |
| T-SRV-8 | 500 returns safe error message | API | High |

### Story 3: Client Foundation
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-CLI-1 | Landing page renders | Component | High |
| T-CLI-2 | GOV.UK Header present | Component | High |
| T-CLI-3 | Phase banner shows ALPHA | Component | High |
| T-CLI-4 | GOV.UK Footer present | Component | High |
| T-CLI-5 | Welcome heading present | Component | High |
| T-CLI-6 | Skip link present | Component | High |
| T-CLI-7 | Semantic HTML structure | Component | Medium |
| T-CLI-8 | No accessibility violations | Accessibility | High |
| T-CLI-9 | Document title correct | Component | Medium |
| T-CLI-10 | Client directory structure | Structure | Medium |

### Story 4: Database Foundation
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-DB-1 | Database connection works | Integration | High |
| T-DB-2 | audit_log table exists | Integration | High |
| T-DB-3 | sessions table exists | Integration | High |
| T-DB-4 | Migrations directory exists | Structure | High |
| T-DB-5 | Migration scripts available | Structure | Medium |

### Story 5: Test Infrastructure
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-TST-1 | Jest is configured | Structure | High |
| T-TST-2 | Test scripts available | Structure | High |
| T-TST-3 | Coverage script available | Structure | Medium |
| T-TST-4 | Watch script available | Structure | Medium |
| T-TST-5 | TypeScript tests supported | Structure | Medium |

### Story 6: Shared Code Infrastructure
| Test ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-SHR-1 | Shared in workspaces config | Structure | High |
| T-SHR-2 | Shared directory structure | Structure | High |
| T-SHR-3 | Shared package.json exists | Structure | High |
| T-SHR-4 | Shared tsconfig.json exists | Structure | Medium |
| T-SHR-5 | Example types exported | Structure | High |
| T-SHR-6 | Example constants exported | Structure | Medium |
| T-SHR-7 | Example utility exported | Structure | Medium |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Database unavailable during tests | Tests fail | Medium | Skip DB tests gracefully; use mocks |
| Port conflicts | Server tests fail | Low | Use dynamic ports; document requirements |
| GOV.UK Frontend version changes | Component tests break | Low | Pin version; document dependency |
| Hot-reload not testable | Gap in coverage | High | Document as manual verification |
| Cross-platform differences | Tests pass locally, fail elsewhere | Medium | Use CI with multiple platforms |

---

## 8. Assumptions

1. Tests run from repository root directory
2. npm install has been run before tests
3. Jest is the test runner as specified
4. For integration tests, Docker services may or may not be running
5. TypeScript compilation is handled by ts-jest or pre-compilation
6. The scaffold does not enforce minimum coverage thresholds
7. Tests are designed to fail initially (TDD) and pass after implementation

---

## 9. Test Execution Strategy

### Phase 1: Structure Tests (No dependencies)
Run tests that verify file system structure. These require no running services.

### Phase 2: Unit Tests (Minimal dependencies)
Run tests that verify configuration and exports. May require npm install.

### Phase 3: Component Tests (React environment)
Run tests that render React components. Requires jsdom environment.

### Phase 4: API Tests (Server required)
Run tests against server endpoints. Requires server to be running or app export.

### Phase 5: Database Tests (Optional)
Run tests requiring database. Skip if database unavailable.

---

## 10. Exit Criteria

### Minimum for Feature Completion
- All High priority tests pass
- No accessibility violations in component tests
- Health endpoint returns correct structure
- Project structure matches specification

### Ideal State
- All tests pass
- Coverage report generates successfully
- All manual verification items confirmed

---

## 11. Test Deliverables

| Deliverable | Location |
|-------------|----------|
| Test Plan | `test/artifacts/feature_project-scaffold/test-plan.md` |
| Understanding Document | `test/artifacts/feature_project-scaffold/understanding.md` |
| Behaviour Matrix | `test/artifacts/feature_project-scaffold/test-behaviour-matrix.md` |
| Implementation Guide | `test/artifacts/feature_project-scaffold/implementation-guide.md` |
| Executable Tests | `test/feature_project-scaffold.test.js` |
