# Test Behaviour Matrix - Mock Authentication Feature

## Story 1: Session Management Infrastructure

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Session creation with valid data | T-SM-1 | Covered |
| AC-2 | Session retrieval with valid identifier | T-SM-2 | Covered |
| AC-3 | Session destruction | T-SM-3, T-LO-2 | Covered |
| AC-4 | Session timeout configuration | T-SM-6 | Partial (config only) |
| AC-5 | Secure cookie settings | T-SM-7 | Covered |
| AC-6 | Session data structure | T-SM-4, T-LF-8 | Covered |
| AC-7 | Role value validation | T-SM-5, T-LF-4 | Covered |

## Story 2: API Authentication Middleware

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Unauthenticated request rejection (401) | T-AM-1, T-PR-1 | Covered |
| AC-2 | Authenticated request proceeds | T-AM-2, T-PR-6 | Covered |
| AC-3 | Role-based access enforcement (403) | T-AM-3, T-PR-7 | Covered |
| AC-4 | Role requirement configuration | T-AM-8 | Covered |
| AC-5 | Session user attached to request | T-AM-4 | Covered |
| AC-6 | Session activity refresh | T-AM-5 | Covered |
| AC-7 | Public endpoint bypass | T-AM-6 | Covered |
| AC-8 | Login/logout routes exempt | T-AM-7 | Covered |

## Story 3: Mock Login Form and Flow

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Login page display | - | Frontend (out of scope) |
| AC-2 | Role options displayed | - | Frontend (out of scope) |
| AC-3 | Successful login submission | T-LF-1 | Covered |
| AC-4 | Username required validation | T-LF-2 | Covered |
| AC-5 | Role required validation | T-LF-5 | Covered |
| AC-6 | GOV.UK error summary pattern | - | Frontend (out of scope) |
| AC-7 | API login endpoint | T-LF-1, T-LF-8 | Covered |
| AC-8 | API validation - empty username | T-LF-2, T-LF-3 | Covered |
| AC-9 | API validation - invalid role | T-LF-4 | Covered |
| AC-10 | No credential validation | T-LF-1, T-LF-9 | Covered |
| AC-11 | Role-based redirect after login | T-LF-6, T-LF-7 | Covered |
| AC-12 | Accessibility compliance | - | Frontend (out of scope) |

## Story 4: Protected Route Handling

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Unauthenticated access redirect | T-PR-1 | Covered |
| AC-2 | Return URL redirect after login | T-PR-2 | Covered |
| AC-3 | Return URL role validation | - | Partial (frontend) |
| AC-4 | Return URL sanitisation | T-PR-3, T-PR-4, T-PR-5 | Covered |
| AC-5 | Authenticated access to protected route | T-PR-6 | Covered |
| AC-6 | Session expiry during navigation | T-LO-4 | Covered |
| AC-7 | API 401 triggers frontend redirect | T-AM-1 | Covered (API only) |
| AC-8 | API 403 displays access denied | T-PR-7 | Covered |
| AC-9 | Login page redirect for auth users | - | Frontend (out of scope) |
| AC-10 | Deep linking support | T-PR-2 | Covered |

## Story 5: Logout Flow

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Logout link visibility | - | Frontend (out of scope) |
| AC-2 | Logout link not visible when unauth | - | Frontend (out of scope) |
| AC-3 | Logout action | T-LO-1 | Covered |
| AC-4 | API logout endpoint | T-LO-1 | Covered |
| AC-5 | Session cookie cleared | T-LO-5 | Covered |
| AC-6 | Logout without active session | T-LO-3 | Covered |
| AC-7 | Post-logout protected route access | T-LO-4 | Covered |
| AC-8 | Post-logout back button behaviour | - | Browser (out of scope) |
| AC-9 | Role switch via logout | T-LO-2 | Covered |
| AC-10 | Confirmation not required | T-LO-1 | Covered |

## Story 6: Mock Auth Visual Indicator

| AC | Acceptance Criterion | Test IDs | Status |
|----|---------------------|----------|--------|
| AC-1 | Warning banner on login page | - | Frontend (out of scope) |
| AC-2 | Persistent indicator when authenticated | T-VI-2 | Partial (API data) |
| AC-3 | Indicator shows user and role | T-VI-2 | Covered (API data) |
| AC-4 | Indicator styling | - | Frontend (out of scope) |
| AC-5 | Banner not displayed in production | T-VI-1 | Covered (API flag) |
| AC-6 | Accessibility of indicator | - | Frontend (out of scope) |
| AC-7 | Login page warning prominence | - | Frontend (out of scope) |
| AC-8 | Indicator placement consistency | - | Frontend (out of scope) |

---

## Coverage Summary

| Story | Total ACs | API Covered | Frontend Only | Coverage |
|-------|-----------|-------------|---------------|----------|
| Session Management | 7 | 7 | 0 | 100% |
| API Auth Middleware | 8 | 8 | 0 | 100% |
| Mock Login Form | 12 | 8 | 4 | 67% |
| Protected Route Handling | 10 | 7 | 3 | 70% |
| Logout Flow | 10 | 6 | 4 | 60% |
| Mock Auth Indicator | 8 | 2 | 6 | 25% |
| **Total** | **55** | **38** | **17** | **69%** |

**Note:** Frontend-only acceptance criteria require browser-based testing with React Testing Library or similar tools. These tests focus on API-level behaviour testable with Jest and Supertest.
