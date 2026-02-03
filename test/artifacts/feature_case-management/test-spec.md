# Test Specification - Case Management Feature

## Understanding
Case Management is the foundational feature for the Adoption Digital Platform. It enables creation, viewing, listing, and status management of adoption cases with role-based access control and audit logging. Key actors: HMCTS Case Officers (create/manage), Judges (terminal decisions), and various stakeholders with filtered/redacted views. Nine case statuses with defined transitions, six adoption types, and strict need-to-know access enforcement.

---

## AC to Test ID Mapping

### Story: Case Data Model (story-case-data-model.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-4 | T-DM-4 | Adoption type enum has 6 valid values |
| AC-5 | T-DM-5 | Case status enum has 9 valid values |
| AC-10 | T-DM-10 | TypeScript types exported correctly |

### Story: Create Case (story-create-case.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-5 | T-CC-5 | Valid case creation returns 201 with case data |
| AC-6 | T-CC-6 | Case number format COURT/YEAR/SEQ |
| AC-7 | T-CC-7 | Initial status is APPLICATION |
| AC-8 | T-CC-8 | createdBy tracks authenticated user |
| AC-10 | T-CC-10 | Missing case type returns 400 |
| AC-11 | T-CC-11 | Invalid case type returns 400 |
| AC-12 | T-CC-12 | Missing assigned court returns 400 |
| AC-13 | T-CC-13 | Non-HMCTS user returns 403 |

### Story: List Cases (story-list-cases.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-2 | T-LC-2 | HMCTS sees court-assigned cases |
| AC-3 | T-LC-3 | Judge sees only explicitly assigned cases |
| AC-7 | T-LC-7 | Adopter sees only own cases |
| AC-8 | T-LC-8 | Empty state returns empty array |
| AC-9 | T-LC-9 | Response includes pagination metadata |
| AC-12 | T-LC-12 | Cases sorted by createdAt desc |
| AC-17 | T-LC-17 | Unauthenticated returns 401 |

### Story: View Case (story-view-case.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-2 | T-VC-2 | Professional user sees full case |
| AC-3 | T-VC-3 | Adopter sees redacted view |
| AC-6 | T-VC-6 | Adopter response has redacted:true |
| AC-7 | T-VC-7 | Non-existent case returns 404 |
| AC-8 | T-VC-8 | Unauthorised access returns 403 |
| AC-11 | T-VC-11 | Permissions object reflects role |
| AC-15 | T-VC-15 | Soft-deleted case returns 404 |

### Story: Update Case Status (story-update-case-status.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-3 | T-US-3 | Valid transitions accepted per matrix |
| AC-4 | T-US-4 | Role authority enforced |
| AC-5 | T-US-5 | Successful update returns 200 |
| AC-8 | T-US-8 | Invalid transition returns 400 |
| AC-9 | T-US-9 | Insufficient role returns 403 |
| AC-11 | T-US-11 | Terminal state rejects updates |
| AC-13 | T-US-13 | Reason required for ON_HOLD/APPLICATION_WITHDRAWN |
| AC-15 | T-US-15 | Concurrent update returns 409 |

### Story: Audit Logging (story-case-audit-logging.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-3 | T-AL-3 | CREATE action logged |
| AC-5 | T-AL-5 | STATUS_CHANGE action logged |
| AC-11 | T-AL-11 | Audit log query returns entries |
| AC-12 | T-AL-12 | Non-HMCTS cannot view audit logs |

### Story: Access Control (story-case-access-control.md)
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-3 | T-AC-3 | HMCTS court-based access granted |
| AC-4 | T-AC-4 | Judge needs explicit JUDICIAL assignment |
| AC-8 | T-AC-8 | Adopter needs APPLICANT assignment |
| AC-9 | T-AC-9 | Access denied returns 403 |
| AC-14 | T-AC-14 | Assignment creation returns 201 |
| AC-16 | T-AC-16 | Non-HMCTS cannot manage assignments |

---

## Key Assumptions
- Mock authentication provides user context (role, courtAssignment, organisationId)
- Database layer is mocked via repository pattern
- Case number generation is deterministic (COURT/YEAR/00001)
- View logging is enabled for all tests
- Court code derivation: "Birmingham Family Court" -> "BFC"
- Soft-delete is the standard deletion pattern
- UTC timestamps for all audit entries
- Session state isolated between tests
