import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

const questions = [
  '你國小最好的朋友名字是？',
  '你第一份工作公司名稱是？',
  '你最喜歡的食物是？',
  '你出生城市是？',
];

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: questions[0],
    securityAnswer: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = form.username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error('使用者名稱需為 3-20 字元，僅限英數與底線。');
      return;
    }

    if (form.password.length < 8) {
      toast.error('密碼至少需要 8 碼。');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('兩次密碼輸入不一致。');
      return;
    }

    if (!form.securityAnswer.trim()) {
      toast.error('請填寫安全問題答案。');
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      username: form.username,
      email: form.email,
      password: form.password,
      securityQuestion: form.securityQuestion,
      securityAnswer: form.securityAnswer,
    });

    if (result.ok) {
      toast.success('註冊成功，已自動登入！');
      navigate('/', { replace: true });
    } else {
      toast.error(result.message || '註冊失敗，請稍後再試。');
    }

    setIsSubmitting(false);
  };

  return (
    <main className="hm-login-page" aria-label="註冊頁面">
      <section className="hm-login-shell" aria-label="註冊區塊">
        <section className="hm-login-card" aria-label="註冊卡片">
          <h1 className="hm-login-title">註冊新帳號</h1>

          <form className="d-grid gap-3" onSubmit={handleSubmit} noValidate>
            <input className="form-control hm-login-field" type="text" placeholder="使用者名稱（3-20字，英數底線）" value={form.username} onChange={updateField('username')} required />
            <input className="form-control hm-login-field" type="email" placeholder="Email" value={form.email} onChange={updateField('email')} required />
            <PasswordField className="form-control hm-login-field" placeholder="密碼（至少 8 碼）" value={form.password} onChange={updateField('password')} autoComplete="new-password" required />
            <PasswordField className="form-control hm-login-field" placeholder="確認密碼" value={form.confirmPassword} onChange={updateField('confirmPassword')} autoComplete="new-password" required />

            <label className="hm-form-label mb-0">安全問題</label>
            <select className="form-select hm-login-field" value={form.securityQuestion} onChange={updateField('securityQuestion')}>
              {questions.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            <input className="form-control hm-login-field" type="text" placeholder="安全問題答案" value={form.securityAnswer} onChange={updateField('securityAnswer')} required />

            <button className="btn hm-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '註冊中...' : '註冊並登入'}
            </button>
          </form>

          <p className="hm-login-helper mt-3 mb-0">
            已有帳號？ <Link to="/login" className="hm-login-link">返回登入</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
