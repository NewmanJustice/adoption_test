-- Initial schema migration
-- Creates audit_log and sessions tables

-- Audit log table for tracking system events
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  user_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- Sessions table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);

-- Down migration (for rollback)
-- DROP INDEX IF EXISTS idx_sessions_expire;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS audit_log;
