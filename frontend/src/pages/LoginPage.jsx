import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';

const DEMO_USERS = [
  {
    label: 'Log in as Jordan (Manager)',
    email: 'jordan.miles@example.com',
    password: 'jorda-44fcf1'
  },
  {
    label: 'Log in as Priya (Employee)',
    email: 'priya.patel@example.com',
    password: 'priya-66c716'
  }
];

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

  async function authenticate(credentials) {
    if (submitting) return;
    setError(null);
    try {
      setSubmitting(true);
      const userProfile = await login(credentials.email, credentials.password);
      setForm({ email: credentials.email, password: credentials.password });
      const destination = userProfile?.isManager ? '/employees' : '/availabilities';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to log in with those credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    authenticate(form);
  }

  function handleDemoLogin(demo) {
    setForm({ email: demo.email, password: demo.password });
    authenticate(demo);
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

        <section className="login-demos" aria-label="Demo accounts">
          <p>Or jump straight into a demo profile:</p>
          <div className="login-demos__grid">
            {DEMO_USERS.map((demo) => (
              <button
                type="button"
                key={demo.email}
                className="login-demo-btn"
                onClick={() => handleDemoLogin(demo)}
                disabled={submitting}
              >
                {demo.label}
              </button>
            ))}
          </div>
          <p className="login-demos__hint">Demo credentials reset automatically—feel free to explore.</p>
        </section>
      </div>
    </div>
  );
}
