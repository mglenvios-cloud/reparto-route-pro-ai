import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    ASSIGNED: 'bg-blue-500/20 text-blue-400',
    IN_TRANSIT: 'bg-indigo-500/20 text-indigo-400',
    ARRIVING: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    VISITED: 'bg-green-500/20 text-green-400',
    NOT_DELIVERED: 'bg-red-500/20 text-red-400',
    CUSTOMER_ABSENT: 'bg-orange-500/20 text-orange-400',
    RESCHEDULED: 'bg-cyan-500/20 text-cyan-400',
    CANCELLED: 'bg-gray-500/20 text-gray-400',
    PLANNED: 'bg-slate-500/20 text-slate-400',
    IN_PROGRESS: 'bg-emerald-500/20 text-emerald-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    AVAILABLE: 'bg-green-500/20 text-green-400',
    BUSY: 'bg-red-500/20 text-red-400',
    OFFLINE: 'bg-gray-500/20 text-gray-400',
    ON_BREAK: 'bg-yellow-500/20 text-yellow-400',
    ACTIVE: 'bg-green-500/20 text-green-400',
    INACTIVE: 'bg-gray-500/20 text-gray-400',
    MAINTENANCE: 'bg-orange-500/20 text-orange-400',
    OUT_OF_SERVICE: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    ASSIGNED: 'Asignado',
    IN_TRANSIT: 'En camino',
    ARRIVING: 'Llegando',
    DELIVERED: 'Entregado',
    VISITED: 'Visitado',
    NOT_DELIVERED: 'No entregado',
    CUSTOMER_ABSENT: 'Cliente ausente',
    RESCHEDULED: 'Reprogramado',
    CANCELLED: 'Cancelado',
    PLANNED: 'Planificada',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada',
    AVAILABLE: 'Disponible',
    BUSY: 'Ocupado',
    OFFLINE: 'Desconectado',
    ON_BREAK: 'Descanso',
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    MAINTENANCE: 'Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de servicio',
  };
  return labels[status] || status;
}
