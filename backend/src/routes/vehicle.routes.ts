import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getVehicleLocation } from '../controllers/vehicle.controller';

const router = Router();
router.use(authenticate);

router.get('/', getVehicles);
router.get('/locations', getVehicleLocation);
router.get('/:id', getVehicle);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createVehicle);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), updateVehicle);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteVehicle);

export default router;
