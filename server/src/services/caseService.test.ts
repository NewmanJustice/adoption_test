import * as caseService from './caseService.js';
import * as caseRepo from '../repositories/caseRepository.js';
import { SessionUser } from '../types/auth.js';
import { Case, CaseAssignment, CaseDashboardCase } from '../types/case.js';

describe('caseService', () => {
  beforeEach(() => {
    caseRepo.clearAllData();
  });

  describe('isValidAdoptionType', () => {
    it('returns true for valid adoption types', () => {
      expect(caseService.isValidAdoptionType('AGENCY_ADOPTION')).toBe(true);
      expect(caseService.isValidAdoptionType('STEP_PARENT_ADOPTION')).toBe(true);
      expect(caseService.isValidAdoptionType('INTERCOUNTRY_ADOPTION')).toBe(true);
    });

    it('returns false for invalid adoption types', () => {
      expect(caseService.isValidAdoptionType('INVALID_TYPE')).toBe(false);
      expect(caseService.isValidAdoptionType('')).toBe(false);
    });
  });

  describe('isTerminalStatus', () => {
    it('returns true for terminal statuses', () => {
      expect(caseService.isTerminalStatus('ORDER_GRANTED')).toBe(true);
      expect(caseService.isTerminalStatus('APPLICATION_REFUSED')).toBe(true);
      expect(caseService.isTerminalStatus('APPLICATION_WITHDRAWN')).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      expect(caseService.isTerminalStatus('APPLICATION')).toBe(false);
      expect(caseService.isTerminalStatus('DIRECTIONS')).toBe(false);
    });
  });

  describe('isValidTransition', () => {
    it('allows APPLICATION to DIRECTIONS', () => {
      expect(caseService.isValidTransition('APPLICATION', 'DIRECTIONS')).toBe(true);
    });

    it('allows APPLICATION to ON_HOLD', () => {
      expect(caseService.isValidTransition('APPLICATION', 'ON_HOLD')).toBe(true);
    });

    it('disallows APPLICATION directly to FINAL_HEARING', () => {
      expect(caseService.isValidTransition('APPLICATION', 'FINAL_HEARING')).toBe(false);
    });

    it('disallows transitions from terminal statuses', () => {
      expect(caseService.isValidTransition('ORDER_GRANTED', 'APPLICATION')).toBe(false);
    });
  });

  describe('canRolePerformTransition', () => {
    it('allows JUDGE to grant order', () => {
      expect(caseService.canRolePerformTransition('JUDGE_LEGAL_ADVISER', 'ORDER_GRANTED')).toBe(true);
    });

    it('disallows HMCTS officer to grant order', () => {
      expect(caseService.canRolePerformTransition('HMCTS_CASE_OFFICER', 'ORDER_GRANTED')).toBe(false);
    });

    it('allows HMCTS officer to move to DIRECTIONS', () => {
      expect(caseService.canRolePerformTransition('HMCTS_CASE_OFFICER', 'DIRECTIONS')).toBe(true);
    });

    it('disallows ADOPTER to perform transitions', () => {
      expect(caseService.canRolePerformTransition('ADOPTER', 'DIRECTIONS')).toBe(false);
    });
  });

  describe('requiresReason', () => {
    it('requires reason for ON_HOLD', () => {
      expect(caseService.requiresReason('ON_HOLD')).toBe(true);
    });

    it('requires reason for APPLICATION_WITHDRAWN', () => {
      expect(caseService.requiresReason('APPLICATION_WITHDRAWN')).toBe(true);
    });

    it('does not require reason for DIRECTIONS', () => {
      expect(caseService.requiresReason('DIRECTIONS')).toBe(false);
    });
  });

  describe('getPermissions', () => {
    const mockCase: Case = {
      id: '1',
      caseNumber: 'TEST/2026/00001',
      caseType: 'AGENCY_ADOPTION',
      status: 'APPLICATION',
      assignedCourt: 'Test Court',
      createdBy: 'user1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      version: 1,
      applicantIds: [],
    };

    it('grants full permissions to HMCTS officer', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const permissions = caseService.getPermissions(user, mockCase);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canUpdateStatus).toBe(true);
      expect(permissions.canDelete).toBe(true);
      expect(permissions.canViewAudit).toBe(true);
    });

    it('grants limited permissions to JUDGE', () => {
      const user: SessionUser = {
        userId: 'judge1',
        role: 'JUDGE_LEGAL_ADVISER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const permissions = caseService.getPermissions(user, mockCase);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canUpdateStatus).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canViewAudit).toBe(true);
    });

    it('grants no permissions to ADOPTER', () => {
      const user: SessionUser = {
        userId: 'adopter1',
        role: 'ADOPTER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const permissions = caseService.getPermissions(user, mockCase);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canUpdateStatus).toBe(false);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canViewAudit).toBe(false);
    });
  });

  describe('createCase', () => {
    it('creates a case with APPLICATION status', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const newCase = caseService.createCase('AGENCY_ADOPTION', 'London Court', user);

      expect(newCase.id).toBeDefined();
      expect(newCase.caseType).toBe('AGENCY_ADOPTION');
      expect(newCase.assignedCourt).toBe('London Court');
      expect(newCase.status).toBe('APPLICATION');
      expect(newCase.version).toBe(1);
    });

    it('generates unique case numbers', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const case1 = caseService.createCase('AGENCY_ADOPTION', 'London Court', user);
      const case2 = caseService.createCase('AGENCY_ADOPTION', 'London Court', user);

      expect(case1.caseNumber).not.toBe(case2.caseNumber);
    });
  });

  describe('updateStatus', () => {
    let testCase: Case;
    const hmctsUser: SessionUser = {
      userId: 'officer1',
      role: 'HMCTS_CASE_OFFICER',
      createdAt: '2026-01-01',
      lastAccessedAt: '2026-01-01',
    };

    beforeEach(() => {
      testCase = caseService.createCase('AGENCY_ADOPTION', 'Test Court', hmctsUser);
    });

    it('successfully transitions from APPLICATION to DIRECTIONS', () => {
      const result = caseService.updateStatus(testCase.id, 'DIRECTIONS', hmctsUser);

      expect(result.success).toBe(true);
      expect(result.case?.status).toBe('DIRECTIONS');
      expect(result.previousStatus).toBe('APPLICATION');
    });

    it('fails for invalid transitions', () => {
      const result = caseService.updateStatus(testCase.id, 'FINAL_HEARING', hmctsUser);

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_TRANSITION');
    });

    it('fails when reason required but not provided', () => {
      const result = caseService.updateStatus(testCase.id, 'ON_HOLD', hmctsUser);

      expect(result.success).toBe(false);
      expect(result.code).toBe('REASON_REQUIRED');
    });

    it('succeeds when reason provided for ON_HOLD', () => {
      const result = caseService.updateStatus(testCase.id, 'ON_HOLD', hmctsUser, 'Awaiting documents');

      expect(result.success).toBe(true);
      expect(result.case?.status).toBe('ON_HOLD');
    });

    it('fails for version conflict', () => {
      const result = caseService.updateStatus(testCase.id, 'DIRECTIONS', hmctsUser, undefined, 999);

      expect(result.success).toBe(false);
      expect(result.code).toBe('CONFLICT');
      expect(result.currentVersion).toBe(1);
    });

    it('prevents HMCTS from granting order', () => {
      // Move to FINAL_HEARING first
      caseService.updateStatus(testCase.id, 'DIRECTIONS', hmctsUser);
      caseService.updateStatus(testCase.id, 'CONSENT_AND_REPORTING', hmctsUser);
      caseService.updateStatus(testCase.id, 'FINAL_HEARING', hmctsUser);

      const result = caseService.updateStatus(testCase.id, 'ORDER_GRANTED', hmctsUser);

      expect(result.success).toBe(false);
      expect(result.code).toBe('FORBIDDEN');
    });

    it('allows JUDGE to grant order', () => {
      const judgeUser: SessionUser = {
        userId: 'judge1',
        role: 'JUDGE_LEGAL_ADVISER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };

      // Move to FINAL_HEARING
      caseService.updateStatus(testCase.id, 'DIRECTIONS', hmctsUser);
      caseService.updateStatus(testCase.id, 'CONSENT_AND_REPORTING', hmctsUser);
      caseService.updateStatus(testCase.id, 'FINAL_HEARING', hmctsUser);

      const result = caseService.updateStatus(testCase.id, 'ORDER_GRANTED', judgeUser);

      expect(result.success).toBe(true);
      expect(result.case?.status).toBe('ORDER_GRANTED');
    });
  });

  describe('checkCaseAccess', () => {
    it('grants HMCTS access to cases in their court', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
        courtAssignment: 'Test Court',
      };
      const caseData: Case = {
        id: '1',
        caseNumber: 'TEST/2026/00001',
        caseType: 'AGENCY_ADOPTION',
        status: 'APPLICATION',
        assignedCourt: 'Test Court',
        createdBy: 'user1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        version: 1,
        applicantIds: [],
      };

      expect(caseService.checkCaseAccess(user, caseData, [])).toBe(true);
    });

    it('denies HMCTS access to cases in other courts', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
        courtAssignment: 'Other Court',
      };
      const caseData: Case = {
        id: '1',
        caseNumber: 'TEST/2026/00001',
        caseType: 'AGENCY_ADOPTION',
        status: 'APPLICATION',
        assignedCourt: 'Test Court',
        createdBy: 'user1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        version: 1,
        applicantIds: [],
      };

      expect(caseService.checkCaseAccess(user, caseData, [])).toBe(false);
    });

    it('grants ADOPTER access when assigned as applicant', () => {
      const user: SessionUser = {
        userId: 'adopter1',
        role: 'ADOPTER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      const caseData: Case = {
        id: '1',
        caseNumber: 'TEST/2026/00001',
        caseType: 'AGENCY_ADOPTION',
        status: 'APPLICATION',
        assignedCourt: 'Test Court',
        createdBy: 'user1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        version: 1,
        applicantIds: ['adopter1'],
      };
      const assignments: CaseAssignment[] = [{
        id: 'a1',
        caseId: '1',
        userId: 'adopter1',
        assignmentType: 'APPLICANT',
        createdAt: '2026-01-01',
        createdBy: 'officer1',
      }];

      expect(caseService.checkCaseAccess(user, caseData, assignments)).toBe(true);
    });
  });

  describe('calculateAttentionLevel', () => {
    it('returns normal when no hearing date', () => {
      expect(caseService.calculateAttentionLevel({})).toBe('normal');
    });

    it('returns overdue for past hearing dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(caseService.calculateAttentionLevel({ nextHearing: pastDate.toISOString() })).toBe('overdue');
    });

    it('returns approaching for hearing within 7 days', () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 3);
      expect(caseService.calculateAttentionLevel({ nextHearing: nearDate.toISOString() })).toBe('approaching');
    });

    it('returns normal for hearing more than 7 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      expect(caseService.calculateAttentionLevel({ nextHearing: futureDate.toISOString() })).toBe('normal');
    });
  });

  describe('redactCaseForAdopter', () => {
    it('removes sensitive fields', () => {
      const caseData: Case = {
        id: '1',
        caseNumber: 'TEST/2026/00001',
        caseType: 'AGENCY_ADOPTION',
        status: 'APPLICATION',
        assignedCourt: 'Test Court',
        createdBy: 'user1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        version: 1,
        applicantIds: [],
        internalNotes: 'Secret notes',
        staffComments: 'Staff only',
      };

      const redacted = caseService.redactCaseForAdopter(caseData);

      expect(redacted.redacted).toBe(true);
      expect((redacted as any).internalNotes).toBeUndefined();
      expect((redacted as any).staffComments).toBeUndefined();
      expect(redacted.caseNumber).toBe('TEST/2026/00001');
    });
  });
});
