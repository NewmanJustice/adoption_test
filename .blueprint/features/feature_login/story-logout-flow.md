# Story — Logout Flow

## User Story

As an **authenticated user**, I want **to be able to log out of the system** so that **my session is terminated and another user cannot access the system with my credentials on the same device**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** All authenticated users (Developer / Tester in mock mode)
- **Environment Constraint:** Active when `AUTH_MODE=mock` is set
- **Dependencies:**
  - Session management infrastructure
  - Mock login form (for redirect destination)
- **Routes:**
  - `POST /api/auth/logout` — Terminate session
  - Logout link/button in application header
- **This story establishes:**
  - Session termination mechanism
  - User-initiated logout flow
  - Post-logout redirect behaviour

---

## Acceptance Criteria

**AC-1 — Logout link visibility**
- Given a user is authenticated,
- When viewing any page in the application,
- Then a "Sign out" link is visible in the header.

**AC-2 — Logout link not visible when unauthenticated**
- Given a user is not authenticated,
- When viewing the login page or public pages,
- Then no "Sign out" link is displayed.

**AC-3 — Logout action**
- Given an authenticated user clicks "Sign out",
- When the logout request is processed,
- Then the user's session is terminated,
- And the user is redirected to `/login`.

**AC-4 — API logout endpoint**
- Given a POST request to `/api/auth/logout`,
- When the request includes a valid session,
- Then the session is destroyed,
- And the response contains `{ "success": true }`.

**AC-5 — Session cookie cleared**
- Given a successful logout,
- When the response is sent,
- Then the session cookie is cleared from the browser.

**AC-6 — Logout without active session**
- Given a POST request to `/api/auth/logout`,
- When no active session exists,
- Then the response returns `{ "success": true }` (idempotent),
- And no error is raised.

**AC-7 — Post-logout protected route access**
- Given a user has logged out,
- When the user attempts to navigate to a protected route,
- Then the user is redirected to `/login`.

**AC-8 — Post-logout back button behaviour**
- Given a user has logged out,
- When the user uses the browser back button to a cached protected page,
- Then any interaction requiring API calls redirects to `/login`.

**AC-9 — Role switch via logout**
- Given a user wants to switch roles,
- When the user logs out and logs in with a different role,
- Then no data from the previous session persists,
- And the user operates fully as the new role.

**AC-10 — Confirmation not required**
- Given a user clicks "Sign out",
- When the action is triggered,
- Then logout proceeds immediately without confirmation dialog.

---

## API Request/Response

```js
// POST /api/auth/logout
// Request - no body required (session identified by cookie)

// Response - Success (200)
{
  "success": true
}

// Response headers should include Set-Cookie to clear session
```

---

## UI Placement

The "Sign out" link should:
- Appear in the GOV.UK header component
- Be positioned consistently with GOV.UK Design System patterns
- Be clearly associated with the logged-in user identity

---

## Out of Scope

- Logout confirmation dialog (not required for mock auth)
- "Log out of all devices" functionality
- Session termination notification to other tabs
- Audit logging of logout events (deferred to production)
- Automatic logout warning before session timeout

---

## Assumptions

- Logout is immediate and does not require confirmation
- No unsaved work warning is needed for mock authentication phase
- Browser cache may retain page content but API interactions will fail appropriately
