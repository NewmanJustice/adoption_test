# Test Spec — Adoption Pilot

## Brief understanding
- Pilot configuration defines scope, experiment type, and initializes phase state.
- Metric entries require validated fields, role-based write access, and history retention.
- Aggregation applies deterministic bucketing and metric-type rules for summaries.
- Dashboard filters drive summary/trend refresh with completeness indicators and read-only views.
- Spec Freeze gates phase progression and deviations are logged post-freeze.
- Phase transitions enforce gating (Phase 2 requires Spec Freeze) and visibility.
- Business context guidance displays .business_context/Specification-Led-Agentic-Delivery-Pilot.md.
- Actor-tailored guidance shows role-specific dashboard instructions with dismissal preference.
- Audit logs capture metric and phase changes with immutable records.

## AC → Test ID mapping
| Story (path) | AC | Test ID |
| --- | --- | --- |
| story-pilot-configuration.md | AC-1 | TC-AP-001 |
| story-pilot-configuration.md | AC-2 | TC-AP-002 |
| story-pilot-configuration.md | AC-3 | TC-AP-003 |
| story-pilot-configuration.md | AC-4 | TC-AP-004 |
| story-pilot-configuration.md | AC-5 | TC-AP-005 |
| story-metric-entry-capture.md | AC-1 | TC-AP-006 |
| story-metric-entry-capture.md | AC-2 | TC-AP-007 |
| story-metric-entry-capture.md | AC-3 | TC-AP-008 |
| story-metric-entry-capture.md | AC-4 | TC-AP-009 |
| story-metric-entry-capture.md | AC-5 | TC-AP-010 |
| story-metric-entry-capture.md | AC-6 | TC-AP-011 |
| story-aggregation-engine.md | AC-1 | TC-AP-012 |
| story-aggregation-engine.md | AC-2 | TC-AP-013 |
| story-aggregation-engine.md | AC-3 | TC-AP-014 |
| story-aggregation-engine.md | AC-4 | TC-AP-015 |
| story-aggregation-engine.md | AC-5 | TC-AP-016 |
| story-aggregation-engine.md | AC-6 | TC-AP-017 |
| story-dashboard-metrics.md | AC-1 | TC-AP-018 |
| story-dashboard-metrics.md | AC-2 | TC-AP-019 |
| story-dashboard-metrics.md | AC-3 | TC-AP-020 |
| story-dashboard-metrics.md | AC-4 | TC-AP-021 |
| story-dashboard-metrics.md | AC-5 | TC-AP-022 |
| story-spec-freeze-deviations.md | AC-1 | TC-AP-023 |
| story-spec-freeze-deviations.md | AC-2 | TC-AP-024 |
| story-spec-freeze-deviations.md | AC-3 | TC-AP-025 |
| story-spec-freeze-deviations.md | AC-4 | TC-AP-026 |
| story-spec-freeze-deviations.md | AC-5 | TC-AP-027 |
| story-spec-freeze-deviations.md | AC-6 | TC-AP-028 |
| story-pilot-phase-transitions.md | AC-1 | TC-AP-029 |
| story-pilot-phase-transitions.md | AC-2 | TC-AP-030 |
| story-pilot-phase-transitions.md | AC-3 | TC-AP-031 |
| story-pilot-phase-transitions.md | AC-4 | TC-AP-032 |
| story-business-context-guidance.md | AC-1 | TC-AP-033 |
| story-business-context-guidance.md | AC-2 | TC-AP-034 |
| story-business-context-guidance.md | AC-3 | TC-AP-035 |
| story-business-context-guidance.md | AC-4 | TC-AP-036 |
| story-business-context-guidance.md | AC-5 | TC-AP-037 |
| story-actor-tailored-guidance.md | AC-1 | TC-AP-038 |
| story-actor-tailored-guidance.md | AC-2 | TC-AP-039 |
| story-actor-tailored-guidance.md | AC-3 | TC-AP-040 |
| story-actor-tailored-guidance.md | AC-4 | TC-AP-041 |
| story-actor-tailored-guidance.md | AC-5 | TC-AP-042 |
| story-actor-tailored-guidance.md | AC-6 | TC-AP-043 |
| story-actor-tailored-guidance.md | AC-7 | TC-AP-044 |
| story-audit-logging.md | AC-1 | TC-AP-045 |
| story-audit-logging.md | AC-2 | TC-AP-046 |
| story-audit-logging.md | AC-3 | TC-AP-047 |
| story-audit-logging.md | AC-4 | TC-AP-048 |
| story-audit-logging.md | AC-5 | TC-AP-049 |

## Key assumptions
- Pilot roles are authenticated and mapped to Builder/Delivery Lead/SME/Observer.
- Metric key taxonomy and metric-type mapping are predefined for the pilot.
- Dashboard filters map directly to stored metric fields and phase metadata.
- Business context document at .business_context/Specification-Led-Agentic-Delivery-Pilot.md exists.
- Guidance dismissal preference persists across user sessions.
- Audit log storage is immutable for non-admin roles.
