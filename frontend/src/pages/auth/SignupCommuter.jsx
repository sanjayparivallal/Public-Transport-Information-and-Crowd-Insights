import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerCommuter } from '../../api/authApi';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon } from '../../components/icons';
import AuthLayout from '../../components/AuthLayout';

const SignupCommuter = () => {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())              errs.name = 'Full name is required.';
    if (!form.email.trim())             errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)                 errs.password = 'Password is required.';
    else if (form.password.length < 6)  errs.password = 'Minimum 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await registerCommuter({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const Field = ({ id, label, icon: Icon, error, children }) => (
    <div className="group">
      <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-[10px] font-black uppercase tracking-tight text-red-500 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create Account" subtitle="Join to search routes & get crowd info" badge="Normal Commuter">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <Field id="name" label="Full Name" icon={UserIcon} error={errors.name}>
          <input id="name" name="name" type="text" placeholder="John Doe"
            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 
                       placeholder:text-slate-400 outline-hidden transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 
                       ${errors.name ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}`}
            value={form.name} onChange={handleChange} />
        </Field>

        <Field id="email" label="Email Address" icon={MailIcon} error={errors.email}>
          <input id="email" name="email" type="email" placeholder="you@example.com"
            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 
                       placeholder:text-slate-400 outline-hidden transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 
                       ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}`}
            value={form.email} onChange={handleChange} />
        </Field>

        <Field id="password" label="Password" icon={LockIcon} error={errors.password}>
          <input id="password" name="password" type={showPw ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-12 text-sm font-medium text-slate-900 
                       placeholder:text-slate-400 outline-hidden transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 
                       ${errors.password ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}`}
            value={form.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
            {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </Field>

        <button type="submit" 
          className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-xl shadow-blue-200 
                     flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden mt-4" 
          disabled={loading}>
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          {loading
            ? <><span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
            : <><UserIcon size={20} className="group-hover:scale-110 transition-transform" />Create Account</>}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Sign In</Link>
        </p>
        <p className="text-slate-400 mt-2 text-xs font-medium">
          Registering as authority? <Link to="/signup/authority" className="font-bold text-slate-600 hover:text-slate-900 hover:underline">Authority Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupCommuter;
