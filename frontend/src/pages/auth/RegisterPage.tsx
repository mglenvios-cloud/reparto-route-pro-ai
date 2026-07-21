import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Truck } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    try {
      await register({ companyName: form.companyName, email: form.email, password: form.password, name: form.name });
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Route Pro AI</h1>
          <p className="text-dark-400 mt-2">Crea tu cuenta</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Registrarse</h2>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Empresa</label><input className="input-field" placeholder="Nombre de tu empresa" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Nombre</label><input className="input-field" placeholder="Tu nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label><input type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Contraseña</label><input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Confirmar contraseña</label><input type="password" className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required /></div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">{isLoading ? 'Creando cuenta...' : 'Crear cuenta'}</button>
          </form>
          <p className="text-center text-dark-400 text-sm mt-6">¿Ya tienes cuenta? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
