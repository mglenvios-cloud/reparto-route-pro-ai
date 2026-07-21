import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), createCustomer);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), updateCustomer);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteCustomer);

export default router;
