import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getRoutes, getRoute, createRoute, updateRoute, optimizeRoute, getRoutePath, startRoute, completeRoute } from '../controllers/route.controller';

const router = Router();
router.use(authenticate);

router.get('/', getRoutes);
router.get('/:id', getRoute);
router.get('/:id/path', getRoutePath);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), createRoute);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), updateRoute);
router.post('/:id/optimize', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), optimizeRoute);
router.patch('/:id/start', startRoute);
router.patch('/:id/complete', completeRoute);

export default router;
