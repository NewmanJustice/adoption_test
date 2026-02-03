# Story — Protected Route Handling and Redirects

## User Story

As a **user attempting to access protected content**, I want **the system to redirect me to the login page if I'm not authenticated, and return me to my original destination after login** so that **I don't lose my intended navigation path when authentication is required**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** All system users (Developer / Tester in mock mode)
- **Environment Constraint:** Active when `AUTH_MODE=mock` is set
- **Dependencies:**
  - Session management infrastructure
  - API authentication middleware
  - Mock login form
- **Routes:**
  - All protected frontend routes (e.g., `/dashboard`, `/cases/*`, `/my-cases`)
  - `GET /login` with optional `?returnUrl=` parameter
- **This story establishes:**
  - Frontend route guards
  - Return URL handling
  - Redirect behaviour for unauthenticated access

---

## Acceptance Criteria

**AC-1 — Unauthenticated access to protected route**
- Given a user is not authenticated (no active session),
- When the user navigates to a protected route (e.g., `/dashboard`),
- Then the user is redirected to `/login`,
- And the original URL is preserved as a query parameter: `/login?returnUrl=%2Fdashboard`.

**AC-2 — Return URL redirect after login**
- Given a user was redirected to login with a `returnUrl` parameter,
- When the user successfully logs in,
- Then the user is redirected to the original `returnUrl`,
- And not to the default landing page.

**AC-3 — Return URL role validation**
- Given a user logs in with a `returnUrl` parameter,
- When the user's role does not have permission for the return URL,
- Then the user is redirected to their default landing page instead,
- And a notification indicates the original page was not accessible.

**AC-4 — Return URL sanitisation**
- Given a `returnUrl` parameter is provided,
- When the URL is processed,
- Then only relative URLs starting with `/` are accepted,
- And absolute URLs or external URLs are ignored (redirect to default).

**AC-5 — Authenticated access to protected route**
- Given a user has an active session,
- When the user navigates to a protected route,
- Then the page loads normally without redirect.

**AC-6 — Session expiry during navigation**
- Given a user has an active session,
- When the session expires while viewing a protected page,
- Then on the next navigation or API call, the user is redirected to login,
- And the current URL is preserved as the `returnUrl`.

**AC-7 — API 401 triggers frontend redirect**
- Given the frontend makes an API call,
- When the API returns 401 Unauthorized,
- Then the frontend redirects to `/login`,
- And the current page URL is preserved as `returnUrl`.

**AC-8 — API 403 displays access denied**
- Given an authenticated user makes an API call,
- When the API returns 403 Forbidden,
- Then the frontend displays an access denied message,
- And the user is NOT redirected to login.

**AC-9 — Login page redirect for authenticated users**
- Given a user has an active session,
- When the user navigates to `/login`,
- Then the user is redirected to their default landing page.

**AC-10 — Deep linking support**
- Given a user receives a direct link to a case (e.g., `/cases/12345`),
- When the user is not authenticated,
- Then the user is redirected to login with `returnUrl=/cases/12345`,
- And after login, the user arrives at `/cases/12345` (if permitted).

---

## Route Protection Configuration

```js
// Example protected routes (for reference)
const protectedRoutes = [
  { path: '/dashboard', roles: '*' },           // Any authenticated user
  { path: '/cases', roles: ['HMCTS_CASE_OFFICER', 'JUDGE_LEGAL_ADVISER', 'CAFCASS_OFFICER', 'LA_SOCIAL_WORKER'] },
  { path: '/my-cases', roles: ['ADOPTER'] },
  { path: '/admin/*', roles: ['HMCTS_CASE_OFFICER'] }
];

const publicRoutes = [
  '/login',
  '/accessibility-statement',
  '/cookies'
];
```

---

## Default Landing Pages by Role

| Role | Default Landing Page |
|------|---------------------|
| HMCTS Case Officer | `/dashboard` |
| Judge / Legal Adviser | `/dashboard` |
| Cafcass Officer | `/dashboard` |
| Local Authority Social Worker | `/dashboard` |
| Voluntary Adoption Agency Worker | `/dashboard` |
| Adopter | `/my-cases` |

---

## Out of Scope

- Specific route-to-role mappings (defined per feature as routes are added)
- Case-level access control (user can access case 123 but not case 456)
- Timeout warning before session expiry
- "Keep me signed in" session extension UI
- Concurrent session handling (same user logged in elsewhere)

---

## Technical Notes

- Frontend route guards should check session validity on route change
- Consider using React Router's loader pattern or a route wrapper component
- Return URL should be URL-encoded when passed as query parameter
- Return URL validation should occur both client-side and server-side
