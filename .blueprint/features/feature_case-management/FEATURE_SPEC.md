# Feature Specification — Case Management

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** The Adoption Digital Platform requires a foundational capability to create, view, update, and manage adoption cases. Without this core feature, no other case-related functionality (document handling, court processes, AI-assisted decisions) can operate.

- **User or system need:** All system actors need the ability to work with adoption cases appropriate to their role. HMCTS case officers need to create and manage case records; judges need to review case details; social workers need to submit and track cases; adopters need limited visibility into their own cases.

- **How this supports the system purpose:** This feature directly implements the "Single digital case record" requirement from System Spec Section 3 (In Scope) and establishes the case entity that is central to all adoption proceedings as defined in Section 5 (Core Domain Concepts).

> **System Spec Alignment:** This feature implements core case management functionality required by System Spec Sections 3 (System Boundaries), 5 (Core Domain Concepts - Case), and 6 (High-Level Lifecycle & State Model). It is foundational to the entire platform.

---

## 2. Scope

### In Scope
- Create new adoption cases with required attributes (case type, parties, assigned court)
- View case details appropriate to user role (with redaction where required)
- List cases filtered by user role and permissions (need-to-know enforcement)
- Update case status through defined lifecycle states
- Basic case lifecycle management (status transitions)
- Support for all six adoption types defined in System Spec Section 5
- Role-based access control at case level
- Audit logging of all case operations

### Out of Scope
- Document upload and management (separate feature)
- Party/participant management beyond basic case assignment (separate feature)
- Hearing scheduling and management (separate feature)
- Court bundle generation (separate feature)
- AI-assisted features (summarisation, risk flagging) (separate features)
- Consent handling workflow (separate feature)
- Inter-agency messaging and collaboration (separate feature)
- Placement order ingestion from external systems (separate feature)
- Form A58 digital submission workflow (separate feature)
- Case search beyond role-filtered listing (future enhancement)

---

## 3. Actors Involved
**Who interacts with this feature.**

### HMCTS Case Officer
- **Can do:** Create cases, view all assigned court cases, update case status, assign case numbers
- **Cannot do:** Make judicial decisions, access cases from other courts without assignment

### Judge / Legal Adviser
- **Can do:** View case details for cases they are assigned to, review case status
- **Cannot do:** Create cases, modify case administrative data, access unassigned cases

### Cafcass Officer
- **Can do:** View cases where they are assigned as reporting officer, see case status
- **Cannot do:** Create cases, modify case data, access cases without assignment

### Local Authority Social Worker
- **Can do:** View cases for children in their LA's care, see case status, request case creation
- **Cannot do:** Directly create court cases (submitted via application), access other LA cases

### Voluntary Adoption Agency Worker
- **Can do:** View cases where their agency is involved, see case status
- **Cannot do:** Create cases, access cases without agency involvement

### Adopter
- **Can do:** View their own case(s) only, see case status (limited/redacted view)
- **Cannot do:** View other cases, see birth family identifying information, modify case data

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path - Case Creation
1. HMCTS Case Officer initiates case creation
2. System presents case creation form with required fields
3. Officer enters: case type, assigned court, primary parties (minimum: applicant, child)
4. System validates required fields and business rules
5. System generates unique case number
6. System creates case record with status "Application"
7. System logs creation event in audit trail
8. Officer receives confirmation with case number

### Happy Path - Case Viewing
1. Authenticated user requests to view a case
2. System verifies user has permission to access this case (role + assignment)
3. System retrieves case data
4. System applies role-based redaction rules (e.g., birth family info hidden from adopters)
5. System presents case details appropriate to user role

### Happy Path - Case Listing
1. Authenticated user requests case list
2. System identifies user role and permissions
3. System queries cases where user has legitimate access
4. System returns filtered, paginated list of cases
5. List shows: case number, case type, status, key dates

### Happy Path - Status Update
1. Authorised user initiates status transition
2. System validates transition is permitted from current state
3. System validates user role can perform this transition
4. System updates case status
5. System logs status change in audit trail
6. User receives confirmation

### Alternative Flows

**Access Denied:**
- User attempts to access case without permission
- System returns 403 with appropriate message
- Attempt is logged for security audit

**Invalid Status Transition:**
- User attempts invalid state transition (e.g., Application directly to Order Granted)
- System rejects with explanation of valid transitions
- Case status unchanged

**Validation Failure:**
- Required fields missing or invalid data
- System returns validation errors
- User corrects and resubmits

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### Case States (from System Spec Section 6)
This feature implements the core case lifecycle:

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| **Application** | Case created from submitted application | Case creation |
| **Directions** | Case allocated, directions being issued | Application accepted |
| **Consent & Reporting** | Awaiting consent/reports | Directions issued |
| **Final Hearing** | Hearing scheduled, bundle prepared | Reports received |
| **Order Granted** | Adoption order made (terminal) | Hearing decision |
| **Application Refused** | Court refuses order (terminal) | Hearing decision |
| **Application Withdrawn** | Applicant withdraws (terminal) | Applicant request |
| **On Hold** | Awaiting external input (non-terminal) | Various triggers |
| **Adjourned** | Hearing adjourned (non-terminal) | Hearing outcome |

### State Transition Rules
```
[Application] --> [Directions] --> [Consent & Reporting] --> [Final Hearing]
                                                                    |
                                                         +----------+----------+
                                                         |          |          |
                                                         v          v          v
                                                  [Order Granted] [Refused] [Withdrawn]

Any non-terminal state can transition to:
- [On Hold] (and back)
- [Adjourned] (and back)
- [Application Withdrawn]
```

### Feature Classification
- **State-creating:** Yes - creates new case records in "Application" state
- **State-transitioning:** Yes - enables movement through case lifecycle
- **State-constraining:** Yes - enforces valid state transitions only

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule: Single Case Record
- **Description:** Each adoption matter must have exactly one case record (System Spec Section 7)
- **Inputs:** Case creation request with identifying information
- **Outputs:** New case created OR rejection if duplicate detected
- **Type:** Deterministic

### Rule: Case Number Generation
- **Description:** System generates unique, court-prefixed case number
- **Inputs:** Assigned court, case type, current date
- **Outputs:** Unique case number (format: COURT/YEAR/SEQUENCE)
- **Type:** Deterministic

### Rule: Role-Based Case Access
- **Description:** Users can only access cases where they have a legitimate role (System Spec Section 7 - Access Rules)
- **Inputs:** User role, user assignments, requested case
- **Outputs:** Access granted OR access denied
- **Type:** Deterministic

### Rule: Adopter View Redaction
- **Description:** Birth family identifying information must be redacted from adopter views (System Spec Section 7)
- **Inputs:** Case data, user role
- **Outputs:** Full case data OR redacted case data (for adopters)
- **Type:** Deterministic

### Rule: Valid State Transitions
- **Description:** Case status can only change via permitted transitions
- **Inputs:** Current state, requested new state, user role
- **Outputs:** Transition permitted OR transition rejected
- **Type:** Deterministic

### Rule: Status Transition Authority
- **Description:** Only certain roles can trigger certain transitions
- **Inputs:** User role, requested transition
- **Outputs:** Action permitted OR action denied
- **Type:** Deterministic

| Transition | Permitted Roles |
|------------|-----------------|
| Create case | HMCTS Case Officer |
| Application -> Directions | HMCTS Case Officer |
| Directions -> Consent & Reporting | HMCTS Case Officer |
| Any -> On Hold | HMCTS Case Officer, Judge |
| Any -> Withdrawn | HMCTS Case Officer |
| Final Hearing -> Terminal states | Judge / Legal Adviser |

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- **Authentication (Mock Login feature):** User must be authenticated with a role
- **Database:** PostgreSQL for case record storage
- **API Layer:** Express.js REST endpoints
- **Frontend:** React components for case UI

### External Systems
- None for MVP (future: LA systems for case data, HMCTS Reform platform)

### Policy Dependencies
- Role definitions from System Spec Section 4 must remain stable
- Case lifecycle states from System Spec Section 6 must remain stable
- Adoption types from System Spec Section 5 must remain stable

### Operational Dependencies
- Database must be available and migrated
- Authentication service must be operational

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Performance
- Case creation: < 2 seconds (per System Spec Section 9)
- Case listing: < 1 second for typical page (50 cases)
- Case view: < 500ms

### Audit/Logging Needs
- **Full audit trail required** (System Spec Section 7)
- Every case action must log: user, timestamp, action, before/after state
- Audit records must be immutable
- Support reconstruction of case state at any point in time

### Security Implications
- Case data contains sensitive personal information
- Role-based access must be enforced at API level (not just UI)
- Redaction logic must be server-side (cannot trust client)
- All access attempts (successful and failed) must be logged

### Error Tolerance
- Database transaction rollback on partial failures
- Clear error messages without exposing system internals
- Graceful handling of concurrent updates

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. Mock authentication feature is complete and provides role information
2. Six adoption types are sufficient for MVP (no additional types needed)
3. Case lifecycle states from System Spec are complete for MVP
4. Case-level permissions will be based on explicit assignment (user assigned to case)
5. Court assignment is a simple reference (no complex court hierarchy for MVP)
6. Case number format can follow a simple pattern (complex registry rules deferred)

### Open Questions
1. **Party Assignment Model:** How are users assigned to cases? Is this manual (Case Officer assigns) or automatic (based on organisation)?
2. **Multi-Court Cases:** Can a case transfer between courts? If so, what happens to case number and assignments?
3. **Case Archival:** When and how are closed cases archived? What access remains post-archival?
4. **Organisation Scope:** Should case listing filter by organisation (e.g., LA social worker sees only their LA's cases) or just by explicit assignment?
5. **Draft Cases:** Should there be a "Draft" state before "Application" for cases being prepared but not yet submitted?
6. **Linked Cases:** How do we handle cases linked to care proceedings or other family matters? (System Spec Section 10 flags this as a design gap)

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### System Spec Alignment Assessment

This feature **reinforces** existing system assumptions:
- Directly implements the "Case" domain concept from Section 5
- Follows the case lifecycle model from Section 6
- Enforces access rules from Section 7
- Supports all six adoption types from Section 5

### Tensions Identified

**Tension 1: Party Assignment Model**
- System Spec Section 7 states "Users can only access cases where they have a legitimate role"
- However, the spec does not detail HOW users are assigned to cases
- **Recommendation:** For MVP, assume manual assignment by HMCTS Case Officer. Document this as a clarification rather than spec change.

**Tension 2: Linked Proceedings Gap**
- System Spec Section 10 explicitly flags "Linked Proceedings" as a design gap
- Case management feature will need to handle this eventually
- **Recommendation:** For MVP, include a "linked case reference" field but defer the full linking behaviour. Flag for future system spec update.

**Tension 3: Organisation-Scoped Access**
- System Spec implies need-to-know access but does not specify organisation-based filtering
- LA social workers should presumably only see their LA's cases
- **Recommendation:** Add organisation association to user context (beyond just role). Propose minor system spec clarification to Section 7 Access Rules.

### Proposed System Spec Clarification
The following clarification is recommended for System Spec Section 7 (Access Rules):

> "Case-level access is determined by explicit assignment. Users are assigned to cases either:
> (a) automatically based on organisational involvement (e.g., LA social workers for children in their LA's care), or
> (b) manually by HMCTS Case Officers (e.g., assigning a judge to a case).
> The assignment model may vary by role and will be detailed in feature specifications."

**Status:** Flagged for decision - does not block MVP implementation.

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
1. **Case Creation Flow:** HMCTS Case Officer creates a new case with required data
2. **Case Viewing:** Users view case details appropriate to their role
3. **Case Listing:** Users see filtered list of cases they have access to
4. **Case Status Updates:** Authorised users transition case through lifecycle states
5. **Role-Based Access Enforcement:** API-level permission checks
6. **Adopter Redaction:** Birth family information hidden from adopter views
7. **Audit Logging:** All case operations logged for compliance

### Expected Story Boundaries
- Case creation should be a single focused story (happy path + validation)
- Case viewing and listing can be separate stories (different UI concerns)
- Status transitions may need per-transition stories OR a consolidated story with multiple ACs
- Redaction logic should be a separate technical story or explicit AC on viewing stories
- Audit logging could be a cross-cutting technical enabler story

### Areas Needing Careful Story Framing
- **Access Control Testing:** Stories must include ACs for both permitted AND denied access scenarios
- **State Transition Matrix:** Consider a reference table in stories showing which roles can perform which transitions
- **Redaction Verification:** Adopter view stories must explicitly verify sensitive data is NOT visible
- **Audit Completeness:** Stories should specify what audit data is captured, not just "audit logging"

### Recommended Story Sequence
1. Database schema and case model (technical foundation)
2. Case creation API and basic UI
3. Case listing with role-based filtering
4. Case detail view with role-based redaction
5. Case status update API with transition validation
6. Audit logging infrastructure
7. Access denied handling and security logging

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-03 | Initial feature specification created | Implement core case management per System Spec Sections 3, 5, 6, 7 | Alex |
