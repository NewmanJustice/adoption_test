import { DocumentRepository } from '../repositories/documentRepository.js';
import { OcrService } from './ocrService.js';
import { storage } from '../config/storage.js';
import { antivirus } from '../config/antivirus.js';
import { calculateFileHash } from '../utils/fileHash.js';
import { DocumentMetadata, UploadResult, BulkUploadResult, DocumentListFilter } from '@adoption/shared/types/document.js';
import { DocumentType, DESCRIPTION_MAX_LENGTH } from '@adoption/shared/constants/documentTypes.js';

export class DocumentService {
  constructor(
    private documentRepository: DocumentRepository,
    private ocrService: OcrService
  ) {}

  async uploadDocument(
    caseId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
    uploadedBy: string,
    description?: string,
    ipAddress?: string
  ): Promise<UploadResult> {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!documentType) {
      return { success: false, error: 'Select a document type' };
    }

    if (documentType === 'other' && !description) {
      return { success: false, error: 'Description is required for "Other" document type' };
    }

    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
      return { success: false, error: `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters` };
    }

    const scanResult = await antivirus.scanBuffer(file.buffer, file.originalname);
    if (scanResult.isInfected) {
      return { 
        success: false, 
        error: `File failed virus scan: ${scanResult.viruses?.join(', ')}` 
      };
    }

    const fileHash = await calculateFileHash(file.buffer);
    
    const existingDoc = await this.documentRepository.findByHash(caseId, fileHash);
    if (existingDoc) {
      return {
        success: false,
        isDuplicate: true,
        existingDocumentId: existingDoc.id,
        error: 'This file has already been uploaded to this case'
      };
    }

    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filename = `${documentId}-${file.originalname}`;
    
    const storagePath = await storage.uploadFile(filename, file.buffer, file.mimetype);

    const document = await this.documentRepository.create({
      id: documentId,
      caseId,
      filename,
      originalFilename: file.originalname,
      documentType,
      description,
      fileSize: file.size,
      fileHash,
      mimeType: file.mimetype,
      storagePath,
      uploadedBy,
      ocrStatus: 'pending',
      virusScanStatus: 'clean'
    });

    await this.documentRepository.createAuditLog({
      documentId: document.id,
      userId: uploadedBy,
      action: 'upload',
      ipAddress,
      metadata: { 
        filename: file.originalname,
        documentType,
        fileSize: file.size
      }
    });

    await this.ocrService.queueDocument(document.id, storagePath, file.mimetype);

    return {
      success: true,
      documentId: document.id,
      filename: file.originalname
    };
  }

  async uploadBulk(
    caseId: string,
    files: Express.Multer.File[],
    documentTypes: DocumentType[],
    uploadedBy: string,
    descriptions?: string[],
    ipAddress?: string
  ): Promise<BulkUploadResult> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const documentType = documentTypes[i] || documentTypes[0];
      const description = descriptions?.[i];

      const result = await this.uploadDocument(
        caseId,
        file,
        documentType,
        uploadedBy,
        description,
        ipAddress
      );

      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      results,
      successCount,
      failureCount
    };
  }

  async getDocument(documentId: string): Promise<DocumentMetadata | null> {
    return await this.documentRepository.findById(documentId);
  }

  async listDocuments(filter: DocumentListFilter, userRole?: string, userId?: string): Promise<DocumentMetadata[]> {
    let documents = await this.documentRepository.findByCaseId(filter.caseId);

    if (filter.documentType) {
      documents = documents.filter(d => d.documentType === filter.documentType);
    }

    if (filter.ocrStatus) {
      documents = documents.filter(d => d.ocrStatus === filter.ocrStatus);
    }

    if (filter.uploadedBy) {
      documents = documents.filter(d => d.uploadedBy === filter.uploadedBy);
    }

    if (userRole === 'ADOPTER' && userId) {
      documents = documents.filter(d => d.uploadedBy === userId);
    }

    return documents;
  }

  async downloadDocument(documentId: string, userId: string, ipAddress?: string): Promise<Buffer> {
    const doc = await this.documentRepository.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    if (doc.virusScanStatus === 'infected') {
      throw new Error('Cannot download infected file');
    }

    await this.documentRepository.createAuditLog({
      documentId,
      userId,
      action: 'download',
      ipAddress
    });

    return await storage.downloadFile(doc.storagePath);
  }

  async getDocumentVersions(caseId: string, filename: string): Promise<DocumentMetadata[]> {
    return await this.documentRepository.findByCaseAndFilename(caseId, filename);
  }
}
