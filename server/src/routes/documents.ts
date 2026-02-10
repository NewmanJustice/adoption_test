import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import { requireCaseAccess, requireUploadPermission } from '../middleware/permissions.js';

export function createDocumentRoutes(documentController: DocumentController): Router {
  const router = Router();

  router.get(
    '/cases/:caseId/upload-document',
    requireCaseAccess,
    requireUploadPermission,
    documentController.getUploadForm
  );

  router.post(
    '/cases/:caseId/upload-document',
    requireCaseAccess,
    requireUploadPermission,
    upload.single('file'),
    handleUploadError,
    documentController.uploadSingle
  );

  router.post(
    '/cases/:caseId/upload-documents/bulk',
    requireCaseAccess,
    requireUploadPermission,
    upload.array('files'),
    handleUploadError,
    documentController.uploadBulk
  );

  router.get(
    '/cases/:caseId/documents',
    requireCaseAccess,
    documentController.listDocuments
  );

  router.get(
    '/documents/:documentId',
    documentController.getDocument
  );

  router.get(
    '/documents/:documentId/download',
    documentController.downloadDocument
  );

  router.get(
    '/cases/:caseId/documents/:filename/versions',
    requireCaseAccess,
    documentController.getVersions
  );

  return router;
}
