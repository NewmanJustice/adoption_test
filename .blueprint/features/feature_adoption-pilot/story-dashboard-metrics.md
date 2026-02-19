# Story — Metrics dashboard with filters

## User story
As a Builder or Observer, I want a metrics dashboard with filters so that I can review pilot progress and completeness.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Summary cards show latest values**
- Given I have read access to the pilot dashboard,
- When the dashboard loads,
- Then summary cards display the latest value per metric for the selected filters (date range, phase, loop number, experiment type).

**AC-2 — Filters update summaries and trends**
- Given the dashboard is open,
- When I change any filter and apply it,
- Then summary cards and trend charts refresh using the updated filter set.

**AC-3 — Incomplete metric indicators**
- Given the selected window lacks required metric keys,
- When the dashboard renders,
- Then an “incomplete” indicator is shown, missing metrics are listed, and the completeness score is reduced.

**AC-4 — Performance targets**
- Given a typical date range is selected,
- When the dashboard loads,
- Then summary values render within 2 seconds and trend data within 3 seconds.

**AC-5 — Read-only for observers**
- Given I am an Observer,
- When I view the dashboard,
- Then no create or edit controls are available.

## Technical Notes
- All metric keys and error codes are strictly type-checked in the backend for safety and maintainability.

## Out of scope
- External reporting integrations or export tooling
- Displaying live adoption case data
