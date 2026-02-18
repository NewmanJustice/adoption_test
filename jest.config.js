/** @type {import('jest').Config} */
module.exports = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'scaffold',
      testMatch: ['<rootDir>/test/**/*.test.js'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
            moduleResolution: 'node',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            isolatedModules: true,
          },
          diagnostics: {
            ignoreCodes: ['TS1343'], // Ignore import.meta errors
          },
        }],
      },
      moduleNameMapper: {
        '^@adoption/shared/(.+)\\.js$': '<rootDir>/shared/$1',
        '^@adoption/shared/(.*)$': '<rootDir>/shared/$1',
        '^@adoption/shared$': '<rootDir>/shared/index.ts',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      transformIgnorePatterns: [
        'node_modules/(?!(@adoption)/)',
      ],
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/server/**/*.test.ts'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@adoption/shared$': '<rootDir>/shared',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
    {
      displayName: 'client',
      testMatch: ['<rootDir>/client/**/*.test.tsx', '<rootDir>/client/**/*.test.ts'],
      testEnvironment: 'jsdom',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@adoption/shared$': '<rootDir>/shared',
        '\\.(css|scss)$': 'identity-obj-proxy',
      },
      setupFilesAfterEnv: ['<rootDir>/client/jest.setup.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            module: 'commonjs',
            moduleResolution: 'node',
          },
        }],
      },
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/shared/**/*.test.ts'],
      testEnvironment: 'node',
      preset: 'ts-jest',
    },
  ],
  collectCoverageFrom: [
    'server/src/**/*.ts',
    'client/src/**/*.{ts,tsx}',
    'shared/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
