import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService.js';
import { AuthenticatedRequest, canViewDocument } from '../middleware/permissions.js';
import { DocumentType, DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_HELP_TEXT } from '@adoption/shared/constants/documentTypes.js';
import * as caseService from '../services/caseService.js';

export class DocumentController {
  constructor(private documentService: DocumentService) {}

  getUploadForm = async (req: AuthenticatedRequest, res: Response) => {
    const { caseId } = req.params;
    
    const documentTypes = Object.values(DOCUMENT_TYPES).map(type => ({
      value: type,
      label: DOCUMENT_TYPE_LABELS[type],
      helpText: DOCUMENT_TYPE_HELP_TEXT[type]
    }));

    res.json({
      caseId,
      documentTypes,
      userRole: req.user?.role
    });
  };

  uploadSingle = async (req: AuthenticatedRequest, res: Response) => {
    const { caseId } = req.params;
    const { documentType, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await this.documentService.uploadDocument(
      caseId,
      file,
      documentType as DocumentType,
      req.user!.userId,
      description,
      req.ip
    );

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error,
        isDuplicate: result.isDuplicate,
        existingDocumentId: result.existingDocumentId
      });
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: result.documentId,
      filename: result.filename,
      redirectTo: `/cases/${caseId}`
    });
  };

  uploadBulk = async (req: AuthenticatedRequest, res: Response) => {
    const { caseId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let documentTypes: DocumentType[];
    let descriptions: string[] | undefined;

    if (req.body.documentType) {
      documentTypes = Array(files.length).fill(req.body.documentType);
    } else if (req.body.documentTypes) {
      documentTypes = Array.isArray(req.body.documentTypes) 
        ? req.body.documentTypes 
        : JSON.parse(req.body.documentTypes);
    } else {
      return res.status(400).json({ error: 'Document type(s) required' });
    }

    if (req.body.descriptions) {
      descriptions = Array.isArray(req.body.descriptions)
        ? req.body.descriptions
        : JSON.parse(req.body.descriptions);
    }

    const result = await this.documentService.uploadBulk(
      caseId,
      files,
      documentTypes,
      req.user!.userId,
      descriptions,
      req.ip
    );

    if (result.failureCount > 0 && result.successCount === 0) {
      return res.status(400).json({
        error: 'All uploads failed',
        results: result.results
      });
    }

    res.status(result.failureCount > 0 ? 207 : 201).json({
      message: `${result.successCount} of ${files.length} files uploaded successfully`,
      successCount: result.successCount,
      failureCount: result.failureCount,
      results: result.results,
      redirectTo: result.failureCount === 0 ? `/cases/${caseId}` : undefined
    });
  };

  listDocuments = async (req: AuthenticatedRequest, res: Response) => {
    const { caseId } = req.params;
    const { documentType, ocrStatus, uploadedBy } = req.query;

    const documents = await this.documentService.listDocuments(
      {
        caseId,
        documentType: documentType as DocumentType | undefined,
        ocrStatus: ocrStatus as any,
        uploadedBy: uploadedBy as string | undefined
      },
      req.user?.role,
      req.user?.userId
    );

    res.json({ documents });
  };

  getDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { documentId } = req.params;
    const sessionUser = req.session.user;

    if (!sessionUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const document = await this.documentService.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const caseData = await caseService.getCase(document.caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const assignments = await caseService.getAssignments(document.caseId);
    const hasAccess = caseService.checkCaseAccess(sessionUser, caseData, assignments);

    if (!hasAccess || !canViewDocument(document.documentType, document.uploadedBy, sessionUser)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });
  };

  downloadDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { documentId } = req.params;
    const sessionUser = req.session.user;

    if (!sessionUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const document = await this.documentService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const caseData = await caseService.getCase(document.caseId);
      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const assignments = await caseService.getAssignments(document.caseId);
      const hasAccess = caseService.checkCaseAccess(sessionUser, caseData, assignments);

      if (!hasAccess || !canViewDocument(document.documentType, document.uploadedBy, sessionUser)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const buffer = await this.documentService.downloadDocument(
        documentId,
        sessionUser.userId,
        req.ip
      );

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalFilename}"`);
      res.send(buffer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Cannot download infected file') {
        return res.status(403).json({ error: error.message });
      }
      throw error;
    }
  };

  getVersions = async (req: AuthenticatedRequest, res: Response) => {
    const { caseId, filename } = req.params;

    const versions = await this.documentService.getDocumentVersions(caseId, filename);
    res.json({ versions });
  };
}
