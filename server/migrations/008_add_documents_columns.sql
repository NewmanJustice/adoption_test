-- Migration: Add upload_status and deleted_at columns to documents table
-- This migration adds columns required for the postgresql-persistence feature

ALTER TABLE documents ADD COLUMN IF NOT EXISTS upload_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_documents_upload_status ON documents(upload_status);
