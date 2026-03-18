import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, LogInIcon } from '../../components/icons';
import AuthLayout from '../../components/AuthLayout';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, logout, user } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'authority') navigate('/dashboard/authority', { replace: true });
      else navigate('/dashboard/commuter', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { toast.error('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res         = await loginUser({ email: form.email.trim().toLowerCase(), password: form.password });
      const payload     = res.data?.data || res.data;
      const accessToken  = payload.accessToken;
      const refreshToken = payload.refreshToken;
      const userObj      = payload.user || payload.authority;

      if (!accessToken || !userObj) throw new Error('Invalid response from server.');

      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      login(userObj, accessToken, refreshToken);

      const from = location.state?.from;
      navigate(from && from !== '/login' ? from : '/dashboard/commuter', { replace: true });
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid credentials')) toast.error('Incorrect email or password.');
      else if (msg.toLowerCase().includes('disabled')) toast.error('Account disabled. Contact support.');
      else toast.error(msg || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Email */}
        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <MailIcon size={16} />
            </span>
            <input id="email" name="email" type="email" className="input pl-9"
              placeholder="you@example.com" value={form.email} onChange={handleChange}
              autoComplete="email" required />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <LockIcon size={16} />
            </span>
            <input id="password" name="password" type={showPw ? 'text' : 'password'}
              className="input pl-9 pr-9"
              placeholder="Enter your password" value={form.password} onChange={handleChange}
              autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
            : <><LogInIcon size={16} />Sign In</>}
        </button>
      </form>

      {/* Divider */}
      <div className="divider-text my-6">or continue with</div>

      {/* Links */}
      <div className="text-center text-sm space-y-3">
        <p className="text-slate-500">
          No account yet?
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup/commuter" className="btn-secondary text-xs">Normal Commuter Registration</Link>
          <Link to="/signup/authority" className="btn-secondary text-xs">Authority Registration</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
