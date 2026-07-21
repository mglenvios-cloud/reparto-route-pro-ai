import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user!.companyId },
      include: { branches: true, configs: true, _count: { select: { users: true, drivers: true, vehicles: true, customers: true, orders: true } } },
    });
    if (!company) throw new AppError(404, 'Empresa no encontrada');
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.user!.companyId },
      data: req.body,
    });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user!.companyId;
    const [
      drivers, vehicles, customers, orders, todayOrders, activeRoutes
    ] = await Promise.all([
      prisma.driver.count({ where: { companyId, isActive: true } }),
      prisma.vehicle.count({ where: { companyId, isActive: true } }),
      prisma.customer.count({ where: { companyId, isActive: true } }),
      prisma.order.count({ where: { companyId } }),
      prisma.order.count({ where: { companyId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.route.count({ where: { companyId, status: 'IN_PROGRESS' } }),
    ]);

    res.json({
      success: true,
      data: { drivers, vehicles, customers, orders, todayOrders, activeRoutes },
    });
  } catch (error) { next(error); }
};
