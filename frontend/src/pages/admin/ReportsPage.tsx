import { useEffect, useState } from 'react';
import { reportApi, aiApi } from '../../services/api';
import { BarChart3, Download, FileText, TrendingUp, Fuel, Trophy, Lightbulb, Brain } from 'lucide-react';

export default function ReportsPage() {
  const [tab, setTab] = useState<'deliveries' | 'visits' | 'productivity' | 'fuel' | 'ranking' | 'ai'>('deliveries');
  const [data, setData] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const loadData = async () => {
    try {
      if (tab === 'deliveries') { const { data: d } = await reportApi.getDeliveries({ startDate, endDate }); setData(d.data); }
      else if (tab === 'visits') { const { data: d } = await reportApi.getVisits({ startDate, endDate }); setData(d.data); }
      else if (tab === 'productivity') { const { data: d } = await reportApi.getProductivity(); setData(d.data); }
      else if (tab === 'fuel') { const { data: d } = await reportApi.getFuel({ startDate, endDate }); setData(d.data); }
      else if (tab === 'ranking') { const { data: d } = await reportApi.getRanking(); setData(d.data); }
      else if (tab === 'ai') {
        const { data: s } = await aiApi.getSuggestions();
        setSuggestions(s.data || []);
        const { data: r } = await aiApi.generateReport({ startDate, endDate });
        setData(r.data);
      }
    } catch {}
  };

  useEffect(() => { loadData(); }, [tab, startDate, endDate]);

  const downloadPDF = (url: string) => window.open(url, '_blank');

  const tabs = [
    { id: 'deliveries' as const, icon: FileText, label: 'Entregas' },
    { id: 'visits' as const, icon: TrendingUp, label: 'Visitas' },
    { id: 'productivity' as const, icon: BarChart3, label: 'Productividad' },
    { id: 'fuel' as const, icon: Fuel, label: 'Combustible' },
    { id: 'ranking' as const, icon: Trophy, label: 'Ranking' },
    { id: 'ai' as const, icon: Brain, label: 'IA' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {(tab === 'deliveries' || tab === 'visits' || tab === 'fuel') && (
        <div className="flex items-center gap-4">
          <div><label className="block text-xs text-dark-400 mb-1">Desde</label><input type="date" className="input-field py-2" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><label className="block text-xs text-dark-400 mb-1">Hasta</label><input type="date" className="input-field py-2" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          <button onClick={() => downloadPDF(`/api/reports/${tab}?startDate=${startDate}&endDate=${endDate}&format=pdf`)} className="btn-secondary text-sm flex items-center gap-2 mt-5"><Download size={16} /> PDF</button>
          <button onClick={() => downloadPDF(`/api/reports/${tab}?startDate=${startDate}&endDate=${endDate}&format=excel`)} className="btn-secondary text-sm flex items-center gap-2 mt-5"><FileText size={16} /> Excel</button>
        </div>
      )}

      {tab === 'deliveries' && data && (
        <div className="card"><h3 className="font-semibold mb-4">Entregas ({data.length})</h3>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-700"><th className="text-left py-2 px-3 text-dark-400">Código</th><th className="text-left py-2 px-3 text-dark-400">Cliente</th><th className="text-left py-2 px-3 text-dark-400">Repartidor</th><th className="text-left py-2 px-3 text-dark-400">Estado</th><th className="text-left py-2 px-3 text-dark-400">Valor</th></tr></thead><tbody>{data.map((o: any) => <tr key={o.id} className="border-b border-dark-700/50"><td className="py-2 px-3">{o.code}</td><td className="py-2 px-3">{o.customer?.name}</td><td className="py-2 px-3">{o.driver?.name || '-'}</td><td className="py-2 px-3">{o.status}</td><td className="py-2 px-3">${o.value || 0}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {tab === 'productivity' && data && (
        <div className="card"><h3 className="font-semibold mb-4">Productividad</h3>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-700"><th className="text-left py-2 px-3 text-dark-400">Repartidor</th><th className="text-left py-2 px-3 text-dark-400">Entregas</th><th className="text-left py-2 px-3 text-dark-400">Rutas</th><th className="text-left py-2 px-3 text-dark-400">Distancia</th><th className="text-left py-2 px-3 text-dark-400">Duración</th></tr></thead><tbody>{data.map((r: any) => <tr key={r.id} className="border-b border-dark-700/50"><td className="py-2 px-3 font-medium">{r.name}</td><td className="py-2 px-3">{r.deliveriesCompleted}</td><td className="py-2 px-3">{r.routesCompleted}</td><td className="py-2 px-3">{(r.totalDistance / 1000).toFixed(1)} km</td><td className="py-2 px-3">{Math.round(r.totalDuration / 60)} min</td></tr>)}</tbody></table></div>
        </div>
      )}

      {tab === 'fuel' && data && (
        <div className="card">
          <h3 className="font-semibold mb-4">Combustible</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-400">${data.total?.cost?.toFixed(2) || 0}</p><p className="text-sm text-dark-400">Total gastado</p></div>
            <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-400">{data.total?.liters?.toFixed(1) || 0} L</p><p className="text-sm text-dark-400">Total litros</p></div>
            <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-purple-400">{data.total?.entries || 0}</p><p className="text-sm text-dark-400">Cargas</p></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-700"><th className="text-left py-2 px-3 text-dark-400">Vehículo</th><th className="text-left py-2 px-3 text-dark-400">Litros</th><th className="text-left py-2 px-3 text-dark-400">Costo</th><th className="text-left py-2 px-3 text-dark-400">Fecha</th></tr></thead><tbody>{data.logs?.map((l: any) => <tr key={l.id} className="border-b border-dark-700/50"><td className="py-2 px-3">{l.vehicle?.plate}</td><td className="py-2 px-3">{l.liters} L</td><td className="py-2 px-3">${l.cost}</td><td className="py-2 px-3">{new Date(l.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {tab === 'ranking' && data && (
        <div className="card"><h3 className="font-semibold mb-4">Ranking de Repartidores</h3>
          <div className="space-y-3">{[...data].sort((a: any, b: any) => b.efficiency - a.efficiency).map((r: any, i: number) => (
            <div key={r.id} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-600 text-dark-300'}`}>{i + 1}</span>
              <div className="flex-1"><p className="font-medium">{r.name}</p><p className="text-sm text-dark-400">{r.code}</p></div>
              <div className="text-right"><p className="font-bold text-green-400">{r.efficiency}%</p><p className="text-xs text-dark-400">{r.completed}/{r.totalAssigned} entregas</p></div>
            </div>
          ))}</div>
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-6">
          {data && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain size={18} className="text-purple-400" /> Resumen Automático</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{data.summary?.totalDeliveries || 0}</p><p className="text-sm text-dark-400">Total entregas</p></div>
                <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-400">{data.summary?.completionRate || 0}%</p><p className="text-sm text-dark-400">Tasa de éxito</p></div>
                <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-400">{data.summary?.onTimeRate || 0}%</p><p className="text-sm text-dark-400">A tiempo</p></div>
                <div className="bg-dark-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-orange-400">{data.summary?.pending || 0}</p><p className="text-sm text-dark-400">Pendientes</p></div>
              </div>
              {data.insights?.map((i: string, idx: number) => <p key={idx} className="text-sm text-dark-300 mb-1">• {i}</p>)}
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400" /> Sugerencias de Mejora</h3>
            {suggestions.length > 0 ? suggestions.map((s, i) => <p key={i} className="text-sm text-dark-300 mb-2">• {s}</p>) : <p className="text-sm text-dark-400">Cargando sugerencias...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
