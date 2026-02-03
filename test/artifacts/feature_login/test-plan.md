# Test Plan - Mock Authentication (Login) Feature

## 1. Scope and Objectives

### 1.1 In Scope

- Session management API endpoints
- Authentication middleware behaviour
- Login API endpoint validation and response
- Logout API endpoint behaviour
- Role-based access control at API level
- Protected route redirects (API-level 401/403)
- Mock auth indicator presence (API flag)

### 1.2 Out of Scope

- Frontend UI component rendering
- Browser-specific behaviour (caching, back button)
- Gov.UK One Login integration (Phase 2)
- Production environment configuration
- Case-level permissions
- Document-level redaction
- Rate limiting and CORS
- Accessibility compliance (requires browser testing)

---

## 2. Test Types

### 2.1 Unit Tests
- Session data structure validation
- Role validation function
- Return URL sanitisation function

### 2.2 API Integration Tests (Primary Focus)
- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/logout` - Logout endpoint
- `GET /api/session` - Session retrieval endpoint (if implemented)
- Protected endpoint access with/without valid session
- Role-based endpoint access control

### 2.3 Middleware Tests
- Authentication middleware behaviour
- Role requirement enforcement
- Public endpoint bypass
- Session activity refresh

---

## 3. Test Environment

### 3.1 Prerequisites
- Node.js with Express.js server
- Jest test runner
- Supertest for HTTP assertions
- supertest-session for session persistence across requests

### 3.2 Environment Variables
```
AUTH_MODE=mock
NODE_ENV=test
SESSION_TIMEOUT=1800000 (30 minutes in ms)
```

### 3.3 Test Data

**Valid Roles:**
- `HMCTS_CASE_OFFICER`
- `JUDGE_LEGAL_ADVISER`
- `CAFCASS_OFFICER`
- `LA_SOCIAL_WORKER`
- `VAA_WORKER`
- `ADOPTER`

**Test Users:**
- `test-user` - Generic test username
- `alice@example.com` - Email-format username
- `developer123` - Alphanumeric username

---

## 4. Test Categories

### 4.1 Session Management (Story 1)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-SM-1 | Session creation with valid data | Integration | High |
| T-SM-2 | Session retrieval with valid identifier | Integration | High |
| T-SM-3 | Session destruction | Integration | High |
| T-SM-4 | Session data structure validation | Unit | Medium |
| T-SM-5 | Invalid role rejection | Integration | High |
| T-SM-6 | Session timeout configuration | Unit | Medium |
| T-SM-7 | Secure cookie settings | Integration | Medium |

### 4.2 API Authentication Middleware (Story 2)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-AM-1 | Unauthenticated request returns 401 | Integration | High |
| T-AM-2 | Authenticated request proceeds | Integration | High |
| T-AM-3 | Insufficient role returns 403 | Integration | High |
| T-AM-4 | Session data attached to request | Integration | High |
| T-AM-5 | Session activity timestamp updated | Integration | Medium |
| T-AM-6 | Public endpoint bypass | Integration | High |
| T-AM-7 | Login/logout routes exempt | Integration | High |
| T-AM-8 | Wildcard role access | Integration | Medium |

### 4.3 Mock Login Form API (Story 3)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-LF-1 | Successful login with valid data | Integration | High |
| T-LF-2 | Login fails with empty username | Integration | High |
| T-LF-3 | Login fails with missing username | Integration | High |
| T-LF-4 | Login fails with invalid role | Integration | High |
| T-LF-5 | Login fails with missing role | Integration | High |
| T-LF-6 | Login returns correct redirect URL | Integration | High |
| T-LF-7 | Adopter role redirects to /my-cases | Integration | High |
| T-LF-8 | Session created on successful login | Integration | High |
| T-LF-9 | All six roles accepted | Integration | Medium |

### 4.4 Protected Route Handling (Story 4)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-PR-1 | Unauthenticated access returns 401 | Integration | High |
| T-PR-2 | Return URL preserved in 401 response | Integration | Medium |
| T-PR-3 | Return URL sanitisation - relative paths | Unit | High |
| T-PR-4 | Return URL sanitisation - absolute URLs rejected | Unit | High |
| T-PR-5 | Return URL sanitisation - external URLs rejected | Unit | High |
| T-PR-6 | Authenticated access succeeds | Integration | High |
| T-PR-7 | API 403 for insufficient permissions | Integration | High |

### 4.5 Logout Flow (Story 5)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-LO-1 | Successful logout with active session | Integration | High |
| T-LO-2 | Logout clears session | Integration | High |
| T-LO-3 | Logout without session is idempotent | Integration | High |
| T-LO-4 | Post-logout protected access returns 401 | Integration | High |
| T-LO-5 | Session cookie cleared on logout | Integration | Medium |

### 4.6 Mock Auth Visual Indicator (Story 6)
| ID | Test Name | Type | Priority |
|----|-----------|------|----------|
| T-VI-1 | Auth mode flag returned in session/config | Integration | Medium |
| T-VI-2 | Session includes user and role info | Integration | Medium |

---

## 5. Risks and Mitigation

### 5.1 Identified Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session store implementation varies | Tests may be implementation-specific | Test behaviour, not implementation |
| Timing-dependent tests (timeout) | Flaky tests | Mock timers or skip timeout tests |
| Cookie handling varies by environment | Inconsistent results | Use supertest-session for consistency |
| Frontend tests require browser | Limited coverage | Focus on API tests; note gaps |

### 5.2 Test Assumptions

1. Server is configured with `AUTH_MODE=mock`
2. Express session middleware is properly configured
3. Test database/session store is reset between test suites
4. API endpoints follow documented paths

---

## 6. Test Execution

### 6.1 Execution Order

1. Session Management tests (foundational)
2. Authentication Middleware tests (depends on sessions)
3. Login API tests (depends on middleware)
4. Protected Route tests (depends on login)
5. Logout tests (depends on login)
6. Visual Indicator tests (supplementary)

### 6.2 Test Commands

```bash
# Run all feature tests
npm test -- test/feature_login.test.js

# Run with coverage
npm test -- --coverage test/feature_login.test.js

# Run specific test suite
npm test -- test/feature_login.test.js -t "Login API"
```

---

## 7. Exit Criteria

- All high-priority tests pass
- No critical defects outstanding
- Test coverage of all acceptance criteria documented
- All assumptions documented and validated
