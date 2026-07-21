import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateCode, paginate, buildPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const driverId = req.query.driverId as string;
    const { skip, take } = paginate(page, limit);
    const where: any = { companyId: req.user!.companyId };
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (search) where.OR = [{ code: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take, include: { customer: true, address: true, driver: { select: { id: true, name: true, code: true } }, evidence: true }, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, data: orders, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) { next(error); }
};

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { customer: true, address: true, driver: true, evidence: true, route: true } });
    if (!order) throw new AppError(404, 'Pedido no encontrado');
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.order.count({ where: { companyId: req.user!.companyId } });
    const order = await prisma.order.create({ data: { companyId: req.user!.companyId, code: generateCode('ORD', count + 1), ...req.body }, include: { customer: true, address: true } });
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const updateOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    if (order.count === 0) throw new AppError(404, 'Pedido no encontrado');
    const updated = await prisma.order.findUnique({ where: { id: req.params.id }, include: { customer: true, address: true } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.order.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { status: 'CANCELLED' } });
    res.json({ success: true, message: 'Pedido cancelado' });
  } catch (error) { next(error); }
};

export const assignOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { driverId } = req.body;
    await prisma.order.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { driverId, status: 'ASSIGNED' } });
    res.json({ success: true, message: 'Pedido asignado' });
  } catch (error) { next(error); }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, ...rest } = req.body;
    const updateData: any = { status, ...rest };
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    await prisma.order.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: updateData });
    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) { next(error); }
};

export const getOrdersByDriver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({ where: { driverId: req.params.driverId, companyId: req.user!.companyId }, include: { customer: true, address: true }, orderBy: { priority: 'desc' } });
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};
