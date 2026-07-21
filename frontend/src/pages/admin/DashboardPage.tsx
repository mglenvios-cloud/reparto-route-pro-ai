import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { companyApi, driverApi, vehicleApi, orderApi, reportApi } from '../../services/api';
import { MapPin, Users, Truck, Package, TrendingUp, Clock } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDistance, formatDuration } from '../../lib/utils';

const driverIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-6 h-6 bg-primary-500 rounded-full border-2 border-white shadow-lg"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
const vehicleIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
const customerIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, driversRes, vehiclesRes, ordersRes, rankRes] = await Promise.all([
        companyApi.getStats(), driverApi.getAll({ limit: '50' }), vehicleApi.getAll(), orderApi.getAll({ limit: '10' }), reportApi.getRanking(),
      ]);
      setStats(statsRes.data.data);
      setDrivers(driversRes.data.data);
      setVehicles(vehiclesRes.data.data);
      setRecentOrders(ordersRes.data.data);
      setRanking(rankRes.data.data);
    } catch {}
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon size={24} /></div>
      <div><p className="text-2xl font-bold">{value || 0}</p><p className="text-dark-400 text-sm">{label}</p></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Repartidores" value={stats.drivers} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Truck} label="Vehículos" value={stats.vehicles} color="bg-green-500/20 text-green-400" />
        <StatCard icon={Package} label="Pedidos Hoy" value={stats.todayOrders} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={TrendingUp} label="Rutas Activas" value={stats.activeRoutes} color="bg-orange-500/20 text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden" style={{ height: 400 }}>
          <MapContainer center={[19.4326, -99.1332]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {drivers.filter(d => d.latitude).map(d => (
              <Marker key={d.id} position={[d.latitude, d.longitude]} icon={driverIcon}>
                <Popup><div className="text-dark-900"><p className="font-bold">{d.name}</p><p className="text-sm">{getStatusLabel(d.status)}</p></div></Popup>
              </Marker>
            ))}
            {vehicles.filter(v => v.latitude).map(v => (
              <Marker key={v.id} position={[v.latitude, v.longitude]} icon={vehicleIcon}>
                <Popup><div className="text-dark-900"><p className="font-bold">{v.plate}</p><p className="text-sm">{getStatusLabel(v.status)}</p></div></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Ranking Repartidores</h3>
            <div className="space-y-3">
              {ranking.slice(0, 5).map((r: any, i: number) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{r.name}</p><p className="text-xs text-dark-400">{r.completed} entregas</p></div>
                  <span className="text-sm font-medium text-green-400">{r.efficiency}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} /> Últimos Pedidos</h3>
            <div className="space-y-2">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-1.5">
                  <div><p className="text-sm font-medium">{o.code}</p><p className="text-xs text-dark-400">{o.customer?.name}</p></div>
                  <span className={`badge ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
