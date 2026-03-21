import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAuthority } from '../../api/authApi';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, BuildingIcon, LocationIcon, IdCardIcon } from '../../components/icons';
import AuthLayout from '../../components/AuthLayout';

const SignupAuthority = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    organizationName: '', authorityCode: '', region: '',
  });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
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

  const ic = (f) => `w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 
                       placeholder:text-slate-400 outline-hidden transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 
                       ${errors[f] ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}`;
  
  const Err = ({ f }) => errors[f] ? <p className="mt-1.5 text-[10px] font-black uppercase tracking-tight text-red-500 animate-in fade-in slide-in-from-top-1">{errors[f]}</p> : null;

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100">
      <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
        <Icon size={16} />
      </div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
  );

  return (
    <AuthLayout
      title="Authority Registration"
      subtitle="Register your transport authority"
      badge="Authority"
      badgeClass="bg-amber-100 text-amber-600 shadow-sm shadow-amber-100"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Administrator Details ── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeader icon={UserIcon} title="Administrator Details" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="group">
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><UserIcon size={18} /></span>
                <input id="name" name="name" type="text" placeholder="Admin Name"
                  className={ic('name')} value={form.name} onChange={handleChange} />
              </div>
              <Err f="name" />
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><MailIcon size={18} /></span>
                <input id="email" name="email" type="email" placeholder="admin@authority.gov"
                  className={ic('email')} value={form.email} onChange={handleChange} />
              </div>
              <Err f="email" />
            </div>

            <div className="group">
              <label htmlFor="auth-password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><LockIcon size={18} /></span>
                <input id="auth-password" name="password" type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters" className={`${ic('password')} pr-12`}
                  value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-amber-600 transition-colors">
                  {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              <Err f="password" />
            </div>
          </div>
        </div>

        {/* ── Organisation Details ── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <SectionHeader icon={BuildingIcon} title="Organisation Details" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="group">
              <label htmlFor="organizationName" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Organisation Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><BuildingIcon size={18} /></span>
                <input id="organizationName" name="organizationName" type="text"
                  placeholder="Tamil Nadu State Transport" className={ic('organizationName')}
                  value={form.organizationName} onChange={handleChange} />
              </div>
              <Err f="organizationName" />
            </div>

            <div className="group">
              <label htmlFor="authorityCode" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Authority Code *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><IdCardIcon size={18} /></span>
                <input id="authorityCode" name="authorityCode" type="text"
                  placeholder="TNSTC-NTH" className={ic('authorityCode')}
                  value={form.authorityCode} onChange={handleChange} />
              </div>
              <Err f="authorityCode" />
            </div>

            <div className="sm:col-span-2 group">
              <label htmlFor="region" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-amber-600 transition-colors">Region *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none group-focus-within:text-amber-500 transition-colors"><LocationIcon size={18} /></span>
                <input id="region" name="region" type="text" placeholder="Salem"
                   className={ic('region')} value={form.region} onChange={handleChange} />
              </div>
              <Err f="region" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="relative w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-2xl shadow-xl shadow-amber-200 
                     flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden mt-2">
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          {loading
            ? <><span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />Registering…</>
            : <><BuildingIcon size={20} className="group-hover:rotate-6 transition-transform" />Register Authority Account</>}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">Sign In</Link>
        </p>
        <p className="text-slate-400 mt-2 text-xs font-medium">
          Registering as commuter? <Link to="/signup/commuter" className="font-bold text-slate-600 hover:text-slate-900 hover:underline">Commuter Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupAuthority;
