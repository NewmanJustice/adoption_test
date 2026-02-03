# Understanding Document - Case Management Feature

## Overview

The Case Management feature is the foundational capability of the Adoption Digital Platform, enabling the creation, viewing, updating, and management of adoption cases. This document summarises the key behaviours and requirements derived from seven user stories.

---

## Stories Covered

| Story | Type | Primary Actor |
|-------|------|---------------|
| Case Data Model | Technical enabler | System |
| Create Case | User-facing | HMCTS Case Officer |
| List Cases | User-facing | All authenticated users |
| View Case | User-facing | All users with case access |
| Update Case Status | User-facing | HMCTS Case Officer, Judge |
| Case Audit Logging | Technical enabler | System |
| Case Access Control | Technical enabler | System |

---

## Key Behaviours

### 1. Case Creation
- **Only HMCTS Case Officers** can create cases
- Case type selection from six adoption types (Agency, Step-Parent, Intercountry, Non-Agency, Foster-to-Adopt, Following Placement Order)
- Assigned court is required
- System generates unique case number: `{COURT_CODE}/{YEAR}/{SEQUENCE}`
- Initial status is always `APPLICATION`
- `createdBy` records the authenticated user

### 2. Case Listing
- **Role-based filtering**: Users only see cases they have permission to access
- HMCTS Case Officer: sees cases assigned to their court
- Judge/Legal Adviser: sees only explicitly assigned cases
- Cafcass Officer: sees only assigned cases
- LA Social Worker: sees cases where their LA is involved
- VAA Worker: sees cases where their agency is involved
- Adopter: sees only their own cases (redirected to `/my-cases`)
- Pagination with default page size of 25
- Sorted by created date (newest first)

### 3. Case Viewing
- **Full view** for professional users (HMCTS, Judge, Cafcass, LA, VAA)
- **Redacted view** for Adopters:
  - No birth family identifying information
  - No linked case reference
  - No internal notes
  - No `createdBy` field
  - Limited status history (dates only, no user names)
- Response includes `redacted: true/false` flag
- Includes permissions object for UI to determine available actions

### 4. Status Transitions
- Nine possible statuses: APPLICATION, DIRECTIONS, CONSENT_AND_REPORTING, FINAL_HEARING, ORDER_GRANTED, APPLICATION_REFUSED, APPLICATION_WITHDRAWN, ON_HOLD, ADJOURNED
- Terminal states (no further transitions): ORDER_GRANTED, APPLICATION_REFUSED, APPLICATION_WITHDRAWN
- Valid transitions enforced per state transition matrix
- Role-based authority for transitions:
  - Terminal state transitions (ORDER_GRANTED, APPLICATION_REFUSED): Judge/Legal Adviser only
  - APPLICATION_WITHDRAWN: HMCTS Case Officer
  - All other transitions: HMCTS Case Officer
- Reason required for: ON_HOLD, APPLICATION_WITHDRAWN, APPLICATION_REFUSED
- Optimistic locking prevents concurrent update conflicts

### 5. Access Control
- **Need-to-know principle** enforced at API level
- Assignment types: JUDICIAL, CAFCASS, COURT, APPLICANT
- Organisation-based access for LA and VAA workers
- Access denial returns 403 without revealing case existence
- All access attempts logged (successful and denied)

### 6. Audit Logging
- Every case operation logged: CREATE, UPDATE, STATUS_CHANGE, VIEW, DELETE
- Audit records are **immutable** (cannot be modified or deleted)
- Before/after state captured for reconstruction
- Timestamps in UTC
- Only HMCTS Case Officers can view audit logs

---

## Assumptions Made

1. **Court assignment for HMCTS users** is pre-seeded or configured externally
2. **Organisation associations** exist in user session context for LA/VAA workers
3. **Case number format** uses simple court code derivation (e.g., "Birmingham Family Court" -> "BFC")
4. **Sequence numbers reset** per court per year
5. **UUID format** is acceptable for all primary keys
6. **PostgreSQL 14+** is available with `gen_random_uuid()` support
7. **Soft delete** is the standard pattern (preserve audit trail)
8. **View logging** may be configurable for performance reasons
9. **Asynchronous audit logging** does not block primary operations

---

## Identified Ambiguities and Questions

| ID | Question | Default Interpretation |
|----|----------|----------------------|
| Q-1 | How are users assigned to courts? | Assumed pre-seeded in mock auth |
| Q-2 | What happens to case number if court is changed? | Number remains unchanged (deferred) |
| Q-3 | Can ON_HOLD return to any previous state? | Returns only to the state immediately before ON_HOLD |
| Q-4 | Is view logging always on? | Configurable, assumed ON for testing |
| Q-5 | What validates court names? | No validation for MVP (free text) |

---

## Data Model Summary

### Case Entity
- `id` (UUID)
- `case_number` (unique, COURT/YEAR/SEQ)
- `case_type` (enum: 6 types)
- `status` (enum: 9 statuses)
- `assigned_court` (string)
- `linked_case_reference` (optional)
- `notes` (optional)
- `created_at`, `updated_at` (timestamps)
- `created_by` (user ID)
- `deleted_at` (soft delete)

### Enumerations
- **AdoptionType**: AGENCY_ADOPTION, STEP_PARENT_ADOPTION, INTERCOUNTRY_ADOPTION, NON_AGENCY_ADOPTION, FOSTER_TO_ADOPT, ADOPTION_FOLLOWING_PLACEMENT_ORDER
- **CaseStatus**: APPLICATION, DIRECTIONS, CONSENT_AND_REPORTING, FINAL_HEARING, ORDER_GRANTED, APPLICATION_REFUSED, APPLICATION_WITHDRAWN, ON_HOLD, ADJOURNED
- **AssignmentType**: JUDICIAL, CAFCASS, COURT, APPLICANT
- **AuditAction**: CREATE, UPDATE, STATUS_CHANGE, VIEW, DELETE

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/cases` | Create new case |
| GET | `/api/cases` | List cases (filtered by role) |
| GET | `/api/cases/:id` | View case details |
| PATCH | `/api/cases/:id/status` | Update case status |
| GET | `/api/cases/:id/audit` | View case audit log |
| POST | `/api/cases/:id/assignments` | Create case assignment |
| GET | `/api/cases/:id/assignments` | List case assignments |
| DELETE | `/api/cases/:id/assignments/:id` | Revoke assignment |

---

## Non-Functional Requirements

- Case creation: < 2 seconds
- Case listing: < 1 second for 50 cases
- Case view: < 500ms
- Audit logs are immutable
- All operations server-side enforced (not client-side)
- WCAG 2.1 AA accessibility compliance
