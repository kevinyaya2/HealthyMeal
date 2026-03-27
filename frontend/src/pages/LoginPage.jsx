import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

export default function LoginPage() {
  const logoSrc = `${import.meta.env.BASE_URL}image/logo.jpg`;
  const { isAuthenticated, login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await login(account, password);

    if (result.ok) {
      toast.success('登入成功，歡迎回來！');
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message || '登入失敗，請稍後再試。');
    }

    setIsSubmitting(false);
  };

  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    const result = await loginDemo();
    if (result.ok) {
      toast.success('已使用示範帳號登入');
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message || '示範登入失敗');
    }
    setIsSubmitting(false);
  };

  return (
    <main className="hm-login-page" aria-label="登入頁面">
      <section className="hm-login-shell" aria-label="登入區塊">
        <div className="hm-login-brand">
          <span className="hm-login-brand-mark" aria-hidden="true">
            <img className="hm-login-brand-icon" src={logoSrc} alt="HealthyMeal Logo" />
          </span>
          <span>HealthyMeal 會員中心</span>
        </div>

        <section className="hm-login-card" aria-label="登入卡片">
          <h1 className="hm-login-title">帳號登入</h1>

          <form className="d-grid gap-3" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="visually-hidden" htmlFor="account">帳號</label>
              <input
                id="account"
                name="account"
                type="text"
                className="form-control hm-login-field"
                placeholder="請輸入 Email 或使用者名稱"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="visually-hidden" htmlFor="password">密碼</label>
              <PasswordField
                id="password"
                name="password"
                className="form-control hm-login-field"
                placeholder="請輸入密碼"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <p className="hm-login-helper mb-0">
              <Link to="/register" className="hm-login-link">註冊新帳號</Link>
              <span className="mx-2">|</span>
              <Link to="/forgot-password" className="hm-login-link">忘記密碼</Link>
            </p>

            <button className="btn hm-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '登入中...' : '登入'}
            </button>
          </form>

          <div className="hm-login-divider">或</div>

          <button type="button" className="btn hm-login-demo-btn" onClick={handleQuickDemo} disabled={isSubmitting}>
            {isSubmitting ? '處理中...' : '快速試用（一鍵登入）'}
          </button>
        </section>
      </section>
    </main>
  );
}
