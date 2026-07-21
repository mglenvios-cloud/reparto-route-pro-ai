import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const { skip, take } = paginate(page, limit);
    const where: any = { companyId: req.user!.companyId };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take, include: { addresses: true, _count: { select: { orders: true, visits: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    res.json({ success: true, data: customers, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) { next(error); }
};

export const getCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { addresses: true, orders: { take: 10, orderBy: { createdAt: 'desc' } }, visits: { take: 10, orderBy: { createdAt: 'desc' } } } });
    if (!customer) throw new AppError(404, 'Cliente no encontrado');
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.create({ data: { companyId: req.user!.companyId, name: req.body.name, lastName: req.body.lastName, phone: req.body.phone, email: req.body.email, notes: req.body.notes } });
    if (req.body.addresses) { for (const addr of req.body.addresses) { await prisma.address.create({ data: { ...addr, customerId: customer.id } }); } }
    const withAddresses = await prisma.customer.findUnique({ where: { id: customer.id }, include: { addresses: true } });
    res.status(201).json({ success: true, data: withAddresses });
  } catch (error) { next(error); }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    if (customer.count === 0) throw new AppError(404, 'Cliente no encontrado');
    const updated = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { addresses: true } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.customer.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: { isActive: false } });
    res.json({ success: true, message: 'Cliente desactivado' });
  } catch (error) { next(error); }
};
