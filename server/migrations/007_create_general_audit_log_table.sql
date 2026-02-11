-- Migration: Create general audit log table
-- This migration creates a general-purpose audit log table for all entities

CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changes JSONB,
  metadata JSONB
);

CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
