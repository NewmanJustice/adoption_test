# Story — Compare mode (pilot vs control)

## User story
As a Delivery Lead, I want compare mode to show pilot vs control deltas so that we can evaluate impact across the same period.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Calculate deltas with control data**
- Given pilot and control data exist for the selected period,
- When I enable compare mode,
- Then each summary card shows pilot value, control value, delta (P − C), and a directional indicator.

**AC-2 — Handle missing control data**
- Given control data is missing for the selected period,
- When I enable compare mode,
- Then pilot-only summaries are shown with a warning and no delta values.

**AC-3 — Use consistent aggregation inputs**
- Given compare mode is enabled,
- When summary values are computed,
- Then pilot and control values use the same date range, buckets, and metric-type aggregation rules.

**AC-4 — Toggle compare mode off**
- Given compare mode is enabled,
- When I disable compare mode,
- Then the dashboard returns to the single experiment type view with the previous filters preserved.

**AC-5 — Trend alignment**
- Given compare mode is enabled and trend data is available,
- When trends are displayed,
- Then pilot and control series align to the same time buckets.

## Out of scope
- Statistical significance testing or confidence intervals
