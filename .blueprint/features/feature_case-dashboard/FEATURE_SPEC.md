# Feature Specification — Case Dashboard

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** Users across multiple agencies (HMCTS, Cafcass, Local Authorities, voluntary adoption agencies) currently lack a unified view of adoption cases relevant to their role. Without a central dashboard, users cannot efficiently assess their workload, identify cases requiring attention, or track case progression.

- **User or system need:** Professional users need an at-a-glance overview of their adoption caseload showing key information (status, dates, parties) to prioritise work effectively. Adopters need visibility of their own case status in a clear, non-overwhelming format.

- **How this supports the system purpose:** The dashboard directly supports the system's goal of "reduced time-to-decision" and "improved statutory compliance" by surfacing case status, deadlines, and progression visibility. It implements the "Dashboard for case progression and bottlenecks" requirement from the business context (Section 9).

> **System Spec Alignment:** This feature implements System Spec Section 3 (Reporting & Analytics - Dashboards), Section 7 (Access Rules - Need-to-Know, Role-Based Views), and serves as the primary landing page for authenticated professional users as established in the login feature.

---

## 2. Scope

### In Scope
- Display a list/table of adoption cases the authenticated user has permission to view
- Show key case attributes at a glance: case number, case type, current status, key dates, parties involved
- Filter cases by status, case type, and date ranges
- Sort cases by relevant columns (date, status, case number)
- Navigate to individual case detail pages from the dashboard
- Role-based data visibility (redaction of sensitive information for Adopter role)
- Pagination for users with large caseloads
- Visual indicators for cases requiring attention (approaching deadlines, overdue actions)
- Responsive layout for mobile access (social workers in the field)

### Out of Scope
- Case creation (separate feature)
- Case editing or status updates from the dashboard
- Bulk case actions or selection
- Advanced search functionality (keyword search across case content)
- Caseload analytics or reporting visualisations (separate reporting feature)
- AI-generated case summaries on the dashboard
- Cross-agency case visibility beyond user's assigned cases
- Export functionality (CSV, PDF)
- Saved filter preferences or personalised views

---

## 3. Actors Involved
**Who interacts with this feature.**

### HMCTS Case Officer
- **Can do:** View all cases assigned to their court; filter and sort cases; navigate to case details; see full case information including all parties
- **Cannot do:** View cases at other courts; modify case data from dashboard

### Judge / Legal Adviser
- **Can do:** View cases listed for their court/hearing list; see full case details including AI advisory flags; filter by hearing dates
- **Cannot do:** View administrative case details outside their judicial function

### Cafcass Officer
- **Can do:** View cases where they are assigned as reporting officer; see consent status and report deadlines
- **Cannot do:** View cases not assigned to them; see internal LA case notes

### Local Authority Social Worker
- **Can do:** View cases for children under their LA's care; see placement details and timeline compliance
- **Cannot do:** View cases from other Local Authorities; see adopter personal details beyond what is appropriate

### Voluntary Adoption Agency Worker
- **Can do:** View cases involving adopters assessed by their agency; see adopter application status
- **Cannot do:** View cases not involving their agency's adopters; see birth family identifying information

### Adopter
- **Can do:** View only their own case(s); see application status and next steps; see redacted case information appropriate to their role
- **Cannot do:** View other cases; see birth family identifying information; see internal agency assessments

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path
1. User logs in and is redirected to the dashboard (professional users) or "My Cases" view (Adopters)
2. System queries cases based on user's role and permissions
3. Dashboard displays a paginated list of accessible cases with key information
4. User can filter the list by status, case type, or date range
5. User can sort the list by clicking column headers
6. Cases with approaching deadlines or overdue actions are visually highlighted
7. User clicks a case row/link to navigate to case detail view

### Key Alternatives

**No Cases Found:**
- New users or users with no assigned cases see an empty state with helpful guidance
- Message explains why no cases appear and what actions might be needed

**Large Caseload:**
- Pagination controls allow navigation through results
- Default page size appropriate to user context (e.g., 20 cases per page)

**Filter Applied with No Results:**
- Clear indication that filters are active
- Easy way to clear filters and return to full list

### User-Visible Outcomes
- Immediate visibility of case workload upon login
- Clear understanding of which cases need attention
- Confidence that all accessible cases are visible
- Ability to quickly locate specific cases through filtering

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### States Displayed
This feature **reads and displays** case states but does not modify them:
- Pre-Application (if visible to user's role)
- Application (received, processing)
- Directions (issued, pending compliance)
- Consent & Reporting (awaiting consent, reports pending)
- Final Hearing (scheduled, awaiting)
- Post-Order (completed, archived)
- Non-terminal states: On Hold, Adjourned

### Feature Classification
- **State-reading:** Displays current case states without modification
- **State-constraining:** Enforces role-based visibility of states and transitions
- **Not state-creating or state-transitioning:** Dashboard is read-only

### Visibility Rules by Lifecycle Phase
| Phase | HMCTS | Judge | Cafcass | LA SW | VAA | Adopter |
|-------|-------|-------|---------|-------|-----|---------|
| Pre-Application | - | - | - | Yes | Yes | Limited |
| Application | Yes | - | - | Yes | Yes | Yes |
| Directions | Yes | Yes | Yes | Yes | Yes | Yes |
| Final Hearing | Yes | Yes | Yes | Yes | Yes | Yes |
| Post-Order | Yes | Yes | - | Yes | Yes | Yes |

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule: Case Visibility Determination
- **Description:** User can only view cases where they have a legitimate role assignment
- **Inputs:** User ID, User Role, Case party assignments, Organisation membership
- **Outputs:** List of case IDs user is permitted to view
- **Type:** Deterministic
- **Reference:** System Spec Section 7 - Access Rules (Need-to-Know)

### Rule: Role-Based Field Redaction
- **Description:** Certain case fields are hidden or redacted based on user role
- **Inputs:** User Role, Case data fields
- **Outputs:** Filtered/redacted case data
- **Type:** Deterministic
- **Redaction Examples:**
  - Adopters: Birth family names, addresses, and identifying details redacted
  - VAA Workers: Birth family addresses redacted
  - All non-HMCTS: Internal court administration notes hidden

### Rule: Attention Indicator Logic
- **Description:** Cases are flagged for attention based on deadline proximity and overdue status
- **Inputs:** Case key dates, current date, statutory deadlines
- **Outputs:** Attention level (normal, approaching deadline, overdue)
- **Type:** Deterministic
- **Thresholds:**
  - Approaching: Action due within 7 days
  - Overdue: Action past due date

### Rule: Default Sort Order
- **Description:** Cases are sorted by relevance to user workflow
- **Inputs:** User role, case dates
- **Outputs:** Ordered case list
- **Type:** Deterministic
- **Logic:** Cases requiring attention first, then by most recent activity

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- **Authentication/Session:** Login feature must establish user identity and role (feature_login)
- **Case Data Model:** Database schema for cases, parties, and dates
- **API Layer:** Protected endpoints returning case data
- **Role-Permission Mapping:** Configuration defining what each role can access

### External Systems
- None for MVP (case data is within system)
- Future: LA system integration for real-time case updates

### Policy Dependencies
- Role definitions from System Spec Section 4 must remain stable
- Redaction rules aligned with adoption data protection requirements
- Statutory deadline definitions (e.g., 10-week placement rule)

### Operational Dependencies
- Authenticated session must be active
- Database containing case records must be available

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Performance
- Dashboard load time: < 2 seconds for up to 100 cases
- Filter/sort operations: < 500ms response
- Pagination: < 1 second per page load
- Must remain responsive under concurrent multi-agency access

### Accessibility
- WCAG 2.1 AA compliance required
- Table must be navigable by screen readers
- Filter controls must be keyboard accessible
- Status indicators must not rely solely on colour
- Mobile-responsive for field workers

### Audit/Logging
- Log dashboard access per user for audit purposes
- Log filter/search actions for usage analytics
- No case data in logs (only case IDs and action types)

### Security
- All case data transmitted over HTTPS
- Session validation on every API request
- Case visibility enforced at API level, not just UI
- No caching of sensitive case data in browser

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. Cases exist in the database (seeded or created via other features)
2. User-to-case assignment model is defined (how users are linked to cases)
3. Case status values are enumerated and consistent
4. Key dates (application date, hearing dates, deadlines) are reliably populated
5. Party information is structured to support redaction logic
6. GOV.UK Design System provides suitable table/list components

### Open Questions
1. **Case Assignment Model:** How are professional users assigned to cases? By organisation only, or explicit assignment per case?
2. **Adopter Multi-Case View:** Can an adopter have multiple active cases? (e.g., sibling adoptions)
3. **Cross-Court Visibility:** Can HMCTS officers see cases transferred from other courts?
4. **Deadline Calculation:** Are statutory deadlines calculated from case data or manually set?
5. **Case Count Display:** Should the dashboard show total case counts per status as summary cards?

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### System Spec Alignment Assessment

This feature **reinforces** existing system assumptions:
- Implements "Dashboards, case progression tracking" from Section 3 In Scope
- Exercises "Need-to-Know" and "Role-Based Views" access rules from Section 7
- Fulfils the dashboard destination established in login feature redirect logic
- Aligns with GOV.UK Design System patterns per Section 12.9

### Clarifications Required

The System Spec does not explicitly define:
- **User-Case Assignment Model:** Section 7 states "users can only access cases where they have a legitimate role" but does not specify the mechanism (organisation membership, explicit assignment, or both)
- **Dashboard vs. My Cases Distinction:** The roles config shows Adopters redirect to `/my-cases` while professionals go to `/dashboard` - this feature should clarify whether these are the same component with different views or separate pages

### No Contradictions Identified

The feature operates within the boundaries set by the system specification. The read-only nature of the dashboard and strict role-based visibility align with system access rules.

### Recommendation
The user-case assignment model should be clarified as a technical design decision during implementation. This does not require a system spec change but should be documented in the implementation plan.

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
1. **Case List API:** Backend endpoint returning filtered, paginated cases for the authenticated user
2. **Case Visibility Logic:** Implementation of role-based case access rules
3. **Dashboard Page Layout:** GOV.UK-compliant table/list display of cases
4. **Filter Controls:** UI for filtering by status, type, and date range
5. **Sort Functionality:** Column sorting with visual indicators
6. **Attention Indicators:** Visual highlighting of cases needing action
7. **Empty States:** Handling of no-cases and no-results scenarios
8. **Pagination:** Navigation for large case lists
9. **Case Navigation:** Click-through to case detail pages
10. **Adopter View:** Simplified "My Cases" view for adopter role

### Expected Story Boundaries
- API and visibility logic stories should be backend-focused
- UI stories should follow GOV.UK Design System patterns
- Filter, sort, and pagination can be combined or split based on complexity
- Adopter view may be a variant of the main dashboard or a separate story

### Areas Needing Careful Story Framing
- **Role-Based Redaction:** Must be tested across all six roles with specific acceptance criteria per role
- **Performance Testing:** Large caseload scenarios should have explicit acceptance criteria
- **Accessibility:** Each UI story should include accessibility acceptance criteria
- **Empty States:** Should be designed with trauma-informed principles for adopters seeing no case progress

### Recommended Story Sequence
1. Case list API with visibility logic (backend foundation)
2. Dashboard page layout with basic case display
3. Filter controls
4. Sort functionality
5. Pagination
6. Attention indicators
7. Empty state handling
8. Adopter "My Cases" view (if separate from dashboard)

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-04 | Initial feature specification created | Implement case dashboard as primary post-login landing page for adoption case management | Alex |
