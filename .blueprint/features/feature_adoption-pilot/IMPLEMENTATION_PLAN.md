## Summary
Implement the adoption-pilot feature by adding pilot configuration, metric capture, deterministic aggregation, compare mode, and audit logging across server, shared types, and client UI. Work focuses on new pilot-specific API endpoints, storage tables, and dashboard components with role-based access control and lifecycle gating.

## Files to Create/Modify
| path | action | purpose |
| --- | --- | --- |
| shared/types/api.ts | modify | Add pilot configuration, metric entry, dashboard, compare mode, audit log, and filter response types. |
| server/src/types/auth.ts | modify | Introduce pilot roles (Builder, SME, Delivery Lead, Observer) for RBAC. |
| server/src/config/roles.ts | modify | Register pilot roles and post-login redirects. |
| client/src/pages/LoginPage.tsx | modify | Expose pilot roles in mock login options. |
| server/migrations/009_create_pilot_tables.sql | create | Add tables for pilot config, metric entries/history/notes, deviations, phases, and pilot audit log. |
| server/src/repositories/pilotRepository.ts | create | Data access for pilot config, metrics, deviations, phases, audit records. |
| server/src/services/pilotService.ts | create | Validation, role checks, phase gating, aggregation/compare logic, deviation logging. |
| server/src/controllers/pilotController.ts | create | HTTP handlers for pilot config, metrics, dashboard/compare, phase transitions, audit log. |
| server/src/routes/pilot.ts | create | Express routes with requireAuth guards for pilot endpoints. |
| server/src/app.ts | modify | Mount pilot routes. |
| client/src/pages/PilotDashboardPage.tsx | create | Dashboard UI with filters, summary cards, trends, compare mode, deviations. |
| client/src/pages/PilotConfigPage.tsx | create | Builder-only pilot configuration and overview display. |
| client/src/pages/PilotMetricEntryPage.tsx | create | Metric entry capture and SME notes. |
| client/src/components/pilot/* | create | Filter controls, summary cards, trend charts, completeness indicators. |
| client/src/App.tsx | modify | Add pilot routes and navigation entry points. |
| test/feature_adoption-pilot.test.js | modify | Replace placeholders with coverage for key pilot flows. |

## Implementation Steps
1. Extend shared API types and server auth roles to include pilot-specific roles and response contracts.
2. Create DB migration(s) for pilot configuration, metric entry/history/notes, deviations, phase transitions, and audit logs with indexes.
3. Implement pilotRepository CRUD for config, metric entries/history, deviations, phase state, and audit log retrieval.
4. Implement pilotService for validation, RBAC checks, phase gating, Spec Freeze logic, deviation recording, and audit logging.
5. Add deterministic aggregation utilities (bucketing, latest value selection, metric-type rules) and compare mode delta calculation.
6. Build pilotController endpoints for config create/read, metric entry create/update/note, dashboard summary/trends, compare mode, phase transitions, and audit log queries.
7. Wire pilot routes into app.ts with requireAuth and role scoping (Builder, SME, Delivery Lead, Observer).
8. Build client pages/components for pilot config, metric entry, dashboard filters/compare mode/deviation display, and hook them into App routes.
9. Implement client API calls and UX for read-only roles (Observer) and validation error handling.
10. Update and expand test/feature_adoption-pilot.test.js to cover acceptance criteria and role gating.

## Risks/Questions
- Clarify pilot metric taxonomy and which metrics are manual vs automated to finalize validation rules and UI inputs.
- Confirm whether pilot roles should map to existing system roles or be added as new roles in auth.
