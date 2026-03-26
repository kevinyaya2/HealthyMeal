import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart({
  cart,
  totalPrice,
  removeFromCart,
  updateCartItemQuantity,
  checkout,
  clearCart,
}) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const shippingFee = cart.length > 0 ? 60 : 0;
  const discount = totalPrice >= 1200 ? 80 : 0;
  const payableTotal = totalPrice + shippingFee - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('購物車目前是空的');
      return;
    }

    if (isCheckingOut) return;
    setIsCheckingOut(true);

    const result = await checkout();
    setIsCheckingOut(false);

    if (!result?.ok) return;

    setSuccessOrder(result.order);
    setTimeout(() => {
      navigate('/orders-advice');
    }, 1500);
  };

  const handleClear = () => {
    if (cart.length === 0) return;
    clearCart();
    toast('購物車已清空');
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    toast(`${item.name} 已移除`);
  };

  return (
    <section id="cart" className="container my-5 py-4 bg-white rounded-4 shadow-sm border">
      <h2 className="text-center fw-bold mb-4">我的購物車</h2>

      {cart.length === 0 ? (
        <div className="text-center text-muted my-5 empty-cart-state">
          <div className="empty-cart-illustration mb-3">🛒</div>
          <h4 className="fw-bold mb-2">你的購物車目前沒有商品</h4>
          <p className="mb-4">先去商品頁挑幾份健康餐，完成今天的飲食計畫。</p>
          <Link to="/" className="btn btn-success rounded-pill px-4">
            前往商品頁
          </Link>
        </div>
      ) : (
        <>
          <div className="row g-4 cart-layout">
            <div className="col-lg-8">
              <ul className="list-group list-group-flush rounded border bg-white">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center py-3"
                  >
                    <div>
                      <h5 className="mb-1 fw-bold">{item.name}</h5>
                      <div className="text-muted small">單價 NT$ {item.price}</div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          aria-label={`decrease-${item.name}`}
                        >
                          -
                        </button>
                        <span className="px-3 fw-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          aria-label={`increase-${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-end" style={{ minWidth: '110px' }}>
                        <div className="fw-bold text-success">NT$ {item.price * item.quantity}</div>
                        <button
                          className="btn btn-link btn-sm text-danger p-0 mt-1"
                          onClick={() => handleRemove(item)}
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-4">
              <div className="cart-summary-card p-4 rounded-3 border shadow-sm bg-light">
                <h5 className="fw-bold mb-3">訂單摘要</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>小計</span>
                  <span>NT$ {totalPrice}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>運費</span>
                  <span>NT$ {shippingFee}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>折扣</span>
                  <span className="text-success">- NT$ {discount}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">應付金額</span>
                  <span className="fw-bold fs-4 text-success">NT$ {payableTotal}</span>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn btn-success rounded-pill" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? '結帳中...' : '前往結帳'}
                  </button>
                  <button className="btn btn-outline-secondary rounded-pill" onClick={handleClear}>
                    清空購物車
                  </button>
                </div>
                <p className="small text-muted mt-3 mb-0">滿 NT$ 1200 自動套用 NT$ 80 折扣</p>
              </div>
            </div>
          </div>

          <div className="mobile-cart-bar d-md-none">
            <div>
              <div className="small text-muted">應付金額</div>
              <div className="fw-bold text-success">NT$ {payableTotal}</div>
            </div>
            <button className="btn btn-success rounded-pill px-4" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? '結帳中...' : '結帳'}
            </button>
          </div>
        </>
      )}

      {successOrder ? (
        <div className="checkout-success-overlay" role="status" aria-live="polite">
          <div className="checkout-success-card text-center">
            <div className="success-check mb-3">✓</div>
            <h4 className="fw-bold mb-2">結帳成功</h4>
            <p className="mb-1 text-muted">訂單編號：#{successOrder.id}</p>
            <p className="mb-0 text-success fw-semibold">總金額 NT$ {successOrder.totalPrice}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
