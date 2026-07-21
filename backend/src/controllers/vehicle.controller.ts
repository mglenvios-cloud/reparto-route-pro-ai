import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ where: { companyId: req.user!.companyId }, include: { driver: true, _count: { select: { fuelLogs: true, maintenanceLogs: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: vehicles });
  } catch (error) { next(error); }
};

export const getVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { driver: true, fuelLogs: { orderBy: { createdAt: 'desc' }, take: 10 }, maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!vehicle) throw new AppError(404, 'Vehículo no encontrado');
    res.json({ success: true, data: vehicle });
  } catch (error) { next(error); }
};

export const createVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await prisma.vehicle.create({ data: { companyId: req.user!.companyId, ...req.body } });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) { next(error); }
};

export const updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await prisma.vehicle.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    if (vehicle.count === 0) throw new AppError(404, 'Vehículo no encontrado');
    const updated = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.vehicle.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { isActive: false } });
    res.json({ success: true, message: 'Vehículo desactivado' });
  } catch (error) { next(error); }
};

export const getVehicleLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ where: { companyId: req.user!.companyId, lastLocationAt: { not: null } }, select: { id: true, plate: true, latitude: true, longitude: true, speed: true, heading: true, status: true, driverId: true, lastLocationAt: true } });
    res.json({ success: true, data: vehicles });
  } catch (error) { next(error); }
};
