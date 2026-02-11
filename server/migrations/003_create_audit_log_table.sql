-- Migration: Create document audit log table
-- Created: 2024-01-xx

CREATE TABLE IF NOT EXISTS document_audit_log (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_audit_log_document_id ON document_audit_log(document_id);
CREATE INDEX idx_document_audit_log_user_id ON document_audit_log(user_id);
CREATE INDEX idx_document_audit_log_action ON document_audit_log(action);
CREATE INDEX idx_document_audit_log_timestamp ON document_audit_log(timestamp);

ALTER TABLE document_audit_log ADD CONSTRAINT fk_document_audit_log_document 
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
