# Story — Session Management Infrastructure

## User Story

As a **developer building the Adoption Digital Platform**, I want **a session management infrastructure that can store and retrieve user authentication state** so that **subsequent features can rely on a consistent foundation for tracking authenticated users across requests**.

---

## Context / Scope

- **Story Type:** Technical foundation / enabler
- **Actors:** System (no direct user interaction)
- **Environment Constraint:** Session management must function when `AUTH_MODE=mock` is set (per System Spec Section 12.3)
- **Dependencies:** None (this is a foundational story)
- **Routes:**
  - No user-facing routes; this establishes server-side infrastructure
- **This story establishes:**
  - Server-side session storage mechanism
  - Session creation, retrieval, and destruction capabilities
  - Session timeout handling
  - Secure session cookie configuration

---

## Acceptance Criteria

**AC-1 — Session creation**
- Given the server receives a request to create a session with valid user data,
- When the session creation function is invoked with username and role,
- Then a new session is created containing the username and role,
- And a secure session identifier is generated.

**AC-2 — Session retrieval**
- Given a valid session exists,
- When a subsequent request includes the session identifier,
- Then the session data (username, role) can be retrieved.

**AC-3 — Session destruction**
- Given an active session exists,
- When the session destruction function is invoked,
- Then the session is invalidated,
- And subsequent requests with that session identifier return no session data.

**AC-4 — Session timeout configuration**
- Given a session is created,
- When 30 minutes of inactivity passes (configurable),
- Then the session is automatically invalidated.

**AC-5 — Secure cookie settings**
- Given a session is created,
- When the session cookie is set,
- Then the cookie is configured with:
  - `httpOnly: true` (prevents JavaScript access),
  - `secure: true` in non-development environments,
  - `sameSite: strict` or `lax` to prevent CSRF.

**AC-6 — Session data structure**
- Given a session is created,
- When session data is stored,
- Then the session contains at minimum:
  - `userId` (string): the mock username,
  - `role` (string): one of the six defined roles,
  - `createdAt` (timestamp): session creation time,
  - `lastAccessedAt` (timestamp): last activity time.

**AC-7 — Role value validation**
- Given a session creation request,
- When the role provided is not one of the six valid roles,
- Then the session creation fails with an appropriate error.

---

## Session Persistence

```js
// Server-side session structure
session = {
  userId: 'mock-username',
  role: 'HMCTS_CASE_OFFICER' | 'JUDGE_LEGAL_ADVISER' | 'CAFCASS_OFFICER' | 'LA_SOCIAL_WORKER' | 'VAA_WORKER' | 'ADOPTER',
  createdAt: '2026-02-03T10:00:00Z',
  lastAccessedAt: '2026-02-03T10:15:00Z'
}
```

### Valid Role Values

| Role Constant | Display Name |
|---------------|--------------|
| `HMCTS_CASE_OFFICER` | HMCTS Case Officer |
| `JUDGE_LEGAL_ADVISER` | Judge / Legal Adviser |
| `CAFCASS_OFFICER` | Cafcass Officer |
| `LA_SOCIAL_WORKER` | Local Authority Social Worker |
| `VAA_WORKER` | Voluntary Adoption Agency Worker |
| `ADOPTER` | Adopter |

---

## Out of Scope

- User-facing login UI (covered in separate story)
- API authentication middleware (covered in separate story)
- Production authentication with Gov.UK One Login (Phase 2)
- Organisation-level association with sessions (open question in feature spec)
- Persistent sessions across browser restarts (decision: require fresh login)
- Audit logging of session events (deferred to production authentication)

---

## Technical Notes

- Session storage approach (in-memory, Redis, database-backed) is an implementation decision for Codey
- This story enables but does not implement route protection
- Session timeout value (30 minutes) can be configured via environment variable if needed
