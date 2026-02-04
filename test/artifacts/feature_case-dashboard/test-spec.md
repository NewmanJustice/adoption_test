# Test Specification - Case Dashboard

## Understanding
The Case Dashboard feature provides authenticated users with a centralized view of their adoption caseload. Professional users see a table-based dashboard at `/dashboard`, while Adopters see a simplified card-based view at `/my-cases`. Key functionality includes role-based case visibility, field redaction, filtering, sorting, pagination, and attention indicators for cases needing urgent action. The feature is read-only and enforces need-to-know access rules.

## AC to Test ID Mapping

### Story: Case List API (`story-case-list-api.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-API-1.1 | Authenticated user retrieves case list |
| AC-2 | T-API-2.1 | User sees only assigned cases |
| AC-2 | T-API-2.2 | User cannot see other org cases |
| AC-3 | T-API-3.1 | VAA worker sees redacted birth family addresses |
| AC-3 | T-API-3.2 | Adopter sees redacted birth parent details |
| AC-4 | T-API-4.1 | Pagination returns correct page size |
| AC-4 | T-API-4.2 | Pagination metadata included |
| AC-5 | T-API-5.1 | Filter by status returns matches |
| AC-5 | T-API-5.2 | Filter by case type returns matches |
| AC-6 | T-API-6.1 | Unauthenticated returns 401 |

### Story: Dashboard Layout (`story-dashboard-layout.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-DL-1.1 | Dashboard page loads with title |
| AC-2 | T-DL-2.1 | Table has required columns |
| AC-3 | T-DL-3.1 | Case number links to detail page |
| AC-4 | T-DL-4.1 | Mobile viewport shows stacked layout |
| AC-5 | T-DL-5.1 | Loading state shows indicator |
| AC-6 | T-DL-6.1 | Table has accessible structure |

### Story: Filter, Sort & Pagination (`story-filter-sort-pagination.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-FSP-1.1 | Filter by status updates results |
| AC-2 | T-FSP-2.1 | Filter by case type updates results |
| AC-3 | T-FSP-3.1 | Filter by date range updates results |
| AC-4 | T-FSP-4.1 | Combined filters apply AND logic |
| AC-5 | T-FSP-5.1 | Clear filters resets to full list |
| AC-6 | T-FSP-6.1 | Sort by column header ascending |
| AC-6 | T-FSP-6.2 | Sort toggle to descending |
| AC-7 | T-FSP-7.1 | Pagination controls display when needed |

### Story: Attention Indicators (`story-attention-indicators.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-AI-1.1 | Approaching deadline shows amber tag |
| AC-2 | T-AI-2.1 | Overdue shows red tag |
| AC-3 | T-AI-3.1 | Normal cases show no indicator |
| AC-4 | T-AI-4.1 | Default sort: overdue first |
| AC-5 | T-AI-5.1 | Indicator has text label |
| AC-6 | T-AI-6.1 | Screen reader announces attention |

### Story: Empty States (`story-empty-states.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-ES-1.1 | No cases shows empty message |
| AC-2 | T-ES-2.1 | No filter results shows message |
| AC-3 | T-ES-3.1 | Active filters shown in summary |
| AC-4 | T-ES-4.1 | API error shows error message |
| AC-5 | T-ES-5.1 | Adopter empty state is trauma-informed |

### Story: Adopter My Cases (`story-adopter-my-cases.md`)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-MC-1.1 | Adopter redirects to /my-cases |
| AC-2 | T-MC-2.1 | Page shows summary cards |
| AC-3 | T-MC-3.1 | Card shows case reference and status |
| AC-4 | T-MC-4.1 | Birth parent info is redacted |
| AC-5 | T-MC-5.1 | Multiple cases show separate cards |
| AC-6 | T-MC-6.1 | Card links to case detail |
| AC-7 | T-MC-7.1 | Language is trauma-informed |

## Key Assumptions
- User-to-case assignment is via organisation membership and/or explicit case assignment
- Case data exists in database with required fields (status, caseType, keyDates, parties)
- Attention level calculated server-side based on 7-day threshold
- Session contains userId, role, and organisationId for access control
- GOV.UK components render semantic HTML with proper ARIA attributes
