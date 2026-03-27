import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'healthymeal.auth';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function getInitialAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistAuth(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function parseApiResponse(res) {
  const data = await res.json().catch(() => null);
  if (res.ok) {
    return { ok: true, data };
  }
  return {
    ok: false,
    message: data?.message || data?.error || '請稍後再試',
  };
}

export function getAuthToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);

  const setSession = (payload) => {
    setAuth(payload);
    persistAuth(payload);
  };

  const login = async (account, password) => {
    const normalizedAccount = String(account || '').trim();

    if (!normalizedAccount || !password) {
      return { ok: false, message: '請輸入 Email 或使用者名稱與密碼。' };
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: normalizedAccount, password }),
    }).catch(() => null);

    if (!res) return { ok: false, message: '連線失敗，請確認後端是否啟動。' };

    const parsed = await parseApiResponse(res);
    if (!parsed.ok) return parsed;

    const payload = {
      token: parsed.data?.token,
      user: parsed.data?.user,
    };

    if (!payload.token || !payload.user) {
      return { ok: false, message: '登入回傳資料不完整。' };
    }

    setSession(payload);
    return { ok: true };
  };

  const loginDemo = async () => {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);

    if (!res) return { ok: false, message: '連線失敗，請確認後端是否啟動。' };

    const parsed = await parseApiResponse(res);
    if (!parsed.ok) return parsed;

    const payload = {
      token: parsed.data?.token,
      user: parsed.data?.user,
    };

    if (!payload.token || !payload.user) {
      return { ok: false, message: '示範登入回傳資料不完整。' };
    }

    setSession(payload);
    return { ok: true };
  };

  const register = async (form) => {
    const payload = {
      username: String(form.username || '').trim(),
      email: String(form.email || '').trim(),
      password: String(form.password || ''),
      securityQuestion: String(form.securityQuestion || '').trim(),
      securityAnswer: String(form.securityAnswer || '').trim(),
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res) return { ok: false, message: '連線失敗，請確認後端是否啟動。' };

    const parsed = await parseApiResponse(res);
    if (!parsed.ok) return parsed;

    const session = {
      token: parsed.data?.token,
      user: parsed.data?.user,
    };

    if (!session.token || !session.user) {
      return { ok: false, message: '註冊回傳資料不完整。' };
    }

    setSession(session);
    return { ok: true };
  };

  const getSecurityQuestion = async (email) => {
    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail) {
      return { ok: false, message: '請先輸入 Email。' };
    }

    const res = await fetch(`${API_BASE}/auth/forgot-password/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    }).catch(() => null);

    if (!res) return { ok: false, message: '連線失敗，請確認後端是否啟動。' };

    const parsed = await parseApiResponse(res);
    if (!parsed.ok) return parsed;

    if (!parsed.data?.found) {
      return { ok: false, message: parsed.data?.message || '查無此 Email。' };
    }

    return {
      ok: true,
      question: parsed.data.securityQuestion,
      message: parsed.data?.message,
    };
  };

  const resetPasswordBySecurityAnswer = async ({ email, securityAnswer, newPassword }) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, securityAnswer, newPassword }),
    }).catch(() => null);

    if (!res) return { ok: false, message: '連線失敗，請確認後端是否啟動。' };

    const parsed = await parseApiResponse(res);
    if (!parsed.ok) return parsed;

    return { ok: true, message: parsed.data?.message || '密碼已更新' };
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(auth?.user && auth?.token),
      user: auth?.user || null,
      token: auth?.token || null,
      login,
      loginDemo,
      register,
      getSecurityQuestion,
      resetPasswordBySecurityAnswer,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
