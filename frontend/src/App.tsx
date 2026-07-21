import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import DriversPage from './pages/admin/DriversPage';
import VehiclesPage from './pages/admin/VehiclesPage';
import CustomersPage from './pages/admin/CustomersPage';
import OrdersPage from './pages/admin/OrdersPage';
import VisitsPage from './pages/admin/VisitsPage';
import RoutesPage from './pages/admin/RoutesPage';
import ImportPage from './pages/admin/ImportPage';
import ReportsPage from './pages/admin/ReportsPage';
import DriverLayout from './components/driver/DriverLayout';
import DriverDeliveriesPage from './pages/driver/DeliveriesPage';
import DriverVisitsPage from './pages/driver/VisitsPage';
import DriverNavigationPage from './pages/driver/NavigationPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const { isAuthenticated, loadProfile } = useAuthStore();
  const { darkMode } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) loadProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

        <Route path="/" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DISPATCHER']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        <Route path="/driver" element={<ProtectedRoute allowedRoles={['DRIVER']}><DriverLayout /></ProtectedRoute>}>
          <Route index element={<DriverDeliveriesPage />} />
          <Route path="deliveries" element={<DriverDeliveriesPage />} />
          <Route path="visits" element={<DriverVisitsPage />} />
          <Route path="navigation/:id" element={<DriverNavigationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
