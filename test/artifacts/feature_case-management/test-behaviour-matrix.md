# Test Behaviour Matrix - Case Management Feature

This document maps acceptance criteria to test cases, ensuring complete coverage.

---

## Story: Case Data Model

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-1 | Case table created | T-DM-1 | Covered |
| AC-2 | Required case fields | T-DM-2 | Covered |
| AC-3 | Optional case fields | T-DM-3 | Covered |
| AC-4 | Adoption type enumeration | T-DM-4.1, T-DM-4.2 | Covered |
| AC-5 | Case status enumeration | T-DM-5.1, T-DM-5.2 | Covered |
| AC-6 | Case number uniqueness | T-DM-6 | Covered |
| AC-7 | Timestamps auto-populated | T-DM-7 | Covered |
| AC-8 | Updated timestamp auto-refreshed | T-DM-8 | Covered |
| AC-9 | Soft delete support | T-DM-9 | Covered |
| AC-10 | TypeScript types exported | T-DM-10 | Covered |

---

## Story: Create Case

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-3 | Case type required validation | T-CC-3 | Covered |
| AC-4 | Assigned court required validation | T-CC-4 | Covered |
| AC-5 | Successful case creation | T-CC-5 | Covered |
| AC-6 | Case number generation | T-CC-6 | Covered |
| AC-7 | Initial case status | T-CC-7 | Covered |
| AC-8 | Created by tracking | T-CC-8 | Covered |
| AC-9 | API case creation endpoint | T-CC-9 | Covered |
| AC-10 | API validation - missing case type | T-CC-10 | Covered |
| AC-11 | API validation - invalid case type | T-CC-11 | Covered |
| AC-12 | API validation - missing assigned court | T-CC-12 | Covered |
| AC-13 | Role restriction - non-HMCTS user | T-CC-13.1 - T-CC-13.5 | Covered |

---

## Story: List Cases

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-2 | HMCTS sees assigned court cases | T-LC-2 | Covered |
| AC-3 | Judge sees assigned cases | T-LC-3 | Covered |
| AC-4 | Cafcass sees assigned cases | T-LC-4 | Covered |
| AC-5 | LA Social Worker sees LA cases | T-LC-5 | Covered |
| AC-6 | VAA Worker sees agency cases | T-LC-6 | Covered |
| AC-7 | Adopter sees own cases only | T-LC-7 | Covered |
| AC-8 | Empty state display | T-LC-8 | Covered |
| AC-9 | API case list endpoint | T-LC-9 | Covered |
| AC-10 | Pagination support | T-LC-10 | Covered |
| AC-11 | Pagination API parameters | T-LC-11 | Covered |
| AC-12 | Case list sorting | T-LC-12 | Covered |
| AC-17 | API unauthenticated access | T-LC-17 | Covered |

---

## Story: View Case

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-2 | Full view for professional users | T-VC-2.1 - T-VC-2.5 | Covered |
| AC-3 | Redacted view for Adopters | T-VC-3 | Covered |
| AC-4 | Adopter redaction - birth parent hidden | T-VC-4 | Covered |
| AC-5 | API case detail endpoint | T-VC-5 | Covered |
| AC-6 | API response includes redaction flag | T-VC-6 | Covered |
| AC-7 | Case not found | T-VC-7 | Covered |
| AC-8 | Access denied - no case access | T-VC-8 | Covered |
| AC-10 | Status history section | T-VC-10 | Covered |
| AC-11 | Case actions based on role | T-VC-11 | Covered |
| AC-12 | No edit actions for Adopters | T-VC-12 | Covered |
| AC-15 | Soft-deleted case not viewable | T-VC-15 | Covered |

---

## Story: Update Case Status

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-2 | Valid transitions only shown | T-US-2 | Covered |
| AC-3 | Transition validation matrix | T-US-3.1 - T-US-3.9 | Covered |
| AC-4 | Role-based transition authority | T-US-4.1 - T-US-4.5 | Covered |
| AC-5 | Successful status update | T-US-5 | Covered |
| AC-6 | Status update recorded in history | T-US-6 | Covered |
| AC-7 | API status update endpoint | T-US-7 | Covered |
| AC-8 | API validation - invalid transition | T-US-8 | Covered |
| AC-9 | API validation - insufficient role | T-US-9 | Covered |
| AC-10 | API validation - case not found | T-US-10 | Covered |
| AC-11 | Terminal state - no update option | T-US-11.1 - T-US-11.3 | Covered |
| AC-12 | On Hold - return to previous state | T-US-12 | Covered |
| AC-13 | Reason required for certain transitions | T-US-13.1 - T-US-13.3 | Covered |
| AC-15 | Concurrent update handling | T-US-15 | Covered |

---

## Story: Case Audit Logging

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-3 | Case creation logged | T-AL-3 | Covered |
| AC-4 | Case update logged | T-AL-4 | Covered |
| AC-5 | Status change logged | T-AL-5 | Covered |
| AC-6 | Case view logged | T-AL-6 | Covered |
| AC-7 | Case deletion logged | T-AL-7 | Covered |
| AC-8 | Audit records are immutable | T-AL-8 | Covered |
| AC-10 | Timestamps use UTC | T-AL-10 | Covered |
| AC-11 | Audit log query by case | T-AL-11 | Covered |
| AC-12 | Audit log query restricted | T-AL-12 | Covered |
| AC-13 | Audit log pagination | T-AL-13 | Covered |
| AC-14 | Access denied attempts logged | T-AL-14 | Covered |

---

## Story: Case Access Control

| AC | Description | Test IDs | Status |
|----|-------------|----------|--------|
| AC-3 | HMCTS Case Officer access rule | T-AC-3 | Covered |
| AC-4 | Judge/Legal Adviser access rule | T-AC-4 | Covered |
| AC-5 | Cafcass Officer access rule | T-AC-5 | Covered |
| AC-6 | LA Social Worker access rule | T-AC-6 | Covered |
| AC-7 | VAA Worker access rule | T-AC-7 | Covered |
| AC-8 | Adopter access rule | T-AC-8 | Covered |
| AC-9 | Access denied response | T-AC-9 | Covered |
| AC-10 | Access denied does not leak existence | T-AC-10 | Covered |
| AC-11 | Assignment creation | T-AC-11 | Covered |
| AC-12 | Assignment revocation | T-AC-12 | Covered |
| AC-13 | Multiple assignments per user | T-AC-13 | Covered |
| AC-14 | API assignment endpoint - create | T-AC-14 | Covered |
| AC-15 | API assignment endpoint - list | T-AC-15 | Covered |
| AC-16 | Only HMCTS can manage assignments | T-AC-16.1, T-AC-16.2 | Covered |
| AC-17 | Security logging for denied access | T-AC-17 | Covered |

---

## Test ID Naming Convention

- **T-DM-** : Data Model tests
- **T-CC-** : Create Case tests
- **T-LC-** : List Cases tests
- **T-VC-** : View Case tests
- **T-US-** : Update Status tests
- **T-AL-** : Audit Logging tests
- **T-AC-** : Access Control tests

---

## Coverage Summary

| Story | Total ACs | Covered | Pending |
|-------|-----------|---------|---------|
| Case Data Model | 10 | 10 | 0 |
| Create Case | 11 | 11 | 0 |
| List Cases | 10 | 10 | 0 |
| View Case | 11 | 11 | 0 |
| Update Case Status | 14 | 14 | 0 |
| Case Audit Logging | 11 | 11 | 0 |
| Case Access Control | 15 | 15 | 0 |
| **TOTAL** | **82** | **82** | **0** |

---

## Notes

1. UI-specific acceptance criteria (AC-1, AC-16, AC-17 in most stories) are out of scope for API tests
2. Accessibility criteria (AC-19 in list-cases, AC-16 in create-case, etc.) are out of scope for API tests
3. All permission tests cover both positive (access granted) and negative (access denied) scenarios
