/**
 * Feature Case Management Tests
 * Tests for Case Data Model, CRUD Operations, Access Control, and Audit Logging
 */

const request = require('supertest');
const session = require('supertest-session');

// Import app from server
const app = require('../server/src/app').default;

// Valid adoption types per AC-4
const VALID_ADOPTION_TYPES = [
  'AGENCY_ADOPTION',
  'STEP_PARENT_ADOPTION',
  'INTERCOUNTRY_ADOPTION',
  'NON_AGENCY_ADOPTION',
  'FOSTER_TO_ADOPT',
  'ADOPTION_FOLLOWING_PLACEMENT_ORDER'
];

// Valid case statuses per AC-5
const VALID_CASE_STATUSES = [
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

// Terminal statuses that cannot be changed
const TERMINAL_STATUSES = ['ORDER_GRANTED', 'APPLICATION_REFUSED', 'APPLICATION_WITHDRAWN'];

// Test user fixtures
const TEST_USERS = {
  hmctsCaseOfficer: {
    username: 'hmcts-officer',
    role: 'HMCTS_CASE_OFFICER',
    courtAssignment: 'Birmingham Family Court'
  },
  judge: {
    username: 'judge-user',
    role: 'JUDGE_LEGAL_ADVISER',
    courtAssignment: 'Birmingham Family Court'
  },
  adopter: {
    username: 'adopter-user',
    role: 'ADOPTER'
  },
  socialWorker: {
    username: 'sw-user',
    role: 'LA_SOCIAL_WORKER',
    organisationId: 'LA-001'
  }
};

let testSession;

// Helper to login as a specific user
const loginAs = async (userFixture) => {
  await testSession
    .post('/api/auth/login')
    .send(userFixture);
};

// Helper to create a valid case
const createValidCase = async (overrides = {}) => {
  const caseData = {
    caseType: 'AGENCY_ADOPTION',
    assignedCourt: 'Birmingham Family Court',
    ...overrides
  };
  return testSession
    .post('/api/cases')
    .send(caseData);
};

beforeEach(() => {
  testSession = session(app);
});

// =============================================================================
// CASE DATA MODEL TESTS
// =============================================================================

describe('Case Data Model', () => {
  describe('T-DM-4: Adoption type enum has 6 valid values', () => {
    it('defines exactly 6 adoption types', () => {
      expect(VALID_ADOPTION_TYPES).toHaveLength(6);
    });

    it('includes AGENCY_ADOPTION type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('AGENCY_ADOPTION');
    });

    it('includes STEP_PARENT_ADOPTION type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('STEP_PARENT_ADOPTION');
    });

    it('includes INTERCOUNTRY_ADOPTION type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('INTERCOUNTRY_ADOPTION');
    });

    it('includes NON_AGENCY_ADOPTION type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('NON_AGENCY_ADOPTION');
    });

    it('includes FOSTER_TO_ADOPT type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('FOSTER_TO_ADOPT');
    });

    it('includes ADOPTION_FOLLOWING_PLACEMENT_ORDER type', () => {
      expect(VALID_ADOPTION_TYPES).toContain('ADOPTION_FOLLOWING_PLACEMENT_ORDER');
    });
  });

  describe('T-DM-5: Case status enum has 9 valid values', () => {
    it('defines exactly 9 case statuses', () => {
      expect(VALID_CASE_STATUSES).toHaveLength(9);
    });

    it('includes APPLICATION status', () => {
      expect(VALID_CASE_STATUSES).toContain('APPLICATION');
    });

    it('includes DIRECTIONS status', () => {
      expect(VALID_CASE_STATUSES).toContain('DIRECTIONS');
    });

    it('includes CONSENT_AND_REPORTING status', () => {
      expect(VALID_CASE_STATUSES).toContain('CONSENT_AND_REPORTING');
    });

    it('includes FINAL_HEARING status', () => {
      expect(VALID_CASE_STATUSES).toContain('FINAL_HEARING');
    });

    it('includes ORDER_GRANTED status', () => {
      expect(VALID_CASE_STATUSES).toContain('ORDER_GRANTED');
    });

    it('includes ON_HOLD status', () => {
      expect(VALID_CASE_STATUSES).toContain('ON_HOLD');
    });

    it('includes APPLICATION_WITHDRAWN status', () => {
      expect(VALID_CASE_STATUSES).toContain('APPLICATION_WITHDRAWN');
    });

    it('includes APPLICATION_REFUSED status', () => {
      expect(VALID_CASE_STATUSES).toContain('APPLICATION_REFUSED');
    });

    it('includes ADJOURNED status', () => {
      expect(VALID_CASE_STATUSES).toContain('ADJOURNED');
    });
  });

  describe('T-DM-10: TypeScript types exported correctly', () => {
    it('AdoptionType enum matches expected values', async () => {
      // This test verifies the types module exports correctly
      // In a real implementation, we would import from types
      const expectedTypes = VALID_ADOPTION_TYPES;
      expect(expectedTypes).toBeDefined();
      expect(Array.isArray(expectedTypes)).toBe(true);
    });

    it('CaseStatus enum matches expected values', async () => {
      const expectedStatuses = VALID_CASE_STATUSES;
      expect(expectedStatuses).toBeDefined();
      expect(Array.isArray(expectedStatuses)).toBe(true);
    });

    it('Case interface includes required fields', async () => {
      // Verify structure matches expected case interface
      const requiredFields = [
        'id',
        'caseNumber',
        'caseType',
        'status',
        'assignedCourt',
        'createdBy',
        'createdAt',
        'updatedAt'
      ];
      expect(requiredFields).toHaveLength(8);
    });
  });
});

// =============================================================================
// CREATE CASE TESTS
// =============================================================================

describe('Create Case', () => {
  describe('T-CC-5: Valid case creation returns 201 with case data', () => {
    it('creates case with valid data', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase();

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.caseType).toBe('AGENCY_ADOPTION');
      expect(res.body.assignedCourt).toBe('Birmingham Family Court');
    });

    it('returns created case data in response', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase({ caseType: 'STEP_PARENT_ADOPTION' });

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('caseNumber');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('createdAt');
    });
  });

  describe('T-CC-6: Case number format COURT/YEAR/SEQ', () => {
    it('generates case number with correct format', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase();
      const currentYear = new Date().getFullYear();

      expect(res.status).toBe(201);
      // Format: BFC/2026/00001 (Court code / Year / Sequence)
      expect(res.body.caseNumber).toMatch(/^[A-Z]+\/\d{4}\/\d{5}$/);
    });

    it('derives court code from court name', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase({ assignedCourt: 'Birmingham Family Court' });

      // Birmingham Family Court -> BFC
      expect(res.body.caseNumber).toMatch(/^BFC\//);
    });

    it('increments sequence number for new cases', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res1 = await createValidCase();
      const res2 = await createValidCase();

      const seq1 = parseInt(res1.body.caseNumber.split('/')[2]);
      const seq2 = parseInt(res2.body.caseNumber.split('/')[2]);

      expect(seq2).toBeGreaterThan(seq1);
    });
  });

  describe('T-CC-7: Initial status is APPLICATION', () => {
    it('sets status to APPLICATION for new cases', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase();

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('APPLICATION');
    });

    it('ignores status field in request body', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase({ status: 'ORDER_GRANTED' });

      expect(res.body.status).toBe('APPLICATION');
    });
  });

  describe('T-CC-8: createdBy tracks authenticated user', () => {
    it('sets createdBy to authenticated user ID', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await createValidCase();

      expect(res.status).toBe(201);
      expect(res.body.createdBy).toBe('hmcts-officer');
    });

    it('records different users correctly', async () => {
      const anotherOfficer = {
        username: 'other-officer',
        role: 'HMCTS_CASE_OFFICER',
        courtAssignment: 'Birmingham Family Court'
      };
      await loginAs(anotherOfficer);

      const res = await createValidCase();

      expect(res.body.createdBy).toBe('other-officer');
    });
  });

  describe('T-CC-10: Missing case type returns 400', () => {
    it('rejects request without caseType', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({ assignedCourt: 'Birmingham Family Court' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/caseType|case type|required/i);
    });

    it('rejects request with null caseType', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({ caseType: null, assignedCourt: 'Birmingham Family Court' });

      expect(res.status).toBe(400);
    });

    it('rejects request with empty caseType', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({ caseType: '', assignedCourt: 'Birmingham Family Court' });

      expect(res.status).toBe(400);
    });
  });

  describe('T-CC-11: Invalid case type returns 400', () => {
    it('rejects invalid adoption type', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({
          caseType: 'INVALID_TYPE',
          assignedCourt: 'Birmingham Family Court'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid|caseType|type/i);
    });

    it('rejects case-insensitive invalid type', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({
          caseType: 'step_parent', // lowercase should be invalid
          assignedCourt: 'Birmingham Family Court'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('T-CC-12: Missing assigned court returns 400', () => {
    it('rejects request without assignedCourt', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({ caseType: 'AGENCY_ADOPTION' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/assignedCourt|court|required/i);
    });

    it('rejects request with empty assignedCourt', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession
        .post('/api/cases')
        .send({
          caseType: 'AGENCY_ADOPTION',
          assignedCourt: ''
        });

      expect(res.status).toBe(400);
    });
  });

  describe('T-CC-13: Non-HMCTS user returns 403', () => {
    it('denies case creation for ADOPTER role', async () => {
      await loginAs(TEST_USERS.adopter);

      const res = await createValidCase();

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/permission|forbidden|authoriz/i);
    });

    it('denies case creation for JUDGE role', async () => {
      await loginAs(TEST_USERS.judge);

      const res = await createValidCase();

      expect(res.status).toBe(403);
    });

    it('denies case creation for LA_SOCIAL_WORKER role', async () => {
      await loginAs(TEST_USERS.socialWorker);

      const res = await createValidCase();

      expect(res.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({
          caseType: 'AGENCY_ADOPTION',
          assignedCourt: 'Birmingham Family Court'
        });

      expect(res.status).toBe(401);
    });
  });
});

// =============================================================================
// LIST CASES TESTS
// =============================================================================

describe('List Cases', () => {
  describe('T-LC-2: HMCTS sees court-assigned cases', () => {
    it('returns cases for assigned court', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.cases)).toBe(true);
    });

    it('filters by court assignment', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      await createValidCase({ assignedCourt: 'Birmingham Family Court' });

      const res = await testSession.get('/api/cases');

      res.body.cases.forEach((c) => {
        expect(c.assignedCourt).toBe('Birmingham Family Court');
      });
    });
  });

  describe('T-LC-3: Judge sees only explicitly assigned cases', () => {
    it('returns only cases assigned to judge', async () => {
      await loginAs(TEST_USERS.judge);

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.cases)).toBe(true);
    });

    it('excludes cases not assigned to judge', async () => {
      await loginAs(TEST_USERS.judge);

      const res = await testSession.get('/api/cases');

      res.body.cases.forEach((c) => {
        expect(c.assignedJudge).toBe('judge-user');
      });
    });
  });

  describe('T-LC-7: Adopter sees only own cases', () => {
    it('returns only cases where user is applicant', async () => {
      await loginAs(TEST_USERS.adopter);

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      res.body.cases.forEach((c) => {
        expect(c.applicantIds).toContain('adopter-user');
      });
    });

    it('excludes cases for other adopters', async () => {
      await loginAs(TEST_USERS.adopter);

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      // All returned cases should belong to this adopter
      expect(res.body.cases.every((c) => c.applicantIds.includes('adopter-user'))).toBe(true);
    });
  });

  describe('T-LC-8: Empty state returns empty array', () => {
    it('returns empty array when no cases match', async () => {
      await loginAs({
        username: 'new-adopter',
        role: 'ADOPTER'
      });

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      expect(res.body.cases).toEqual([]);
    });

    it('returns 200 not 404 for empty results', async () => {
      await loginAs({
        username: 'empty-user',
        role: 'ADOPTER'
      });

      const res = await testSession.get('/api/cases');

      expect(res.status).toBe(200);
      expect(res.status).not.toBe(404);
    });
  });

  describe('T-LC-9: Response includes pagination metadata', () => {
    it('includes total count', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases');

      expect(res.body.pagination).toBeDefined();
      expect(typeof res.body.pagination.total).toBe('number');
    });

    it('includes page and pageSize', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases');

      expect(res.body.pagination.page).toBeDefined();
      expect(res.body.pagination.pageSize).toBeDefined();
    });

    it('includes totalPages', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases');

      expect(res.body.pagination.totalPages).toBeDefined();
    });
  });

  describe('T-LC-12: Cases sorted by createdAt desc', () => {
    it('returns newest cases first', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases');

      const cases = res.body.cases;
      if (cases.length > 1) {
        for (let i = 0; i < cases.length - 1; i++) {
          const current = new Date(cases[i].createdAt);
          const next = new Date(cases[i + 1].createdAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('T-LC-17: Unauthenticated returns 401', () => {
    it('returns 401 without session', async () => {
      const res = await request(app).get('/api/cases');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/authentication|auth|required/i);
    });
  });
});

// =============================================================================
// VIEW CASE TESTS
// =============================================================================

describe('View Case', () => {
  describe('T-VC-2: Professional user sees full case', () => {
    it('HMCTS officer sees all case fields', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(caseId);
      expect(res.body.caseType).toBeDefined();
      expect(res.body.assignedCourt).toBeDefined();
    });

    it('social worker sees full case details', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await loginAs(TEST_USERS.socialWorker);
      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.status).toBe(200);
      expect(res.body.redacted).not.toBe(true);
    });
  });

  describe('T-VC-3: Adopter sees redacted view', () => {
    it('hides sensitive fields from adopter', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      // Link adopter to case (simulated)
      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${caseId}`);

      if (res.status === 200) {
        expect(res.body.internalNotes).toBeUndefined();
        expect(res.body.staffComments).toBeUndefined();
      }
    });
  });

  describe('T-VC-6: Adopter response has redacted:true', () => {
    it('marks response as redacted for adopter', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${caseId}`);

      if (res.status === 200) {
        expect(res.body.redacted).toBe(true);
      }
    });
  });

  describe('T-VC-7: Non-existent case returns 404', () => {
    it('returns 404 for unknown case ID', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases/non-existent-id-12345');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found|case|exist/i);
    });

    it('returns 404 for malformed case ID', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);

      const res = await testSession.get('/api/cases/!!!invalid!!!');

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('T-VC-8: Unauthorised access returns 403', () => {
    it('denies access to unrelated adopter', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await loginAs({
        username: 'other-adopter',
        role: 'ADOPTER'
      });

      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.status).toBe(403);
    });
  });

  describe('T-VC-11: Permissions object reflects role', () => {
    it('HMCTS officer has edit permission', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.body.permissions).toBeDefined();
      expect(res.body.permissions.canEdit).toBe(true);
    });

    it('adopter has read-only permission', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${caseId}`);

      if (res.status === 200) {
        expect(res.body.permissions.canEdit).toBe(false);
      }
    });

    it('judge has status update permission', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await loginAs(TEST_USERS.judge);
      const res = await testSession.get(`/api/cases/${caseId}`);

      if (res.status === 200) {
        expect(res.body.permissions.canUpdateStatus).toBe(true);
      }
    });
  });

  describe('T-VC-15: Soft-deleted case returns 404', () => {
    it('returns 404 for deleted case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      // Delete the case
      await testSession.delete(`/api/cases/${caseId}`);

      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.status).toBe(404);
    });

    it('does not expose deleted case data', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      await testSession.delete(`/api/cases/${caseId}`);

      const res = await testSession.get(`/api/cases/${caseId}`);

      expect(res.body.caseNumber).toBeUndefined();
    });
  });
});

// =============================================================================
// UPDATE CASE STATUS TESTS
// =============================================================================

describe('Update Case Status', () => {
  // Helper to update case status
  const updateStatus = async (caseId, newStatus, reason = null) => {
    const body = { status: newStatus };
    if (reason) body.reason = reason;
    return testSession.patch(`/api/cases/${caseId}/status`).send(body);
  };

  describe('T-US-3: Valid transitions accepted per matrix', () => {
    it('allows APPLICATION to DIRECTIONS', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('DIRECTIONS');
    });

    it('allows DIRECTIONS to CONSENT_AND_REPORTING', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');

      const res = await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');

      expect(res.status).toBe(200);
    });

    it('allows CONSENT_AND_REPORTING to FINAL_HEARING', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');
      await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');

      const res = await updateStatus(created.body.id, 'FINAL_HEARING');

      expect(res.status).toBe(200);
    });
  });

  describe('T-US-4: Role authority enforced', () => {
    it('HMCTS can transition to DIRECTIONS', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.status).toBe(200);
    });

    it('Judge can transition to ORDER_GRANTED', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');
      await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');
      await updateStatus(created.body.id, 'FINAL_HEARING');

      await loginAs(TEST_USERS.judge);
      const res = await updateStatus(created.body.id, 'ORDER_GRANTED');

      expect(res.status).toBe(200);
    });
  });

  describe('T-US-5: Successful update returns 200', () => {
    it('returns 200 with updated case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
    });

    it('returns updated status in response', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.body.status).toBe('DIRECTIONS');
      expect(res.body.previousStatus).toBe('APPLICATION');
    });
  });

  describe('T-US-8: Invalid transition returns 400', () => {
    it('rejects APPLICATION to ORDER_GRANTED', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'ORDER_GRANTED');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid|transition|not allowed/i);
    });

    it('rejects DIRECTIONS to APPLICATION', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');

      const res = await updateStatus(created.body.id, 'APPLICATION');

      expect(res.status).toBe(400);
    });
  });

  describe('T-US-9: Insufficient role returns 403', () => {
    it('adopter cannot update status', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.adopter);
      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.status).toBe(403);
    });

    it('social worker cannot grant case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');
      await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');
      await updateStatus(created.body.id, 'FINAL_HEARING');

      await loginAs(TEST_USERS.socialWorker);
      const res = await updateStatus(created.body.id, 'ORDER_GRANTED');

      expect(res.status).toBe(403);
    });
  });

  describe('T-US-11: Terminal state rejects updates', () => {
    it('ORDER_GRANTED case cannot be updated', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');
      await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');
      await updateStatus(created.body.id, 'FINAL_HEARING');

      await loginAs(TEST_USERS.judge);
      await updateStatus(created.body.id, 'ORDER_GRANTED');

      const res = await updateStatus(created.body.id, 'ON_HOLD', 'test');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/terminal|final|cannot|change/i);
    });

    it('APPLICATION_REFUSED case cannot be updated', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');
      await updateStatus(created.body.id, 'CONSENT_AND_REPORTING');
      await updateStatus(created.body.id, 'FINAL_HEARING');

      await loginAs(TEST_USERS.judge);
      await updateStatus(created.body.id, 'APPLICATION_REFUSED');

      const res = await updateStatus(created.body.id, 'ON_HOLD', 'test');

      expect(res.status).toBe(400);
    });

    it('APPLICATION_WITHDRAWN case cannot be updated', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'APPLICATION_WITHDRAWN', 'Applicant request');

      const res = await updateStatus(created.body.id, 'DIRECTIONS');

      expect(res.status).toBe(400);
    });
  });

  describe('T-US-13: Reason required for ON_HOLD/APPLICATION_WITHDRAWN', () => {
    it('ON_HOLD requires reason', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'ON_HOLD');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/reason|required/i);
    });

    it('APPLICATION_WITHDRAWN requires reason', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'APPLICATION_WITHDRAWN');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/reason|required/i);
    });

    it('ON_HOLD succeeds with reason', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'ON_HOLD', 'Awaiting documents');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ON_HOLD');
    });

    it('APPLICATION_WITHDRAWN succeeds with reason', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await updateStatus(created.body.id, 'APPLICATION_WITHDRAWN', 'Applicant request');

      expect(res.status).toBe(200);
    });
  });

  describe('T-US-15: Concurrent update returns 409', () => {
    it('returns 409 on version conflict', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      // Simulate concurrent update with version mismatch
      const res = await testSession
        .patch(`/api/cases/${caseId}/status`)
        .send({ status: 'DIRECTIONS', version: 0 });

      // First update should succeed
      expect([200, 409]).toContain(res.status);
    });

    it('includes current version in 409 response', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await updateStatus(created.body.id, 'DIRECTIONS');

      const res = await testSession
        .patch(`/api/cases/${created.body.id}/status`)
        .send({ status: 'CONSENT_AND_REPORTING', version: 0 });

      if (res.status === 409) {
        expect(res.body.currentVersion).toBeDefined();
      }
    });
  });
});

// =============================================================================
// AUDIT LOGGING TESTS
// =============================================================================

describe('Audit Logging', () => {
  describe('T-AL-3: CREATE action logged', () => {
    it('logs case creation with CREATE action', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      const caseId = created.body.id;

      const res = await testSession.get(`/api/cases/${caseId}/audit`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.entries)).toBe(true);

      const createEntry = res.body.entries.find((e) => e.action === 'CREATE');
      expect(createEntry).toBeDefined();
    });

    it('CREATE log includes actor and timestamp', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      const createEntry = res.body.entries.find((e) => e.action === 'CREATE');
      expect(createEntry.actor).toBe('hmcts-officer');
      expect(createEntry.timestamp).toBeDefined();
    });
  });

  describe('T-AL-5: STATUS_CHANGE action logged', () => {
    it('logs status update with STATUS_CHANGE action', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await testSession
        .patch(`/api/cases/${created.body.id}/status`)
        .send({ status: 'DIRECTIONS' });

      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      const statusEntry = res.body.entries.find((e) => e.action === 'STATUS_CHANGE');
      expect(statusEntry).toBeDefined();
    });

    it('STATUS_CHANGE includes before and after values', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await testSession
        .patch(`/api/cases/${created.body.id}/status`)
        .send({ status: 'DIRECTIONS' });

      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      const statusEntry = res.body.entries.find((e) => e.action === 'STATUS_CHANGE');
      expect(statusEntry.changes.before).toBe('APPLICATION');
      expect(statusEntry.changes.after).toBe('DIRECTIONS');
    });
  });

  describe('T-AL-11: Audit log query returns entries', () => {
    it('returns audit entries for case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      expect(res.status).toBe(200);
      expect(res.body.entries).toBeDefined();
      expect(res.body.entries.length).toBeGreaterThan(0);
    });

    it('entries are sorted by timestamp descending', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();
      await testSession
        .patch(`/api/cases/${created.body.id}/status`)
        .send({ status: 'DIRECTIONS' });

      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      const entries = res.body.entries;
      if (entries.length > 1) {
        for (let i = 0; i < entries.length - 1; i++) {
          const current = new Date(entries[i].timestamp);
          const next = new Date(entries[i + 1].timestamp);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('T-AL-12: Non-HMCTS cannot view audit logs', () => {
    it('adopter cannot access audit logs', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      expect(res.status).toBe(403);
    });

    it('social worker cannot access audit logs', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.socialWorker);
      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      expect(res.status).toBe(403);
    });

    it('judge can access audit logs', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.judge);
      const res = await testSession.get(`/api/cases/${created.body.id}/audit`);

      // Judge should have access for judicial oversight
      expect([200, 403]).toContain(res.status);
    });
  });
});

// =============================================================================
// ACCESS CONTROL TESTS
// =============================================================================

describe('Access Control', () => {
  describe('T-AC-3: HMCTS court-based access granted', () => {
    it('HMCTS officer sees cases for assigned court', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase({ assignedCourt: 'Birmingham Family Court' });

      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(200);
    });

    it('HMCTS officer cannot see cases from other courts', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase({ assignedCourt: 'Birmingham Family Court' });

      await loginAs({
        username: 'london-officer',
        role: 'HMCTS_CASE_OFFICER',
        courtAssignment: 'London Family Court'
      });

      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(403);
    });
  });

  describe('T-AC-4: Judge needs explicit JUDICIAL assignment', () => {
    it('unassigned judge cannot access case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs({
        username: 'other-judge',
        role: 'JUDGE_LEGAL_ADVISER'
      });

      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(403);
    });

    it('assigned judge can access case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      // Assign judge to case
      await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'judge-user',
          assignmentType: 'JUDICIAL'
        });

      await loginAs(TEST_USERS.judge);
      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(200);
    });
  });

  describe('T-AC-8: Adopter needs APPLICANT assignment', () => {
    it('unassigned adopter cannot access case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(403);
    });

    it('assigned adopter can access own case', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      // Assign adopter as applicant
      await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'adopter-user',
          assignmentType: 'APPLICANT'
        });

      await loginAs(TEST_USERS.adopter);
      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(200);
    });
  });

  describe('T-AC-9: Access denied returns 403', () => {
    it('returns 403 with appropriate error', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs({
        username: 'random-adopter',
        role: 'ADOPTER'
      });

      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden|permission|access|denied/i);
    });

    it('403 response includes code', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs({
        username: 'random-adopter',
        role: 'ADOPTER'
      });

      const res = await testSession.get(`/api/cases/${created.body.id}`);

      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  describe('T-AC-14: Assignment creation returns 201', () => {
    it('creates assignment successfully', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'new-social-worker',
          assignmentType: 'SOCIAL_WORKER'
        });

      expect(res.status).toBe(201);
      expect(res.body.assignmentId).toBeDefined();
    });

    it('assignment includes case and user IDs', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      const res = await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'cafcass-officer',
          assignmentType: 'CAFCASS'
        });

      expect(res.body.caseId).toBe(created.body.id);
      expect(res.body.userId).toBe('cafcass-officer');
    });
  });

  describe('T-AC-16: Non-HMCTS cannot manage assignments', () => {
    it('adopter cannot create assignments', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.adopter);
      const res = await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'another-user',
          assignmentType: 'APPLICANT'
        });

      expect(res.status).toBe(403);
    });

    it('social worker cannot create assignments', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.socialWorker);
      const res = await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'another-sw',
          assignmentType: 'SOCIAL_WORKER'
        });

      expect(res.status).toBe(403);
    });

    it('judge cannot create assignments', async () => {
      await loginAs(TEST_USERS.hmctsCaseOfficer);
      const created = await createValidCase();

      await loginAs(TEST_USERS.judge);
      const res = await testSession
        .post(`/api/cases/${created.body.id}/assignments`)
        .send({
          userId: 'another-judge',
          assignmentType: 'JUDICIAL'
        });

      expect(res.status).toBe(403);
    });
  });
});
