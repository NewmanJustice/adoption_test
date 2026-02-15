# Story — Spec Freeze and deviation logging

## User story
As a Builder, I want to record a Spec Freeze and log post-freeze deviations so that structural changes are auditable.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Record Spec Freeze**
- Given the pilot is configured,
- When I confirm Spec Freeze,
- Then a Spec Freeze timestamp is recorded and displayed in the pilot overview.

**AC-2 — Prevent Spec Freeze changes**
- Given a Spec Freeze timestamp already exists,
- When any user attempts to change or clear it,
- Then the action is blocked and the timestamp remains unchanged.

**AC-3 — Restrict Spec Freeze to Builder**
- Given a user is not a Builder,
- When they attempt to set Spec Freeze,
- Then access is denied.

**AC-4 — Log post-freeze deviations**
- Given Spec Freeze is set,
- When a structural change event is recorded,
- Then a deviation entry is created with timestamp, user, and affected area/metric.

**AC-5 — Do not log deviations pre-freeze**
- Given Spec Freeze is not set,
- When a structural change event is recorded,
- Then no deviation entry is created.

**AC-6 — Surface deviations with metrics**
- Given deviations exist for a selected period,
- When I view the pilot dashboard,
- Then the deviations are listed alongside the affected metrics.

## Out of scope
- Approval workflows for deviation exceptions
- Editing or deleting deviation entries
