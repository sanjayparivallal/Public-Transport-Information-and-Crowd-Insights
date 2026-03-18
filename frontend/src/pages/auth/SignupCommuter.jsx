import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerCommuter } from '../../api/authApi';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon } from '../../components/icons';
import AuthLayout from '../../components/AuthLayout';

const SignupCommuter = () => {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
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
    if (!form.confirmPassword)          errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
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
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
          <Icon size={16} />
        </span>
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create Account" subtitle="Join to search routes & get crowd info" badge="Normal Commuter">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <Field id="name" label="Full Name" icon={UserIcon} error={errors.name}>
          <input id="name" name="name" type="text" placeholder="John Doe"
            className={`input pl-9 ${errors.name ? 'input-error' : ''}`}
            value={form.name} onChange={handleChange} />
        </Field>

        <Field id="email" label="Email Address" icon={MailIcon} error={errors.email}>
          <input id="email" name="email" type="email" placeholder="you@example.com"
            className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
            value={form.email} onChange={handleChange} />
        </Field>

        <Field id="password" label="Password" icon={LockIcon} error={errors.password}>
          <input id="password" name="password" type={showPw ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            className={`input pl-9 pr-9 ${errors.password ? 'input-error' : ''}`}
            value={form.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600">
            {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </Field>

        <Field id="confirmPassword" label="Confirm Password" icon={LockIcon} error={errors.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type={showCp ? 'text' : 'password'}
            placeholder="Re-enter password"
            className={`input pl-9 pr-9 ${errors.confirmPassword ? 'input-error' : ''}`}
            value={form.confirmPassword} onChange={handleChange} />
          <button type="button" onClick={() => setShowCp(v => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600">
            {showCp ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </Field>

        <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
            : <><UserIcon size={16} />Create Account</>}
        </button>
      </form>

      <div className="divider-text my-5">or continue with</div>

      <div className="text-center text-sm space-y-1.5">
        <p className="text-slate-500">
          Have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
        <p className="text-slate-500">
          Registering as authority?{' '}
          <Link to="/signup/authority" className="text-blue-600 font-semibold hover:underline">Authority Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupCommuter;
