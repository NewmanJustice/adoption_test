# Story — Mock Auth Visual Indicator

## User Story

As a **developer or tester using mock authentication**, I want **a clear visual indicator that mock authentication is active** so that **I am always aware this is not production authentication and cannot accidentally mistake a test environment for a live system**.

---

## Context / Scope

- **Story Type:** User-facing feature (safety/awareness)
- **Actors:** Developer / Tester
- **Environment Constraint:** Only displayed when `AUTH_MODE=mock` is set
- **Dependencies:**
  - Session management infrastructure (to detect auth mode)
- **Routes:**
  - Applies to all pages when mock authentication is active
  - Particularly prominent on login page
- **This story establishes:**
  - Visual differentiation of mock authentication mode
  - Safety warning preventing production confusion

---

## Acceptance Criteria

**AC-1 — Warning banner on login page**
- Given `AUTH_MODE=mock` is set,
- When a user views the login page,
- Then a prominent warning banner is displayed stating:
  - "Mock authentication - Development/Testing only"
  - "This is not a production login. Do not use real credentials."

**AC-2 — Persistent indicator when authenticated**
- Given a user is logged in via mock authentication,
- When viewing any page in the application,
- Then a visual indicator confirms mock authentication is active.

**AC-3 — Indicator shows current user and role**
- Given a user is logged in via mock authentication,
- When viewing the indicator,
- Then it displays:
  - The current username,
  - The current role.

**AC-4 — Indicator styling**
- Given the mock auth indicator is displayed,
- When rendered,
- Then:
  - It uses a distinct colour that differentiates from standard GOV.UK elements,
  - It does not obstruct page content,
  - It remains visible without scrolling (fixed or header position).

**AC-5 — Banner not displayed in production mode**
- Given `AUTH_MODE` is NOT set to `mock` (e.g., `govuk-one-login`),
- When viewing any page,
- Then no mock authentication warning or indicator is displayed.

**AC-6 — Accessibility of indicator**
- Given the mock auth indicator is displayed,
- Then:
  - Text has sufficient colour contrast (WCAG 2.1 AA),
  - The indicator does not interfere with screen reader navigation,
  - The indicator is not announced repeatedly on every page (aria-live considerations).

**AC-7 — Login page warning prominence**
- Given a user is on the login page,
- When the warning banner is displayed,
- Then it appears above the login form,
- And uses GOV.UK warning or notification banner patterns.

**AC-8 — Indicator placement consistency**
- Given a user navigates between pages while authenticated,
- When the indicator is displayed,
- Then it appears in the same location on every page.

---

## Visual Design Guidance

### Login Page Warning Banner

Use the GOV.UK notification banner pattern with a warning variant:

```
+----------------------------------------------------------+
|  ⚠ Mock Authentication - Development/Testing Only        |
|                                                          |
|  This is not a production login. Any username will be    |
|  accepted without validation. Do not enter real          |
|  credentials.                                            |
+----------------------------------------------------------+
```

### Authenticated State Indicator

Options (implementation choice for Codey):

**Option A: Header bar addition**
A small bar below the main GOV.UK header showing:
```
Mock Auth: test-user | HMCTS Case Officer | [Sign out]
```

**Option B: Phase banner style**
Using the GOV.UK phase banner pattern position:
```
DEVELOPMENT | Logged in as: test-user (HMCTS Case Officer)
```

---

## Suggested Colour Approach

- Use a colour that is clearly distinct from GOV.UK blue/green
- Consider yellow/amber (warning) or a development-specific colour
- Ensure contrast ratios meet accessibility requirements
- Do not use red (reserves for errors)

---

## Out of Scope

- Environment-specific text beyond "Development/Testing"
- Clickable indicator to change role (use logout/login flow)
- Countdown timer showing session expiry
- Toggle to hide the indicator
- Different indicator styles per environment (staging vs development)

---

## Assumptions

- The indicator is informational and does not impede workflows
- Developers accept a small amount of screen real estate for safety
- The indicator is the same for all mock authentication users regardless of role

---

## Security Rationale

This indicator is a safety feature to prevent:
- Confusion between test and production environments
- Accidental use of real credentials in test environments
- Screenshots or recordings being mistaken for production systems
- Users believing they are accessing a secure, production system

The feature spec explicitly requires "clear indication that this is a mock/development login (not for production use)" — this story fulfils that requirement.
