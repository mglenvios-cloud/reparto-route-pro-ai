import { useEffect, useState } from 'react';
import { visitApi } from '../../services/api';
import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { CalendarCheck, MapPin, Clock, CheckCircle, XCircle, Camera, Signature, Navigation } from 'lucide-react';

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadVisits(); const interval = setInterval(loadVisits, 15000); return () => clearInterval(interval); }, []);

  const loadVisits = async () => { try { const { data } = await visitApi.getAll({ limit: '100' }); setVisits(data.data); } catch {} };

  const handleStatusUpdate = async (id: string, status: string) => { try { await visitApi.updateStatus(id, { status }); loadVisits(); } catch {} };

  const filtered = filter === 'all' ? visits : visits.filter(v => v.status === filter.toUpperCase());
  const pendingCount = visits.filter(v => ['PENDING', 'ASSIGNED'].includes(v.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Visitas</h1>
        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">{pendingCount} pendientes</span>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[{ id: 'all', label: 'Todas', count: visits.length }, { id: 'pending', label: 'Pendientes', count: pendingCount }, { id: 'visited', label: 'Visitadas', count: visits.filter(v => v.status === 'VISITED').length }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${filter === f.id ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300'}`}>{f.label} ({f.count})</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(visit => (
          <div key={visit.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{visit.title}</p>
                <p className="text-xs text-dark-400">{visit.customer?.name} · {visit.code}</p>
              </div>
              <span className={`badge ${getStatusColor(visit.status)}`}>{getStatusLabel(visit.status)}</span>
            </div>
            {visit.description && <p className="text-sm text-dark-300 mb-2">{visit.description}</p>}
            <div className="flex items-center gap-4 text-xs text-dark-400 mb-3">
              {visit.address?.street && <span className="flex items-center gap-1"><MapPin size={12} /> {visit.address.street}</span>}
              {visit.scheduledDate && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(visit.scheduledDate).toLocaleDateString()}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['PENDING', 'ASSIGNED'].includes(visit.status) && (
                <button onClick={() => handleStatusUpdate(visit.id, 'IN_TRANSIT')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><Navigation size={14} /> Iniciar viaje</button>
              )}
              {visit.status === 'IN_TRANSIT' && (
                <button onClick={() => handleStatusUpdate(visit.id, 'ARRIVING')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><MapPin size={14} /> Llegando</button>
              )}
              {['IN_TRANSIT', 'ARRIVING'].includes(visit.status) && (
                <>
                  <button onClick={() => handleStatusUpdate(visit.id, 'VISITED')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-green-500 hover:bg-green-600"><CheckCircle size={14} /> Visitado</button>
                  <button onClick={() => handleStatusUpdate(visit.id, 'CUSTOMER_ABSENT')} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><XCircle size={14} /> Ausente</button>
                </>
              )}
              <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Camera size={14} /> Foto</button>
              <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Signature size={14} /> Firma</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-dark-400 py-8">No hay visitas</p>}
      </div>
    </div>
  );
}
