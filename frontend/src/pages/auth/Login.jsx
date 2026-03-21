import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, LogInIcon, UserIcon, BuildingIcon } from '../../components/icons';
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
        <div className="group">
          <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
              <MailIcon size={18} />
            </span>
            <input id="email" name="email" type="email" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 
                         placeholder:text-slate-400 outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="you@example.com" value={form.email} onChange={handleChange}
              autoComplete="email" required />
          </div>
        </div>

        {/* Password */}
        <div className="group">
          <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
              <LockIcon size={18} />
            </span>
            <input id="password" name="password" type={showPw ? 'text' : 'password'}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-12 text-sm font-medium text-slate-900 
                         placeholder:text-slate-400 outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="••••••••" value={form.password} onChange={handleChange}
              autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        </div>


        <button type="submit" 
          className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-xl shadow-blue-200 
                     flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden" 
          disabled={loading}>
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          {loading
            ? <><span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
            : <><LogInIcon size={20} className="group-hover:translate-x-1 transition-transform" />Sign In</>}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 text-center text-sm">
        <p className="text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup/commuter" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Sign up</Link>
        </p>
        <p className="text-slate-400 mt-2 text-xs font-medium">
          Are you a transport authority? <Link to="/signup/authority" className="font-bold text-slate-600 hover:text-slate-900 hover:underline">Register here</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
