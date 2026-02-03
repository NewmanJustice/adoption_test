# Story — Mock Login Form and Flow

## User Story

As a **developer or tester**, I want **a mock login form where I can enter a username and select a user role** so that **I can simulate authenticated sessions for different user types without implementing full identity provider integration**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** Developer / Tester
- **Environment Constraint:** Only available when `AUTH_MODE=mock` is set
- **Dependencies:**
  - Session management infrastructure
  - API authentication middleware
- **Routes:**
  - `GET /login` — Display mock login form
  - `POST /api/auth/login` — Process login submission
- **This story captures:**
  - Username (freeform text)
  - Role selection (from predefined list)

---

## Acceptance Criteria

**AC-1 — Login page display**
- Given a user navigates to `/login`,
- When the page loads,
- Then a login form is displayed containing:
  - A text input for username,
  - A selection control (dropdown or radio buttons) for role,
  - A "Sign in" button,
  - A clear visual warning that this is mock/development authentication.

**AC-2 — Role options displayed**
- Given the login form is displayed,
- When viewing the role selection,
- Then all six roles are available:
  - HMCTS Case Officer,
  - Judge / Legal Adviser,
  - Cafcass Officer,
  - Local Authority Social Worker,
  - Voluntary Adoption Agency Worker,
  - Adopter.

**AC-3 — Successful login submission**
- Given a user enters a non-empty username and selects a role,
- When the user clicks "Sign in",
- Then the form submits to `POST /api/auth/login`,
- And on success, the user is redirected to the appropriate landing page for their role.

**AC-4 — Username required validation**
- Given the login form is displayed,
- When the user submits without entering a username,
- Then a validation error is displayed: "Enter a username",
- And the form is not submitted.

**AC-5 — Role required validation**
- Given the login form is displayed,
- When the user submits without selecting a role,
- Then a validation error is displayed: "Select a role",
- And the form is not submitted.

**AC-6 — GOV.UK error summary pattern**
- Given validation errors occur,
- When errors are displayed,
- Then:
  - A GOV.UK error summary is displayed at the top of the page,
  - Each error links to the relevant field,
  - Focus moves to the error summary,
  - Individual field error messages are shown inline.

**AC-7 — API login endpoint**
- Given a POST request to `/api/auth/login`,
- When the request body contains `{ "username": "test-user", "role": "HMCTS_CASE_OFFICER" }`,
- Then a session is created,
- And the response contains `{ "success": true, "redirectUrl": "/dashboard" }`.

**AC-8 — API validation - empty username**
- Given a POST request to `/api/auth/login`,
- When the username is empty or missing,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Username is required" }`.

**AC-9 — API validation - invalid role**
- Given a POST request to `/api/auth/login`,
- When the role is not one of the six valid options,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Invalid role selected" }`.

**AC-10 — No credential validation**
- Given any non-empty username is submitted,
- When processing the login,
- Then the username is accepted without validation,
- And no password is required or accepted.

**AC-11 — Role-based redirect after login**
- Given a successful login,
- When determining the redirect destination,
- Then users are redirected based on their role:
  - HMCTS Case Officer → `/dashboard`,
  - Judge / Legal Adviser → `/dashboard`,
  - Cafcass Officer → `/dashboard`,
  - Local Authority Social Worker → `/dashboard`,
  - Voluntary Adoption Agency Worker → `/dashboard`,
  - Adopter → `/my-cases`.

**AC-12 — Accessibility compliance**
- Given the login form is displayed,
- Then:
  - All form inputs have associated labels,
  - The form is navigable by keyboard,
  - Focus order is logical,
  - Colour contrast meets WCAG 2.1 AA standards.

---

## Session Persistence

```js
// Session created on successful login
session = {
  userId: 'entered-username',
  role: 'SELECTED_ROLE',
  createdAt: '2026-02-03T10:00:00Z',
  lastAccessedAt: '2026-02-03T10:00:00Z'
}
```

---

## API Request/Response

```js
// POST /api/auth/login
// Request
{
  "username": "test-user",
  "role": "HMCTS_CASE_OFFICER"
}

// Response - Success (200)
{
  "success": true,
  "user": {
    "userId": "test-user",
    "role": "HMCTS_CASE_OFFICER"
  },
  "redirectUrl": "/dashboard"
}

// Response - Validation Error (400)
{
  "success": false,
  "error": "Username is required",
  "code": "VALIDATION_ERROR"
}
```

---

## Out of Scope

- Real credential validation or password handling
- "Remember me" functionality
- Account creation or registration
- Password reset flows
- Multi-factor authentication
- Organisation selection (open question deferred)
- Pre-seeded test user accounts (open question deferred)

---

## Design Notes

- Username field should use GOV.UK text input component
- Role selection could use GOV.UK radios or select component (implementation choice)
- Mock authentication warning should be prominent but not obstructive
- Form layout should follow GOV.UK form patterns
