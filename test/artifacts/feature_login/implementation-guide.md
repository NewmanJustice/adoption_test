# Implementation Guide - Mock Authentication Feature

## Overview

This guide describes what the tests expect from the implementation. Codey should use this as a contract to develop against.

---

## 1. Required API Endpoints

### POST /api/auth/login

**Purpose:** Create an authenticated session

**Request:**
```json
{
  "username": "string (required, non-empty)",
  "role": "string (required, must be valid role)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "entered-username",
    "role": "SELECTED_ROLE"
  },
  "redirectUrl": "/dashboard or /my-cases"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Username is required" | "Invalid role selected",
  "code": "VALIDATION_ERROR"
}
```

### POST /api/auth/logout

**Purpose:** Terminate the current session

**Request:** No body required (session identified by cookie)

**Success Response (200):**
```json
{
  "success": true
}
```

**Note:** This endpoint should return success even if no session exists (idempotent).

### GET /api/auth/session (Recommended)

**Purpose:** Retrieve current session information

**Success Response (200) - Authenticated:**
```json
{
  "authenticated": true,
  "user": {
    "userId": "username",
    "role": "ROLE_CONSTANT"
  },
  "authMode": "mock"
}
```

**Success Response (200) - Not Authenticated:**
```json
{
  "authenticated": false,
  "authMode": "mock"
}
```

---

## 2. Valid Role Constants

Tests expect these exact string values:

```javascript
const VALID_ROLES = [
  'HMCTS_CASE_OFFICER',
  'JUDGE_LEGAL_ADVISER',
  'CAFCASS_OFFICER',
  'LA_SOCIAL_WORKER',
  'VAA_WORKER',
  'ADOPTER'
];
```

---

## 3. Role-Based Redirect URLs

| Role | Redirect URL |
|------|--------------|
| `HMCTS_CASE_OFFICER` | `/dashboard` |
| `JUDGE_LEGAL_ADVISER` | `/dashboard` |
| `CAFCASS_OFFICER` | `/dashboard` |
| `LA_SOCIAL_WORKER` | `/dashboard` |
| `VAA_WORKER` | `/dashboard` |
| `ADOPTER` | `/my-cases` |

---

## 4. Authentication Middleware Behaviour

### Unauthenticated Request (401)

When no valid session exists:

```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### Insufficient Permissions (403)

When session exists but role is not permitted:

```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "requiredRoles": ["ROLE_A", "ROLE_B"],
  "userRole": "ACTUAL_ROLE"
}
```

### Request Object Enhancement

When authenticated, `req.user` should contain:

```javascript
req.user = {
  userId: 'username',
  role: 'ROLE_CONSTANT',
  sessionId: 'session-identifier'
};
```

---

## 5. Session Data Structure

Tests expect sessions to contain:

```javascript
{
  userId: 'string',           // The entered username
  role: 'string',             // One of the six valid roles
  createdAt: 'ISO timestamp', // Session creation time
  lastAccessedAt: 'ISO timestamp' // Last activity time
}
```

---

## 6. Protected Endpoint Configuration

Tests expect middleware that can be configured like:

```javascript
// Any authenticated user
router.get('/api/some-endpoint',
  requireAuth({ allowedRoles: '*' }),
  handler
);

// Specific roles only
router.get('/api/admin-endpoint',
  requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER'] }),
  handler
);

// Public endpoint (no middleware)
router.get('/api/public/health', handler);
```

---

## 7. Cookie Configuration

Session cookies should be configured with:

```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: 'strict' // or 'lax'
}
```

---

## 8. Return URL Handling

### Sanitisation Rules

- Only accept relative URLs starting with `/`
- Reject absolute URLs (e.g., `https://...`)
- Reject external URLs
- URL-encode when passing as query parameter

### Expected Behaviour

```javascript
// Valid
sanitizeReturnUrl('/dashboard') // => '/dashboard'
sanitizeReturnUrl('/cases/123') // => '/cases/123'

// Invalid (return null or default)
sanitizeReturnUrl('https://evil.com') // => null
sanitizeReturnUrl('//evil.com') // => null
sanitizeReturnUrl('javascript:alert(1)') // => null
```

---

## 9. Test Endpoint Requirements

For tests to run, the implementation needs:

1. **Express app export** - Export the Express app for supertest
2. **Session middleware** - express-session configured
3. **Auth routes** - `/api/auth/login`, `/api/auth/logout`
4. **Session route** - `/api/auth/session` (recommended)
5. **Protected test endpoint** - At least one protected route for testing middleware

### Recommended Test Helpers

```javascript
// Export app for testing
// server/src/app.js
module.exports = app;

// Or if using server start
// server/src/index.js
if (require.main === module) {
  app.listen(PORT);
}
module.exports = app;
```

---

## 10. Environment Variables

Tests assume these environment variables:

```
AUTH_MODE=mock
NODE_ENV=test
SESSION_SECRET=test-secret
```

---

## 11. Error Response Consistency

All API errors should follow this format:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

Standard error codes:
- `VALIDATION_ERROR` - Invalid input data
- `AUTH_REQUIRED` - No valid session
- `FORBIDDEN` - Valid session but insufficient role

---

## 12. Implementation Checklist

- [ ] Session management infrastructure
  - [ ] Session creation with username and role
  - [ ] Session retrieval by identifier
  - [ ] Session destruction
  - [ ] Secure cookie configuration
  - [ ] Role validation

- [ ] Authentication middleware
  - [ ] Validate session existence
  - [ ] Check role permissions
  - [ ] Attach user to request
  - [ ] Update lastAccessedAt
  - [ ] Public endpoint bypass

- [ ] Login endpoint
  - [ ] Accept username and role
  - [ ] Validate required fields
  - [ ] Validate role value
  - [ ] Create session
  - [ ] Return redirect URL

- [ ] Logout endpoint
  - [ ] Destroy session
  - [ ] Clear cookie
  - [ ] Idempotent behaviour

- [ ] Session info endpoint
  - [ ] Return current user info
  - [ ] Return auth mode flag
