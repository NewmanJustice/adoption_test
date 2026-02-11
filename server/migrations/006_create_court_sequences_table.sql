-- Migration: Create court_sequences table
-- This migration creates a table for tracking case number sequences per court

CREATE TABLE IF NOT EXISTS court_sequences (
  id SERIAL PRIMARY KEY,
  court_code VARCHAR(10) NOT NULL,
  current_year INTEGER NOT NULL,
  current_sequence INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(court_code, current_year)
);

CREATE INDEX idx_court_sequences_code ON court_sequences(court_code);

-- Seed initial data for common courts
INSERT INTO court_sequences (court_code, current_year, current_sequence)
VALUES 
  ('BFC', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
  ('MFC', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
  ('LFC', EXTRACT(YEAR FROM NOW())::INTEGER, 0)
ON CONFLICT (court_code) DO NOTHING;
