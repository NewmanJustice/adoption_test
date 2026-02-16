## Summary
Update the adoption-pilot feature to remove compare mode functionality and Phase 3, while adding business context guidance display and actor-tailored dashboard help. This simplifies the pilot lifecycle to a 2-phase model (Phase 1 → Phase 2 only) and adds guidance features to improve user onboarding.

## Files to Create/Modify
| path | action | purpose |
| --- | --- | --- |
| shared/types/api.ts | modify | Remove compare mode types; add guidance display and user preference types |
| server/migrations/009_create_pilot_tables.sql | modify | Remove compare/control experiment type columns; simplify phase enum to 2 phases; add user preferences table |
| server/src/repositories/pilotRepository.ts | modify | Remove compare mode queries; add user preferences CRUD for guidance dismissal |
| server/src/services/pilotService.ts | modify | Remove compare mode logic and Phase 3 transitions; add role-based guidance text logic |
| server/src/controllers/pilotController.ts | modify | Remove compare mode endpoints; add guidance endpoints (GET /guidance/business-context, GET /guidance/dashboard) |
| server/src/routes/pilot.ts | modify | Remove compare mode routes; add guidance and user preference routes |
| client/src/pages/PilotDashboardPage.tsx | modify | Remove compare mode UI; add collapsible actor-tailored guidance panel with dismissal preference |
| client/src/pages/PilotGuidancePage.tsx | create | New page to render .business_context/Specification-Led-Agentic-Delivery-Pilot.md with TOC navigation |
| client/src/components/pilot/ActorGuidancePanel.tsx | create | Collapsible guidance panel showing role-specific dashboard instructions |
| client/src/components/pilot/MarkdownRenderer.tsx | create | Markdown rendering component for business context display |
| client/src/utils/guidanceContent.ts | create | Map pilot roles to tailored guidance text (Builder, SME, Delivery Lead, Observer instructions) |
| client/src/App.tsx | modify | Add /pilot/guidance route for business context page |
| test/feature_adoption-pilot.test.js | modify | Remove compare mode tests; update phase transition tests to only cover Phase 1→2; add guidance tests (TC-AP-033 to TC-AP-044) |

## Implementation Steps
1. Update shared types: remove `experimentType`, `compareMode` types; add `GuidanceResponse`, `UserPreference` types
2. Modify DB migration: remove `experiment_type` column from pilot tables; change phase enum to only "Phase 1" and "Phase 2"; add `user_preferences` table
3. Update pilotRepository: remove compare mode queries; add `getUserPreference()` and `setUserPreference()` for guidance dismissal
4. Update pilotService: remove compare delta calculations; add `getBusinessContextGuidance()` to read markdown file; add `getActorGuidance(role)` to return role-specific text
5. Update pilotController: remove `/dashboard/compare` endpoint; add `GET /api/pilot/guidance/business-context` and `GET /api/pilot/guidance/dashboard`; add `POST /api/pilot/preferences` for dismissal state
6. Update pilot routes: remove compare mode routes; add guidance and preference routes with requireAuth middleware
7. Create client guidance page: markdown renderer with TOC for .business_context/Specification-Led-Agentic-Delivery-Pilot.md content (TC-AP-033 to TC-AP-037)
8. Create actor guidance panel: collapsible component fetching role-specific text, with dismiss action persisted to user preferences (TC-AP-038 to TC-AP-044)
9. Update dashboard page: remove compare mode filters and UI; integrate ActorGuidancePanel at top of dashboard
10. Update tests: remove compare mode test cases; verify Phase 1→2 transition only (no Phase 3); add business context and actor guidance test coverage

## Risks/Questions
- Confirm markdown rendering library choice (react-markdown recommended for client)
- Verify .business_context/Specification-Led-Agentic-Delivery-Pilot.md is accessible at build/runtime
- Clarify if guidance dismissal preference should be per-user or per-role globally
