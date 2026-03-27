import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import BadgePage from './pages/BadgePage';
import CartPage from './pages/CartPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import MealListPage from './pages/MealListPage';
import OrderAdvicePage from './pages/OrderAdvicePage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionPage from './pages/SubscriptionPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <AppDataProvider>
      <MainLayout />
    </AppDataProvider>
  );
}

function AdminOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<MealListPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/badge" element={<BadgePage />} />
        <Route path="/orders-advice" element={<OrderAdvicePage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route
          path="/admin/dashboard"
          element={(
            <AdminOnlyRoute>
              <AdminDashboardPage />
            </AdminOnlyRoute>
          )}
        />
        <Route
          path="/admin/menu"
          element={(
            <AdminOnlyRoute>
              <AdminMenuPage />
            </AdminOnlyRoute>
          )}
        />
        <Route
          path="/admin/orders"
          element={(
            <AdminOnlyRoute>
              <AdminOrdersPage />
            </AdminOnlyRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <AdminOnlyRoute>
              <AdminUsersPage />
            </AdminOnlyRoute>
          )}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
