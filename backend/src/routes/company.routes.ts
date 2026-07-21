import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getCompany, updateCompany, getStats } from '../controllers/company.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCompany);
router.put('/', authorize('SUPER_ADMIN', 'ADMIN'), updateCompany);
router.get('/stats', getStats);

export default router;
