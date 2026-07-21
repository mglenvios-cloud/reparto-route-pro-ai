import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDeliveryReport, getVisitReport, getProductivityReport, getFuelReport, getRanking } from '../controllers/report.controller';

const router = Router();
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'));

router.get('/deliveries', getDeliveryReport);
router.get('/visits', getVisitReport);
router.get('/productivity', getProductivityReport);
router.get('/fuel', getFuelReport);
router.get('/ranking', getRanking);

export default router;
