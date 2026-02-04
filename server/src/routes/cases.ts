import { Router } from 'express';
import * as caseController from '../controllers/caseController.js';

const router = Router();

router.post('/cases', caseController.createCase);
router.get('/cases', caseController.listCases);
router.get('/cases/:id', caseController.getCase);
router.patch('/cases/:id/status', caseController.updateCaseStatus);
router.delete('/cases/:id', caseController.deleteCase);
router.get('/cases/:id/audit', caseController.getAuditLog);
router.post('/cases/:id/assignments', caseController.createAssignment);
router.get('/cases/:id/assignments', caseController.listAssignments);

export default router;
