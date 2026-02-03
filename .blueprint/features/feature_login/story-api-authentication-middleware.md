# Story — API Authentication Middleware

## User Story

As a **developer implementing protected API endpoints**, I want **middleware that validates session existence and enforces role-based access control on API requests** so that **protected endpoints reject unauthenticated or unauthorised requests consistently**.

---

## Context / Scope

- **Story Type:** Technical enabler
- **Actors:** System (middleware operates transparently on requests)
- **Environment Constraint:** Middleware active when `AUTH_MODE=mock` is set
- **Dependencies:**
  - Session management infrastructure must be implemented
- **Routes:**
  - Applies to all `/api/*` routes (configurable per endpoint)
- **This story establishes:**
  - Request-level session validation
  - Role-based endpoint access control
  - Consistent error responses for authentication/authorisation failures

---

## Acceptance Criteria

**AC-1 — Unauthenticated request rejection**
- Given a request is made to a protected API endpoint,
- When no valid session exists,
- Then the API returns HTTP 401 Unauthorized,
- And the response body contains `{ "error": "Authentication required" }`.

**AC-2 — Authenticated request proceeds**
- Given a request is made to a protected API endpoint,
- When a valid session exists,
- Then the request proceeds to the route handler,
- And the session data (userId, role) is available to the handler.

**AC-3 — Role-based access enforcement**
- Given a protected endpoint requires specific role(s),
- When a request is made with a valid session but insufficient role,
- Then the API returns HTTP 403 Forbidden,
- And the response body contains `{ "error": "Insufficient permissions" }`.

**AC-4 — Role requirement configuration**
- Given an API endpoint,
- When defining the endpoint,
- Then developers can specify:
  - `requireAuth: true/false` (whether authentication is required),
  - `allowedRoles: ['ROLE_A', 'ROLE_B']` (which roles may access),
  - Or `allowedRoles: '*'` (any authenticated user).

**AC-5 — Session user attached to request**
- Given a request passes authentication,
- When the request reaches the route handler,
- Then `req.user` contains:
  - `userId` (string),
  - `role` (string),
  - `sessionId` (string).

**AC-6 — Session activity refresh**
- Given a valid authenticated request,
- When the request is processed,
- Then the session's `lastAccessedAt` timestamp is updated.

**AC-7 — Public endpoint bypass**
- Given an endpoint is marked as public (`requireAuth: false`),
- When an unauthenticated request is made,
- Then the request proceeds without authentication checks.

**AC-8 — Login and logout routes exempt**
- Given the login (`POST /api/auth/login`) and logout (`POST /api/auth/logout`) routes,
- When requests are made to these endpoints,
- Then authentication middleware does not block them.

---

## Error Response Format

```js
// 401 Unauthorized - No valid session
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}

// 403 Forbidden - Valid session but wrong role
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "requiredRoles": ["HMCTS_CASE_OFFICER", "JUDGE_LEGAL_ADVISER"],
  "userRole": "ADOPTER"
}
```

---

## Middleware Configuration Example

```js
// Example endpoint configuration (for Codey reference)
router.get('/api/cases',
  requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER', 'JUDGE_LEGAL_ADVISER', 'CAFCASS_OFFICER', 'LA_SOCIAL_WORKER'] }),
  casesController.list
);

router.get('/api/cases/:id',
  requireAuth({ allowedRoles: '*' }),  // Any authenticated user
  casesController.get
);

router.get('/api/public/health',
  // No middleware - public endpoint
  healthController.check
);
```

---

## Out of Scope

- Specific role-to-permission mappings for individual endpoints (defined per feature)
- Case-level permissions (user can only see assigned cases) - handled by downstream features
- Document-level redaction based on role - handled by downstream features
- Audit logging of access attempts - deferred to production authentication
- Rate limiting - separate concern
- CORS configuration - separate concern

---

## Technical Notes

- Middleware should be composable and easy to apply to route groups
- Error responses should be consistent JSON format for frontend handling
- Role constants should be imported from shared types to prevent typos
