import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { LayoutDashboard, Users, Truck, UserCircle, Package, CalendarCheck, Map, Upload, BarChart3, LogOut, Menu, X, ChevronDown, Bell, Sun, Moon } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/drivers', icon: Users, label: 'Repartidores' },
  { to: '/vehicles', icon: Truck, label: 'Vehículos' },
  { to: '/customers', icon: UserCircle, label: 'Clientes' },
  { to: '/orders', icon: Package, label: 'Pedidos' },
  { to: '/visits', icon: CalendarCheck, label: 'Visitas' },
  { to: '/routes', icon: Map, label: 'Rutas' },
  { to: '/import', icon: Upload, label: 'Importar' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const NavContent = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.end}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-dark-300 hover:text-white hover:bg-dark-700'}`}
          onClick={() => setMobileOpen(false)}>
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-dark-900">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-dark-700">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg">Route Pro AI</span>
        </div>
        <NavContent />
        <div className="p-3 border-t border-dark-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all">
            <LogOut size={20} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 lg:px-6">
          <button onClick={toggleSidebar} className="lg:hidden text-dark-300 hover:text-white p-2"><Menu size={24} /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-700 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-700">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-medium">{user?.name?.[0]}</div>
                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                <ChevronDown size={16} className="text-dark-400" />
              </button>
              {profileOpen && <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl py-1 z-50"><button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 w-full"><LogOut size={16} /> Cerrar sesión</button></div>}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
