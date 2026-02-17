# Implementation Plan — Actor-Tailored Dashboard Guidance

## Summary
Add role-specific guidance panel to PilotDashboardPage showing tailored instructions for Builder, SME, Delivery Lead, and Observer roles. Panel is collapsible with preference persistence using localStorage, and filter/control elements include optional help tooltips.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `client/src/components/pilot/PilotGuidancePanel.tsx` | Create | Collapsible guidance panel with role-based content |
| `client/src/data/pilotGuidance.ts` | Create | Role-specific guidance content as structured data |
| `client/src/components/pilot/PilotFilters.tsx` | Modify | Add help tooltips to filter controls |
| `client/src/pages/PilotDashboardPage.tsx` | Modify | Integrate guidance panel above filters |
| `shared/types/pilot.ts` | Modify | Add PilotRole type and guidance data types |
| `client/src/hooks/useLocalStorage.ts` | Create | Reusable localStorage hook for preference persistence |

## Implementation Steps

1. **Create shared types** (`shared/types/pilot.ts`)
   - Add `PilotRole` type union: `'PILOT_BUILDER' | 'PILOT_SME' | 'PILOT_DELIVERY_LEAD' | 'PILOT_OBSERVER'`
   - Define `GuidanceContent` interface with `title`, `description`, `actions` (string array), `tips` (optional string array)

2. **Create guidance data** (`client/src/data/pilotGuidance.ts`)
   - Define `PILOT_GUIDANCE: Record<PilotRole, GuidanceContent>` object
   - Builder: Configure pilot scope, confirm Spec Freeze, review metrics/deviations, identify structural issues
   - SME: Provide feedback, review prototypes, add contextual notes to metrics
   - Delivery Lead: Manage phases, ensure metric coverage, use filters, review completeness
   - Observer: View metrics, interpret summary cards/trends, explore with filters

3. **Create localStorage hook** (`client/src/hooks/useLocalStorage.ts`)
   - Generic `useLocalStorage<T>(key: string, initialValue: T)` hook
   - Returns `[value, setValue]` tuple with auto-sync to localStorage
   - Handle JSON parse/stringify errors gracefully

4. **Create guidance panel component** (`client/src/components/pilot/PilotGuidancePanel.tsx`)
   - Accept `role: PilotRole | undefined` prop
   - Use `useLocalStorage('pilotGuidanceCollapsed', false)` for collapse state
   - Render GOV.UK Details component for collapsible panel
   - Display role-specific guidance from `PILOT_GUIDANCE[role]`
   - Show generic message if role not recognized

5. **Add tooltips to filters** (`client/src/components/pilot/PilotFilters.tsx`)
   - Add GOV.UK Hint component below each filter label
   - Date range: "Filter metrics by the date they were recorded"
   - Phase: "Show metrics from a specific pilot phase (1 or 2)"
   - Loop: "Filter by iteration number within the current phase"

6. **Integrate guidance into dashboard** (`client/src/pages/PilotDashboardPage.tsx`)
   - Map `user.role` to `PilotRole` type (or undefined if not pilot role)
   - Render `<PilotGuidancePanel role={pilotRole} />` before `<PilotFilters />`
   - Position between action buttons and filters section

7. **Test with all roles**
   - Verify each role sees appropriate guidance content
   - Confirm collapse state persists across page reloads
   - Check tooltips display correctly for filter controls

## Risks/Questions

- **Guidance content accuracy:** Content should be validated with actual Builder/SME/Delivery Lead users to ensure it matches their workflow needs
- **Tooltip verbosity:** Help text should be concise to avoid overwhelming users; consider progressive disclosure if more detail needed
- **User preferences API:** Currently using localStorage; may need migration to server-side user preferences if multi-device persistence required in future

