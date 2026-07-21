import { useEffect, useState } from 'react';
import { vehicleApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ plate: '', brand: '', model: '', year: '', color: '', type: 'CAR' });

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => { try { const { data } = await vehicleApi.getAll(); setVehicles(data.data); } catch {} };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await vehicleApi.update(editing.id, form); } else { await vehicleApi.create(form); }
      setShowModal(false); setEditing(null); setForm({ plate: '', brand: '', model: '', year: '', color: '', type: 'CAR' }); loadVehicles();
    } catch {}
  };

  const filtered = vehicles.filter(v => v.plate.includes(search) || v.brand?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <button onClick={() => { setEditing(null); setForm({ plate: '', brand: '', model: '', year: '', color: '', type: 'CAR' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Agregar</button>
      </div>
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" /><input className="input-field pl-10" placeholder="Buscar vehículos..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4">
        {filtered.map(v => (
          <div key={v.id} className="card flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"><Truck size={20} /></div>
            <div className="flex-1 min-w-0"><p className="font-medium">{v.plate}</p><p className="text-sm text-dark-400">{v.brand} {v.model} {v.year}</p></div>
            <span className={`badge ${getStatusColor(v.status)}`}>{getStatusLabel(v.status)}</span>
            {v.driver && <span className="text-sm text-dark-400">{v.driver.name}</span>}
            <div className="flex gap-2">
              <button onClick={() => { setEditing(v); setForm(v); setShowModal(true); }} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={async () => { if (confirm('¿Desactivar vehículo?')) { await vehicleApi.delete(v.id); loadVehicles(); } }} className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nuevo'} Vehículo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-dark-300 mb-1">Placa</label><input className="input-field" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} required /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Marca</label><input className="input-field" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Modelo</label><input className="input-field" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Año</label><input type="number" className="input-field" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Color</label><input className="input-field" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Tipo</label><select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="CAR">Auto</option><option value="VAN">Camioneta</option><option value="TRUCK">Camión</option><option value="MOTORCYCLE">Moto</option></select></div>
              </div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
