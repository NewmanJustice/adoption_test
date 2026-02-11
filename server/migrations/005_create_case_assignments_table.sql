-- Migration: Create case_assignments table
-- This migration creates the case assignments table for mapping users to cases

CREATE TABLE IF NOT EXISTS case_assignments (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by VARCHAR(255),
  UNIQUE(case_id, user_id, role)
);

CREATE INDEX idx_case_assignments_case_id ON case_assignments(case_id);
CREATE INDEX idx_case_assignments_user_id ON case_assignments(user_id);
CREATE INDEX idx_case_assignments_role ON case_assignments(role);

ALTER TABLE case_assignments ADD CONSTRAINT fk_case_assignments_case 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;
