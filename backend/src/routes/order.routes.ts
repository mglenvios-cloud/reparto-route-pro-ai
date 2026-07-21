import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder, assignOrder, updateOrderStatus, getOrdersByDriver } from '../controllers/order.controller';

const router = Router();
router.use(authenticate);

router.get('/', getOrders);
router.get('/driver/:driverId', getOrdersByDriver);
router.get('/:id', getOrder);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), createOrder);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), updateOrder);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteOrder);
router.patch('/:id/assign', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), assignOrder);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER'), updateOrderStatus);

export default router;
