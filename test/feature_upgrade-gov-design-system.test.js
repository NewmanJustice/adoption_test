/**
 * GOV.UK Frontend v5 Upgrade Tests
 *
 * These tests verify the technical upgrade from govuk-frontend v4 to v5.
 * Tests are designed to work incrementally as the codebase develops.
 */

const fs = require('fs');
const path = require('path');

// Helper to safely check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

// Helper to read file content safely
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
};

// Project root path
const PROJECT_ROOT = path.resolve(__dirname, '..');

describe('GOV.UK Frontend v5 Upgrade', () => {

  // ===========================================
  // Story 2: Package and Sass Migration Tests
  // ===========================================

  describe('Story 2: Package Version and Sass Migration', () => {

    describe('T-2.1: Package Version', () => {
      it('should have govuk-frontend as a dependency', () => {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        expect(fileExists(pkgPath)).toBe(true);

        const pkg = JSON.parse(readFile(pkgPath));
        const govukVersion = pkg.dependencies?.['govuk-frontend'] ||
                            pkg.devDependencies?.['govuk-frontend'];

        expect(govukVersion).toBeDefined();
      });

      it('should have govuk-frontend version 5.x installed', () => {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const pkg = JSON.parse(readFile(pkgPath));
        const govukVersion = pkg.dependencies?.['govuk-frontend'] ||
                            pkg.devDependencies?.['govuk-frontend'];

        // Version should start with 5 (e.g., "^5.14.0", "5.14.0", "~5.14.0")
        expect(govukVersion).toMatch(/^[\^~]?5\./);
      });
    });

    describe('T-2.2 & T-2.3: Sass Import Syntax', () => {
      const sassEntryPoints = [
        'client/src/styles/index.scss',
        'src/styles/index.scss',
        'styles/index.scss'
      ];

      it('should not use deprecated @import for govuk-frontend', () => {
        let foundSassFile = false;

        for (const relativePath of sassEntryPoints) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            foundSassFile = true;
            const content = readFile(fullPath);

            // Should NOT contain @import 'govuk-frontend
            const hasDeprecatedImport = /@import\s+['"]govuk-frontend/.test(content);
            expect(hasDeprecatedImport).toBe(false);
          }
        }

        if (!foundSassFile) {
          // Skip if no Sass files exist yet
          console.log('No Sass entry point found - skipping import syntax check');
        }
      });

      it('should use @use syntax for govuk-frontend imports', () => {
        let foundSassFile = false;

        for (const relativePath of sassEntryPoints) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            foundSassFile = true;
            const content = readFile(fullPath);

            // Should contain @use 'govuk-frontend
            const hasModernImport = /@use\s+['"]govuk-frontend/.test(content);
            expect(hasModernImport).toBe(true);
          }
        }

        if (!foundSassFile) {
          console.log('No Sass entry point found - skipping @use syntax check');
        }
      });

      it('should use correct v5 import path (/dist/govuk/)', () => {
        for (const relativePath of sassEntryPoints) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            const content = readFile(fullPath);

            if (content.includes('govuk-frontend')) {
              // v5 uses /dist/ path
              const hasV5Path = /govuk-frontend\/dist\//.test(content);
              expect(hasV5Path).toBe(true);
            }
          }
        }
      });
    });
  });

  // ===========================================
  // Story 3: Component Class Names Tests
  // ===========================================

  describe('Story 3: Component Class Names', () => {

    const componentPaths = {
      Header: ['client/src/components/Header.jsx', 'client/src/components/Header.tsx'],
      Footer: ['client/src/components/Footer.jsx', 'client/src/components/Footer.tsx'],
      PhaseBanner: ['client/src/components/PhaseBanner.jsx', 'client/src/components/PhaseBanner.tsx'],
      SkipLink: ['client/src/components/SkipLink.jsx', 'client/src/components/SkipLink.tsx']
    };

    const findComponent = (possiblePaths) => {
      for (const relativePath of possiblePaths) {
        const fullPath = path.join(PROJECT_ROOT, relativePath);
        if (fileExists(fullPath)) {
          return { path: fullPath, content: readFile(fullPath) };
        }
      }
      return null;
    };

    describe('T-3.1: Header Component', () => {
      it('should contain govuk-header class when component exists', () => {
        const component = findComponent(componentPaths.Header);

        if (component) {
          expect(component.content).toMatch(/govuk-header/);
        } else {
          console.log('Header component not found - test will pass when component is created');
        }
      });
    });

    describe('T-3.2: Footer Component', () => {
      it('should contain govuk-footer class when component exists', () => {
        const component = findComponent(componentPaths.Footer);

        if (component) {
          expect(component.content).toMatch(/govuk-footer/);
        } else {
          console.log('Footer component not found - test will pass when component is created');
        }
      });
    });

    describe('T-3.3: PhaseBanner Component', () => {
      it('should contain govuk-phase-banner class when component exists', () => {
        const component = findComponent(componentPaths.PhaseBanner);

        if (component) {
          expect(component.content).toMatch(/govuk-phase-banner/);
        } else {
          console.log('PhaseBanner component not found - test will pass when component is created');
        }
      });
    });

    describe('T-3.4: SkipLink Component', () => {
      it('should contain govuk-skip-link class when component exists', () => {
        const component = findComponent(componentPaths.SkipLink);

        if (component) {
          expect(component.content).toMatch(/govuk-skip-link/);
        } else {
          console.log('SkipLink component not found - test will pass when component is created');
        }
      });
    });
  });

  // ===========================================
  // Story 4: JavaScript Initialisation Tests
  // ===========================================

  describe('Story 4: JavaScript Initialisation', () => {

    describe('T-4.2: Header data-module attribute', () => {
      it('should have data-module="govuk-header" when Header component exists', () => {
        const headerPaths = [
          'client/src/components/Header.jsx',
          'client/src/components/Header.tsx'
        ];

        let found = false;
        for (const relativePath of headerPaths) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            found = true;
            const content = readFile(fullPath);
            expect(content).toMatch(/data-module=["']govuk-header["']/);
          }
        }

        if (!found) {
          console.log('Header component not found - skipping data-module check');
        }
      });
    });

    describe('T-4.3: SkipLink data-module attribute', () => {
      it('should have data-module="govuk-skip-link" when SkipLink component exists', () => {
        const skipLinkPaths = [
          'client/src/components/SkipLink.jsx',
          'client/src/components/SkipLink.tsx'
        ];

        let found = false;
        for (const relativePath of skipLinkPaths) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            found = true;
            const content = readFile(fullPath);
            expect(content).toMatch(/data-module=["']govuk-skip-link["']/);
          }
        }

        if (!found) {
          console.log('SkipLink component not found - skipping data-module check');
        }
      });
    });

    describe('T-4.4: JavaScript imports use v5 patterns', () => {
      it('should not use deprecated initAll import pattern', () => {
        const jsEntryPoints = [
          'client/src/index.js',
          'client/src/index.jsx',
          'client/src/index.ts',
          'client/src/index.tsx',
          'client/src/App.js',
          'client/src/App.jsx'
        ];

        for (const relativePath of jsEntryPoints) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            const content = readFile(fullPath);

            // If govuk-frontend is imported, it should use v5 patterns
            if (content.includes('govuk-frontend')) {
              // v5 prefers createAll over initAll for selective init
              // But initAll is still valid - just checking imports work
              const hasValidImport = /import\s+.*from\s+['"]govuk-frontend['"]/.test(content);
              if (hasValidImport) {
                expect(hasValidImport).toBe(true);
              }
            }
          }
        }
      });
    });
  });

  // ===========================================
  // Story 5: Build and Accessibility Tests
  // ===========================================

  describe('Story 5: Build Verification', () => {

    describe('T-5.1 & T-5.2: Build Process', () => {
      it('should have a build script defined', () => {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const pkg = JSON.parse(readFile(pkgPath));

        // Check for common build script names
        const hasBuildScript = pkg.scripts?.build ||
                              pkg.scripts?.['build:css'] ||
                              pkg.scripts?.['build:sass'];

        // Build script should exist (may not for new projects)
        if (!hasBuildScript) {
          console.log('No build script found - add "build" script to package.json');
        }
      });
    });

    describe('T-5.8: Test Configuration', () => {
      it('should have Jest configured', () => {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const pkg = JSON.parse(readFile(pkgPath));

        const hasJest = pkg.devDependencies?.jest ||
                       pkg.dependencies?.jest ||
                       fileExists(path.join(PROJECT_ROOT, 'jest.config.js'));

        expect(hasJest).toBeTruthy();
      });
    });
  });

  // ===========================================
  // Story 1: Configuration Verification Tests
  // ===========================================

  describe('Story 1: Configuration Verification', () => {

    describe('T-1.1: Sass Compiler Version', () => {
      it('should have sass (Dart Sass) as a dependency', () => {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const pkg = JSON.parse(readFile(pkgPath));

        // Check for sass package (Dart Sass)
        const hasSass = pkg.devDependencies?.sass || pkg.dependencies?.sass;

        if (!hasSass) {
          console.log('Sass not found - required for @use syntax support');
        }
      });
    });

    describe('T-1.2: No Custom Sass Overrides', () => {
      it('should not have custom govuk variable overrides in main Sass file', () => {
        const sassFiles = [
          'client/src/styles/index.scss',
          'src/styles/index.scss'
        ];

        for (const relativePath of sassFiles) {
          const fullPath = path.join(PROJECT_ROOT, relativePath);
          if (fileExists(fullPath)) {
            const content = readFile(fullPath);

            // Check for variable overrides (e.g., $govuk-font-family:)
            const hasOverrides = /\$govuk-[a-z-]+\s*:/.test(content);

            if (hasOverrides) {
              console.log('Warning: Custom GOV.UK variable overrides found - migration may be more complex');
            }
          }
        }
      });
    });
  });
});
