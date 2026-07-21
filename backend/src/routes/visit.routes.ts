import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getVisits, getVisit, createVisit, updateVisit, updateVisitStatus } from '../controllers/visit.controller';

const router = Router();
router.use(authenticate);

router.get('/', getVisits);
router.get('/:id', getVisit);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), createVisit);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), updateVisit);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER'), updateVisitStatus);

export default router;
