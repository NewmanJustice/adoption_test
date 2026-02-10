-- Migration: Create documents table
-- Created: 2024-01-xx

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY,
  case_id VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT,
  file_size INTEGER NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  ocr_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  ocr_completed_at TIMESTAMP WITH TIME ZONE,
  ocr_failure_reason TEXT,
  virus_scan_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  virus_scan_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_file_hash ON documents(file_hash);
CREATE INDEX idx_documents_virus_scan_status ON documents(virus_scan_status);
CREATE INDEX idx_documents_case_filename ON documents(case_id, original_filename);
