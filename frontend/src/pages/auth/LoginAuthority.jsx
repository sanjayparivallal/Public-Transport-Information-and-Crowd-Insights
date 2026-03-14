import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const LoginAuthority = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect away
  useEffect(() => {
    if (user) {
      if (user.role === 'authority') navigate('/dashboard/authority', { replace: true });
      else navigate('/dashboard/commuter', { replace: true });
    }
  }, [user, navigate]);


  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password)  {
      toast.error('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: form.email.trim().toLowerCase(), password: form.password });

      // Backend returns: { success:true, data: { accessToken, refreshToken, authority } }
      // (authorities are NOT in the `user` key — they use `authority`)
      const payload      = res.data?.data || res.data;
      const accessToken  = payload.accessToken;
      const refreshToken = payload.refreshToken;
      // Authority login returns `authority`, commuter login returns `user`
      const userObj      = payload.user || payload.authority;

      if (!accessToken || !userObj) throw new Error('Invalid response from server.');

      if (userObj.role !== 'authority') {
        logout();
        throw new Error('Please use the Commuter Login portal.');
      }

      // Store & set auth state
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      login(userObj, accessToken, refreshToken);

      // Redirect
      const from = location.state?.from;
      if (from && from !== '/login/authority') {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard/authority', { replace: true });
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid credentials')) {
        toast.error('❌ Incorrect email or password. Please try again.');
      } else if (msg.toLowerCase().includes('disabled')) {
        toast.error('🚫 Your account has been disabled. Contact support.');
      } else {
        toast.error(msg || 'Login failed. Please try again.');
      }
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

        <h1 className="auth-title">Authority Portal</h1>
        <p className="auth-subtitle">Sign in to manage your transport fleet</p>

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
          Not an authority?{' '}
          <Link to="/login">Commuter Login</Link>
          <br />
          Need an account?{' '}
          <Link to="/signup/authority">Authority Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginAuthority;
