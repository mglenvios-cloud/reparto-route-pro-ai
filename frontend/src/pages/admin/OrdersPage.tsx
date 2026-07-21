import { useEffect, useState } from 'react';
import { orderApi, driverApi, customerApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { Plus, Search, Eye } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', addressId: '', driverId: '', description: '', value: '', scheduledDate: '' });

  useEffect(() => { loadOrders(); loadDrivers(); loadCustomers(); }, [search, statusFilter]);

  const loadOrders = async () => { try { const { data } = await orderApi.getAll({ search, status: statusFilter, limit: '100' }); setOrders(data.data); } catch {} };
  const loadDrivers = async () => { try { const { data } = await driverApi.getAll({ limit: '100' }); setDrivers(data.data); } catch {} };
  const loadCustomers = async () => { try { const { data } = await customerApi.getAll({ limit: '100' }); setCustomers(data.data); } catch {} };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await orderApi.create(form); setShowModal(false); setForm({ customerId: '', addressId: '', driverId: '', description: '', value: '', scheduledDate: '' }); loadOrders(); } catch {} };

  const handleStatusChange = async (id: string, status: string) => { try { await orderApi.updateStatus(id, { status }); loadOrders(); } catch {} };

  const statuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'ARRIVING', 'DELIVERED', 'NOT_DELIVERED', 'CUSTOMER_ABSENT', 'RESCHEDULED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Pedidos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo Pedido</button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" /><input className="input-field pl-10" placeholder="Buscar pedidos..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Todos</option>{statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}</select>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-dark-700 text-left text-sm text-dark-400"><th className="px-4 py-3 font-medium">Código</th><th className="px-4 py-3 font-medium">Cliente</th><th className="px-4 py-3 font-medium">Repartidor</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 font-medium">Valor</th><th className="px-4 py-3 font-medium">Fecha</th><th className="px-4 py-3 font-medium">Acciones</th></tr></thead>
            <tbody>{orders.map(o => <tr key={o.id} className="border-b border-dark-700/50 hover:bg-dark-700/30"><td className="px-4 py-3 text-sm font-medium">{o.code}</td><td className="px-4 py-3 text-sm">{o.customer?.name}</td><td className="px-4 py-3 text-sm">{o.driver?.name || '-'}</td><td className="px-4 py-3"><span className={`badge ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span></td><td className="px-4 py-3 text-sm">${o.value || 0}</td><td className="px-4 py-3 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><select className="text-xs bg-dark-700 border border-dark-600 rounded-lg px-2 py-1" value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}</select></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nuevo Pedido</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-dark-300 mb-1">Cliente</label><select className="input-field" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} required><option value="">Seleccionar...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm text-dark-300 mb-1">Repartidor</label><select className="input-field" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}><option value="">Sin asignar</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div><label className="block text-sm text-dark-300 mb-1">Descripción</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-dark-300 mb-1">Valor</label><input type="number" className="input-field" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div><div><label className="block text-sm text-dark-300 mb-1">Fecha programada</label><input type="datetime-local" className="input-field" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} /></div></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
