# Story — Attention Indicators

## User story
As a professional user, I want to see visual indicators for cases requiring urgent attention so that I can prioritise cases with approaching deadlines or overdue actions.

---

## Context / scope
- All professional users viewing the dashboard
- Visual highlighting based on deadline proximity
- Route:
  - `GET /dashboard`
- Attention levels: normal, approaching, overdue

---

## Acceptance criteria

**AC-1 — Approaching deadline indicator**
- Given a case has an action due within 7 days,
- When the case is displayed in the table,
- Then it shows an orange/amber "Approaching deadline" tag,
- And the row has a subtle visual highlight (left border or background tint).

**AC-2 — Overdue indicator**
- Given a case has an action past its due date,
- When the case is displayed in the table,
- Then it shows a red "Overdue" tag,
- And the row has a stronger visual highlight indicating urgency.

**AC-3 — Normal status (no indicator)**
- Given a case has no imminent deadlines (action due beyond 7 days),
- When the case is displayed in the table,
- Then no attention tag is shown,
- And the row uses standard styling.

**AC-4 — Default sort order by attention**
- Given I load the dashboard without explicit sort parameters,
- Then cases are sorted with overdue cases first,
- Then approaching deadline cases,
- Then normal cases (within each group, sorted by most recent activity).

**AC-5 — Non-colour-dependent indicators**
- Given attention indicators are displayed,
- Then the status is communicated via both:
  - Colour (amber/red),
  - Text label ("Approaching deadline" / "Overdue"),
- So that users with colour blindness can identify case urgency.

**AC-6 — Screen reader announcement**
- Given a screen reader user navigates to a case with attention status,
- Then the attention level is announced along with the case information,
- Using appropriate ARIA labels or visually hidden text.

---

## Attention level calculation (API)

| Condition | Attention Level | Days Until Due |
|-----------|-----------------|----------------|
| Action past due date | `overdue` | < 0 |
| Action due within 7 days | `approaching` | 0-7 |
| Action due beyond 7 days | `normal` | > 7 |

Key dates considered: next hearing date, report submission deadline, consent deadline, compliance deadline.

---

## Out of scope
- Configurable threshold days (fixed at 7 days for approaching)
- Email notifications for overdue cases
- Attention level filtering (filter by "overdue only")
- Case-specific notification preferences

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 6, Rule: Attention Indicator Logic)
- GOV.UK: Tag component (with colour variants)
