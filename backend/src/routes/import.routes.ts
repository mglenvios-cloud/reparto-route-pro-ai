import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { importFile, importText, importGoogleSheets, importAPI } from '../controllers/import.controller';

const router = Router();
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'));

router.post('/file', upload.single('file'), importFile);
router.post('/text', importText);
router.post('/google-sheets', importGoogleSheets);
router.post('/api', importAPI);

export default router;
