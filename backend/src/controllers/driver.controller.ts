import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateCode, paginate, buildPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getDrivers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const { skip, take } = paginate(page, limit);
    const where: any = { companyId: req.user!.companyId };
    if (status) where.status = status;
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({ where, skip, take, include: { _count: { select: { orders: true, routes: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.driver.count({ where }),
    ]);
    res.json({ success: true, data: drivers, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) { next(error); }
};

export const getDriver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { vehicles: true, gpsLogs: { take: 1, orderBy: { timestamp: 'desc' } } } });
    if (!driver) throw new AppError(404, 'Repartidor no encontrado');
    res.json({ success: true, data: driver });
  } catch (error) { next(error); }
};

export const createDriver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.driver.count({ where: { companyId: req.user!.companyId } });
    const driver = await prisma.driver.create({ data: { companyId: req.user!.companyId, code: generateCode('DRV', count + 1), ...req.body } });
    res.status(201).json({ success: true, data: driver });
  } catch (error) { next(error); }
};

export const updateDriver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    if (driver.count === 0) throw new AppError(404, 'Repartidor no encontrado');
    const updated = await prisma.driver.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteDriver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.driver.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { isActive: false } });
    res.json({ success: true, message: 'Repartidor desactivado' });
  } catch (error) { next(error); }
};

export const updateDriverLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude, speed, heading } = req.body;
    await prisma.driver.update({ where: { id: req.params.id }, data: { latitude, longitude, speed, heading, lastLatitude: latitude, lastLongitude: longitude, lastLocationAt: new Date() } });
    await prisma.gPSLog.create({ data: { driverId: req.params.id, latitude, longitude, speed, heading } });
    res.json({ success: true });
  } catch (error) { next(error); }
};
