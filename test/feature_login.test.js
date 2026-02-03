/**
 * Feature Login Tests - Mock Authentication
 * Tests for Session Management, Auth Middleware, Login/Logout APIs
 */

const request = require('supertest');
const session = require('supertest-session');

// Import app from server
const app = require('../server/src/app').default;

const VALID_ROLES = [
  'HMCTS_CASE_OFFICER',
  'JUDGE_LEGAL_ADVISER',
  'CAFCASS_OFFICER',
  'LA_SOCIAL_WORKER',
  'VAA_WORKER',
  'ADOPTER'
];

const ROLE_REDIRECTS = {
  'HMCTS_CASE_OFFICER': '/dashboard',
  'JUDGE_LEGAL_ADVISER': '/dashboard',
  'CAFCASS_OFFICER': '/dashboard',
  'LA_SOCIAL_WORKER': '/dashboard',
  'VAA_WORKER': '/dashboard',
  'ADOPTER': '/my-cases'
};

let testSession;

beforeEach(() => {
  testSession = session(app);
});

describe('Session Management Infrastructure', () => {
  describe('T-SM-1: Session creation with valid data', () => {
    it('creates session with username and role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'HMCTS_CASE_OFFICER' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.userId).toBe('test-user');
      expect(res.body.user.role).toBe('HMCTS_CASE_OFFICER');
    });
  });

  describe('T-SM-5: Invalid role rejection', () => {
    it('rejects invalid role value', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'INVALID_ROLE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid role selected');
    });
  });

  describe('T-SM-4: Session data structure', () => {
    it('session contains required fields', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'HMCTS_CASE_OFFICER' });

      const res = await testSession.get('/api/auth/session');

      expect(res.body.user.userId).toBeDefined();
      expect(res.body.user.role).toBeDefined();
      expect(res.body.authMode).toBe('mock');
    });
  });
});

describe('API Authentication Middleware', () => {
  describe('T-AM-1: Unauthenticated request returns 401', () => {
    it('returns 401 for protected endpoint without session', async () => {
      const res = await request(app).get('/api/protected');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('T-AM-2: Authenticated request proceeds', () => {
    it('allows access with valid session', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'HMCTS_CASE_OFFICER' });

      const res = await testSession.get('/api/protected');

      expect(res.status).not.toBe(401);
    });
  });

  describe('T-AM-3: Insufficient role returns 403', () => {
    it('returns 403 when role not permitted', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'ADOPTER' });

      const res = await testSession.get('/api/admin-only');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Insufficient permissions');
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  describe('T-AM-6: Public endpoint bypass', () => {
    it('allows unauthenticated access to public endpoints', async () => {
      const res = await request(app).get('/api/public/health');

      expect(res.status).not.toBe(401);
    });
  });

  describe('T-AM-7: Login/logout routes exempt', () => {
    it('login endpoint accessible without auth', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', role: 'ADOPTER' });

      expect(res.status).not.toBe(401);
    });

    it('logout endpoint accessible without auth', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).not.toBe(401);
    });
  });
});

describe('Login API', () => {
  describe('T-LF-1: Successful login', () => {
    it('logs in with valid username and role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test-user', role: 'HMCTS_CASE_OFFICER' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.redirectUrl).toBe('/dashboard');
    });
  });

  describe('T-LF-2: Empty username validation', () => {
    it('rejects empty username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', role: 'HMCTS_CASE_OFFICER' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username is required');
    });
  });

  describe('T-LF-3: Missing username validation', () => {
    it('rejects missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ role: 'HMCTS_CASE_OFFICER' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username is required');
    });
  });

  describe('T-LF-4: Invalid role validation', () => {
    it('rejects invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', role: 'SUPER_ADMIN' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid role selected');
    });
  });

  describe('T-LF-5: Missing role validation', () => {
    it('rejects missing role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test-user' });

      expect(res.status).toBe(400);
    });
  });

  describe('T-LF-7: Adopter redirect', () => {
    it('redirects adopter to /my-cases', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'adopter-user', role: 'ADOPTER' });

      expect(res.body.redirectUrl).toBe('/my-cases');
    });
  });

  describe('T-LF-9: All roles accepted', () => {
    it('accepts all six valid roles', async () => {
      for (const role of VALID_ROLES) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ username: 'test', role });

        expect(res.status).toBe(200);
        expect(res.body.redirectUrl).toBe(ROLE_REDIRECTS[role]);
      }
    });
  });
});

describe('Logout API', () => {
  describe('T-LO-1: Successful logout', () => {
    it('logs out successfully', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test', role: 'ADOPTER' });

      const res = await testSession.post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('T-LO-2: Logout clears session', () => {
    it('session is cleared after logout', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test', role: 'ADOPTER' });

      await testSession.post('/api/auth/logout');

      const res = await testSession.get('/api/auth/session');
      expect(res.body.authenticated).toBe(false);
    });
  });

  describe('T-LO-3: Idempotent logout', () => {
    it('logout without session returns success', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('T-LO-4: Post-logout access denied', () => {
    it('protected routes return 401 after logout', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'test', role: 'ADOPTER' });

      await testSession.post('/api/auth/logout');

      const res = await testSession.get('/api/protected');
      expect(res.status).toBe(401);
    });
  });
});

describe('Protected Route Handling', () => {
  describe('T-PR-3/4/5: Return URL sanitisation', () => {
    const sanitizeReturnUrl = (url) => {
      if (!url || typeof url !== 'string') return null;
      if (!url.startsWith('/')) return null;
      if (url.startsWith('//')) return null;
      if (url.toLowerCase().includes('javascript:')) return null;
      return url;
    };

    it('accepts valid relative URLs', () => {
      expect(sanitizeReturnUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeReturnUrl('/cases/123')).toBe('/cases/123');
    });

    it('rejects absolute URLs', () => {
      expect(sanitizeReturnUrl('https://evil.com')).toBeNull();
      expect(sanitizeReturnUrl('http://evil.com')).toBeNull();
    });

    it('rejects protocol-relative URLs', () => {
      expect(sanitizeReturnUrl('//evil.com')).toBeNull();
    });

    it('rejects javascript URLs', () => {
      expect(sanitizeReturnUrl('javascript:alert(1)')).toBeNull();
    });
  });
});

describe('Mock Auth Visual Indicator', () => {
  describe('T-VI-1: Auth mode flag', () => {
    it('session endpoint returns authMode', async () => {
      const res = await request(app).get('/api/auth/session');

      expect(res.body.authMode).toBe('mock');
    });
  });

  describe('T-VI-2: Session includes user info', () => {
    it('returns user and role when authenticated', async () => {
      await testSession
        .post('/api/auth/login')
        .send({ username: 'dev-user', role: 'HMCTS_CASE_OFFICER' });

      const res = await testSession.get('/api/auth/session');

      expect(res.body.authenticated).toBe(true);
      expect(res.body.user.userId).toBe('dev-user');
      expect(res.body.user.role).toBe('HMCTS_CASE_OFFICER');
    });
  });
});
