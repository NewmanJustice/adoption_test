# Implementation Plan - Mock Authentication (Login) Feature

## Summary

This plan implements a mock authentication system for the Adoption Digital Platform, enabling developers and testers to simulate authenticated sessions for six user roles without full Gov.UK One Login integration. The implementation covers session management, authentication middleware, login/logout APIs, and visual indicators.

---

## Understanding

### Key Behaviours
1. **Session Management** - Server-side session storage with secure cookies
2. **Authentication Middleware** - Request-level session validation and role-based access control
3. **Login API** - Accept username/role, create session, return role-based redirect
4. **Logout API** - Destroy session, clear cookies, idempotent behaviour
5. **Protected Routes** - 401 for unauthenticated, 403 for insufficient permissions
6. **Visual Indicator** - API flag indicating mock auth mode

### Test Count
- **Total Tests**: 26 test cases in `/workspaces/adoption_test/test/feature_login.test.js`
- **Currently Skipped**: 25 tests (awaiting implementation)
- **Active**: 1 test (return URL sanitisation - unit test)

### Valid Roles
| Constant | Redirect |
|----------|----------|
| `HMCTS_CASE_OFFICER` | `/dashboard` |
| `JUDGE_LEGAL_ADVISER` | `/dashboard` |
| `CAFCASS_OFFICER` | `/dashboard` |
| `LA_SOCIAL_WORKER` | `/dashboard` |
| `VAA_WORKER` | `/dashboard` |
| `ADOPTER` | `/my-cases` |

---

## Files to Create/Modify

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/workspaces/adoption_test/server/src/config/roles.ts` | Role constants and redirect mappings |
| `/workspaces/adoption_test/server/src/config/session.ts` | Session configuration |
| `/workspaces/adoption_test/server/src/middleware/sessionMiddleware.ts` | Express-session setup |
| `/workspaces/adoption_test/server/src/middleware/authMiddleware.ts` | Authentication/authorisation middleware |
| `/workspaces/adoption_test/server/src/routes/auth.ts` | Auth routes (login, logout, session) |
| `/workspaces/adoption_test/server/src/controllers/authController.ts` | Auth request handlers |
| `/workspaces/adoption_test/server/src/services/sessionService.ts` | Session business logic |
| `/workspaces/adoption_test/server/src/utils/urlSanitiser.ts` | Return URL sanitisation |
| `/workspaces/adoption_test/server/src/types/auth.ts` | TypeScript interfaces for auth |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/workspaces/adoption_test/server/src/app.ts` | Add session middleware, auth routes |
| `/workspaces/adoption_test/server/src/config/index.ts` | Add session/auth config exports |
| `/workspaces/adoption_test/server/package.json` | Add `express-session` dependency |
| `/workspaces/adoption_test/test/feature_login.test.js` | Uncomment app import, remove `.skip` |

---

## Implementation Steps (Ordered)

### Phase 1: Foundation (Stories 1 & 2)

**Step 1.1: Install Dependencies**
```bash
cd server && npm install express-session @types/express-session
```

**Step 1.2: Create Type Definitions**
- File: `/workspaces/adoption_test/server/src/types/auth.ts`
- Define: `UserRole`, `SessionUser`, `AuthRequest` interfaces
- Extend Express `Request` type with `user` property

**Step 1.3: Create Role Configuration**
- File: `/workspaces/adoption_test/server/src/config/roles.ts`
- Export: `VALID_ROLES` array, `ROLE_REDIRECTS` mapping
- Export: `isValidRole()` validation function

**Step 1.4: Create Session Configuration**
- File: `/workspaces/adoption_test/server/src/config/session.ts`
- Configure: Session secret, timeout (30 min), cookie settings
- Settings: `httpOnly: true`, `secure` based on env, `sameSite: 'strict'`

**Step 1.5: Create Session Middleware**
- File: `/workspaces/adoption_test/server/src/middleware/sessionMiddleware.ts`
- Configure: `express-session` with memory store (dev)
- Export: Configured session middleware

**Step 1.6: Create Auth Middleware**
- File: `/workspaces/adoption_test/server/src/middleware/authMiddleware.ts`
- Implement: `requireAuth({ allowedRoles })` middleware factory
- Handle: 401 for no session, 403 for wrong role
- Attach: `req.user` with `userId`, `role`, `sessionId`

### Phase 2: Login/Logout APIs (Story 3 & 5)

**Step 2.1: Create Session Service**
- File: `/workspaces/adoption_test/server/src/services/sessionService.ts`
- Implement: `createSession(req, username, role)`
- Implement: `destroySession(req)`
- Implement: `getSessionData(req)`

**Step 2.2: Create Auth Controller**
- File: `/workspaces/adoption_test/server/src/controllers/authController.ts`
- Implement: `login(req, res)` - validate, create session, return redirect
- Implement: `logout(req, res)` - destroy session, return success
- Implement: `getSession(req, res)` - return session info + authMode

**Step 2.3: Create Auth Routes**
- File: `/workspaces/adoption_test/server/src/routes/auth.ts`
- Route: `POST /api/auth/login` - public
- Route: `POST /api/auth/logout` - public
- Route: `GET /api/auth/session` - public

**Step 2.4: Integrate into App**
- Modify: `/workspaces/adoption_test/server/src/app.ts`
- Add: Session middleware before routes
- Add: Auth routes to Express app
- Add: Test protected endpoint `/api/protected`

### Phase 3: Protected Routes & Utils (Story 4 & 6)

**Step 3.1: Create URL Sanitiser**
- File: `/workspaces/adoption_test/server/src/utils/urlSanitiser.ts`
- Implement: `sanitizeReturnUrl(url)` function
- Reject: Absolute URLs, protocol-relative URLs, javascript: URLs
- Accept: Only relative paths starting with `/`

**Step 3.2: Create Test Endpoints**
- Add: `/api/protected` - requires any authenticated user
- Add: `/api/admin-only` - requires `HMCTS_CASE_OFFICER` role
- Add: `/api/public/health` - public endpoint (already exists)

**Step 3.3: Update Config Index**
- Modify: `/workspaces/adoption_test/server/src/config/index.ts`
- Export: Role config, session config

### Phase 4: Test Activation

**Step 4.1: Enable Tests**
- Modify: `/workspaces/adoption_test/test/feature_login.test.js`
- Uncomment: `const app = require('../server/src/app');`
- Remove: `.skip` from all test cases
- Verify: All 26 tests pass

---

## Data Model

### Session Structure
```typescript
interface SessionData {
  userId: string;           // Entered username
  role: UserRole;           // One of six valid roles
  createdAt: string;        // ISO timestamp
  lastAccessedAt: string;   // ISO timestamp
}
```

### Request User Object
```typescript
interface RequestUser {
  userId: string;
  role: UserRole;
  sessionId: string;
}
```

### API Response Formats
```typescript
// Login Success (200)
{ success: true, user: { userId, role }, redirectUrl: string }

// Login Error (400)
{ success: false, error: string, code: 'VALIDATION_ERROR' }

// Session Info (200)
{ authenticated: boolean, user?: { userId, role }, authMode: 'mock' }

// Auth Error (401)
{ error: 'Authentication required', code: 'AUTH_REQUIRED' }

// Forbidden (403)
{ error: 'Insufficient permissions', code: 'FORBIDDEN' }
```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `username` | Required, non-empty string | "Username is required" |
| `role` | Required, must be in `VALID_ROLES` | "Invalid role selected" |
| `returnUrl` | Must start with `/`, no absolute URLs | Silently ignored |

---

## Risks/Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test file uses JS, server uses TS | Import compatibility | Ensure app exports correctly for CommonJS |
| Memory session store | Data loss on restart | Acceptable for dev; document for prod |
| No `supertest-session` in root deps | Session tests may fail | Add to devDependencies if needed |

### Open Questions

1. **TypeScript Compilation**: Tests import from `../server/src/app` - need to verify TS compilation or use `ts-jest` in root.

2. **Session Store**: Using memory store for development. Redis/database store would be needed for production but is out of scope.

3. **Cookie Security**: `secure: true` requires HTTPS. In development, this should be `false`.

---

## Definition of Done

- [ ] All 26 tests in `feature_login.test.js` pass
- [ ] `npm test` passes with no errors
- [ ] `npm run lint` passes (if configured)
- [ ] Session created with correct data structure on login
- [ ] Session destroyed correctly on logout
- [ ] 401 returned for unauthenticated protected requests
- [ ] 403 returned for insufficient role permissions
- [ ] All six roles accepted and redirect correctly
- [ ] `authMode: 'mock'` returned in session endpoint
- [ ] No TypeScript compilation errors

---

## File Creation Order

1. `server/src/types/auth.ts` - Type definitions first
2. `server/src/config/roles.ts` - Role constants
3. `server/src/config/session.ts` - Session config
4. `server/src/utils/urlSanitiser.ts` - Utility function
5. `server/src/services/sessionService.ts` - Session logic
6. `server/src/middleware/sessionMiddleware.ts` - Session setup
7. `server/src/middleware/authMiddleware.ts` - Auth checks
8. `server/src/controllers/authController.ts` - Request handlers
9. `server/src/routes/auth.ts` - Route definitions
10. Modify `server/src/app.ts` - Integration
11. Modify `server/package.json` - Dependencies
12. Modify `test/feature_login.test.js` - Enable tests

---

## Traceability

| Story | Implementation Files |
|-------|---------------------|
| Session Management | `sessionMiddleware.ts`, `sessionService.ts`, `session.ts` |
| Auth Middleware | `authMiddleware.ts`, `types/auth.ts` |
| Login Form API | `authController.ts`, `routes/auth.ts`, `roles.ts` |
| Protected Routes | `authMiddleware.ts`, `urlSanitiser.ts` |
| Logout Flow | `authController.ts`, `sessionService.ts` |
| Visual Indicator | `authController.ts` (session endpoint) |
