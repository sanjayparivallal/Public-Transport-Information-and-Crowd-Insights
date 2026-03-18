import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAuthority } from '../../api/authApi';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, BuildingIcon, LocationIcon, IdCardIcon } from '../../components/icons';
import AuthLayout from '../../components/AuthLayout';

const SignupAuthority = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    organizationName: '', authorityCode: '', region: '',
  });
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
    if (!form.name.trim())             errs.name = 'Name is required.';
    if (!form.email.trim())            errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.organizationName.trim()) errs.organizationName = 'Organization name is required.';
    if (!form.authorityCode.trim())    errs.authorityCode = 'Authority code is required.';
    if (!form.region.trim())           errs.region = 'Region is required.';
    if (!form.password)                errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters.';
    if (!form.confirmPassword)         errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await registerAuthority({
        name: form.name.trim(), email: form.email.trim(), password: form.password,
        organizationName: form.organizationName.trim(),
        authorityCode: form.authorityCode.trim(), region: form.region.trim(),
      });
      toast.success('Authority account created! Redirecting to login…');
      setTimeout(() => navigate('/login/authority'), 1800);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const ic = (f) => `input pl-9 ${errors[f] ? 'input-error' : ''}`;
  const Err = ({ f }) => errors[f] ? <p className="mt-1 text-xs text-red-600">{errors[f]}</p> : null;

  return (
    <AuthLayout
      title="Authority Registration"
      subtitle="Register your transport authority"
      badge="Authority"
      badgeClass="badge-amber"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Administrator Details ── */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
            Administrator Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label htmlFor="name" className="label">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><UserIcon size={16} /></span>
                <input id="name" name="name" type="text" placeholder="Admin Name"
                  className={ic('name')} value={form.name} onChange={handleChange} />
              </div>
              <Err f="name" />
            </div>

            <div>
              <label htmlFor="email" className="label">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><MailIcon size={16} /></span>
                <input id="email" name="email" type="email" placeholder="admin@authority.gov"
                  className={ic('email')} value={form.email} onChange={handleChange} />
              </div>
              <Err f="email" />
            </div>

            <div>
              <label htmlFor="auth-password" className="label">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><LockIcon size={16} /></span>
                <input id="auth-password" name="password" type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters" className={`${ic('password')} pr-9`}
                  value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-600">
                  {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              <Err f="password" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><LockIcon size={16} /></span>
                <input id="confirmPassword" name="confirmPassword" type={showCp ? 'text' : 'password'}
                  placeholder="Re-enter password" className={`${ic('confirmPassword')} pr-9`}
                  value={form.confirmPassword} onChange={handleChange} />
                <button type="button" onClick={() => setShowCp(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-600">
                  {showCp ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              <Err f="confirmPassword" />
            </div>
          </div>
        </div>

        {/* ── Organisation Details ── */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
            Organisation Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label htmlFor="organizationName" className="label">Organisation Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><BuildingIcon size={16} /></span>
                <input id="organizationName" name="organizationName" type="text"
                  placeholder="Tamil Nadu State Transport" className={ic('organizationName')}
                  value={form.organizationName} onChange={handleChange} />
              </div>
              <Err f="organizationName" />
            </div>

            <div>
              <label htmlFor="authorityCode" className="label">Authority Code *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><IdCardIcon size={16} /></span>
                <input id="authorityCode" name="authorityCode" type="text"
                  placeholder="TNSTC-NTH" className={ic('authorityCode')}
                  value={form.authorityCode} onChange={handleChange} />
              </div>
              <Err f="authorityCode" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="region" className="label">Region *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><LocationIcon size={16} /></span>
                <input id="region" name="region" type="text" placeholder="Salem"
                  className={ic('region')} value={form.region} onChange={handleChange} />
              </div>
              <Err f="region" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full justify-center py-2.5 btn bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500 focus:ring-2 focus:ring-offset-2 focus:outline-none">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering…</>
            : <><BuildingIcon size={16} />Register Authority Account</>}
        </button>
      </form>

      <div className="divider-text my-5">or continue with</div>

      <div className="text-center text-sm space-y-1.5">
        <p className="text-slate-500">
          Have an account?{' '}
          <Link to="/login/authority" className="text-amber-600 font-semibold hover:underline">Sign In</Link>
        </p>
        <p className="text-slate-500">
          Registering as commuter?{' '}
          <Link to="/signup/commuter" className="text-blue-600 font-semibold hover:underline">Commuter Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupAuthority;
