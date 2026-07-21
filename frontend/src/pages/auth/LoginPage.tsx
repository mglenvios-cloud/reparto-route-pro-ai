import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Route Pro AI</h1>
          <p className="text-dark-400 mt-2">Plataforma de gestión de rutas y entregas</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Registrarse</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
