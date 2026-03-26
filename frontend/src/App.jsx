import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import { AppDataProvider } from './context/AppDataContext';
import BadgePage from './pages/BadgePage';
import CartPage from './pages/CartPage';
import MealListPage from './pages/MealListPage';
import OrderAdvicePage from './pages/OrderAdvicePage';
import SubscriptionPage from './pages/SubscriptionPage';

function App() {
  return (
    <AppDataProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MealListPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/badge" element={<BadgePage />} />
          <Route path="/orders-advice" element={<OrderAdvicePage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppDataProvider>
  );
}

export default App;

