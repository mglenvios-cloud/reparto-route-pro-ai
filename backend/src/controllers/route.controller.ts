import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { calculateRoute, calculateRouteWithOptimization } from '../utils/osrm';

const prisma = new PrismaClient();

export const getRoutes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;
    const driverId = req.query.driverId as string;
    const date = req.query.date as string;
    const where: any = { companyId: req.user!.companyId };
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (date) where.date = new Date(date);
    const routes = await prisma.route.findMany({ where, include: { driver: { select: { id: true, name: true, code: true } }, routeStops: { include: { address: true }, orderBy: { sequence: 'asc' } }, _count: { select: { orders: true, visits: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: routes });
  } catch (error) { next(error); }
};

export const getRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const route = await prisma.route.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { driver: true, routeStops: { include: { address: true }, orderBy: { sequence: 'asc' } }, orders: { include: { customer: true, address: true } }, visits: { include: { customer: true, address: true } }, trackings: { orderBy: { timestamp: 'desc' }, take: 100 } } });
    if (!route) throw new AppError(404, 'Ruta no encontrada');
    res.json({ success: true, data: route });
  } catch (error) { next(error); }
};

export const createRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stops, ...routeData } = req.body;
    const route = await prisma.route.create({ data: { companyId: req.user!.companyId, name: req.body.name, driverId: req.body.driverId, date: req.body.date ? new Date(req.body.date) : undefined } });
    if (stops) { for (let i = 0; i < stops.length; i++) { await prisma.routeStop.create({ data: { routeId: route.id, addressId: stops[i].addressId, orderId: stops[i].orderId, visitId: stops[i].visitId, sequence: i + 1, latitude: stops[i].latitude, longitude: stops[i].longitude } }); } }
    const fullRoute = await prisma.route.findUnique({ where: { id: route.id }, include: { routeStops: { orderBy: { sequence: 'asc' } } } });
    res.status(201).json({ success: true, data: fullRoute });
  } catch (error) { next(error); }
};

export const updateRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.route.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    const updated = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!updated) throw new AppError(404, 'Ruta no encontrada');
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const optimizeRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const route = await prisma.route.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { routeStops: { include: { address: true }, orderBy: { sequence: 'asc' } } } });
    if (!route) throw new AppError(404, 'Ruta no encontrada');
    const waypoints = route.routeStops.filter((s: any) => s.latitude && s.longitude).map((s: any) => ({ lat: s.latitude!, lng: s.longitude! }));
    if (waypoints.length < 2) throw new AppError(400, 'Se necesitan al menos 2 paradas con coordenadas');
    const result = await calculateRouteWithOptimization(waypoints);
    if (!result) throw new AppError(500, 'Error al optimizar la ruta');
    await prisma.route.update({ where: { id: route.id }, data: { optimized: true, totalDistance: result.totalDistance, totalDuration: result.totalDuration } });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getRoutePath = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const route = await prisma.route.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { routeStops: { where: { latitude: { not: null } }, orderBy: { sequence: 'asc' } } } });
    if (!route || route.routeStops.length < 2) throw new AppError(400, 'Ruta no encontrada o sin suficientes paradas');
    const waypoints = route.routeStops.map(s => ({ lat: s.latitude!, lng: s.longitude! }));
    const result = await calculateRoute(waypoints);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const startRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.route.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { status: 'IN_PROGRESS', startedAt: new Date() } });
    res.json({ success: true, message: 'Ruta iniciada' });
  } catch (error) { next(error); }
};

export const completeRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.route.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { status: 'COMPLETED', completedAt: new Date() } });
    res.json({ success: true, message: 'Ruta completada' });
  } catch (error) { next(error); }
};
