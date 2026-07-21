import { useEffect, useState } from 'react';
import { routeApi, driverApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { Plus, Search, Map, Play, CheckCircle, Navigation } from 'lucide-react';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', driverId: '', date: '' });

  useEffect(() => { loadRoutes(); loadDrivers(); }, []);

  const loadRoutes = async () => { try { const { data } = await routeApi.getAll({ limit: '100' }); setRoutes(data.data); } catch {} };
  const loadDrivers = async () => { try { const { data } = await driverApi.getAll({ limit: '100' }); setDrivers(data.data); } catch {} };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await routeApi.create({ ...form, stops: [] }); setShowModal(false); setForm({ name: '', driverId: '', date: '' }); loadRoutes(); } catch {} };

  const handleStart = async (id: string) => { try { await routeApi.start(id); loadRoutes(); } catch {} };
  const handleComplete = async (id: string) => { try { await routeApi.complete(id); loadRoutes(); } catch {} };
  const handleOptimize = async (id: string) => { try { await routeApi.optimize(id); loadRoutes(); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Rutas</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva Ruta</button></div>
      <div className="grid gap-4">
        {routes.map(r => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-semibold">{r.name}</h3><p className="text-sm text-dark-400">{r.driver?.name || 'Sin repartidor'} · {r.routeStops?.length || 0} paradas</p></div>
              <span className={`badge ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-400 mb-3">
              <span>{r._count?.orders || 0} pedidos</span>
              <span>{r._count?.visits || 0} visitas</span>
              {r.totalDistance > 0 && <span>{(r.totalDistance / 1000).toFixed(1)} km</span>}
            </div>
            <div className="flex gap-2">
              {r.status === 'PLANNED' && <><button onClick={() => handleStart(r.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Play size={14} /> Iniciar</button><button onClick={() => handleOptimize(r.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Navigation size={14} /> Optimizar</button></>}
              {r.status === 'IN_PROGRESS' && <button onClick={() => handleComplete(r.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><CheckCircle size={14} /> Completar</button>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nueva Ruta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-dark-300 mb-1">Nombre</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Repartidor</label><select className="input-field" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}><option value="">Seleccionar...</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div><label className="block text-sm text-dark-300 mb-1">Fecha</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
