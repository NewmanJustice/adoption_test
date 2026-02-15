-- Migration: Create adoption pilot tables
-- Adds configuration, metric entries, deviations, phases, and audit logging tables

CREATE TABLE IF NOT EXISTS pilot_configuration (
  id VARCHAR(50) PRIMARY KEY,
  domain_scope TEXT NOT NULL,
  experiment_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_phase_state (
  id VARCHAR(50) PRIMARY KEY,
  config_id VARCHAR(50) REFERENCES pilot_configuration(id) ON DELETE CASCADE,
  current_phase VARCHAR(20) NOT NULL,
  spec_freeze_at TIMESTAMP WITH TIME ZONE,
  stability_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_transition_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pilot_metric_entries (
  id VARCHAR(50) PRIMARY KEY,
  metric_key VARCHAR(100) NOT NULL,
  metric_type VARCHAR(20) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  phase VARCHAR(20) NOT NULL,
  loop_number INT NOT NULL DEFAULT 1,
  experiment_type VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS pilot_metric_history (
  id VARCHAR(50) PRIMARY KEY,
  metric_entry_id VARCHAR(50) REFERENCES pilot_metric_entries(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_metric_notes (
  id VARCHAR(50) PRIMARY KEY,
  metric_entry_id VARCHAR(50) REFERENCES pilot_metric_entries(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_deviations (
  id VARCHAR(50) PRIMARY KEY,
  description TEXT NOT NULL,
  metric_key VARCHAR(100),
  phase VARCHAR(20) NOT NULL,
  experiment_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_audit_log (
  id VARCHAR(50) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  actor_id VARCHAR(100) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_pilot_metric_entries_key_date ON pilot_metric_entries(metric_key, date);
CREATE INDEX IF NOT EXISTS idx_pilot_metric_entries_phase ON pilot_metric_entries(phase);
CREATE INDEX IF NOT EXISTS idx_pilot_metric_entries_experiment ON pilot_metric_entries(experiment_type);
CREATE INDEX IF NOT EXISTS idx_pilot_metric_history_entry ON pilot_metric_history(metric_entry_id);
CREATE INDEX IF NOT EXISTS idx_pilot_metric_notes_entry ON pilot_metric_notes(metric_entry_id);
CREATE INDEX IF NOT EXISTS idx_pilot_deviations_created_at ON pilot_deviations(created_at);
CREATE INDEX IF NOT EXISTS idx_pilot_audit_log_created_at ON pilot_audit_log(created_at);
