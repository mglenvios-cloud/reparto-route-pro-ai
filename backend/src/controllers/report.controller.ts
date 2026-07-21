import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { generatePDF, generateExcel } from '../utils/reports';

const prisma = new PrismaClient();

export const getDeliveryReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const driverId = req.query.driverId as string;
    const format = req.query.format as string;
    const where: any = { companyId: req.user!.companyId };
    if (startDate && endDate) where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    if (driverId) where.driverId = driverId;
    const orders = await prisma.order.findMany({ where, include: { driver: { select: { name: true } }, customer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    if (format === 'pdf') {
      const pdf = await generatePDF('Reporte de Entregas', ['Código', 'Cliente', 'Repartidor', 'Estado', 'Fecha', 'Valor'], orders.map(o => [o.code, o.customer?.name || '', o.driver?.name || '', o.status, o.createdAt.toISOString().split('T')[0], o.value || '']));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-entregas.pdf');
      res.send(pdf);
    } else if (format === 'excel') {
      const excel = generateExcel(['Código', 'Cliente', 'Repartidor', 'Estado', 'Fecha', 'Valor'], orders.map(o => [o.code, o.customer?.name || '', o.driver?.name || '', o.status, o.createdAt.toISOString().split('T')[0], o.value || '']));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-entregas.xlsx');
      res.send(excel);
    } else res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

export const getVisitReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const driverId = req.query.driverId as string;
    const format = req.query.format as string;
    const where: any = { companyId: req.user!.companyId };
    if (startDate && endDate) where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    if (driverId) where.driverId = driverId;
    const visits = await prisma.visit.findMany({ where, include: { driver: { select: { name: true } }, customer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    if (format === 'pdf') {
      const pdf = await generatePDF('Reporte de Visitas', ['Código', 'Cliente', 'Repartidor', 'Estado', 'Fecha', 'Título'], visits.map(v => [v.code, v.customer?.name || '', v.driver?.name || '', v.status, v.createdAt.toISOString().split('T')[0], v.title]));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-visitas.pdf');
      res.send(pdf);
    } else if (format === 'excel') {
      const excel = generateExcel(['Código', 'Cliente', 'Repartidor', 'Estado', 'Fecha', 'Título'], visits.map(v => [v.code, v.customer?.name || '', v.driver?.name || '', v.status, v.createdAt.toISOString().split('T')[0], v.title]));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-visitas.xlsx');
      res.send(excel);
    } else res.json({ success: true, data: visits });
  } catch (error) { next(error); }
};

export const getProductivityReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { companyId: req.user!.companyId, isActive: true },
      include: { orders: { where: { status: 'DELIVERED' } }, routes: { where: { status: 'COMPLETED' } } },
    });
    const report = drivers.map(d => ({ id: d.id, name: d.name, deliveriesCompleted: d.orders.length, routesCompleted: d.routes.length, totalDistance: d.routes.reduce((sum, r) => sum + r.totalDistance, 0), totalDuration: d.routes.reduce((sum, r) => sum + r.totalDuration, 0) })).sort((a, b) => b.deliveriesCompleted - a.deliveriesCompleted);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};

export const getFuelReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const vehicleId = req.query.vehicleId as string;
    const where: any = { vehicle: { companyId: req.user!.companyId } };
    if (startDate && endDate) where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    if (vehicleId) where.vehicleId = vehicleId;
    const fuelLogs = await prisma.fuel.findMany({ where, include: { vehicle: { select: { plate: true } } }, orderBy: { createdAt: 'desc' } });
    const total = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    res.json({ success: true, data: { logs: fuelLogs, total: { cost: total, liters: totalLiters, entries: fuelLogs.length } } });
  } catch (error) { next(error); }
};

export const getRanking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { companyId: req.user!.companyId, isActive: true },
      include: { _count: { select: { orders: true } }, orders: { where: { status: 'DELIVERED' }, select: { id: true } } },
    });
    const ranking = drivers.map(d => ({ id: d.id, name: d.name, code: d.code, totalAssigned: d._count.orders, completed: d.orders.length, efficiency: d._count.orders > 0 ? Math.round((d.orders.length / d._count.orders) * 100) : 0 })).sort((a, b) => b.efficiency - a.efficiency);
    res.json({ success: true, data: ranking });
  } catch (error) { next(error); }
};
