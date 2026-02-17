# Feature Specification — Adoption Pilot

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** The adoption programme needs a bounded, measurable pilot to evaluate Specification-Led Agentic Delivery before committing to broad rollout. Without a defined pilot structure, learning remains anecdotal and risks repeating lifecycle instability.

- **User or system need:** Delivery leadership and SMEs need a way to configure a pilot, capture structured metrics, and review outcomes with clear comparators (pilot vs control) across the pilot lifecycle.

- **How this supports the system purpose:** The pilot provides a controlled path to deliver the adoption platform with higher structural clarity and reduced rework, aligning with the intent and observability expectations in `.blueprint/system_specification/SYSTEM_SPEC.md`.

> **System Spec Alignment:** Supports `.blueprint/system_specification/SYSTEM_SPEC.md` Sections 1 (Purpose & Intent), 8 (Observability), and 9 (Non-Functional Expectations). It does not alter adoption case behaviour or user journeys.

---

## 2. Scope
### In Scope
- Define pilot configuration: domain scope, pilot, and phase tracking
- Record pilot lifecycle milestones, including Spec Freeze timestamp
- Capture MetricEntry records for pilot metrics (structural integrity, predictability, NFR posture, SME alignment, governance)
- Deterministic aggregation for latest values and trend series (time bucketing by date range)
- Strict type enforcement for error codes, metric keys, and user roles to ensure type safety in all pilot APIs
- Dashboard views with filters for date range, phase, loop number, and experiment type (pilot/control/compare)
- Audit trail for metric creation/updates and pilot phase transitions
- Displaying the pilot specification content as navigable React pages, with sections structured as TypeScript data and rendered under /pilot/about
- Sidebar navigation dynamically lists all pilot guidance sections, allowing users to jump directly to each section as a native page
- Content stored in client/src/data/pilotSpecification.ts as structured TypeScript data with proper typing
- Guidance on how the dashboard behaviour works, and what steps they need to take, tailored to the current Actor

### Out of Scope
- Production adoption case workflows or live case data
- Automated legal or operational decisions based on pilot metrics
- Long-term analytics beyond the pilot’s defined timeframe
- External reporting integrations or export tooling
- Replacement of operational monitoring for the live platform

---

## 3. Actors Involved
**Who interacts with this feature.**

### Builder (Technical Authority)
- **Can do:** Configure pilot scope, confirm Spec Freeze, review metrics and deviations
- **Cannot do:** Override metric aggregation rules or alter recorded history

### SME (Domain Expert)
- **Can do:** Provide feedback inputs, review prototype outcomes, add contextual notes to metrics
- **Cannot do:** Change pilot configuration or phase state

### Delivery Lead / Pilot Coordinator
- **Can do:** Manage pilot phases, ensure metric entry coverage, view dashboard and compare mode
- **Cannot do:** Change aggregation logic or delete metric records

### Analyst / Observer
- **Can do:** Read dashboard metrics, view trend series, export read-only summaries (if available)
- **Cannot do:** Create or modify metric entries, change pilot phases

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path
1. Delivery Lead configures pilot scope and confirms experiment type (pilot)
2. Phase 1 begins; pilot artefacts are produced and Spec Freeze is recorded
3. Metric entries are captured during phases (manual or automated sources)
4. Dashboard aggregates latest values and trend series using deterministic rules
5. Users filter by date range, phase, or loop to review progress
6. Compare mode shows pilot vs control deltas for the same period
7. Deviations post-freeze are logged and surfaced alongside metrics

### Key Alternatives
**Incomplete Metrics:**
- Missing data yields “incomplete” indicators and reduces completeness score
- Dashboard shows which metrics are missing for the selected window

**Compare Mode Without Control Data:**
- System returns pilot-only summaries with a warning
- Delta calculations are suppressed when control data is absent

**Spec Freeze Breach:**
- Post-freeze structural changes are logged as deviations
- Deviations are visible in the dashboard alongside affected metrics

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### Pilot Lifecycle Phases
This feature manages a pilot-specific lifecycle (distinct from adoption case states):

| Phase | Description | Entry Condition |
|-------|-------------|-----------------|
| **Phase 1 – Structural Foundation** | Outcome, domain, state, event models, NFR envelope defined | Pilot configured |
| **Phase 2 – Agentic Specification Loops** | Prototype generation, SME feedback, spec mutation cycles | Spec Freeze timestamp set |

### Feature Classification
- **State-creating:** Yes — creates pilot configuration and Spec Freeze records
- **State-transitioning:** Yes — moves pilot through phases
- **State-constraining:** Yes — enforces logging of deviations post-freeze

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule: MetricEntry Schema
- **Description:** Every metric must include `metricKey`, `value`, `unit`, `date`, `phase`, `experimentType`, and `role`
- **Inputs:** Metric submission payload
- **Outputs:** Stored metric entry or validation error
- **Type:** Deterministic

### Rule: Time Bucketing
- **Description:** Trend buckets depend on date range length
- **Inputs:** From/to date range
- **Outputs:** Daily (≤14 days), weekly (15–90 days, ISO week), monthly (>90 days)
- **Type:** Deterministic

### Rule: Latest Value Selection
- **Description:** Latest metric value uses max(date) then max(createdAt)
- **Inputs:** Metric entries for a key
- **Outputs:** Single latest value for summary cards
- **Type:** Deterministic

### Rule: Trend Aggregation by Metric Type
- **Description:** Aggregation depends on metric type
- **Inputs:** Metric entries, metric type mapping
- **Outputs:** Aggregated values per bucket
- **Type:** Deterministic
- **Mapping:**
  - Percent/Score metrics → AVG(value)
  - Count metrics → SUM(value)
  - Time metrics → AVG(value)

### Rule: Spec Freeze Deviation Logging
- **Description:** Any post-freeze structural change must create a deviation record
- **Inputs:** Change event, Spec Freeze timestamp
- **Outputs:** Deviation log entry linked to affected metrics
- **Type:** Deterministic

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- **Authentication/Session:** Internal pilot roles must be authenticated
- **Metrics Store:** Persistent storage for MetricEntry records and deviation logs
- **Dashboard UI:** Read-only views and filters for metrics and comparisons
- **Audit Logging:** Immutable logging for metric creation and phase transitions

### External Systems
- None required for MVP (optional future export to reporting tools)

### Policy Dependencies
- Security and audit expectations from `.blueprint/system_specification/SYSTEM_SPEC.md` Section 9
- Data sensitivity handling aligned with `.blueprint/system_specification/SYSTEM_SPEC.md` Section 7 (Audit & Compliance Rules)

### Operational Dependencies
- Named Builder and SME availability (per pilot preconditions)
- Defined control sprint for comparison metrics

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Determinism & Auditability
- All aggregation rules must be deterministic and reproducible
- Metric history must be immutable and auditable
- Deviations post-freeze must be traceable to the change event

### Performance
- Dashboard summary load: < 2 seconds for typical ranges
- Trend aggregation computed within acceptable interactive latency (< 3 seconds)

### Security
- Pilot metrics may contain sensitive delivery information; enforce role-based access
- No deletion of metrics without explicit administrative override and audit record

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. A bounded adoption sub-domain is selected that meets pilot scope criteria
2. Metric definitions and metric key taxonomy are stable for the pilot duration
3. A control sprint is executed with comparable lifecycle complexity
4. Builder and SME roles are assigned and available for rapid feedback loops
5. Metric entries are captured consistently (manual or automated sources defined)

### Open Questions
1. **Metric Capture Mechanism:** Which metrics are automated vs manually entered?
2. **Pilot Scope Selection:** Which adoption workflow/module is the pilot domain?
3. **Spec Freeze Governance:** Who approves changes after freeze and how are exceptions recorded?
4. **Data Sensitivity:** Will any pilot metrics reference real case data or only delivery artefacts?
5. **Dashboard Audience:** Is read-only access required for wider stakeholders beyond the pilot team?

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### System Spec Alignment Assessment
This feature **stretches but does not contradict** the system specification:
- It is a delivery/measurement capability, not a production adoption workflow
- It aligns with `.blueprint/system_specification/SYSTEM_SPEC.md` Sections 8 (Observability) and 9 (Non-Functional Expectations)

### Tensions Identified
**Tension: System Boundary Clarity**
- The system specification defines adoption platform boundaries but does not explicitly cover pilot delivery tooling
- **Recommendation:** Treat pilot tooling as internal delivery infrastructure outside the production system boundary. No system spec change required unless pilot tooling becomes a permanent product module.

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
1. **Pilot Configuration:** Define pilot scope, experiment type, and phase tracking
2. **Metric Entry Capture:** Create and validate MetricEntry records
3. **Aggregation Engine:** Implement deterministic bucketing and summary logic
4. **Dashboard Views:** Summary cards, trend charts, and filter controls
5. **Spec Freeze & Deviations:** Record freeze timestamp and post-freeze deviations
6. **Role-Based Access:** Permissions for Builder, SME, Delivery Lead, Observer
7. **Audit Logging:** Immutable metric and phase change records

### Expected Story Boundaries
- Aggregation logic should be a backend-focused story with clear acceptance criteria
- Dashboard UI can be split into summary and trend/compare stories
- Spec Freeze and deviation tracking should be distinct from metric capture

### Areas Needing Careful Story Framing
- **Determinism:** Acceptance criteria must assert reproducible results for a fixed data set
- **Access Control:** Explicit tests for write vs read permissions per role

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-05 | Initial feature specification created | Define bounded adoption pilot for Specification-Led Agentic Delivery | Alex |
| 2026-02-17 | Updated pilot spec content delivery approach | Changed from API-fetched markdown to native React data structure for better performance and type safety | Developer |
