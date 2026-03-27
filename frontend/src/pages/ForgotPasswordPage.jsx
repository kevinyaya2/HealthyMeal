import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

export default function ForgotPasswordPage() {
  const { isAuthenticated, getSecurityQuestion, resetPasswordBySecurityAnswer } = useAuth();
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFindQuestion = async (event) => {
    event.preventDefault();
    setLoadingQuestion(true);

    const result = await getSecurityQuestion(email);
    if (result.ok) {
      setQuestion(result.question || '');
      toast.success('已取得安全問題，請作答。');
    } else {
      setQuestion('');
      toast.error(result.message || '找不到安全問題。');
    }

    setLoadingQuestion(false);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!question) {
      toast.error('請先查詢安全問題。');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('新密碼至少需要 8 碼。');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('兩次新密碼輸入不一致。');
      return;
    }

    setSubmittingReset(true);

    const result = await resetPasswordBySecurityAnswer({
      email,
      securityAnswer: answer,
      newPassword,
    });

    if (result.ok) {
      toast.success(result.message || '密碼已更新，請重新登入。');
      setAnswer('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.message || '重設密碼失敗。');
    }

    setSubmittingReset(false);
  };

  return (
    <main className="hm-login-page" aria-label="忘記密碼頁面">
      <section className="hm-login-shell" aria-label="忘記密碼區塊">
        <section className="hm-login-card" aria-label="重設密碼卡片">
          <h1 className="hm-login-title">忘記密碼</h1>

          <form className="d-grid gap-3" onSubmit={handleFindQuestion} noValidate>
            <input
              className="form-control hm-login-field"
              type="email"
              placeholder="請輸入註冊 Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn hm-login-submit" type="submit" disabled={loadingQuestion}>
              {loadingQuestion ? '查詢中...' : '查詢安全問題'}
            </button>
          </form>

          {question ? (
            <form className="d-grid gap-3 mt-3" onSubmit={handleResetPassword} noValidate>
              <div className="hm-question-box">安全問題：{question}</div>
              <input className="form-control hm-login-field" type="text" placeholder="請輸入答案" value={answer} onChange={(event) => setAnswer(event.target.value)} required />
              <PasswordField className="form-control hm-login-field" placeholder="新密碼（至少 8 碼）" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required />
              <PasswordField className="form-control hm-login-field" placeholder="確認新密碼" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
              <button className="btn hm-login-submit" type="submit" disabled={submittingReset}>
                {submittingReset ? '更新中...' : '更新密碼'}
              </button>
            </form>
          ) : null}

          <p className="hm-login-helper mt-3 mb-0">
            <Link to="/login" className="hm-login-link">返回登入</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
