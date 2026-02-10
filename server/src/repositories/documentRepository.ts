import { Pool } from 'pg';
import { DocumentMetadata, DocumentVersion, DocumentAuditLog, OcrStatus } from '@adoption/shared/types/document';
import { DocumentType } from '@adoption/shared/constants/documentTypes';

export class DocumentRepository {
  constructor(private pool: Pool) {}

  async create(doc: Omit<DocumentMetadata, 'uploadedAt' | 'version'>): Promise<DocumentMetadata> {
    const existingDocs = await this.findByCaseAndFilename(doc.caseId, doc.originalFilename);
    const version = existingDocs.length > 0 ? Math.max(...existingDocs.map(d => d.version)) + 1 : 1;

    const result = await this.pool.query(
      `INSERT INTO documents (
        id, case_id, filename, original_filename, document_type, description,
        file_size, file_hash, mime_type, storage_path, uploaded_by,
        version, ocr_status, virus_scan_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        doc.id, doc.caseId, doc.filename, doc.originalFilename, doc.documentType,
        doc.description || null, doc.fileSize, doc.fileHash, doc.mimeType,
        doc.storagePath, doc.uploadedBy, version, doc.ocrStatus, doc.virusScanStatus
      ]
    );

    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<DocumentMetadata | null> {
    const result = await this.pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async findByCaseId(caseId: string): Promise<DocumentMetadata[]> {
    const result = await this.pool.query(
      'SELECT * FROM documents WHERE case_id = $1 ORDER BY uploaded_at DESC',
      [caseId]
    );
    return result.rows.map(row => this.mapRow(row));
  }

  async findByCaseAndFilename(caseId: string, filename: string): Promise<DocumentMetadata[]> {
    const result = await this.pool.query(
      'SELECT * FROM documents WHERE case_id = $1 AND original_filename = $2 ORDER BY version DESC',
      [caseId, filename]
    );
    return result.rows.map(row => this.mapRow(row));
  }

  async findByHash(caseId: string, hash: string): Promise<DocumentMetadata | null> {
    const result = await this.pool.query(
      'SELECT * FROM documents WHERE case_id = $1 AND file_hash = $2 LIMIT 1',
      [caseId, hash]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async updateOcrStatus(id: string, status: OcrStatus, completedAt?: Date, failureReason?: string): Promise<void> {
    await this.pool.query(
      `UPDATE documents 
       SET ocr_status = $1, ocr_completed_at = $2, ocr_failure_reason = $3, updated_at = NOW()
       WHERE id = $4`,
      [status, completedAt || null, failureReason || null, id]
    );
  }

  async updateVirusScanStatus(id: string, status: 'clean' | 'infected'): Promise<void> {
    await this.pool.query(
      `UPDATE documents 
       SET virus_scan_status = $1, virus_scan_completed_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [status, id]
    );
  }

  async createAuditLog(log: Omit<DocumentAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.pool.query(
      `INSERT INTO document_audit_log (id, document_id, user_id, action, ip_address, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, log.documentId, log.userId, log.action, log.ipAddress || null, log.metadata ? JSON.stringify(log.metadata) : null]
    );
  }

  async getAuditLogs(documentId: string): Promise<DocumentAuditLog[]> {
    const result = await this.pool.query(
      'SELECT * FROM document_audit_log WHERE document_id = $1 ORDER BY timestamp DESC',
      [documentId]
    );
    return result.rows.map(row => ({
      id: row.id,
      documentId: row.document_id,
      userId: row.user_id,
      action: row.action,
      timestamp: row.timestamp,
      ipAddress: row.ip_address,
      metadata: row.metadata
    }));
  }

  private mapRow(row: any): DocumentMetadata {
    return {
      id: row.id,
      caseId: row.case_id,
      filename: row.filename,
      originalFilename: row.original_filename,
      documentType: row.document_type,
      description: row.description,
      fileSize: row.file_size,
      fileHash: row.file_hash,
      mimeType: row.mime_type,
      storagePath: row.storage_path,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at,
      version: row.version,
      ocrStatus: row.ocr_status,
      ocrCompletedAt: row.ocr_completed_at,
      ocrFailureReason: row.ocr_failure_reason,
      virusScanStatus: row.virus_scan_status,
      virusScanCompletedAt: row.virus_scan_completed_at
    };
  }
}
