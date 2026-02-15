# Story — Deterministic aggregation engine

## User story
As an Analyst, I want deterministic aggregation of metric entries so that summaries and trends are reproducible.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Daily buckets for short ranges**
- Given a date range of 14 days or fewer,
- When I request a trend series,
- Then the results are grouped into daily buckets.

**AC-2 — Weekly buckets for medium ranges**
- Given a date range between 15 and 90 days,
- When I request a trend series,
- Then the results are grouped by ISO week.

**AC-3 — Monthly buckets for long ranges**
- Given a date range greater than 90 days,
- When I request a trend series,
- Then the results are grouped into monthly buckets.

**AC-4 — Latest value selection**
- Given multiple entries exist for a metric key,
- When the latest value is calculated,
- Then the entry with max(`date`) and then max(`createdAt`) is selected.

**AC-5 — Metric-type aggregation rules**
- Given metric entries are aggregated,
- When the metric type is percent/score, count, or time,
- Then the aggregation uses AVG for percent/score, SUM for count, and AVG for time.

**AC-6 — Deterministic output**
- Given the same dataset and filter inputs,
- When aggregation is run multiple times,
- Then the outputs are identical.

## Out of scope
- Custom per-metric aggregation overrides beyond the defined mapping
- Predictive or statistical forecasting
