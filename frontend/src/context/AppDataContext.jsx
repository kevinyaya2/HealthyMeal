import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthToken } from './AuthContext';

const AppDataContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

  const refreshMenuItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) {
        throw new Error('Failed to fetch menu');
      }
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      toast.error('載入餐點失敗，請稍後再試。');
    }
  }, []);

  useEffect(() => {
    refreshMenuItems();

    fetch(`${API_BASE}/orders`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setOrderHistory(data))
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        toast.error('載入訂單紀錄失敗，請稍後再試。');
      });
  }, [refreshMenuItems]);

  const addToCart = (item) => {
    setCart((prev) => upsertItem(prev, item));
  };

  const addItemsToCart = (items) => {
    const validItems = (items || []).filter(Boolean);
    if (validItems.length === 0) {
      toast.error('沒有可加入購物車的品項。');
      return;
    }

    setCart((prev) => validItems.reduce((nextCart, item) => upsertItem(nextCart, item), prev));
    toast.success(`已加入 ${validItems.length} 項到購物車`);
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
    const cartItemsForOrder = cart.flatMap((item) =>
      Array.from({ length: item.quantity }, () => normalizeMenuItem(item)),
    );

    if (cartItemsForOrder.length === 0) {
      toast.error('購物車是空的，請先加入商品。');
      return { ok: false, error: new Error('購物車是空的') };
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
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
    if (count >= 20) return '健康老饕';
    if (count >= 10) return '穩定回購客';
    if (count >= 5) return '飲食新手';
    if (count >= 1) return '初次嘗鮮';
    return '尚未下單';
  };

  const getHealthAdvice = () => {
    if (orderHistory.length === 0) {
      return '目前還沒有訂單資料，先選幾份餐點，我再提供更精準的建議。';
    }

    let lowSugar = 0;
    let protein = 0;
    let balancedDiet = 0;

    orderHistory.flatMap((order) => order.items || []).forEach((item) => {
      if (item.category === '低糖') lowSugar += 1;
      if (item.category === '高蛋白') protein += 1;
      if (item.category === '均衡餐') balancedDiet += 1;
    });

    if (lowSugar > 2) return '你偏好低糖選擇，建議維持良好飲食節奏。';
    if (protein > 2) return '你常選高蛋白餐，記得補充蔬菜與水分。';
    if (balancedDiet > 2) return '你整體搭配很均衡，繼續保持。';
    return '建議增加蔬菜與蛋白質比例，讓營養更完整。';
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
    refreshMenuItems,
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
