import { Response } from 'express';
import { requireAuth } from './authMiddleware.js';
import { AuthRequest, SessionUser } from '../types/auth.js';

describe('authMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      session: {} as any,
      sessionID: 'test-session-id',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('requireAuth with no options', () => {
    it('returns 401 when no session', () => {
      mockReq.session = undefined as any;
      const middleware = requireAuth();

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when no user in session', () => {
      mockReq.session = { user: undefined } as any;
      const middleware = requireAuth();

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next and attaches user when authenticated', () => {
      const user: SessionUser = {
        userId: 'user1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth();

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        userId: 'user1',
        role: 'HMCTS_CASE_OFFICER',
        sessionId: 'test-session-id',
      });
    });

    it('updates lastAccessedAt on request', () => {
      const user: SessionUser = {
        userId: 'user1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth();

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(user.lastAccessedAt).not.toBe('2026-01-01');
    });
  });

  describe('requireAuth with allowedRoles="*"', () => {
    it('allows any authenticated user', () => {
      const user: SessionUser = {
        userId: 'adopter1',
        role: 'ADOPTER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth({ allowedRoles: '*' });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuth with specific roles', () => {
    it('allows user with matching role', () => {
      const user: SessionUser = {
        userId: 'officer1',
        role: 'HMCTS_CASE_OFFICER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER', 'JUDGE_LEGAL_ADVISER'] });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('returns 403 for user without matching role', () => {
      const user: SessionUser = {
        userId: 'adopter1',
        role: 'ADOPTER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER'] });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: ['HMCTS_CASE_OFFICER'],
        userRole: 'ADOPTER',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('allows JUDGE when in allowed roles', () => {
      const user: SessionUser = {
        userId: 'judge1',
        role: 'JUDGE_LEGAL_ADVISER',
        createdAt: '2026-01-01',
        lastAccessedAt: '2026-01-01',
      };
      mockReq.session = { user } as any;
      const middleware = requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER', 'JUDGE_LEGAL_ADVISER'] });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
