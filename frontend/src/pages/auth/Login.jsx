import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password)  {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: form.email.trim(), password: form.password });
      const { accessToken, refreshToken, user } = res.data;

      // Store tokens
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      login(user, accessToken);

      // Role-based redirect
      if (user?.role === 'authority') {
        navigate('/dashboard/authority');
      } else {
        navigate('/dashboard/commuter');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo text-decoration-none mb-3 d-block">
          🚌 <span style={{ color: '#1e293b' }}>Public</span>
          <span style={{ color: '#2563eb' }}>Transit</span>
        </Link>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div className="alert-custom alert-error mb-3">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-group-icon">
              <span className="icon">✉️</span>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-group-icon">
              <span className="icon">🔒</span>
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary-custom" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              '→ Sign In'
            )}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <div className="auth-links">
          Don't have an account?{' '}
          <Link to="/signup/commuter">Sign up as Commuter</Link>
          {' · '}
          <Link to="/signup/authority">Sign up as Authority</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
