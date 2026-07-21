import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface RouteOptimizationResult {
  waypoints: { lat: number; lng: number }[];
  totalDistance: number;
  totalDuration: number;
  geometry: any;
  legs: any[];
}
