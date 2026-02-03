# Understanding - Mock Authentication (Login) Feature

## Summary

The Mock Authentication feature provides a development/testing mechanism that allows developers and testers to simulate authenticated sessions for different user roles without implementing full Gov.UK One Login integration. This is explicitly scoped as Phase 1 of the authentication strategy per System Spec Section 12.4.

---

## Key Behaviours

### Session Management Infrastructure (Story 1)
- Server-side session storage for user authentication state
- Session creation with username and role
- Session retrieval via session identifier
- Session destruction (logout/timeout)
- 30-minute idle timeout (configurable)
- Secure cookie configuration (httpOnly, secure, sameSite)
- Role validation against six predefined roles

### API Authentication Middleware (Story 2)
- Request-level session validation
- Role-based endpoint access control
- 401 Unauthorized for missing/invalid sessions
- 403 Forbidden for insufficient role permissions
- Session data attached to request (`req.user`)
- Session activity timestamp updates
- Public endpoint bypass capability
- Login/logout routes exempt from auth checks

### Mock Login Form (Story 3)
- Login page at `/login` with username and role selection
- All six roles available for selection
- Form validation (username required, role required)
- GOV.UK error summary pattern for validation errors
- API endpoint `POST /api/auth/login`
- No credential validation (any non-empty username accepted)
- Role-based redirect after successful login

### Protected Route Handling (Story 4)
- Redirect unauthenticated users to `/login`
- Preserve original URL as `returnUrl` query parameter
- Return to original destination after login
- Validate `returnUrl` (relative paths only)
- Role-based return URL validation
- API 401 triggers frontend redirect to login
- API 403 shows access denied (no redirect)
- Authenticated users on `/login` redirect to dashboard

### Logout Flow (Story 5)
- "Sign out" link visible when authenticated
- Session termination via `POST /api/auth/logout`
- Session cookie cleared on logout
- Redirect to `/login` after logout
- Idempotent logout (no error if no session)
- Post-logout API calls return 401

### Mock Auth Visual Indicator (Story 6)
- Warning banner on login page
- Persistent indicator showing current user and role
- Indicator only visible when `AUTH_MODE=mock`
- Accessible styling (WCAG 2.1 AA)
- Not displayed in production mode

---

## Valid Roles

| Role Constant | Display Name |
|---------------|--------------|
| `HMCTS_CASE_OFFICER` | HMCTS Case Officer |
| `JUDGE_LEGAL_ADVISER` | Judge / Legal Adviser |
| `CAFCASS_OFFICER` | Cafcass Officer |
| `LA_SOCIAL_WORKER` | Local Authority Social Worker |
| `VAA_WORKER` | Voluntary Adoption Agency Worker |
| `ADOPTER` | Adopter |

---

## Role-Based Redirects

| Role | Default Landing Page |
|------|---------------------|
| HMCTS Case Officer | `/dashboard` |
| Judge / Legal Adviser | `/dashboard` |
| Cafcass Officer | `/dashboard` |
| Local Authority Social Worker | `/dashboard` |
| Voluntary Adoption Agency Worker | `/dashboard` |
| Adopter | `/my-cases` |

---

## Initial Assumptions

1. **Session Storage**: Implementation approach (in-memory, Redis, database) is left to developer discretion. Tests will verify behaviour, not implementation.

2. **Cookie Configuration**: In development environment, `secure: false` is acceptable; `secure: true` is required for non-development environments.

3. **Session Timeout**: 30 minutes idle timeout is the default; tests will verify timeout configuration exists but may not test actual timeout due to time constraints.

4. **Return URL Handling**: Only relative URLs starting with `/` are valid; absolute URLs and external URLs are rejected.

5. **Error Response Format**: API errors return JSON with `error` and optionally `code` fields.

6. **Frontend Integration**: Tests will focus on API behaviour; frontend-specific behaviour (React Router guards, focus management) may require separate component tests.

7. **AUTH_MODE Environment Variable**: Tests assume `AUTH_MODE=mock` is set. Production mode (`govuk-one-login`) behaviour is out of scope for these tests.

---

## Ambiguities Identified

1. **Session Data Structure**: The `userId` field stores the "mock username" per AC-6 of session management. This is the entered username, not a system-generated ID.

2. **API Response Codes**: Story mentions `code` field in some responses but not all. Tests will verify presence where explicitly documented.

3. **Role Validation Timing**: Role validation occurs both at session creation (Story 1, AC-7) and at login API (Story 3, AC-9). Tests will verify both.

4. **Return URL Notification**: AC-3 of protected route handling mentions "a notification indicates the original page was not accessible" but does not specify the notification mechanism. Tests will verify redirect occurs.

5. **Session Cookie Name**: Not specified; tests will verify a session exists but not the specific cookie name.

---

## Out of Scope for Testing

- Real credential validation or password handling
- Gov.UK One Login integration (Phase 2)
- Organisation-level association with sessions
- Audit logging of session events
- Case-level permissions
- Document-level redaction
- Rate limiting
- CORS configuration
- Frontend component rendering (accessibility tests)
- Browser-specific behaviour (caching, back button)
