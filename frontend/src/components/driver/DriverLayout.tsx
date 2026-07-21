import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Package, CalendarCheck, Navigation, LogOut, Truck } from 'lucide-react';

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
          <div><p className="font-bold text-sm">Route Pro AI</p><p className="text-xs text-dark-400">{user?.name}</p></div>
        </div>
        <button onClick={handleLogout} className="p-2 text-dark-400 hover:text-red-400"><LogOut size={20} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex justify-around py-2 px-4 safe-area-bottom">
        <NavLink to="/driver/deliveries" className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-dark-400'}`}>
          <Package size={22} /><span className="text-xs">Entregas</span>
        </NavLink>
        <NavLink to="/driver/visits" className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-dark-400'}`}>
          <CalendarCheck size={22} /><span className="text-xs">Visitas</span>
        </NavLink>
        <NavLink to="/driver" end className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-dark-400'}`}>
          <Navigation size={22} /><span className="text-xs">Navegar</span>
        </NavLink>
      </nav>
    </div>
  );
}
