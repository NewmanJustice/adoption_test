#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', env: process.env });
  if (typeof result.status !== 'number' || result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const shouldMigrate = process.env.RUN_MIGRATIONS_ON_STARTUP === 'true' || process.env.APP_ENV === 'PROD';

if (shouldMigrate) {
  run(process.execPath, ['scripts/pgmigrate.cjs', 'up']);
}

run(process.execPath, ['dist/index.js']);
