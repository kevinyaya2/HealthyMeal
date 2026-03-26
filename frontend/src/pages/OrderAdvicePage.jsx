import OrderHistory from '../components/OrderHistory';
import { useAppData } from '../context/AppDataContext';

export default function OrderAdvicePage() {
  const { orderHistory, getHealthAdvice, addItemsToCart } = useAppData();

  return (
    <OrderHistory
      orderHistory={orderHistory}
      getHealthAdvice={getHealthAdvice}
      onReorder={addItemsToCart}
    />
  );
}
