# Implementation Plan - Case Management Feature

## Summary
Case management feature enabling creation, viewing, listing, and status updates of adoption cases with role-based access control and audit logging.

---

## Phase 1: Backend API (COMPLETE)

### Files Created
| Path | Purpose |
|------|---------|
| `server/src/types/case.ts` | Case, CaseStatus, AdoptionType types |
| `server/src/repositories/caseRepository.ts` | In-memory data persistence with CRUD, assignments, audit |
| `server/src/services/caseService.ts` | Business logic, access control, status transitions |
| `server/src/controllers/caseController.ts` | HTTP handlers for all endpoints |
| `server/src/routes/cases.ts` | Express route definitions |

### Files Modified
| Path | Change |
|------|--------|
| `server/src/types/auth.ts` | Added courtAssignment, organisationId to SessionUser |
| `server/src/services/sessionService.ts` | Extended session options |
| `server/src/controllers/authController.ts` | Pass extended context to session |
| `server/src/app.ts` | Registered case management routes |

### API Endpoints Implemented
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/cases` | Create case (HMCTS only) |
| GET | `/api/cases` | List cases (role-filtered) |
| GET | `/api/cases/:id` | View case (with redaction) |
| DELETE | `/api/cases/:id` | Soft-delete case |
| PATCH | `/api/cases/:id/status` | Update status |
| GET | `/api/cases/:id/audit` | View audit log |
| POST | `/api/cases/:id/assignments` | Create assignment |

### Test Status
- **107/107 tests passing**
- Commit: `5eca031`

---

## Phase 2: Frontend UI (PENDING)

### Files to Create
| Path | Purpose | Story ACs |
|------|---------|-----------|
| `client/src/pages/CaseListPage.tsx` | Case listing with role-based filtering | story-list-cases AC-1, AC-8, AC-10, AC-13-15, AC-18-19 |
| `client/src/pages/CaseDetailPage.tsx` | Case detail view with redaction | story-view-case AC-1-3, AC-9-13, AC-16 |
| `client/src/pages/CreateCasePage.tsx` | Case creation form (HMCTS only) | story-create-case AC-1-5, AC-14-17 |
| `client/src/pages/UpdateStatusPage.tsx` | Status update form | story-update-case-status AC-1-2, AC-5, AC-13-16 |
| `client/src/components/CaseStatusTag.tsx` | GOV.UK tag for status display | story-list-cases AC-18 |
| `client/src/components/CaseTable.tsx` | Case list table component | story-list-cases AC-1, AC-19 |
| `client/src/components/Pagination.tsx` | GOV.UK pagination component | story-list-cases AC-10 |
| `client/src/services/caseService.ts` | API client for case operations | All stories |

### Files to Modify
| Path | Change |
|------|--------|
| `client/src/App.tsx` | Add routes for case pages |
| `client/src/pages/DashboardPage.tsx` | Add link/redirect to case list |

### Implementation Steps

1. **Create case API service** - Client-side service to call case endpoints with proper error handling and type safety.

2. **Create CaseStatusTag component** - GOV.UK tag component with colour coding for different statuses (green for granted, red for refused/withdrawn, blue for active states).

3. **Create Pagination component** - Reusable GOV.UK pagination following design system patterns.

4. **Create CaseTable component** - Accessible table with proper headers, scope attributes, and row click navigation.

5. **Implement CaseListPage** -
   - Fetch cases from API on mount
   - Display in CaseTable with pagination
   - Show "Create case" button for HMCTS only
   - Handle empty state
   - Handle loading and error states

6. **Implement CaseDetailPage** -
   - Fetch case by ID from URL params
   - Display case details in GOV.UK summary list
   - Show/hide fields based on `redacted` flag
   - Display permissions-based action buttons
   - Show case history section
   - Handle 404 and 403 responses

7. **Implement CreateCasePage** -
   - GOV.UK form with radios for case type
   - Text input for assigned court
   - Optional fields for linked reference and notes
   - Client-side validation with GOV.UK error summary
   - Redirect non-HMCTS users
   - Success redirect to case detail

8. **Implement UpdateStatusPage** -
   - Display current status
   - Show available transitions as radios
   - Require reason for ON_HOLD/APPLICATION_WITHDRAWN
   - Handle 409 conflict response
   - Redirect to case detail on success

9. **Add routes to App.tsx** -
   ```tsx
   /cases - CaseListPage
   /cases/create - CreateCasePage (HMCTS only)
   /cases/:id - CaseDetailPage
   /cases/:id/status - UpdateStatusPage
   /my-cases - Redirect adopters to filtered list
   ```

10. **Update DashboardPage** - Add prominent link to case list.

### Acceptance Criteria Coverage

| Story | UI ACs | Status |
|-------|--------|--------|
| story-create-case | AC-1,2,3,4,5,14,15,16,17 | Pending |
| story-list-cases | AC-1,8,10,13,14,15,16,18,19 | Pending |
| story-view-case | AC-1,2,3,9,10,11,12,13,14,16 | Pending |
| story-update-case-status | AC-1,2,5,13,14,15,16 | Pending |

### Dependencies
- GOV.UK Frontend components (already installed)
- React Router (already configured)
- Session context for role checking

---

## Risks/Considerations

- **Auth context needed in frontend** - Components need access to current user role to conditionally render actions. May need React context or fetch from `/api/auth/session`.
- **Loading states** - All pages need proper loading spinners following GOV.UK patterns.
- **Error boundaries** - Consider error boundary for API failures.
- **Mobile responsiveness** - Tables may need responsive treatment on small screens.
