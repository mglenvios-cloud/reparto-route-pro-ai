import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

const registerSchema = z.object({
  companyName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Refresh token requerido' });
    const tokens = await authService.refreshToken(token);
    res.json({ success: true, data: { tokens } });
  } catch (error) { next(error); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.userId);
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) { next(error); }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};
