import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerCommuter } from '../../api/authApi';
import { BusIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, PhoneIcon, UserIcon } from '../../components/icons';

const SignupCommuter = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())           errs.name = 'Full name is required.';
    if (!form.email.trim())          errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                     errs.email = 'Enter a valid email address.';
    if (!form.password)              errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)       errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
                                     errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      await registerCommuter(payload);
      toast.success('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo text-decoration-none mb-3 d-flex align-items-center justify-content-center">
          <BusIcon size={24} className="me-2" style={{ color: '#1e293b' }} />
          <span><span style={{ color: '#1e293b' }}>Public</span><span style={{ color: '#2563eb' }}>Transit</span></span>
        </Link>

        <h1 className="auth-title">Create Commuter Account</h1>
        <p className="auth-subtitle">Join as a commuter to search routes, get crowd info &amp; more</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-group-icon">
              <span className="icon"><UserIcon size={18} /></span>
              <input
                id="name" name="name" type="text"
                className={`form-control${errors.name ? ' is-invalid' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-group-icon">
              <span className="icon"><MailIcon size={18} /></span>
              <input
                id="email" name="email" type="email"
                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
          </div>

          {/* Phone (optional) */}
          <div className="mb-3">
            <label className="form-label" htmlFor="phone">
              Phone <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
            </label>
            <div className="input-group-icon">
              <span className="icon"><PhoneIcon size={18} /></span>
              <input
                id="phone" name="phone" type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-group-icon">
              <span className="icon"><LockIcon size={18} /></span>
              <input
                id="password" name="password"
                type={showPw ? 'text' : 'password'}
                className={`form-control${errors.password ? ' is-invalid' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
              </button>
            </div>
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group-icon">
              <span className="icon"><LockIcon size={18} /></span>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showCp ? 'text' : 'password'}
                className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button type="button" className="toggle-password" onClick={() => setShowCp(v => !v)}>
                {showCp ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
              </button>
            </div>
            {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn-primary-custom d-flex align-items-center justify-content-center" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : <><BusIcon size={18} className="me-2"/> Create Commuter Account</>}
          </button>
        </form>

        <div className="auth-links mt-3">
          Already have an account? <Link to="/login">Sign In</Link>
          <br />
          Registering as an authority? <Link to="/signup/authority">Authority Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupCommuter;
