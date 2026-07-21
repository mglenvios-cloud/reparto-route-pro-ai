import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const optimizeRouteAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { waypoints } = req.body;
    if (!waypoints || waypoints.length < 2) throw new AppError(400, 'Se necesitan al menos 2 puntos');
    const result = await aiService.optimizeRoute(waypoints);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const detectDelaysAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const route = await prisma.route.findFirst({ where: { id: req.params.routeId, companyId: req.user!.companyId }, include: { routeStops: true } });
    if (!route) throw new AppError(404, 'Ruta no encontrada');
    const driver = route.driverId ? await prisma.driver.findUnique({ where: { id: route.driverId } }) : null;
    const stops = route.routeStops.map(s => ({ lat: s.latitude || 0, lng: s.longitude || 0, sequence: s.sequence }));
    const result = await aiService.detectDelays({
      driverId: route.driverId || '', routeId: route.id,
      currentLat: driver?.latitude || 0, currentLng: driver?.longitude || 0,
      eta: new Date(), scheduledEnd: route.createdAt, stops,
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const detectAddressAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { address, lat, lng } = req.body;
    if (!address) throw new AppError(400, 'Dirección requerida');
    const result = await aiService.detectIncorrectAddress(address, lat, lng);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const generateReportAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.body;
    const companyId = req.user!.companyId;
    const deliveries = await prisma.order.findMany({ where: { companyId, createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }, include: { driver: true } });
    const drivers = await prisma.driver.findMany({ where: { companyId, isActive: true }, include: { orders: { where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } } } });
    const result = await aiService.generateAutoReport({ companyId, startDate: new Date(startDate), endDate: new Date(endDate), deliveries, drivers });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getSuggestionsAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user!.companyId;
    const allRoutes = await prisma.route.findMany({ where: { companyId } });
    const delayedRoutes = allRoutes.filter(r => r.status !== 'COMPLETED' && r.createdAt < new Date(Date.now() - 86400000));
    const result = await aiService.suggestLogisticsImprovements({
      totalRoutes: allRoutes.length,
      avgStopsPerRoute: allRoutes.reduce((s, r) => s + (r.totalDistance > 0 ? 1 : 0), 0) || 1,
      totalDistance: allRoutes.reduce((s, r) => s + r.totalDistance, 0),
      totalDuration: allRoutes.reduce((s, r) => s + r.totalDuration, 0),
      delayedRoutes: delayedRoutes.length,
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
