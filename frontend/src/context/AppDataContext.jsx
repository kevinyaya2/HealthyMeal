import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const AppDataContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function normalizeMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    category: item.category,
    image: item.image,
  };
}

function upsertItem(cart, item, qtyToAdd = 1) {
  const target = normalizeMenuItem(item);
  const index = cart.findIndex((row) => row.id === target.id);

  if (index === -1) {
    return [...cart, { ...target, quantity: Math.max(1, qtyToAdd) }];
  }

  return cart.map((row, i) =>
    i === index ? { ...row, quantity: row.quantity + Math.max(1, qtyToAdd) } : row,
  );
}

export function AppDataProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((err) => {
        console.error('Failed to fetch menu:', err);
        toast.error('載入菜單失敗，請稍後再試。');
      });

    fetch(`${API_BASE}/orders`)
      .then((res) => res.json())
      .then((data) => setOrderHistory(data))
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        toast.error('載入訂單紀錄失敗。');
      });
  }, []);

  const addToCart = (item) => {
    setCart((prev) => upsertItem(prev, item));
  };

  const addItemsToCart = (items) => {
    const validItems = (items || []).filter(Boolean);
    if (validItems.length === 0) {
      toast.error('這筆訂單沒有可加入的品項。');
      return;
    }

    setCart((prev) => validItems.reduce((nextCart, item) => upsertItem(nextCart, item), prev));
    toast.success(`已加入 ${validItems.length} 個品項到購物車`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const checkout = async () => {
    const cartItemsForOrder = cart.flatMap((item) => Array.from({ length: item.quantity }, () => normalizeMenuItem(item)));

    if (cartItemsForOrder.length === 0) {
      toast.error('購物車是空的，無法結帳。');
      return { ok: false, error: new Error('購物車是空的') };
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItemsForOrder),
      });

      if (!res.ok) throw new Error('結帳失敗');

      const newOrder = await res.json();
      setOrderHistory((prev) => [...prev, newOrder]);
      setCart([]);
      return { ok: true, order: newOrder };
    } catch (err) {
      toast.error(`結帳失敗：${err.message}`);
      return { ok: false, error: err };
    }
  };

  const getTitle = () => {
    const count = orderHistory.length;
    if (count >= 20) return '健康王者';
    if (count >= 10) return '均衡達人';
    if (count >= 5) return '健康進階者';
    if (count >= 1) return '健康新手';
    return '尚未獲得稱號';
  };

  const getHealthAdvice = () => {
    if (orderHistory.length === 0) {
      return '目前還沒有訂單資料，先選一份餐點開始，AI 才能給你更準確建議。';
    }

    let healthy = 0;
    let protein = 0;
    let light = 0;

    orderHistory.flatMap((order) => order.items || []).forEach((item) => {
      if (item.category === '健康餐') healthy += 1;
      if (item.category === '高蛋白') protein += 1;
      if (item.category === '輕食') light += 1;
    });

    if (healthy > 2) return '你最近健康餐比例很高，可以搭配少量高蛋白提升飽足感。';
    if (protein > 2) return '高蛋白攝取不錯，建議增加蔬菜纖維讓營養更均衡。';
    if (light > 2) return '你偏好輕食，若有運動可以加一份蛋白質來源。';
    return '整體選擇很均衡，持續保持這個飲食節奏。';
  };

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
    [cart],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const value = {
    menuItems,
    cart,
    orderHistory,
    searchQuery,
    categoryFilter,
    setSearchQuery,
    setCategoryFilter,
    addToCart,
    addItemsToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    checkout,
    getTitle,
    getHealthAdvice,
    totalPrice,
    cartItemCount,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
