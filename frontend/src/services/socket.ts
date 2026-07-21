import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('Socket conectado'));
  socket.on('disconnect', () => console.log('Socket desconectado'));
  socket.on('connect_error', (err) => console.error('Error socket:', err.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function subscribeToDriverLocations(callback: (data: any) => void) {
  socket?.on('driver:location', callback);
  return () => { socket?.off('driver:location', callback); };
}

export function subscribeToVehicleLocations(callback: (data: any) => void) {
  socket?.on('vehicle:location', callback);
  return () => { socket?.off('vehicle:location', callback); };
}

export function subscribeToOrderUpdates(callback: (data: any) => void) {
  socket?.on('order:updated', callback);
  return () => { socket?.off('order:updated', callback); };
}

export function subscribeToVisitUpdates(callback: (data: any) => void) {
  socket?.on('visit:updated', callback);
  return () => { socket?.off('visit:updated', callback); };
}

export function subscribeToRouteTracking(callback: (data: any) => void) {
  socket?.on('route:tracking', callback);
  return () => { socket?.off('route:tracking', callback); };
}

export function subscribeToNotifications(callback: (data: any) => void) {
  socket?.on('notification:new', callback);
  return () => { socket?.off('notification:new', callback); };
}

export function emitDriverLocation(data: { latitude: number; longitude: number; speed: number; heading: number; accuracy?: number }) {
  socket?.emit('driver:location', data);
}

export function emitVehicleLocation(data: { vehicleId: string; latitude: number; longitude: number; speed: number; heading: number }) {
  socket?.emit('vehicle:location', data);
}

export function emitOrderStatus(data: { orderId: string; status: string; signature?: string; photoUrl?: string; notes?: string }) {
  socket?.emit('order:status', data);
}

export function emitVisitStatus(data: { visitId: string; status: string; signature?: string; notes?: string }) {
  socket?.emit('visit:status', data);
}

export function emitRouteUpdate(data: { routeId: string; latitude: number; longitude: number; speed: number; heading: number }) {
  socket?.emit('route:update', data);
}

export function emitNotification(data: { userId?: string; driverId?: string; title: string; message: string; type?: string }) {
  socket?.emit('notification:send', data);
}
