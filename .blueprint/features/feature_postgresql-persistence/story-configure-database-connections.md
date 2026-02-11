# Story 5 — Configure Database Connections for Multiple Environments

## User story
As a **DevOps engineer**, I want database connection configuration to select the correct PostgreSQL instance based on APP_ENV, so that local, dev, test, and production environments use separate databases.

---

## Context / scope
- Infrastructure story (configuration changes)
- Uses environment variable `APP_ENV` to select database URL
- Configuration logic in `server/src/config/index.ts` (lines 10-32 per Feature Spec)
- No code changes to repository layer (uses existing pool from `server/src/config/database.ts`)
- Scope: Environment-specific connection string selection

---

## Acceptance criteria

**AC-1 — Local environment uses LOCAL_DATABASE_URL**
- Given `APP_ENV=LOCAL` is set,
- When the application starts,
- Then the database connection string is read from `LOCAL_DATABASE_URL`,
- And the connection pool connects to `postgresql://adoption:adoption@localhost:5432/adoption`,
- And all queries execute against the local PostgreSQL instance.

**AC-2 — Dev environment uses DEV_DATABASE_URL**
- Given `APP_ENV=DEV` is set in Azure App Service,
- When the application starts,
- Then the database connection string is read from `DEV_DATABASE_URL`,
- And the connection includes `?sslmode=require` for secure connection,
- And all queries execute against Azure Database for PostgreSQL (dev instance).

**AC-3 — Production environment uses PROD_DATABASE_URL**
- Given `APP_ENV=PROD` is set in Azure App Service,
- When the application starts,
- Then the database connection string is read from `PROD_DATABASE_URL`,
- And the connection includes `?sslmode=require`,
- And all queries execute against Azure Database for PostgreSQL (production instance).

**AC-4 — Missing database URL fails fast**
- Given `APP_ENV=DEV` but `DEV_DATABASE_URL` is not set,
- When the application starts,
- Then initialization fails with a clear error message: "DEV_DATABASE_URL environment variable is required for APP_ENV=DEV",
- And the application does not start,
- And the error is logged to console.

**AC-5 — Connection pool configuration remains unchanged**
- Given database connection is configured for any environment,
- When the connection pool is initialized,
- Then the pool max size remains 10 connections,
- And idle timeout remains at default value,
- And connection retry behavior remains unchanged.

---

## Out of scope
- Connection pool tuning (max size, timeouts)
- Database migration execution automation (manual npm script)
- Database credential rotation (handled by Azure Key Vault)
- Connection string validation (PostgreSQL driver handles this)
- Fallback to alternative database (fail-fast only)
