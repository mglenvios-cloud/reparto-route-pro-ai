import { useEffect, useState } from 'react';
import { visitApi, driverApi, customerApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { Plus, Search } from 'lucide-react';

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', driverId: '', title: '', description: '', scheduledDate: '' });

  useEffect(() => { loadVisits(); loadDrivers(); loadCustomers(); }, [statusFilter]);

  const loadVisits = async () => { try { const { data } = await visitApi.getAll({ status: statusFilter, limit: '100' }); setVisits(data.data); } catch {} };
  const loadDrivers = async () => { try { const { data } = await driverApi.getAll({ limit: '100' }); setDrivers(data.data); } catch {} };
  const loadCustomers = async () => { try { const { data } = await customerApi.getAll({ limit: '100' }); setCustomers(data.data); } catch {} };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await visitApi.create(form); setShowModal(false); setForm({ customerId: '', driverId: '', title: '', description: '', scheduledDate: '' }); loadVisits(); } catch {} };

  const statuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'ARRIVING', 'VISITED', 'CUSTOMER_ABSENT', 'RESCHEDULED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Visitas Técnicas</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva Visita</button></div>
      <div className="flex gap-4"><select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Todas</option>{statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}</select></div>
      <div className="grid gap-4">
        {visits.map(v => (
          <div key={v.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0"><p className="font-medium">{v.title}</p><p className="text-sm text-dark-400">{v.customer?.name} · {v.code}</p></div>
            <span className={`badge ${getStatusColor(v.status)}`}>{getStatusLabel(v.status)}</span>
            {v.driver && <span className="text-sm text-dark-400">{v.driver.name}</span>}
            <span className="text-xs text-dark-400">{v.scheduledDate ? new Date(v.scheduledDate).toLocaleDateString() : '-'}</span>
            <select className="text-xs bg-dark-700 border border-dark-600 rounded-lg px-2 py-1" value={v.status} onChange={async (e) => { await visitApi.updateStatus(v.id, { status: e.target.value }); loadVisits(); }}>
              {statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nueva Visita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-dark-300 mb-1">Título</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Cliente</label><select className="input-field" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} required><option value="">Seleccionar...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm text-dark-300 mb-1">Repartidor</label><select className="input-field" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}><option value="">Sin asignar</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div><label className="block text-sm text-dark-300 mb-1">Descripción</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Fecha programada</label><input type="datetime-local" className="input-field" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} /></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
