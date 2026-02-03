# Test Plan - Case Management Feature

## 1. Scope

### In Scope
- Case creation API and validation
- Case listing API with role-based filtering
- Case detail view API with redaction
- Case status update API with transition validation
- Case access control enforcement
- Case audit logging
- Role-based permission enforcement

### Out of Scope
- UI/frontend component testing (API only)
- Document management integration
- Party/participant management
- Hearing scheduling
- Full database integration (mocked for unit tests)
- Performance/load testing

---

## 2. Test Types

| Type | Framework | Purpose |
|------|-----------|---------|
| Unit Tests | Jest | Controller logic, validation, business rules |
| Integration Tests | Jest + Supertest | API endpoint behaviour |
| Session Tests | Supertest-session | Authentication and session state |

---

## 3. Test Categories

### 3.1 Case Data Model (Story: case-data-model)
- Validate TypeScript types and enums exist
- Verify enum values match specification
- Test case number uniqueness constraint

### 3.2 Case Creation (Story: create-case)
- Happy path: valid case creation
- Validation: missing/invalid case type
- Validation: missing assigned court
- Permission: HMCTS Case Officer allowed
- Permission: other roles forbidden
- Case number generation
- Initial status verification
- Created by tracking

### 3.3 Case Listing (Story: list-cases)
- Role-based filtering for all six roles
- Pagination support
- Empty state handling
- Sort order verification
- Authentication requirement

### 3.4 Case View (Story: view-case)
- Full view for professional users
- Redacted view for Adopters
- Case not found handling
- Access denied handling
- Soft-deleted case handling

### 3.5 Status Update (Story: update-case-status)
- Valid transitions per state
- Invalid transition rejection
- Role authority enforcement
- Terminal state handling
- Reason requirement for specific transitions
- Concurrent update conflict handling
- Status history recording

### 3.6 Audit Logging (Story: case-audit-logging)
- CREATE action logging
- UPDATE action logging
- STATUS_CHANGE action logging
- VIEW action logging
- Audit log immutability
- Audit log query endpoint

### 3.7 Access Control (Story: case-access-control)
- HMCTS court-based access
- Judge explicit assignment access
- Cafcass explicit assignment access
- LA organisation-based access
- VAA organisation-based access
- Adopter applicant assignment access
- Access denial logging
- Assignment management (HMCTS only)

---

## 4. Test Environment

### Dependencies
- Node.js with Express
- Jest test runner
- Supertest for HTTP testing
- Supertest-session for session handling
- Mock database layer

### Test Data
- Pre-defined test users per role
- Sample case data for different scenarios
- Test court assignments
- Test organisation associations

---

## 5. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Database mocking complexity | Use repository pattern with injectable mocks |
| Session state leaking between tests | Reset session in beforeEach |
| Flaky async tests | Use proper async/await patterns |
| Test data coupling | Use factory functions for test data |

---

## 6. Assumptions

1. Mock authentication feature is available and functional
2. Database layer can be mocked via dependency injection
3. Test environment uses same role definitions as production
4. Case number generation logic is deterministic for testing

---

## 7. Test Execution

### Running Tests
```bash
npm test test/feature_case-management.test.js
```

### Coverage Target
- Minimum 80% code coverage for business logic
- All acceptance criteria have at least one test
- All error scenarios tested

---

## 8. Dependencies on Other Features

| Feature | Dependency Type |
|---------|-----------------|
| Mock Login | Authentication context |
| Session Management | User session |
| API Middleware | Authentication enforcement |
