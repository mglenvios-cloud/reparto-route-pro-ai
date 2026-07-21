import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    companyName: string;
    email: string;
    password: string;
    name: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(400, 'El email ya está registrado');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        slug,
        users: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: UserRole.SUPER_ADMIN,
          },
        },
      },
      include: { users: true },
    });

    const user = company.users[0];
    const tokens = this.generateTokens({
      userId: user.id,
      companyId: company.id,
      role: user.role,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLogin: new Date() },
    });

    return { company, user: this.sanitizeUser(user), tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
    if (!user || !user.isActive) throw new AppError(401, 'Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Credenciales inválidas');

    const tokens = this.generateTokens({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLogin: new Date() },
    });

    return { user: this.sanitizeUser(user), company: user.company, tokens };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as AuthPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || user.refreshToken !== token) throw new AppError(401, 'Token inválido');

      const tokens = this.generateTokens({
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch {
      throw new AppError(401, 'Token de refresco inválido');
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true, branch: true },
    });
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    return { ...this.sanitizeUser(user), company: user.company, branch: user.branch };
  }

  private generateTokens(payload: AuthPayload) {
    return {
      accessToken: jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any }),
      refreshToken: jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any }),
    };
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();
