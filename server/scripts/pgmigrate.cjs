#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const env = { ...process.env };

env.DATABASE_URL =
  env.DATABASE_URL ||
  env.PROD_DATABASE_URL ||
  env.DEV_DATABASE_URL ||
  env.TEST_DATABASE_URL ||
  env.LOCAL_DATABASE_URL;

if (!env.DATABASE_URL) {
  console.error(
    'No database URL found. Set DATABASE_URL or one of PROD_DATABASE_URL/DEV_DATABASE_URL/TEST_DATABASE_URL/LOCAL_DATABASE_URL.'
  );
  process.exit(1);
}

const bin = process.platform === 'win32' ? 'node-pg-migrate.cmd' : 'node-pg-migrate';
const args = process.argv.slice(2);

const result = spawnSync(bin, args, {
  stdio: 'inherit',
  env,
});

process.exit(typeof result.status === 'number' ? result.status : 1);
