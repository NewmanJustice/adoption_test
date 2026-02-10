import { DocumentType } from '../constants/documentTypes.js';

export type OcrStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'not-applicable';

export interface DocumentMetadata {
  id: string;
  caseId: string;
  filename: string;
  originalFilename: string;
  documentType: DocumentType;
  description?: string;
  fileSize: number;
  fileHash: string;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  ocrStatus: OcrStatus;
  ocrCompletedAt?: Date;
  ocrFailureReason?: string;
  virusScanStatus: 'pending' | 'clean' | 'infected';
  virusScanCompletedAt?: Date;
}

export interface UploadDocumentRequest {
  caseId: string;
  documentType: DocumentType;
  description?: string;
  file: Express.Multer.File;
}

export interface BulkUploadRequest {
  caseId: string;
  documentTypes: DocumentType[];
  descriptions?: string[];
  files: Express.Multer.File[];
}

export interface UploadResult {
  success: boolean;
  documentId?: string;
  filename?: string;
  error?: string;
  isDuplicate?: boolean;
  existingDocumentId?: string;
}

export interface BulkUploadResult {
  results: UploadResult[];
  successCount: number;
  failureCount: number;
}

export interface DocumentListFilter {
  caseId: string;
  documentType?: DocumentType;
  ocrStatus?: OcrStatus;
  uploadedBy?: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  uploadedBy: string;
  uploadedAt: Date;
  fileHash: string;
  fileSize: number;
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  userId: string;
  action: 'upload' | 'download' | 'access_denied' | 'virus_detected' | 'ocr_queued' | 'ocr_complete' | 'ocr_failed';
  timestamp: Date;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface SignedDownloadUrl {
  url: string;
  expiresAt: Date;
}
