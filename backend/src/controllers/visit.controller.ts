import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateCode, paginate, buildPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getVisits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const driverId = req.query.driverId as string;
    const { skip, take } = paginate(page, limit);
    const where: any = { companyId: req.user!.companyId };
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    const [visits, total] = await Promise.all([
      prisma.visit.findMany({ where, skip, take, include: { customer: true, address: true, driver: { select: { id: true, name: true, code: true } }, evidence: true }, orderBy: { createdAt: 'desc' } }),
      prisma.visit.count({ where }),
    ]);
    res.json({ success: true, data: visits, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) { next(error); }
};

export const getVisit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visit = await prisma.visit.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId }, include: { customer: true, address: true, driver: true, evidence: true } });
    if (!visit) throw new AppError(404, 'Visita no encontrada');
    res.json({ success: true, data: visit });
  } catch (error) { next(error); }
};

export const createVisit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.visit.count({ where: { companyId: req.user!.companyId } });
    const visit = await prisma.visit.create({ data: { companyId: req.user!.companyId, code: generateCode('VIS', count + 1), ...req.body }, include: { customer: true, address: true } });
    res.status(201).json({ success: true, data: visit });
  } catch (error) { next(error); }
};

export const updateVisit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visit = await prisma.visit.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: req.body });
    if (visit.count === 0) throw new AppError(404, 'Visita no encontrada');
    const updated = await prisma.visit.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const updateVisitStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, ...rest } = req.body;
    const updateData: any = { status, ...rest };
    if (status === 'VISITED') updateData.visitedAt = new Date();
    await prisma.visit.updateMany({ where: { id: req.params.id, companyId: req.user!.companyId }, data: updateData });
    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) { next(error); }
};
