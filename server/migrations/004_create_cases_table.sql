-- Migration: Create cases table
-- This migration creates the main cases table for adoption case management

CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(255) PRIMARY KEY,
  case_number VARCHAR(50) NOT NULL UNIQUE,
  case_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  court VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP WITH TIME ZONE,
  internal_notes TEXT,
  staff_comments TEXT,
  assigned_judge VARCHAR(255),
  organisation_id VARCHAR(255),
  status_reason TEXT,
  applicant_ids JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_cases_court ON cases(court);
CREATE INDEX idx_cases_deleted_at ON cases(deleted_at);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_case_number ON cases(case_number);
