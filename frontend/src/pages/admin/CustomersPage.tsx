import { useEffect, useState } from 'react';
import { customerApi } from '../../services/api';
import { Plus, Search, Edit2, Trash2, UserCircle, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', lastName: '', phone: '', email: '', notes: '' });

  useEffect(() => { loadCustomers(); }, [search]);

  const loadCustomers = async () => { try { const { data } = await customerApi.getAll({ search, limit: '100' }); setCustomers(data.data); } catch {} };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await customerApi.update(editing.id, form); } else { await customerApi.create({ ...form, addresses: [] }); }
      setShowModal(false); setEditing(null); setForm({ name: '', lastName: '', phone: '', email: '', notes: '' }); loadCustomers();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', lastName: '', phone: '', email: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Agregar</button>
      </div>
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" /><input className="input-field pl-10" placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4">
        {customers.map(c => (
          <div key={c.id} className="card flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400"><UserCircle size={20} /></div>
            <div className="flex-1 min-w-0"><p className="font-medium">{c.name} {c.lastName}</p><p className="text-sm text-dark-400">{c.email || c.phone} · {c._count?.orders || 0} pedidos</p></div>
            {c.addresses?.[0] && <span className="text-xs text-dark-400 flex items-center gap-1"><MapPin size={12} /> {c.addresses.length} direcciones</span>}
            <div className="flex gap-2">
              <button onClick={() => { setEditing(c); setForm(c); setShowModal(true); }} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={async () => { if (confirm('¿Desactivar cliente?')) { await customerApi.delete(c.id); loadCustomers(); } }} className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nuevo'} Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-dark-300 mb-1">Nombre</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div><label className="block text-sm text-dark-300 mb-1">Apellido</label><input className="input-field" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm text-dark-300 mb-1">Teléfono</label><input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Notas</label><textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
