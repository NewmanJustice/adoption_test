/**
 * Project Scaffold Feature Tests
 *
 * These tests verify the foundational infrastructure for the Adoption Digital Platform.
 * Written in TDD style - tests are designed to fail initially and pass after implementation.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to check if path exists
const pathExists = (relativePath) => {
  return fs.existsSync(path.join(ROOT_DIR, relativePath));
};

// Helper to read JSON file
const readJson = (relativePath) => {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
};

// Helper to read file content
const readFile = (relativePath) => {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
};

// ============================================================================
// STORY 1: Developer Environment Setup
// ============================================================================

describe('Story: Developer Environment Setup', () => {
  describe('AC-1: Repository structure is correct', () => {
    test('T-ENV-1: /client directory exists', () => {
      expect(pathExists('client')).toBe(true);
    });

    test('T-ENV-1: /server directory exists', () => {
      expect(pathExists('server')).toBe(true);
    });

    test('T-ENV-1: /shared directory exists', () => {
      expect(pathExists('shared')).toBe(true);
    });

    test('T-ENV-1: /docker directory exists', () => {
      expect(pathExists('docker')).toBe(true);
    });
  });

  describe('AC-2: npm workspaces configured', () => {
    test('T-ENV-2: root package.json has workspaces array', () => {
      const pkg = readJson('package.json');
      expect(pkg).not.toBeNull();
      expect(pkg.workspaces).toBeDefined();
      expect(Array.isArray(pkg.workspaces)).toBe(true);
    });

    test('T-ENV-2: workspaces includes client, server, shared', () => {
      const pkg = readJson('package.json');
      expect(pkg.workspaces).toContain('client');
      expect(pkg.workspaces).toContain('server');
      expect(pkg.workspaces).toContain('shared');
    });
  });

  describe('AC-4: Environment variables documented', () => {
    test('T-ENV-3: root .env.example exists', () => {
      expect(pathExists('.env.example')).toBe(true);
    });

    test('T-ENV-3: server .env.example exists', () => {
      expect(pathExists('server/.env.example')).toBe(true);
    });
  });

  describe('AC-10: Node.js version enforced', () => {
    test('T-ENV-4: .nvmrc file exists with Node 20', () => {
      const nvmrc = readFile('.nvmrc');
      expect(nvmrc).not.toBeNull();
      expect(nvmrc.trim()).toMatch(/^v?20/);
    });

    test('T-ENV-5: package.json has engines field', () => {
      const pkg = readJson('package.json');
      expect(pkg.engines).toBeDefined();
      expect(pkg.engines.node).toBeDefined();
      expect(pkg.engines.node).toMatch(/20/);
    });
  });

  describe('AC: npm scripts available', () => {
    test('T-ENV-6: dev script exists', () => {
      const pkg = readJson('package.json');
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts.dev).toBeDefined();
    });

    test('T-ENV-6: test script exists', () => {
      const pkg = readJson('package.json');
      expect(pkg.scripts.test).toBeDefined();
    });
  });
});

// ============================================================================
// STORY 2: Server Foundation
// ============================================================================

describe('Story: Server Foundation', () => {
  describe('AC-4: Server directory structure', () => {
    test('T-SRV-4: server/src directory exists', () => {
      expect(pathExists('server/src')).toBe(true);
    });

    test('T-SRV-4: server/src/routes directory exists', () => {
      expect(pathExists('server/src/routes')).toBe(true);
    });

    test('T-SRV-4: server/src/middleware directory exists', () => {
      expect(pathExists('server/src/middleware')).toBe(true);
    });

    test('T-SRV-4: server/migrations directory exists', () => {
      expect(pathExists('server/migrations')).toBe(true);
    });
  });

  describe('AC: Server package configuration', () => {
    test('server package.json exists', () => {
      expect(pathExists('server/package.json')).toBe(true);
    });

    test('server has express dependency', () => {
      const pkg = readJson('server/package.json');
      expect(pkg).not.toBeNull();
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      expect(deps.express).toBeDefined();
    });
  });
});

// ============================================================================
// STORY 3: Client Foundation
// ============================================================================

describe('Story: Client Foundation', () => {
  describe('AC-7: Client directory structure', () => {
    test('T-CLI-10: client/src directory exists', () => {
      expect(pathExists('client/src')).toBe(true);
    });

    test('T-CLI-10: client/src/components directory exists', () => {
      expect(pathExists('client/src/components')).toBe(true);
    });

    test('T-CLI-10: client/src/pages directory exists', () => {
      expect(pathExists('client/src/pages')).toBe(true);
    });
  });

  describe('AC: Client package configuration', () => {
    test('client package.json exists', () => {
      expect(pathExists('client/package.json')).toBe(true);
    });

    test('client has react dependency', () => {
      const pkg = readJson('client/package.json');
      expect(pkg).not.toBeNull();
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      expect(deps.react).toBeDefined();
    });

    test('client has govuk-frontend dependency', () => {
      const pkg = readJson('client/package.json');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      expect(deps['govuk-frontend']).toBeDefined();
    });
  });
});

// ============================================================================
// STORY 4: Database Foundation
// ============================================================================

describe('Story: Database Foundation', () => {
  describe('AC-3: Migrations infrastructure configured', () => {
    test('T-DB-4: migrations directory exists', () => {
      expect(pathExists('server/migrations')).toBe(true);
    });
  });

  describe('AC: Docker configuration', () => {
    test('docker-compose.yml exists', () => {
      const hasCompose = pathExists('docker/docker-compose.yml') ||
                         pathExists('docker-compose.yml');
      expect(hasCompose).toBe(true);
    });
  });
});

// ============================================================================
// STORY 5: Test Infrastructure
// ============================================================================

describe('Story: Test Infrastructure', () => {
  describe('AC-13: Test config files present', () => {
    test('T-TST-1: Jest configuration exists', () => {
      const hasJestConfig = pathExists('jest.config.js') ||
                            pathExists('jest.config.ts') ||
                            pathExists('jest.config.json');
      expect(hasJestConfig).toBe(true);
    });
  });

  describe('AC: Test scripts available', () => {
    test('T-TST-2: test script in package.json', () => {
      const pkg = readJson('package.json');
      expect(pkg.scripts.test).toBeDefined();
    });

    test('T-TST-3: test:coverage script exists', () => {
      const pkg = readJson('package.json');
      expect(pkg.scripts['test:coverage']).toBeDefined();
    });

    test('T-TST-4: test:watch script exists', () => {
      const pkg = readJson('package.json');
      expect(pkg.scripts['test:watch']).toBeDefined();
    });
  });
});

// ============================================================================
// STORY 6: Shared Code Infrastructure
// ============================================================================

describe('Story: Shared Code Infrastructure', () => {
  describe('AC-1: Shared in workspaces config', () => {
    test('T-SHR-1: shared is in workspaces array', () => {
      const pkg = readJson('package.json');
      expect(pkg.workspaces).toContain('shared');
    });
  });

  describe('AC-2: Shared directory structure', () => {
    test('T-SHR-2: shared/types directory exists', () => {
      expect(pathExists('shared/types')).toBe(true);
    });

    test('T-SHR-2: shared/constants directory exists', () => {
      expect(pathExists('shared/constants')).toBe(true);
    });

    test('T-SHR-2: shared/utils directory exists', () => {
      expect(pathExists('shared/utils')).toBe(true);
    });
  });

  describe('AC-4: Shared has package.json', () => {
    test('T-SHR-3: shared/package.json exists', () => {
      expect(pathExists('shared/package.json')).toBe(true);
    });

    test('T-SHR-3: shared package has correct name', () => {
      const pkg = readJson('shared/package.json');
      expect(pkg).not.toBeNull();
      expect(pkg.name).toMatch(/@adoption\/shared|shared/);
    });
  });

  describe('AC-3: Shared has TypeScript config', () => {
    test('T-SHR-4: shared/tsconfig.json exists', () => {
      expect(pathExists('shared/tsconfig.json')).toBe(true);
    });
  });

  describe('AC-5: Example shared types defined', () => {
    test('T-SHR-5: shared/index.ts or index.js exists', () => {
      const hasIndex = pathExists('shared/index.ts') ||
                       pathExists('shared/index.js') ||
                       pathExists('shared/src/index.ts');
      expect(hasIndex).toBe(true);
    });
  });
});
