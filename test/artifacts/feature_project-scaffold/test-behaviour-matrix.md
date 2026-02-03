# Test Behaviour Matrix - Project Scaffold Feature

## Story 1: Developer Environment Setup

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | Repository structure is correct | T-ENV-1 | Verify /client, /server, /shared, /docker exist |
| AC-2 | npm workspaces configured | T-ENV-2 | Check package.json workspaces array |
| AC-3 | Dependencies install successfully | - | Manual verification; npm install |
| AC-4 | Environment variables documented | T-ENV-3 | Verify .env.example files exist |
| AC-5 | Docker Compose starts services | - | Manual verification |
| AC-6 | Application starts in dev mode | - | Manual verification |
| AC-7 | Hot-reload is functional | - | Manual verification |
| AC-8 | Missing env vars cause clear errors | T-SRV-5* | Tested via server startup |
| AC-9 | Docker startup within 60 seconds | - | Manual verification |
| AC-10 | Node.js version enforced | T-ENV-4, T-ENV-5 | Check .nvmrc and engines |

## Story 2: Server Foundation

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | Server starts successfully | T-SRV-1 | Implicit in health endpoint test |
| AC-2 | Health endpoint returns healthy | T-SRV-1, T-SRV-2 | 200 OK with correct body |
| AC-3 | Health reports degraded when DB down | T-SRV-3 | Test with invalid DB config |
| AC-4 | Server directory structure | T-SRV-4 | Verify subdirectories |
| AC-5 | Env vars validated on startup | - | Tested indirectly |
| AC-6 | JSON responses properly formatted | T-SRV-6 | Check Content-Type header |
| AC-7 | CORS configured for development | T-SRV-7 | Check CORS headers |
| AC-8 | Unknown routes return 404 | T-SRV-5 | Test /api/nonexistent |
| AC-9 | Server errors return safe 500 | T-SRV-8 | Test error handling |
| AC-10 | Request logging enabled | - | Manual verification |

## Story 3: Client Foundation

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | Client starts successfully | T-CLI-1 | Implicit in render test |
| AC-2 | Landing page has GOV.UK Header | T-CLI-2 | Check for header element |
| AC-3 | Phase Banner shows ALPHA | T-CLI-3 | Check banner content |
| AC-4 | Landing page has GOV.UK Footer | T-CLI-4 | Check for footer element |
| AC-5 | Welcome content present | T-CLI-5 | Check h1 heading |
| AC-6 | Correct document title | T-CLI-9 | Check page title |
| AC-7 | Client directory structure | T-CLI-10 | Verify subdirectories |
| AC-8 | GOV.UK styles applied | T-CLI-2, T-CLI-4 | Check CSS classes |
| AC-9 | Keyboard navigable | - | Manual verification |
| AC-10 | Skip link present | T-CLI-6 | Check skip link element |
| AC-11 | Semantic HTML structure | T-CLI-7 | Check header/main/footer |
| AC-12 | No accessibility violations | T-CLI-8 | jest-axe test |

## Story 4: Database Foundation

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | PostgreSQL container starts | - | Manual verification |
| AC-2 | Database connection established | T-DB-1 | Via health endpoint |
| AC-3 | Migrations infrastructure configured | T-DB-4 | Check migrations dir |
| AC-4 | Migration commands available | T-DB-5 | Check npm scripts |
| AC-5 | Migrations run successfully | - | Manual verification |
| AC-6 | Migrations can be rolled back | - | Manual verification |
| AC-7 | Migrations table tracks applied | - | Manual verification |
| AC-8 | audit_log table created | T-DB-2 | Query for table |
| AC-9 | sessions table created | T-DB-3 | Query for table |
| AC-10 | Data persists between restarts | - | Manual verification |
| AC-11 | Fresh database setup works | - | Manual verification |
| AC-12 | Connection pooling configured | - | Code review |

## Story 5: Test Infrastructure

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | Test command runs all tests | T-TST-2 | Check test script |
| AC-2 | Server tests run independently | - | Verify by execution |
| AC-3 | Client tests run independently | - | Verify by execution |
| AC-4 | Shared tests run independently | - | Verify by execution |
| AC-5 | Example server test exists | - | Code review |
| AC-6 | Example client test exists | - | Code review |
| AC-7 | Example accessibility test exists | - | Code review |
| AC-8 | Example shared test exists | - | Code review |
| AC-9 | Coverage report generated | T-TST-3 | Check coverage script |
| AC-10 | Coverage includes all packages | - | Verify by execution |
| AC-11 | Watch mode available | T-TST-4 | Check watch script |
| AC-12 | TypeScript tests supported | T-TST-5 | Check jest config |
| AC-13 | Test config files present | T-TST-1 | Check for jest.config |
| AC-14 | Tests complete within 30s | - | Verify by execution |

## Story 6: Shared Code Infrastructure

| AC | Acceptance Criterion | Test IDs | Notes |
|----|---------------------|----------|-------|
| AC-1 | Shared in workspaces config | T-SHR-1 | Check package.json |
| AC-2 | Shared directory structure | T-SHR-2 | Verify subdirs |
| AC-3 | Shared has TypeScript config | T-SHR-4 | Check tsconfig.json |
| AC-4 | Shared has package.json | T-SHR-3 | Check file exists |
| AC-5 | Example shared types defined | T-SHR-5 | Check exports |
| AC-6 | Example constants defined | T-SHR-6 | Check exports |
| AC-7 | Example utility defined | T-SHR-7 | Check exports |
| AC-8 | Server can import shared | - | Code review |
| AC-9 | Client can import shared | - | Code review |
| AC-10 | Type safety works | - | TypeScript compilation |
| AC-11 | Changes trigger rebuild | - | Manual verification |
| AC-12 | TypeScript strict mode enabled | - | Check tsconfig files |

---

## Traceability Summary

| Story | Total ACs | Automated Tests | Manual Only | Coverage |
|-------|-----------|-----------------|-------------|----------|
| Dev Environment | 10 | 5 | 5 | 50% |
| Server Foundation | 10 | 7 | 3 | 70% |
| Client Foundation | 12 | 9 | 3 | 75% |
| Database Foundation | 12 | 4 | 8 | 33% |
| Test Infrastructure | 14 | 5 | 9 | 36% |
| Shared Code | 12 | 7 | 5 | 58% |
| **Total** | **70** | **37** | **33** | **53%** |

Note: Lower automated coverage for Database and Test Infrastructure stories is expected as many criteria require runtime execution or manual verification of infrastructure behaviour.
