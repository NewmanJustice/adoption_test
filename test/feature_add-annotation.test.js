/**
 * Feature: Add Annotation (Prototype Annotator Integration)
 * Tests for integration of prototype-annotator npm package
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

const BASE_PATH = '/__prototype-annotator';

// Helper to read config files
const readFileContent = (filePath) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
};

// Helper to create test app with specific NODE_ENV
const createAppWithEnv = async (nodeEnv) => {
  const originalEnv = process.env.NODE_ENV;
  const originalAnnotationEnabled = process.env.ANNOTATION_ENABLED;
  process.env.NODE_ENV = nodeEnv;
  process.env.ANNOTATION_ENABLED = nodeEnv === 'development' ? 'true' : 'false';

  // Use jest.resetModules() to properly clear Jest's module registry
  jest.resetModules();

  // Clear require.cache as well for good measure
  Object.keys(require.cache).forEach(key => {
    if (key.includes('prototype-annotator') || key.includes('server/src')) {
      delete require.cache[key];
    }
  });

  try {
    const app = require('../server/src/app').default;
    return { app, cleanup: () => {
      process.env.NODE_ENV = originalEnv;
      process.env.ANNOTATION_ENABLED = originalAnnotationEnabled;
    } };
  } catch (e) {
    process.env.NODE_ENV = originalEnv;
    process.env.ANNOTATION_ENABLED = originalAnnotationEnabled;
    throw e;
  }
};

describe('Story: Express Middleware Integration', () => {
  let app;

  beforeAll(async () => {
    const result = await createAppWithEnv('development');
    app = result.app;
  });

  describe('T-EMI-1: Middleware mounted at basePath', () => {
    it('responds to annotator base path when middleware is mounted', async () => {
      const res = await request(app).get(BASE_PATH);

      // Should not return 404 if middleware is mounted
      // Middleware may return redirect, HTML, or other response
      expect(res.status).not.toBe(404);
    });
  });

  describe('T-EMI-3: Annotation overlay script injection', () => {
    it.skip('injects annotator script into HTML responses', async () => {
      // This test requires HTML page serving which may not be implemented yet
      // Will be verified during integration testing
      const res = await request(app)
        .get('/')
        .set('Accept', 'text/html');

      expect(res.text).toContain('prototype-annotator');
    });
  });

  describe('T-EMI-4: Dashboard accessible', () => {
    it('management dashboard responds at basePath/dashboard', async () => {
      const res = await request(app).get(`${BASE_PATH}/dashboard`);

      // Dashboard should be accessible (not 404)
      expect(res.status).not.toBe(404);
    });
  });

  describe('T-EMI-5: Existing routes unaffected', () => {
    it('health endpoint still works', async () => {
      const res = await request(app).get('/api/public/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('auth login endpoint still works', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', role: 'ADOPTER' });

      expect(res.status).toBe(200);
    });
  });
});

describe('Story: Vite Proxy Configuration', () => {
  let viteConfig;

  beforeAll(() => {
    viteConfig = readFileContent('client/vite.config.ts');
  });

  describe('T-VPC-1: Annotator routes in proxy config', () => {
    it('vite config includes annotator path in proxy', () => {
      expect(viteConfig).not.toBeNull();
      expect(viteConfig).toContain('/__prototype-annotator');
    });
  });

  describe('T-VPC-2: Dashboard path proxied', () => {
    it('annotator proxy covers dashboard subpath', () => {
      // The base path proxy should cover all subpaths including /dashboard
      expect(viteConfig).toContain('/__prototype-annotator');
      expect(viteConfig).toContain('localhost:3001');
    });
  });

  describe('T-VPC-4: Existing API proxy preserved', () => {
    it('vite config still includes /api proxy', () => {
      expect(viteConfig).toContain("'/api'");
      expect(viteConfig).toContain('localhost:3001');
    });
  });

  describe('T-VPC-5: WebSocket enabled in proxy', () => {
    it('annotator proxy has ws option enabled', () => {
      // Check for ws: true in the annotator proxy config
      expect(viteConfig).toContain('ws:');
      expect(viteConfig).toMatch(/ws:\s*true/);
    });
  });
});

describe('Story: Development Environment Restriction', () => {
  describe('T-DER-1: Middleware active in development', () => {
    it('annotator routes respond when NODE_ENV=development', async () => {
      const { app, cleanup } = await createAppWithEnv('development');

      try {
        const res = await request(app).get(BASE_PATH);
        expect(res.status).not.toBe(404);
      } finally {
        cleanup();
      }
    });
  });

  describe('T-DER-2: Middleware inactive in production', () => {
    it('annotator routes return 404 when NODE_ENV=production', async () => {
      const { app, cleanup } = await createAppWithEnv('production');

      try {
        const res = await request(app).get(BASE_PATH);
        expect(res.status).toBe(404);
      } finally {
        cleanup();
      }
    });
  });

  describe('T-DER-3: Middleware inactive in test', () => {
    it('annotator routes return 404 when NODE_ENV=test', async () => {
      const { app, cleanup } = await createAppWithEnv('test');

      try {
        const res = await request(app).get(BASE_PATH);
        expect(res.status).toBe(404);
      } finally {
        cleanup();
      }
    });
  });

  describe('T-DER-4: No script injection in production', () => {
    it.skip('HTML responses do not contain annotator scripts in production', async () => {
      // Requires HTML serving implementation
      const { app, cleanup } = await createAppWithEnv('production');

      try {
        const res = await request(app)
          .get('/')
          .set('Accept', 'text/html');

        expect(res.text).not.toContain('prototype-annotator');
      } finally {
        cleanup();
      }
    });
  });
});

describe('Story: Gitignore SQLite Database', () => {
  let gitignoreContent;

  beforeAll(() => {
    gitignoreContent = readFileContent('.gitignore');
  });

  describe('T-GIT-1: Database file pattern in .gitignore', () => {
    it('gitignore excludes annotator sqlite file', () => {
      expect(gitignoreContent).not.toBeNull();
      // Should contain either the specific file or the directory
      const hasDbPattern =
        gitignoreContent.includes('annotator.sqlite') ||
        gitignoreContent.includes('prototype-annotator/') ||
        gitignoreContent.includes('/prototype-annotator');

      expect(hasDbPattern).toBe(true);
    });
  });

  describe('T-GIT-2: Directory pattern in .gitignore', () => {
    it('gitignore excludes annotator directory', () => {
      expect(gitignoreContent).not.toBeNull();
      const hasDirectoryPattern =
        gitignoreContent.includes('prototype-annotator/') ||
        gitignoreContent.includes('/prototype-annotator');

      expect(hasDirectoryPattern).toBe(true);
    });
  });

  describe('T-GIT-3: Comment explaining exclusion', () => {
    it('gitignore has comment for annotator exclusion', () => {
      expect(gitignoreContent).not.toBeNull();
      // Should have a comment near the pattern
      const hasComment =
        gitignoreContent.includes('# Prototype annotator') ||
        gitignoreContent.includes('# prototype-annotator') ||
        gitignoreContent.includes('# Annotation');

      expect(hasComment).toBe(true);
    });
  });
});

describe('Story: GOV.UK Frontend Compatibility', () => {
  describe('T-GOV-1: Styling preserved', () => {
    it.todo('Manual verification: GOV.UK components render correctly with overlay active');
  });

  describe('T-GOV-2: Components annotatable', () => {
    it.todo('Manual verification: GOV.UK form components can be selected for annotation');
  });

  describe('T-GOV-3: Focus states work', () => {
    it.todo('Manual verification: Keyboard focus rings display correctly on annotated elements');
  });

  describe('T-GOV-4: Sidebar positioning', () => {
    it.todo('Manual verification: Annotation sidebar does not obscure main content');
  });

  describe('T-GOV-5: Accessibility standards', () => {
    it.todo('Manual verification: Annotation system meets WCAG 2.1 AA requirements');
  });
});

describe('Integration: App Configuration Verification', () => {
  let appContent;

  beforeAll(() => {
    appContent = readFileContent('server/src/app.ts');
  });

  describe('App.ts contains annotator integration', () => {
    it('imports prototype-annotator package', () => {
      expect(appContent).not.toBeNull();
      expect(appContent).toContain('prototype-annotator');
    });

    it('has ANNOTATION_ENABLED check for middleware', () => {
      expect(appContent).not.toBeNull();
      expect(appContent).toContain('ANNOTATION_ENABLED');
    });

    it('uses correct basePath configuration', () => {
      expect(appContent).not.toBeNull();
      expect(appContent).toContain('__prototype-annotator');
    });
  });
});
