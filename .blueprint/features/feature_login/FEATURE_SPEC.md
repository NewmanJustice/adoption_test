# Feature Specification — Mock Authentication (Login)

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** Development and internal testing require the ability to simulate authenticated sessions for different user roles without implementing full identity provider integration. Without this, developers cannot test role-specific views, access controls, or user journeys.

- **User or system need:** Developers and testers need a simple, reliable way to assume any supported user role to verify that role-based access control, view redaction, and user-specific workflows function correctly before Gov.UK One Login integration is implemented.

- **How this supports the system purpose:** This feature enables rapid iteration on role-specific functionality while deferring the complexity of production identity verification. It directly supports the phased authentication strategy defined in System Spec Section 12.4 (Phase 1: MVP).

> **System Spec Alignment:** This feature directly implements System Spec Section 12.4 (Authentication Strategy - Phase 1). It is explicitly scoped as a development/testing enabler and not a production authentication solution.

---

## 2. Scope

### In Scope
- Display a login screen allowing selection of a username and role
- Support all six user roles defined in System Spec Section 4:
  - HMCTS Case Officer
  - Judge / Legal Adviser
  - Cafcass Officer
  - Local Authority Social Worker
  - Voluntary Adoption Agency Worker
  - Adopter
- Create and maintain a session upon successful mock login
- Enforce role-based access control at the API level based on the selected role
- Provide a logout mechanism that terminates the session
- Store role and username in session for downstream authorisation checks
- Clear indication that this is a mock/development login (not for production use)

### Out of Scope
- Real credential validation or password handling
- Gov.UK One Login integration (Phase 2 - separate feature)
- Multi-factor authentication
- Password reset or account recovery flows
- User registration or account creation
- Identity verification levels
- Integration with external identity providers
- Case-level permissions (handled by downstream features; this feature only establishes role)
- Audit logging of login attempts (deferred to production authentication implementation)

---

## 3. Actors Involved
**Who interacts with this feature.**

### Developer / Tester
- **What they can do:** Select any username and role combination to simulate an authenticated session; log out and switch to a different role
- **What they cannot do:** Access production systems with mock credentials; create persistent user accounts

### All System Roles (when simulated)
Once a role is selected, the user operates as that role:

| Role | System Access Granted |
|------|----------------------|
| **HMCTS Case Officer** | Case management, scheduling, bundle generation, administrative functions |
| **Judge / Legal Adviser** | Case review, AI summaries (advisory), order issuance views |
| **Cafcass Officer** | Case reports, consent witnessing, child representation views |
| **Local Authority Social Worker** | Case submission, placement management, matching views |
| **Voluntary Adoption Agency Worker** | Adopter assessment submission, report views |
| **Adopter** | Limited guided access, own case status, document submission (redacted views) |

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path
1. User navigates to the application
2. System presents a mock login screen with:
   - Text input for username (freeform, no validation)
   - Dropdown or radio selection for role
   - Clear visual indicator that this is mock/development authentication
3. User enters a username and selects a role
4. User submits the login form
5. System creates a session containing the username and role
6. System redirects user to the appropriate landing page for their role
7. All subsequent API requests include session information
8. API-level middleware enforces role-based access control

### Alternative Flows

**Direct URL Access Without Session:**
- User attempts to access a protected route without an active session
- System redirects to the mock login screen
- After login, system redirects to originally requested URL (if permitted for role)

**Logout:**
- User initiates logout
- System terminates the session
- System redirects to the login screen

**Role Switch:**
- User logs out from current session
- User logs in with a different role
- Previous session data is not retained

### User-Visible Outcomes
- Clear confirmation of logged-in state showing username and role
- Role-appropriate navigation and views become accessible
- Restricted content returns appropriate access denied messaging

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### Session States
- **No Session:** User is unauthenticated; only login screen accessible
- **Active Session:** User is authenticated with a specific role; role-appropriate access granted
- **Session Terminated:** After logout; returns to No Session state

### System-Level Impact
- This feature is **state-creating** for the session/authentication context only
- It does not create, modify, or transition any case lifecycle states
- It establishes the user context required for all downstream authorisation decisions

### State Transitions
```
[No Session] --login--> [Active Session]
[Active Session] --logout--> [No Session]
[Active Session] --session timeout--> [No Session]
```

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule: Role Selection
- **Description:** User must select exactly one role from the predefined list
- **Inputs:** Role selection from UI
- **Outputs:** Role stored in session
- **Type:** Deterministic

### Rule: Session Creation
- **Description:** A valid session is created when username and role are provided
- **Inputs:** Username (any non-empty string), Role (from predefined list)
- **Outputs:** Session token/cookie containing username and role
- **Type:** Deterministic

### Rule: API Access Control
- **Description:** Each API endpoint enforces role-based access; requests without valid sessions or with insufficient role permissions are rejected
- **Inputs:** Session token, requested endpoint, user role
- **Outputs:** Access granted (proceed) or Access denied (403 response)
- **Type:** Deterministic

### Rule: No Credential Validation
- **Description:** Mock authentication explicitly does NOT validate credentials
- **Inputs:** Username
- **Outputs:** Username accepted as-is (no validation, no rejection)
- **Type:** Deterministic

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- **Session Management:** Server-side session storage (or secure cookie-based sessions)
- **API Middleware:** Express middleware for authentication/authorisation checks
- **Frontend Router:** React router guards for protected routes

### External Systems
- None (mock authentication is self-contained)

### Policy Dependencies
- Role definitions from System Spec Section 4 must remain stable
- Role-to-permission mappings must be defined (downstream dependency)

### Operational Dependencies
- Environment variable `AUTH_MODE=mock` must be set (per System Spec Section 12.3)
- This feature should only be active in development/test environments

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Performance
- Login response time: < 500ms (no external calls required)
- Session validation on API requests: negligible overhead

### Security Implications
- **Critical:** Mock authentication must NEVER be enabled in production
- Environment configuration must enforce `AUTH_MODE` switching
- Clear visual differentiation in UI when mock auth is active
- No sensitive data stored in mock sessions beyond role identifier

### Audit/Logging Needs
- Minimal for mock authentication (development use only)
- Consider logging role selections for debugging multi-role test scenarios
- Full audit logging deferred to production authentication (Phase 2)

### Error Tolerance
- Graceful handling if session store is unavailable
- Clear error messaging if role selection fails

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. Mock authentication will only be used in development and internal testing environments
2. The `AUTH_MODE` environment variable reliably controls which authentication mechanism is active
3. Role definitions in System Spec Section 4 are complete and stable for MVP
4. Developers require the ability to freely switch between roles during testing
5. No persistent user data needs to be associated with mock usernames
6. Session timeout behaviour can follow standard defaults (e.g., 30 minutes idle)

### Open Questions
1. **Organisation Association:** Should mock login also allow selection of an organisation (e.g., specific Local Authority or court)? This may be needed to test organisation-scoped data access.
2. **Pre-seeded Users:** Should there be a list of pre-seeded mock users with specific permissions beyond role (e.g., assigned to specific cases)?
3. **Session Persistence:** Should mock sessions persist across browser restarts during development, or always require fresh login?
4. **Visual Indicator Placement:** Where should the "Mock Authentication Active" warning appear - header banner, login screen only, or persistent indicator?

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### System Spec Alignment Assessment

This feature **reinforces** existing system assumptions:
- Directly implements Phase 1 authentication strategy as specified in Section 12.4
- Supports the six roles defined in Section 4 without modification
- Enables development of role-based access control patterns specified in Section 7 (Access Rules)

### No Contradictions Identified

The feature is tightly scoped to the MVP mock authentication described in the system specification. No tensions or contradictions with the system specification have been identified.

### Clarification Recommended

The System Spec Section 12.4 does not explicitly state:
- Whether mock authentication should support organisation-level selection (beyond role)
- Whether any audit logging is expected for mock sessions

**Recommendation:** These are acceptable as open questions for BA elaboration. No system spec change required; these are implementation details within the stated scope of "simple username/role selection for testing."

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
1. **Mock Login Form:** User interface for role/username selection and session initiation
2. **Session Management:** Server-side session creation, storage, and termination
3. **API Authentication Middleware:** Request-level role enforcement
4. **Protected Route Handling:** Frontend route guards and redirect behaviour
5. **Logout Flow:** Session termination and cleanup
6. **Mock Auth Visual Indicator:** Clear UI indication that mock authentication is active

### Expected Story Boundaries
- Each story should be independently testable
- Session management stories should be backend-focused
- Login form stories should be frontend-focused with API integration
- Middleware story is a technical enabler for all subsequent role-based features

### Areas Needing Careful Story Framing
- **Role-Permission Mapping:** The login feature establishes role; the specific permissions per role may need a separate technical story or be documented as acceptance criteria across multiple stories
- **Error Handling:** Edge cases (empty username, session expiry) should be explicit in acceptance criteria
- **Environment Safety:** Stories should include acceptance criteria verifying mock auth cannot be accidentally enabled in production configuration

### Recommended Story Sequence
1. Session management infrastructure (technical foundation)
2. API authentication middleware (enables protected endpoints)
3. Mock login form and flow
4. Protected route handling and redirects
5. Logout flow
6. Mock auth visual indicator

---

## 12. Implementation Details (Post-Implementation)

### Backend Implementation

**API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Create session with `{ username, role }`, returns `{ redirectUrl }` |
| `/api/auth/logout` | POST | Destroy session, idempotent |
| `/api/auth/session` | GET | Returns `{ authenticated, user, authMode }` |

**Files Created:**
- `server/src/types/auth.ts` - TypeScript interfaces
- `server/src/config/roles.ts` - Role constants and validation
- `server/src/config/session.ts` - Session configuration
- `server/src/middleware/sessionMiddleware.ts` - Express-session setup
- `server/src/middleware/authMiddleware.ts` - `requireAuth({ allowedRoles })` middleware
- `server/src/services/sessionService.ts` - Session business logic
- `server/src/controllers/authController.ts` - Request handlers
- `server/src/routes/auth.ts` - Auth route definitions
- `server/src/utils/urlSanitiser.ts` - Prevent open redirects

### Frontend Implementation

**Pages Created:**
- `client/src/pages/LoginPage.tsx` - Mock login form with role selection
- `client/src/pages/DashboardPage.tsx` - Authenticated dashboard with session info

**Routing:**
- `/` - Landing page with "Start now" button
- `/login` - Login form
- `/dashboard` - Protected dashboard (redirects to /login if not authenticated)

**Dependencies Added:**
- `react-router-dom` - Client-side routing
- `express-session` - Server-side session management

### Session Configuration
- Memory store (development only)
- 30-minute timeout
- httpOnly, secure cookies (secure only in production)
- `authMode: 'mock'` indicator in session response

---

## 13. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-03 | Initial feature specification created | Implement Phase 1 mock authentication per System Spec Section 12.4 | Alex |
| 2026-02-03 | Added implementation details | Document backend API and frontend UI implementation | Codey |
