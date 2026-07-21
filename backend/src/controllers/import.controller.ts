import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { importService } from '../services/import.service';
import { AppError } from '../middleware/errorHandler';

export const importFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'Archivo requerido');
    const result = await importService.importFromFile(req.user!.companyId, req.file.buffer, req.file.mimetype, req.body.customerId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const importText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, customerId } = req.body;
    if (!text) throw new AppError(400, 'Texto requerido');
    const result = await importService.importFromText(req.user!.companyId, text, customerId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const importGoogleSheets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { csvData, customerId } = req.body;
    if (!csvData) throw new AppError(400, 'Datos CSV requeridos');
    const result = await importService.importFromGoogleSheets(req.user!.companyId, csvData, customerId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const importAPI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data, customerId } = req.body;
    if (!data) throw new AppError(400, 'Datos requeridos');
    const result = await importService.importFromAPI(req.user!.companyId, data, customerId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
