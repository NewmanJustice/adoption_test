# Frontend Test Specification - Case Management Feature

## Understanding
This specification covers **frontend/UI tests** for Phase 2. Backend API has 107 passing tests - these tests focus on React component behaviour, user interactions, and role-based UI rendering.

Scope: CaseListPage, CaseDetailPage, CreateCasePage, UpdateStatusPage

## AC to Test ID Mapping

### CreateCasePage (story-create-case)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-CC-1.1 | Form displays all required fields (type, court, reference, notes, buttons) |
| AC-2 | T-CC-2.1 | All 6 adoption types are displayed as options |
| AC-3 | T-CC-3.1 | Validation error shown when case type not selected |
| AC-4 | T-CC-4.1 | Validation error shown when assigned court empty |
| AC-5 | T-CC-5.1 | Successful submission redirects to case detail |
| AC-14 | T-CC-14.1 | Non-HMCTS user sees access denied message |
| AC-15 | T-CC-15.1 | Cancel button navigates to /cases |
| AC-16 | T-CC-16.1 | Error summary displayed at top with field links |
| AC-17 | T-CC-17.1 | Form passes accessibility checks |

### CaseListPage (story-list-cases)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-CL-1.1 | Table displays with correct columns |
| AC-8 | T-CL-8.1 | Empty state message shown when no cases |
| AC-10 | T-CL-10.1 | Pagination controls displayed when > 25 cases |
| AC-13 | T-CL-13.1 | Clicking row navigates to case detail |
| AC-14 | T-CL-14.1 | HMCTS user sees "Create case" button |
| AC-15 | T-CL-15.1 | Non-HMCTS user does not see "Create case" button |
| AC-16 | T-CL-16.1 | Unauthenticated user redirected to login |
| AC-18 | T-CL-18.1 | Status displayed with GOV.UK tag styling |
| AC-19 | T-CL-19.1 | Table has proper accessibility attributes |

### CaseDetailPage (story-view-case)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-CD-1.1 | Case details displayed (number, type, status, court, dates) |
| AC-2 | T-CD-2.1 | Professional user sees unredacted fields |
| AC-3 | T-CD-3.1 | Adopter sees redacted view |
| AC-9 | T-CD-9.1 | Access denied message for unauthorized case |
| AC-10 | T-CD-10.1 | Case history section displays status changes |
| AC-11 | T-CD-11.1 | HMCTS/Judge sees "Update status" action button |
| AC-12 | T-CD-12.1 | Adopter does not see edit/update actions |
| AC-13 | T-CD-13.1 | "Back to cases" link navigates correctly |
| AC-14 | T-CD-14.1 | Unauthenticated user redirected to login |
| AC-16 | T-CD-16.1 | Page passes accessibility checks |

### UpdateStatusPage (story-update-case-status)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-US-1.1 | Form displays current status and available transitions |
| AC-2 | T-US-2.1 | Only valid transitions shown as options |
| AC-5 | T-US-5.1 | Successful update redirects with success notification |
| AC-13 | T-US-13.1 | Reason required for ON_HOLD/WITHDRAWN transitions |
| AC-14 | T-US-14.1 | Cancel navigates back to case detail |
| AC-15 | T-US-15.1 | Conflict error displayed when status changed |
| AC-16 | T-US-16.1 | Form passes accessibility checks |

## Key Assumptions
1. **Mock API** - Tests mock fetch; API logic tested in backend suite
2. **Session context** - Tests provide mock session data for role-based rendering
3. **Router context** - Components wrapped in MemoryRouter for navigation
4. **Pages not implemented** - Tests written as contracts ahead of implementation
5. **jest-axe** - Used for accessibility assertions where specified in ACs

## Test Count Summary
| Page | Test Count |
|------|------------|
| CreateCasePage | 9 |
| CaseListPage | 9 |
| CaseDetailPage | 10 |
| UpdateStatusPage | 7 |
| **Total** | **35** |
