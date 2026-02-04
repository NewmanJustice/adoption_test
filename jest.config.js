/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'scaffold',
      testMatch: ['<rootDir>/test/**/*.test.js'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      moduleNameMapper: {
        '^@adoption/shared$': '<rootDir>/shared',
      },
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
