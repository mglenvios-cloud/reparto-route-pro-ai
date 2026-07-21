import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Token requerido'));
    try {
      const decoded = jwt.verify(token as string, config.jwt.secret) as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`Usuario conectado: ${user.email}`);

    socket.join(`company:${user.companyId}`);
    socket.join(`user:${user.userId}`);

    if (user.role === 'DRIVER') {
      socket.join(`driver:${user.userId}`);
    }

    socket.on('driver:location', async (data) => {
      const { latitude, longitude, speed, heading, accuracy } = data;
      try {
        const driver = await prisma.driver.findFirst({ where: { userId: user.userId } });
        if (driver) {
          await prisma.driver.update({
            where: { id: driver.id },
            data: { latitude, longitude, speed, heading, lastLatitude: latitude, lastLongitude: longitude, lastLocationAt: new Date() },
          });
          await prisma.gPSLog.create({
            data: { driverId: driver.id, latitude, longitude, speed, heading, accuracy },
          });
          io.to(`company:${user.companyId}`).emit('driver:location', {
            driverId: driver.id,
            name: driver.name,
            latitude,
            longitude,
            speed,
            heading,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error actualizando ubicación:', error);
      }
    });

    socket.on('vehicle:location', async (data) => {
      const { vehicleId, latitude, longitude, speed, heading } = data;
      try {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { latitude, longitude, speed, heading, lastLocationAt: new Date() },
        });
        io.to(`company:${user.companyId}`).emit('vehicle:location', {
          vehicleId,
          latitude,
          longitude,
          speed,
          heading,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error actualizando ubicación del vehículo:', error);
      }
    });

    socket.on('order:status', async (data) => {
      const { orderId, status, signature, photoUrl, notes } = data;
      try {
        const updateData: any = { status };
        if (status === 'DELIVERED') updateData.deliveredAt = new Date();
        if (signature) updateData.signature = signature;
        if (photoUrl) updateData.photoUrl = photoUrl;
        if (notes) updateData.notes = notes;
        await prisma.order.update({ where: { id: orderId }, data: updateData });
        io.to(`company:${user.companyId}`).emit('order:updated', { orderId, status });
      } catch (error) {
        console.error('Error actualizando estado del pedido:', error);
      }
    });

    socket.on('visit:status', async (data) => {
      const { visitId, status, signature, notes } = data;
      try {
        const updateData: any = { status };
        if (status === 'VISITED') updateData.visitedAt = new Date();
        if (signature) updateData.signature = signature;
        if (notes) updateData.notes = notes;
        await prisma.visit.update({ where: { id: visitId }, data: updateData });
        io.to(`company:${user.companyId}`).emit('visit:updated', { visitId, status });
      } catch (error) {
        console.error('Error actualizando estado de la visita:', error);
      }
    });

    socket.on('route:update', async (data) => {
      const { routeId, latitude, longitude } = data;
      try {
        const tracking = await prisma.tracking.create({
          data: { routeId, latitude, longitude, speed: data.speed || 0, heading: data.heading || 0, driverId: user.userId },
        });
        io.to(`company:${user.companyId}`).emit('route:tracking', {
          routeId,
          tracking,
        });
      } catch (error) {
        console.error('Error registrando tracking:', error);
      }
    });

    socket.on('notification:send', async (data) => {
      const { userId, driverId, title, message, type } = data;
      try {
        const notification = await prisma.notification.create({
          data: { userId, driverId, title, message, type: type || 'INFO' },
        });
        if (userId) io.to(`user:${userId}`).emit('notification:new', notification);
        if (driverId) io.to(`driver:${driverId}`).emit('notification:new', notification);
      } catch (error) {
        console.error('Error enviando notificación:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${user.email}`);
    });
  });

  return io;
}
