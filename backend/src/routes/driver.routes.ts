import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, updateDriverLocation } from '../controllers/driver.controller';

const router = Router();
router.use(authenticate);

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createDriver);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISPATCHER'), updateDriver);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteDriver);
router.patch('/:id/location', updateDriverLocation);

export default router;
