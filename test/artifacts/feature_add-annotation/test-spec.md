# Test Specification: add-annotation (Prototype Annotator Integration)

## Understanding
This feature integrates the `prototype-annotator` npm package into the Express server.
Tests verify correct integration: middleware mounting, route responses, environment restriction, and Vite proxy config.
We test the integration contract, NOT the package's internal functionality.
Scope: HTTP requests, config file validation, environment-conditional behaviour.
Manual verification required for: GOV.UK styling compatibility, visual rendering.

## AC to Test ID Mapping

### Story: Express Middleware Integration
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-EMI-1 | Middleware mounted at basePath |
| AC-2 | T-EMI-2 | SQLite database created (skip - file system, verified by AC-1) |
| AC-3 | T-EMI-3 | Overlay script injection (response contains annotator script) |
| AC-4 | T-EMI-4 | Dashboard accessible at basePath/dashboard |
| AC-5 | T-EMI-5 | Existing routes unaffected |

### Story: Vite Proxy Configuration
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-VPC-1 | Annotator routes in proxy config |
| AC-2 | T-VPC-2 | Dashboard path in proxy config |
| AC-3 | T-VPC-3 | Client assets proxied (covered by AC-1) |
| AC-4 | T-VPC-4 | Existing /api proxy preserved |
| AC-5 | T-VPC-5 | WebSocket enabled in proxy config |

### Story: Development Environment Restriction
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-DER-1 | Middleware active when NODE_ENV=development |
| AC-2 | T-DER-2 | Routes return 404 when NODE_ENV=production |
| AC-3 | T-DER-3 | Routes return 404 when NODE_ENV=test |
| AC-4 | T-DER-4 | No script injection in non-development |
| AC-5 | T-DER-5 | Bundle optimization (manual - build verification) |

### Story: Gitignore SQLite Database
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-GIT-1 | Database file pattern in .gitignore |
| AC-2 | T-GIT-2 | Directory pattern in .gitignore |
| AC-3 | T-GIT-3 | Comment explaining exclusion |
| AC-4 | T-GIT-4 | Existing files untracked (manual git verification) |

### Story: GOV.UK Frontend Compatibility
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-GOV-1 | Manual: Styling preserved |
| AC-2 | T-GOV-2 | Manual: Components annotatable |
| AC-3 | T-GOV-3 | Manual: Focus states work |
| AC-4 | T-GOV-4 | Manual: Sidebar positioning |
| AC-5 | T-GOV-5 | Manual: Accessibility standards |

## Key Assumptions
- `prototype-annotator` package exposes Express middleware via named export
- Default basePath is `/__prototype-annotator`
- Middleware conditionally mounted based on NODE_ENV check in app.ts
- Vite config uses standard proxy configuration format
- SQLite database location: `./prototype-annotator/annotator.sqlite`

## Test Approach
- HTTP integration tests using supertest for Express routes
- Static config analysis for Vite proxy and .gitignore
- Environment variable manipulation for NODE_ENV tests
- GOV.UK compatibility tests marked as manual (visual verification)

## Traceability Summary
| Story | Total ACs | Automated | Manual | Skipped |
|-------|-----------|-----------|--------|---------|
| Express Middleware | 5 | 4 | 0 | 1 |
| Vite Proxy | 5 | 4 | 0 | 1 |
| Dev Restriction | 5 | 4 | 0 | 1 |
| Gitignore | 4 | 3 | 0 | 1 |
| GOV.UK Compat | 5 | 0 | 5 | 0 |
| **Total** | **24** | **15** | **5** | **4** |
