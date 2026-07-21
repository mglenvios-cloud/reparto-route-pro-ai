import { useEffect, useState } from 'react';
import { driverApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', lastName: '', phone: '', email: '', licenseNumber: '' });

  useEffect(() => { loadDrivers(); }, [search]);

  const loadDrivers = async () => {
    try { const { data } = await driverApi.getAll({ search, limit: '100' }); setDrivers(data.data); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await driverApi.update(editing.id, form); } else { await driverApi.create(form); }
      setShowModal(false); setEditing(null); setForm({ name: '', lastName: '', phone: '', email: '', licenseNumber: '' }); loadDrivers();
    } catch {}
  };

  const handleEdit = (driver: any) => { setEditing(driver); setForm(driver); setShowModal(true); };
  const handleDelete = async (id: string) => { if (confirm('¿Desactivar repartidor?')) { await driverApi.delete(id); loadDrivers(); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Repartidores</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', lastName: '', phone: '', email: '', licenseNumber: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Agregar</button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" /><input className="input-field pl-10" placeholder="Buscar repartidores..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className="grid gap-4">
        {drivers.map(driver => (
          <div key={driver.id} className="card flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">{driver.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{driver.name} {driver.lastName}</p>
              <p className="text-sm text-dark-400">{driver.email || driver.phone} · {driver.code}</p>
            </div>
            <span className={`badge ${getStatusColor(driver.status)}`}>{getStatusLabel(driver.status)}</span>
            {driver.latitude && <span className="text-xs text-dark-400 flex items-center gap-1"><MapPin size={12} /> Activo</span>}
            <div className="flex gap-2">
              <button onClick={() => handleEdit(driver)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(driver.id)} className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nuevo'} Repartidor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-dark-300 mb-1">Nombre</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Apellido</label><input className="input-field" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm text-dark-300 mb-1">Teléfono</label><input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Licencia</label><input className="input-field" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} /></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
