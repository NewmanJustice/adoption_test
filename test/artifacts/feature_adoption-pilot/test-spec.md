# Test Spec — Adoption Pilot

## Brief understanding
- Pilot configuration defines scope, experiment type, and initializes phase state.
- Metric entries require validated fields, role-based write access, and history retention.
- Aggregation applies deterministic bucketing and metric-type rules for summaries.
- Dashboard filters drive summary/trend refresh with completeness indicators and read-only views.
- Spec Freeze gates phase progression and deviations are logged post-freeze.
- Phase transitions enforce gating (Phase 2 requires Spec Freeze) and visibility.
- Business context guidance displays .business_context/Specification-Led-Agentic-Delivery-Pilot.md.
- Actor-tailored guidance shows role-specific dashboard instructions with dismissal preference and contextual help.
- Audit logs capture metric and phase changes with immutable records.

## AC → Test ID mapping
| Story (path) | AC | Test ID | Scenario |
| --- | --- | --- | --- |
| story-pilot-configuration.md | AC-1 | TC-AP-001 | Pilot config creation |
| story-pilot-configuration.md | AC-2 | TC-AP-002 | Field validation |
| story-pilot-configuration.md | AC-3 | TC-AP-003 | Lifecycle initialization |
| story-pilot-configuration.md | AC-4 | TC-AP-004 | Read-only non-builder access |
| story-pilot-configuration.md | AC-5 | TC-AP-005 | Config change restrictions |
| story-metric-entry-capture.md | AC-1 | TC-AP-006 | Metric entry creation |
| story-metric-entry-capture.md | AC-2 | TC-AP-007 | Required field validation |
| story-metric-entry-capture.md | AC-3 | TC-AP-008 | SME notes |
| story-metric-entry-capture.md | AC-4 | TC-AP-009 | Write access restrictions |
| story-metric-entry-capture.md | AC-5 | TC-AP-010 | History preservation |
| story-metric-entry-capture.md | AC-6 | TC-AP-011 | Aggregation availability |
| story-aggregation-engine.md | AC-1 | TC-AP-012 | Daily bucketing ≤14 days |
| story-aggregation-engine.md | AC-2 | TC-AP-013 | Weekly bucketing 15-90 days |
| story-aggregation-engine.md | AC-3 | TC-AP-014 | Monthly bucketing >90 days |
| story-aggregation-engine.md | AC-4 | TC-AP-015 | Latest value selection |
| story-aggregation-engine.md | AC-5 | TC-AP-016 | Metric-type aggregation |
| story-aggregation-engine.md | AC-6 | TC-AP-017 | Deterministic results |
| story-dashboard-metrics.md | AC-1 | TC-AP-018 | Summary cards latest |
| story-dashboard-metrics.md | AC-2 | TC-AP-019 | Filter updates |
| story-dashboard-metrics.md | AC-3 | TC-AP-020 | Incomplete indicators |
| story-dashboard-metrics.md | AC-4 | TC-AP-021 | Performance targets |
| story-dashboard-metrics.md | AC-5 | TC-AP-022 | Observer read-only |
| story-spec-freeze-deviations.md | AC-1 | TC-AP-023 | Spec Freeze recording |
| story-spec-freeze-deviations.md | AC-2 | TC-AP-024 | Prevent freeze changes |
| story-spec-freeze-deviations.md | AC-3 | TC-AP-025 | Builder-only freeze |
| story-spec-freeze-deviations.md | AC-4 | TC-AP-026 | Post-freeze deviation logging |
| story-spec-freeze-deviations.md | AC-5 | TC-AP-027 | Pre-freeze no deviations |
| story-spec-freeze-deviations.md | AC-6 | TC-AP-028 | Deviation visibility |
| story-pilot-phase-transitions.md | AC-1 | TC-AP-029 | Phase 2 with freeze |
| story-pilot-phase-transitions.md | AC-2 | TC-AP-030 | Block Phase 2 without freeze |
| story-pilot-phase-transitions.md | AC-3 | TC-AP-031 | Transition restrictions |
| story-pilot-phase-transitions.md | AC-4 | TC-AP-032 | Current phase display |
| story-business-context-guidance.md | AC-1 | TC-AP-033 | Pilot framework display |
| story-business-context-guidance.md | AC-2 | TC-AP-034 | Markdown rendering |
| story-business-context-guidance.md | AC-3 | TC-AP-035 | Document navigation |
| story-business-context-guidance.md | AC-4 | TC-AP-036 | Access control |
| story-business-context-guidance.md | AC-5 | TC-AP-037 | Load performance |
| story-actor-tailored-guidance.md | AC-1 | TC-AP-038 | Role-specific guidance display |
| story-actor-tailored-guidance.md | AC-2 | TC-AP-039 | Builder guidance content |
| story-actor-tailored-guidance.md | AC-3 | TC-AP-040 | SME guidance content |
| story-actor-tailored-guidance.md | AC-4 | TC-AP-041 | Observer guidance content |
| story-actor-tailored-guidance.md | AC-5 | TC-AP-042 | Guidance dismissal/collapse |
| story-actor-tailored-guidance.md | AC-6 | TC-AP-043 | Contextual help tooltips |
| story-audit-logging.md | AC-1 | TC-AP-045 | Metric creation logging |
| story-audit-logging.md | AC-2 | TC-AP-046 | Metric update logging |
| story-audit-logging.md | AC-3 | TC-AP-047 | Phase transition logging |
| story-audit-logging.md | AC-4 | TC-AP-048 | Audit immutability |
| story-audit-logging.md | AC-5 | TC-AP-049 | Audit visibility |
| story-pilot-guidance-navigation-ux.md | AC-1 | TC-AP-050 | Flattened navigation structure |
| story-pilot-guidance-navigation-ux.md | AC-2 | TC-AP-051 | GOV.UK typography |
| story-pilot-guidance-navigation-ux.md | AC-3 | TC-AP-052 | Heading hierarchy |
| story-pilot-guidance-navigation-ux.md | AC-4 | TC-AP-053 | Sidebar styling |
| story-pilot-guidance-navigation-ux.md | AC-5 | TC-AP-054 | ReactMarkdown rendering |
| story-pilot-guidance-navigation-ux.md | AC-6 | TC-AP-055 | Navigation state preservation |

## Key assumptions
- Pilot roles are authenticated and mapped to Builder/SME/Observer.
- Metric key taxonomy and metric-type mapping are predefined for the pilot.
- Dashboard filters map directly to stored metric fields and phase metadata.
- Business context document at .business_context/Specification-Led-Agentic-Delivery-Pilot.md exists.
- Actor-tailored guidance content differs per role with specific action steps.
- Guidance dismissal preference persists across sessions via user preferences API/storage.
- Contextual help tooltips are associated with filter and control elements.
- Audit log storage is immutable for non-admin roles.
- Pilot specification data structure in client/src/data/pilotSpecification.ts has been flattened (subsections merged into parent sections).
- ReactMarkdown component is configured with GOV.UK class mappings.
- Navigation active state is managed via React Router.
