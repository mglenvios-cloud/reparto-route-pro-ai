import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { register, login, refreshToken, logout, getProfile } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;
