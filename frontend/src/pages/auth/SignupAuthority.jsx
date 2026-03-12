import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAuthority } from '../../api/authApi';

const SignupAuthority = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    organizationName: '', authorityCode: '', region: '',
    contactEmail: '', contactPhone: '', officeAddress: '',
    coveredDistricts: '',
  });
  const [errors, setErrors]    = useState({});
  const [showPw, setShowPw]    = useState(false);
  const [showCp, setShowCp]    = useState(false);
  const [loading, setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())             errs.name = 'Name is required.';
    if (!form.email.trim())            errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                       errs.email = 'Enter a valid email address.';
    if (!form.organizationName.trim()) errs.organizationName = 'Organization name is required.';
    if (!form.authorityCode.trim())    errs.authorityCode = 'Authority code is required.';
    if (!form.region.trim())           errs.region = 'Region is required.';
    if (!form.password)                errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)         errs.confirmPassword = 'Please confirm your password.';
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
      const coveredDistricts = form.coveredDistricts
        ? form.coveredDistricts.split(',').map(d => d.trim()).filter(Boolean)
        : [];

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        organizationName: form.organizationName.trim(),
        authorityCode: form.authorityCode.trim(),
        region: form.region.trim(),
        coveredDistricts,
      };
      if (form.phone.trim())         payload.phone         = form.phone.trim();
      if (form.contactEmail.trim())  payload.contactEmail  = form.contactEmail.trim();
      if (form.contactPhone.trim())  payload.contactPhone  = form.contactPhone.trim();
      if (form.officeAddress.trim()) payload.officeAddress = form.officeAddress.trim();

      await registerAuthority(payload);
      setSuccess('Authority account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <Link to="/" className="auth-logo text-decoration-none mb-3 d-block">
          🚌 <span style={{ color: '#1e293b' }}>Public</span>
          <span style={{ color: '#2563eb' }}>Transit</span>
        </Link>

        <h1 className="auth-title">Authority Registration</h1>
        <p className="auth-subtitle">Register your transport authority to manage buses and trains</p>

        {apiError && (
          <div className="alert-custom alert-error mb-3">⚠️ {apiError}</div>
        )}
        {success && (
          <div className="alert-custom alert-success mb-3">✅ {success}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Personal Info ── */}
          <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.75rem' }}>
            Administrator Details
          </p>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <div className="input-group-icon">
                <span className="icon">👤</span>
                <input
                  id="name" name="name" type="text"
                  className={`form-control${errors.name ? ' is-invalid' : ''}`}
                  placeholder="Authority Admin Name"
                  value={form.name} onChange={handleChange}
                />
              </div>
              {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div className="input-group-icon">
                <span className="icon">✉️</span>
                <input
                  id="email" name="email" type="email"
                  className={`form-control${errors.email ? ' is-invalid' : ''}`}
                  placeholder="admin@authority.gov"
                  value={form.email} onChange={handleChange}
                />
              </div>
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="auth-phone">Phone <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
              <div className="input-group-icon">
                <span className="icon">📱</span>
                <input id="auth-phone" name="phone" type="tel"
                  className="form-control" placeholder="+91 98765 43210"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label" htmlFor="auth-password">Password *</label>
              <div className="input-group-icon">
                <span className="icon">🔒</span>
                <input
                  id="auth-password" name="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-control${errors.password ? ' is-invalid' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                />
                <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-group-icon">
                <span className="icon">🔒</span>
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showCp ? 'text' : 'password'}
                  className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={handleChange}
                />
                <button type="button" className="toggle-password" onClick={() => setShowCp(v => !v)}>
                  {showCp ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
            </div>
          </div>

          {/* ── Organisation Info ── */}
          <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.75rem' }}>
            Organisation Details
          </p>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="organizationName">Organisation Name *</label>
              <div className="input-group-icon">
                <span className="icon">🏢</span>
                <input
                  id="organizationName" name="organizationName" type="text"
                  className={`form-control${errors.organizationName ? ' is-invalid' : ''}`}
                  placeholder="Tamil Nadu State Transport"
                  value={form.organizationName} onChange={handleChange}
                />
              </div>
              {errors.organizationName && <div className="invalid-feedback d-block">{errors.organizationName}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="authorityCode">Authority Code *</label>
              <div className="input-group-icon">
                <span className="icon">🆔</span>
                <input
                  id="authorityCode" name="authorityCode" type="text"
                  className={`form-control${errors.authorityCode ? ' is-invalid' : ''}`}
                  placeholder="TNSTC-NTH"
                  value={form.authorityCode} onChange={handleChange}
                />
              </div>
              {errors.authorityCode && <div className="invalid-feedback d-block">{errors.authorityCode}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="region">Region *</label>
              <div className="input-group-icon">
                <span className="icon">📍</span>
                <input
                  id="region" name="region" type="text"
                  className={`form-control${errors.region ? ' is-invalid' : ''}`}
                  placeholder="Salem"
                  value={form.region} onChange={handleChange}
                />
              </div>
              {errors.region && <div className="invalid-feedback d-block">{errors.region}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="coveredDistricts">
                Covered Districts <span style={{ color: '#94a3b8', fontWeight: 400 }}>(comma-separated)</span>
              </label>
              <div className="input-group-icon">
                <span className="icon">🗺️</span>
                <input
                  id="coveredDistricts" name="coveredDistricts" type="text"
                  className="form-control"
                  placeholder="Salem, Namakkal, Dharmapuri"
                  value={form.coveredDistricts} onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="contactEmail">Contact Email</label>
              <div className="input-group-icon">
                <span className="icon">✉️</span>
                <input id="contactEmail" name="contactEmail" type="email"
                  className="form-control" placeholder="contact@authority.gov"
                  value={form.contactEmail} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
              <div className="input-group-icon">
                <span className="icon">📞</span>
                <input id="contactPhone" name="contactPhone" type="tel"
                  className="form-control" placeholder="+91 44 2222 0000"
                  value={form.contactPhone} onChange={handleChange} />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="officeAddress">Office Address</label>
              <div className="input-group-icon">
                <span className="icon">🏛️</span>
                <input id="officeAddress" name="officeAddress" type="text"
                  className="form-control" placeholder="123 Transport Bhavan, Salem"
                  value={form.officeAddress} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary-custom" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Registering…</>
              : '🏛️ Register Authority Account'
            }
          </button>
        </form>

        <div className="auth-links mt-3">
          Already have an account? <Link to="/login">Sign In</Link>
          <br />
          Registering as a commuter? <Link to="/signup/commuter">Commuter Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupAuthority;
