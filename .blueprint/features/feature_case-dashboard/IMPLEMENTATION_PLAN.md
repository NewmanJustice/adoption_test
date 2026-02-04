# Implementation Plan - Case Dashboard

## Summary
Enhance the existing `/api/cases` endpoint to support filtering, sorting, pagination, attention indicators, and role-based field redaction. Upgrade the DashboardPage to display a GOV.UK-compliant case table with filter controls and attention indicators. Create a new MyCasesPage with card-based layout for adopters with trauma-informed messaging.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/src/services/caseService.ts` | Modify | Add attention level calculation, filtering logic, sorting, and role-based redaction |
| `server/src/controllers/caseController.ts` | Modify | Extend `listCases` to accept filter/sort/pagination query params |
| `server/src/types/case.ts` | Modify | Add `attentionLevel`, filter params, and redacted field types |
| `shared/types/api.ts` | Modify | Add `CaseDashboardResponse` and filter param types for client |
| `client/src/pages/DashboardPage.tsx` | Modify | Replace placeholder with case table, filters, attention tags, empty states |
| `client/src/pages/MyCasesPage.tsx` | Create | Adopter-specific card-based view with redacted data and trauma-informed copy |
| `client/src/components/CaseFilters.tsx` | Create | Filter controls (status, case type, date range) with GOV.UK styling |
| `client/src/components/AttentionTag.tsx` | Create | Reusable attention indicator tag (amber/red) with screen reader support |
| `client/src/components/EmptyState.tsx` | Create | Reusable empty state component for no-cases and no-results scenarios |
| `client/src/App.tsx` | Modify | Add `/my-cases` route pointing to MyCasesPage |

## Implementation Steps

1. **Extend case types** - Add `attentionLevel` enum (`normal`, `approaching`, `overdue`) and filter query types to `server/src/types/case.ts` and `shared/types/api.ts`

2. **Add attention calculation** - Implement `calculateAttentionLevel(keyDates: KeyDates): AttentionLevel` in caseService comparing next due date against 7-day threshold

3. **Add filtering/sorting logic** - Implement `filterCases(cases, filters)` and `sortCases(cases, sortBy, sortOrder)` in caseService with default sort by attention level

4. **Extend listCases controller** - Parse query params (`status`, `caseType`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`, `page`, `pageSize`) and apply filter/sort/pagination

5. **Create CaseFilters component** - GOV.UK select dropdowns for status/caseType, date inputs, Apply/Clear buttons; update URL query params on submit

6. **Create AttentionTag component** - Render `govuk-tag--yellow` for approaching, `govuk-tag--red` for overdue, include `aria-label` and visually hidden text

7. **Create EmptyState component** - Accept `variant` prop (no-cases, no-results, error, adopter-empty) to render appropriate heading, body text, and action links

8. **Upgrade DashboardPage** - Fetch cases with filters from URL params, render GOV.UK table with columns (Case ref, Type, Status, Child, LA, Key date, Attention), wire filter controls, add loading/error/empty states

9. **Create MyCasesPage** - Fetch adopter's cases, render as GOV.UK summary cards (not table), apply field redaction client-side as backup, use trauma-informed copy from story-adopter-my-cases.md

10. **Add route and redirect logic** - Register `/my-cases` route in App.tsx; update login redirect to route adopters to `/my-cases` instead of `/dashboard`

## Risks/Questions

- **Case assignment model:** Current `listCasesForUser` filters by user. Confirm whether org-based filtering is sufficient or if explicit per-case assignment is required.
- **Key dates source:** Attention calculation requires reliable `nextHearingDate` or similar. Confirm which date fields exist in case data model.
- **Redaction enforcement:** Backend should be primary redaction point. Frontend redaction is defense-in-depth only.
- **Date filter field:** Clarify whether date filter applies to `nextHearingDate`, `applicationDate`, or user-selectable field.
