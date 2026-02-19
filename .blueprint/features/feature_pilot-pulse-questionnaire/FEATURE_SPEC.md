# Feature Specification — Pilot Pulse Questionnaire

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** The Specification-Led Agentic Delivery pilot lacks a lightweight, recurring mechanism to surface structural clarity signals from the people doing the work. Informal conversations and ad-hoc retrospectives produce anecdotal data; they cannot reveal trends in structural maturity or role-level misalignment over time.

- **User or system need:** Pilot Builders and SMEs need a repeatable, low-friction tool to record their perception of structural conditions — authority, intent clarity, lifecycle coherence, architectural discipline — so that the pilot can track whether the structural preconditions described in `.business_context/Specification-Led-Agentic-Delivery-Pilot.md` are being met and whether they are improving.

- **How this supports the system purpose:** This feature is part of the pilot delivery infrastructure. It operationalises the four Structural Preconditions (Section 3 of the pilot spec) as measurable, time-series evidence. Scores and trends can be reviewed alongside pilot delivery metrics, providing a richer picture of whether structural maturity is genuinely increasing. It does not affect adoption case processing or production workflows.

> **System Spec Alignment:** Supports `.blueprint/system_specification/SYSTEM_SPEC.md` Sections 8 (Observability) and 9 (Non-Functional Expectations — specifically availability and monitoring). Classified as internal pilot delivery infrastructure, not a production adoption feature.

---

## 2. Scope

### In Scope
- A questionnaire form accessible from the `/pilot` dashboard, restricted to `PILOT_BUILDER` and `PILOT_SME` roles
- 12 Likert-scale questions (1–5: Strongly Disagree → Strongly Agree) across 4 sections, matching the structure in `.business_context/questionnaire.md`:
  - **Section 1 — Authority & Decision Structure** (Q1–Q3)
  - **Section 2 — Service Intent & Boundaries** (Q4–Q6)
  - **Section 3 — Lifecycle & Operational Modelling** (Q7–Q9)
  - **Section 4 — Architectural & Dependency Discipline** (Q10–Q12)
- One optional free-text field: *"Where does structural clarity feel weakest right now?"*
- Respondents may submit the questionnaire at any time; no enforcement of the bi-weekly cadence at system level (cadence is a governance convention, not a technical constraint)
- Server-side score computation on submission:
  - **Structural Score** per section: `mean(first two questions in section)`
  - **Clarity Score** per section: `third question in section`
  - **Alignment Index** per section: `standard deviation of each question across roles, then mean across section` (computed at read/visualisation time across all responses in a time window, not on individual submission)
- Persistence to a new dedicated PostgreSQL table `pilot_pulse_responses`
- Role is recorded with each response (not user identity — see Section 8)
- A visualisation page accessible via sidenav link, visible to all pilot roles, showing per-section trend charts:
  - Mean Structural Score trend line (per section)
  - Mean Clarity Score trend line (per section)
  - Variance band (Alignment Index) per section over time
- Governance signal flags computed and displayed on the visualisation page:
  - 🔴 Structural Score < 3.0 (any section, latest pulse)
  - 🔴 Alignment Index ≥ 1.0 (any section, latest pulse)
  - 🟠 Structural stable but Clarity falling (two consecutive pulses)
  - 🟠 Variance increasing over two consecutive pulses
- Sidenav entry for the visualisation page under the existing pilot navigation

### Out of Scope
- Enforced bi-weekly scheduling or deadline reminders (cadence is manual/governance-driven)
- Individual response attribution (no display of who submitted which response; role-level only)
- Export or download of raw response data
- Integration with the existing MetricEntry system from the `feature_adoption-pilot` feature (pulse responses are a distinct data domain)
- Editing or deleting submitted responses
- Admin tooling for managing questionnaire structure (questions are static for the pilot duration)
- Trend inference with fewer than 3 pulse windows (system surfaces this as insufficient data)

---

## 3. Actors Involved

### PILOT_BUILDER
- **Can do:** Submit the questionnaire (as Builder role), view the visualisation page and all trend data
- **Cannot do:** Submit a response attributed to a different role; edit or delete responses

### PILOT_SME
- **Can do:** Submit the questionnaire (as SME role), view the visualisation page and all trend data
- **Cannot do:** Submit a response attributed to a different role; edit or delete responses

### PILOT_DELIVERY_LEAD
- **Can do:** View the visualisation page and trend data; interpret governance signal flags
- **Cannot do:** Submit questionnaire responses

### PILOT_OBSERVER
- **Can do:** View the visualisation page and trend data
- **Cannot do:** Submit questionnaire responses

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path — Submission
1. Authenticated user with `PILOT_BUILDER` or `PILOT_SME` role navigates to the `/pilot` dashboard
2. User selects the pulse questionnaire link from the pilot sidenav or dashboard
3. User is presented with the questionnaire: 4 sections, 3 questions each (12 total), all Likert 1–5 radio groups, plus one optional free-text field
4. User completes all required questions and optionally provides free text
5. User submits; server validates and computes section-level Structural and Clarity scores
6. Response is persisted to `pilot_pulse_responses` with role, timestamp, scores, and optional free text
7. User receives confirmation and is returned to the pilot dashboard

### Happy Path — Visualisation
1. Any pilot-role user navigates to the visualisation page via the sidenav
2. System retrieves all responses and groups them into bi-weekly time windows (by submission date)
3. Per-section, per-window aggregates are computed: mean Structural Score, mean Clarity Score, Alignment Index (std dev across roles)
4. Trend charts are displayed; governance signal flags are evaluated against the latest window
5. If fewer than 3 windows exist, a "Insufficient data for trend inference" notice is shown above the charts

### Key Alternatives
**Partial submission:** All 12 Likert questions are required. Free text is optional. Client-side and server-side validation prevent partial submission.

**No data yet:** Visualisation page renders empty state with guidance on completing the first pulse.

**Single role submitting (no cross-role variance):** Alignment Index is undefined when only one role has responded in a window; the system displays this as "Insufficient role diversity for alignment calculation" and suppresses the variance band for that window.

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### Response Lifecycle
Pulse responses are **immutable records**. Once submitted, they cannot be altered or deleted by any user.

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| **Submitted** | Response recorded and scored | Successful form submission |

### Visualisation Window Lifecycle
Time windows are computed dynamically at read time. No window state is persisted — aggregation is always derived from the underlying `pilot_pulse_responses` table.

### Feature Classification
- **State-creating:** Yes — creates `pilot_pulse_responses` records
- **State-transitioning:** No — does not affect adoption case state or pilot phase state
- **State-constraining:** No — does not gate any other system behaviour

---

## 6. Rules & Decision Logic

### Rule: Required Fields
- **Description:** All 12 Likert responses (Q1–Q12) must be present and in range [1, 5]
- **Inputs:** Submission payload
- **Outputs:** Stored response or 400 validation error listing missing/invalid fields
- **Type:** Deterministic

### Rule: Structural Score Computation
- **Description:** `StructuralScore[section] = mean(Q[n], Q[n+1])` where `n` and `n+1` are the first two questions in the section (Q1+Q2, Q4+Q5, Q7+Q8, Q10+Q11)
- **Inputs:** Validated question responses
- **Outputs:** Four decimal Structural Scores stored with the response
- **Type:** Deterministic

### Rule: Clarity Score Computation
- **Description:** `ClarityScore[section] = Q[n]` where `n` is the third question in the section (Q3, Q6, Q9, Q12)
- **Inputs:** Validated question responses
- **Outputs:** Four Clarity Scores (raw response value) stored with the response
- **Type:** Deterministic

### Rule: Alignment Index Computation (Read-Time)
- **Description:** For a given time window, compute standard deviation of each question's responses across all respondents, then `AlignmentIndex[section] = mean(std dev of questions in section)`
- **Inputs:** All responses in time window
- **Outputs:** Alignment Index per section per window
- **Type:** Deterministic
- **Thresholds:**
  - `< 0.5` → Strong alignment
  - `0.5–0.9` → Moderate misalignment
  - `≥ 1.0` → Structural misalignment risk (🔴 flag)
- **Edge case:** Fewer than 2 respondents or a single role in window → alignment suppressed; warning displayed

### Rule: Time Window Grouping
- **Description:** Responses are grouped into bi-weekly (14-day) windows, anchored from the earliest response date in the dataset. Each window is labelled by its start date.
- **Inputs:** All `pilot_pulse_responses` ordered by `submitted_at`
- **Outputs:** Ordered sequence of time windows with aggregated scores
- **Type:** Deterministic

### Rule: Governance Signal Evaluation
- **Description:** Signals evaluated against the most recent complete window
- **Inputs:** Latest window aggregates
- **Outputs:** Active signal flags displayed on visualisation page
- **Type:** Deterministic
- **Signals:**
  - 🔴 Any section Structural Score < 3.0
  - 🔴 Any section Alignment Index ≥ 1.0
  - 🟠 Any section where Structural Score is stable (±0.1) but Clarity Score has fallen vs previous window
  - 🟠 Any section where Alignment Index has increased for two consecutive windows

### Rule: Role Attribution
- **Description:** Submitted role is derived from the authenticated session (`req.session.user.role`), not from user input. The record stores role, not user identity.
- **Inputs:** Session role
- **Outputs:** Role field on stored response
- **Type:** Deterministic

---

## 7. Dependencies

### System Components
- **Authentication / Session middleware:** Required to identify submitting user's role; uses existing `requireAuth` middleware from `server/src/middleware/authMiddleware.ts`
- **PostgreSQL:** New `pilot_pulse_responses` table; new migration required
- **Pilot dashboard sidenav:** Requires a new navigation entry for the questionnaire and visualisation pages
- **Pilot role configuration:** `PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER` roles already defined in `server/src/config/roles.ts`

### External Systems
- None

### Policy Dependencies
- Bi-weekly cadence is a governance convention, not a system constraint; the feature must not enforce it
- Free-text field must include a reminder that personal data should not be included (as stated in `.business_context/questionnaire.md`)
- Alignment Index methodology aligns with shared mental model research (Mathieu et al., 2000; Weick & Sutcliffe, 2001) as referenced in the business context

### Operational Dependencies
- Sufficient pilot participation (minimum 3 bi-weekly windows and cross-role responses) before trend inference is meaningful; system surfaces this via insufficient data notices rather than suppressing the feature

---

## 8. Non-Functional Considerations

### Privacy & Anonymity
- Responses store **role only**, not user identity (no user ID, name, or session identifier stored beyond role)
- This is a deliberate design choice: the questionnaire measures role-level structural perception, not individual attribution
- Free-text content must be treated as potentially sensitive delivery commentary; it must not be indexed or exposed beyond authenticated pilot roles

### Auditability
- Every submission is persisted immutably with `submitted_at` timestamp and role
- No deletion mechanism is exposed; responses are permanent records of the pilot
- Server-side score computation ensures scores are reproducible from stored question values

### Performance
- Questionnaire form load: no latency concerns (static form)
- Visualisation page: aggregation must complete within 3 seconds for expected pilot dataset (tens to low hundreds of responses)
- Aggregation is performed server-side; raw responses are not sent to the client

### Accessibility
- All form controls must meet WCAG 2.1 AA; radio button groups must use GOV.UK radios pattern with visible labels and fieldset/legend
- Charts must include accessible alternatives (e.g. summary table of trend data below each chart)

### Security
- Submission endpoint restricted to `PILOT_BUILDER` and `PILOT_SME` roles
- Visualisation endpoint readable by all pilot roles
- Free-text sanitised server-side before storage to prevent stored XSS

---

## 9. Assumptions & Open Questions

### Assumptions
1. The four pilot roles (`PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER`) exist and are usable for authentication as-is
2. The 12 questions and 4 sections are fixed for the pilot duration; no dynamic question management is needed
3. Trend inference from fewer than 3 windows is suppressed with a notice; this is acceptable UX for an internal pilot tool
4. The bi-weekly cadence is a governance norm, not a system enforcement; users are trusted to respect the cadence
5. A charting library is available or acceptable to add as a dependency for the trend visualisation (e.g. Recharts, which is compatible with the existing React stack)
6. Alignment Index across roles is meaningful only when both `PILOT_BUILDER` and `PILOT_SME` have responded in a window; single-role windows produce an incomplete signal which is surfaced rather than hidden

### Open Questions
1. **Charting library:** Is Recharts the preferred library, or is there a constraint against adding new frontend dependencies?
2. **Window anchoring:** Should time windows be anchored to a fixed pilot start date (set by the Builder), or calculated dynamically from first response? Fixed anchor produces more stable window labels but requires a configuration step.
3. **Free-text visibility:** Is the free-text field visible to all pilot roles on the visualisation page, or only to `PILOT_BUILDER` and `PILOT_DELIVERY_LEAD`? Default assumption is all pilot roles.
4. **Sufficient data threshold:** Is 3 windows the right minimum before trend inference is shown, or should this be 2?
5. **Historical responses:** If the questionnaire is introduced mid-pilot, should responses be backdated, or is the timestamp authoritative?

---

## 10. Impact on System Specification

### System Spec Alignment Assessment
This feature **reinforces** the system specification without contradicting it. It is pilot delivery infrastructure (Observability, Section 8) and does not touch adoption case management, party data, or court processes.

### Tensions Identified

**Tension: Anonymity vs Full Audit Trail**
- `.blueprint/system_specification/SYSTEM_SPEC.md` Section 7 requires a full audit trail: every action logged with user, timestamp, and action details
- This feature deliberately stores **role only**, not user identity, to protect the psychological safety of pilot participants giving honest structural feedback
- **Resolution proposed:** The audit trail requirement applies to case management actions affecting adoption proceedings. Pulse questionnaire submissions are internal delivery health signals, not case actions. Role-level attribution with immutable timestamp is sufficient for this domain. No system spec change is required, but this boundary distinction should be recorded explicitly.
- **Flag for decision:** Confirm that audit trail rule is not intended to apply to internal pilot measurement tooling. If it is, individual user attribution must be added to the schema, which may suppress honest responses.

**Tension: System Boundary (Pilot Tooling vs Product)**
- The existing `feature_adoption-pilot` FEATURE_SPEC notes that pilot tooling sits outside the production system boundary. The pulse questionnaire is consistent with this classification.
- No system spec change required; classification stands.

---

## 11. Handover to BA (Cass)

### Story Themes
1. **Questionnaire Submission:** As a `PILOT_BUILDER` or `PILOT_SME`, I can navigate to and complete the pulse questionnaire, providing Likert responses for all 12 questions and optionally free text, and submit it to be stored
2. **Score Computation:** Structural Score and Clarity Score are computed server-side on submission and stored alongside raw responses
3. **Visualisation — Trend Charts:** As any pilot role, I can view per-section trend line charts (Structural Score, Clarity Score, variance band) over time, grouped into bi-weekly windows
4. **Governance Signal Flags:** Active signal flags (🔴/🟠) are evaluated and displayed on the visualisation page based on the latest complete window
5. **Insufficient Data Notice:** When fewer than 3 windows exist, the system surfaces a clear notice rather than misleading trend inference
6. **Sidenav Navigation:** The questionnaire form and visualisation page are accessible via sidenav entries under the pilot navigation
7. **Role-Based Access:** Submission is restricted to Builder and SME roles; viewing is open to all pilot roles

### Expected Story Boundaries
- Database migration and API (submit + retrieve) should be a distinct story from the frontend questionnaire form
- Score computation logic should have explicit acceptance criteria asserting reproducibility for a fixed input set
- Visualisation/charts can be split: one story for data aggregation API, one story for chart rendering
- Governance signal flag logic should be a distinct, testable backend concern with clear threshold acceptance criteria

### Areas Needing Careful Story Framing
- **Anonymity:** Acceptance criteria must explicitly assert that no user identity (user ID, username) is stored with a response — only role and timestamp
- **Alignment Index edge cases:** Stories for the visualisation must cover the single-role window case and surface it correctly rather than silently producing misleading variance
- **Accessibility:** Chart stories must include an accessible fallback (data table) alongside the visual representation
- **Free-text safety:** The submission story must include server-side sanitisation as a mandatory acceptance criterion

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-07-11 | Initial feature specification created | Define pilot pulse questionnaire for Specification-Led Agentic Delivery pilot | Alex |
