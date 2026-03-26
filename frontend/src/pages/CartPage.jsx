import Cart from '../components/Cart';
import { useAppData } from '../context/AppDataContext';

export default function CartPage() {
  const { cart, totalPrice, removeFromCart, updateCartItemQuantity, checkout, clearCart } = useAppData();

  return (
    <section className="container py-4">
      <Cart
        cart={cart}
        totalPrice={totalPrice}
        removeFromCart={removeFromCart}
        updateCartItemQuantity={updateCartItemQuantity}
        checkout={checkout}
        clearCart={clearCart}
      />
    </section>
  );
}
