# Implementation Guide - Case Management Feature Tests

This guide provides technical details for developers implementing the case management feature against these tests.

---

## 1. Test Setup Requirements

### Dependencies
```json
{
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "supertest-session": "^5.x"
  }
}
```

### Mock Database Layer
Tests use a mocked database layer. Implement a repository pattern:

```javascript
// Example structure
const mockCaseRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn()
};
```

---

## 2. API Endpoints to Implement

### POST /api/cases
Create a new case.

**Request Body:**
```json
{
  "caseType": "AGENCY_ADOPTION",
  "assignedCourt": "Birmingham Family Court",
  "linkedCaseReference": "BC/2025/12345",
  "notes": "Optional notes"
}
```

**Response (201):**
```json
{
  "success": true,
  "case": { /* case object */ },
  "redirectUrl": "/cases/{id}"
}
```

**Error Responses:**
- 400: Validation errors
- 401: Not authenticated
- 403: Not HMCTS Case Officer

---

### GET /api/cases
List cases with role-based filtering.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 25)

**Response (200):**
```json
{
  "success": true,
  "cases": [ /* array of case summaries */ ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 100,
    "totalPages": 4
  }
}
```

---

### GET /api/cases/:id
Get case details with role-based redaction.

**Response (200):**
```json
{
  "success": true,
  "case": { /* case object */ },
  "redacted": false,
  "permissions": {
    "canUpdateStatus": true,
    "canEdit": true
  }
}
```

**Error Responses:**
- 401: Not authenticated
- 403: No access to case
- 404: Case not found

---

### PATCH /api/cases/:id/status
Update case status.

**Request Body:**
```json
{
  "status": "DIRECTIONS",
  "reason": "Application accepted",
  "expectedVersion": "2026-02-03T10:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "case": { /* updated case */ },
  "previousStatus": "APPLICATION",
  "transition": {
    "from": "APPLICATION",
    "to": "DIRECTIONS",
    "at": "...",
    "by": "...",
    "reason": "..."
  }
}
```

**Error Responses:**
- 400: Invalid transition
- 403: Insufficient role
- 404: Case not found
- 409: Concurrent update conflict

---

### GET /api/cases/:id/audit
Get case audit log.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 50)

**Response (200):**
```json
{
  "success": true,
  "caseId": "...",
  "auditLog": [ /* audit entries */ ],
  "pagination": { /* ... */ }
}
```

---

### POST /api/cases/:id/assignments
Create case assignment.

**Request Body:**
```json
{
  "userId": "judge.smith@judiciary.gov.uk",
  "assignmentType": "JUDICIAL"
}
```

---

### GET /api/cases/:id/assignments
List case assignments.

---

### DELETE /api/cases/:id/assignments/:assignmentId
Revoke assignment (soft delete).

---

## 3. Enumerations

### AdoptionType
```javascript
const ADOPTION_TYPES = [
  'AGENCY_ADOPTION',
  'STEP_PARENT_ADOPTION',
  'INTERCOUNTRY_ADOPTION',
  'NON_AGENCY_ADOPTION',
  'FOSTER_TO_ADOPT',
  'ADOPTION_FOLLOWING_PLACEMENT_ORDER'
];
```

### CaseStatus
```javascript
const CASE_STATUSES = [
  'APPLICATION',
  'DIRECTIONS',
  'CONSENT_AND_REPORTING',
  'FINAL_HEARING',
  'ORDER_GRANTED',
  'APPLICATION_REFUSED',
  'APPLICATION_WITHDRAWN',
  'ON_HOLD',
  'ADJOURNED'
];
```

### Terminal Statuses
```javascript
const TERMINAL_STATUSES = [
  'ORDER_GRANTED',
  'APPLICATION_REFUSED',
  'APPLICATION_WITHDRAWN'
];
```

### AssignmentType
```javascript
const ASSIGNMENT_TYPES = [
  'JUDICIAL',
  'CAFCASS',
  'COURT',
  'APPLICANT'
];
```

---

## 4. Status Transition Rules

### Valid Transitions Map
```javascript
const VALID_TRANSITIONS = {
  APPLICATION: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
  DIRECTIONS: ['CONSENT_AND_REPORTING', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
  CONSENT_AND_REPORTING: ['FINAL_HEARING', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
  FINAL_HEARING: ['ORDER_GRANTED', 'APPLICATION_REFUSED', 'ADJOURNED', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
  ON_HOLD: ['APPLICATION_WITHDRAWN'], // Plus return to previous state
  ADJOURNED: ['FINAL_HEARING', 'APPLICATION_WITHDRAWN'],
  ORDER_GRANTED: [],
  APPLICATION_REFUSED: [],
  APPLICATION_WITHDRAWN: []
};
```

### Role-Based Transition Authority
```javascript
const TRANSITION_AUTHORITY = {
  // Transitions requiring Judge role
  JUDGE_ONLY: ['ORDER_GRANTED', 'APPLICATION_REFUSED'],
  // Transitions HMCTS can perform
  HMCTS_ALLOWED: ['DIRECTIONS', 'CONSENT_AND_REPORTING', 'FINAL_HEARING', 'ON_HOLD', 'APPLICATION_WITHDRAWN', 'ADJOURNED'],
  // Transitions requiring reason
  REASON_REQUIRED: ['ON_HOLD', 'APPLICATION_WITHDRAWN', 'APPLICATION_REFUSED']
};
```

---

## 5. Access Control Rules

### Role Access Matrix

| Role | Access Rule |
|------|-------------|
| HMCTS_CASE_OFFICER | Case assigned_court matches user's courtAssignment OR explicit COURT assignment |
| JUDGE_LEGAL_ADVISER | Explicit JUDICIAL assignment only |
| CAFCASS_OFFICER | Explicit CAFCASS assignment only |
| LA_SOCIAL_WORKER | User's organisationId in case_organisations table |
| VAA_WORKER | User's organisationId in case_organisations table |
| ADOPTER | Explicit APPLICANT assignment only |

---

## 6. Redaction Rules for Adopters

Fields to **HIDE** from Adopters:
- `linkedCaseReference`
- `notes`
- `createdBy`
- Birth parent identifying information (future)

Fields to **SHOW** to Adopters:
- `id`
- `caseNumber`
- `caseType`
- `status`
- `assignedCourt`
- `createdAt`
- `updatedAt`

Status History for Adopters:
- Show dates only
- Hide `changedBy` user information

---

## 7. Case Number Generation

Format: `{COURT_CODE}/{YEAR}/{SEQUENCE}`

Example: `BFC/2026/00001`

Rules:
- Court code derived from court name (implementation detail)
- Year is current year (4 digits)
- Sequence is zero-padded, resets per court per year
- Must be unique across all cases

---

## 8. Audit Logging Requirements

Every case operation must create an audit log entry:

```javascript
const auditEntry = {
  id: uuid(),
  caseId: case.id,
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'VIEW' | 'DELETE',
  performedBy: user.userId,
  performedAt: new Date().toISOString(), // UTC
  beforeState: { /* previous state or null */ },
  afterState: { /* new state or null */ },
  metadata: { /* optional context */ }
};
```

---

## 9. Error Response Format

All errors should follow this format:

```json
{
  "success": false,
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

Standard codes:
- `VALIDATION_ERROR` (400)
- `AUTH_REQUIRED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INVALID_TRANSITION` (400)

---

## 10. Test User Context

Tests assume user session contains:

```javascript
const userContext = {
  userId: 'test-user',
  role: 'HMCTS_CASE_OFFICER',
  // For HMCTS users:
  courtAssignment: 'Birmingham Family Court',
  // For LA/VAA workers:
  organisationId: 'LA001',
  organisationType: 'LOCAL_AUTHORITY'
};
```
