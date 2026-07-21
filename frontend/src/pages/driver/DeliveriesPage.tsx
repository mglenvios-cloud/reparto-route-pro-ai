import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { getStatusColor, getStatusLabel, formatDateTime } from '../../lib/utils';
import { Package, Search, MapPin, Camera, Signature, QrCode, CheckCircle, XCircle, Clock, ChevronRight, Navigation } from 'lucide-react';

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { loadOrders(); const interval = setInterval(loadOrders, 15000); return () => clearInterval(interval); }, []);

  const loadOrders = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const { data } = await orderApi.getAll({ driverId: userId || 'my', limit: '100' });
      setOrders(data.data);
    } catch {}
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try { await orderApi.updateStatus(id, { status }); loadOrders(); } catch {}
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter.toUpperCase());
  const pendingCount = orders.filter(o => ['PENDING', 'ASSIGNED'].includes(o.status)).length;

  const filters = [
    { id: 'all', label: 'Todas', count: orders.length },
    { id: 'pending', label: 'Pendientes', count: pendingCount },
    { id: 'delivered', label: 'Entregadas', count: orders.filter(o => o.status === 'DELIVERED').length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Entregas</h1>
        <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">{pendingCount} pendientes</span>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${filter === f.id ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300'}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{order.customer?.name}</p>
                <p className="text-xs text-dark-400">{order.code}</p>
              </div>
              <span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
            </div>
            <p className="text-sm text-dark-300 mb-2">{order.description || order.address?.street}</p>
            <div className="flex items-center gap-4 text-xs text-dark-400 mb-3">
              <span className="flex items-center gap-1"><MapPin size={12} /> {order.address?.city || ''}</span>
              {order.scheduledDate && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.scheduledDate).toLocaleDateString()}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['PENDING', 'ASSIGNED'].includes(order.status) && (
                <button onClick={() => handleStatusUpdate(order.id, 'IN_TRANSIT')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><Navigation size={14} /> Iniciar viaje</button>
              )}
              {order.status === 'IN_TRANSIT' && (
                <button onClick={() => handleStatusUpdate(order.id, 'ARRIVING')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><MapPin size={14} /> Llegando</button>
              )}
              {['IN_TRANSIT', 'ARRIVING'].includes(order.status) && (
                <>
                  <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-green-500 hover:bg-green-600"><CheckCircle size={14} /> Entregado</button>
                  <button onClick={() => handleStatusUpdate(order.id, 'CUSTOMER_ABSENT')} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><XCircle size={14} /> Ausente</button>
                </>
              )}
              <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Camera size={14} /> Foto</button>
              <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Signature size={14} /> Firma</button>
              <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><QrCode size={14} /> QR</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-dark-400 py-8">No hay entregas</p>}
      </div>
    </div>
  );
}
