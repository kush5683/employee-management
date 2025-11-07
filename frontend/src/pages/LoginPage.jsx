import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    try {
      setSubmitting(true);
      await login(form.email, form.password);
      navigate('/employees', { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to log in with those credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <header>
          <p className="login-eyebrow">Employee Management</p>
          <h1>Sign in to continue</h1>
          <p className="login-subtitle">Enter your work email and password to access the dashboard.</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
