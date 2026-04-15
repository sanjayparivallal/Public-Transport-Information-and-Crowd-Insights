import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {  getProfile, updateProfile  } from '../../api';
import {  getManagedTransports  } from '../../api';
import { BuildingIcon, UserIcon, EditIcon, CheckCircleIcon, AlertIcon, PauseIcon, KeyIcon, PlusIcon, ShieldIcon, GlobeIcon } from '../../components/icons';
import Skeleton from '../../components/Skeleton';

/**
 * AuthorityProfile.jsx
 * Profile page for the authority role.
 * Shows all authority-specific fields (organization, region, districts, etc.)
 * and allows updating personal information.
 *
 * Route: to be wired by routing teammate (e.g. /profile/authority)
 */
const AuthorityProfile = () => {
  const { user } = useAuth();

  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [form,       setForm]       = useState({ name: '', phone: '', password: '' });
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');
  const [error,      setError]      = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, transportsRes] = await Promise.all([
          getProfile(),
          getManagedTransports().catch(() => null),
        ]);

        const data = profileRes.data?.data?.user
          || profileRes.data?.data?.authorityProfile
          || profileRes.data?.user
          || profileRes.data?.data
          || profileRes.data;
        setProfile(data);
        setForm({ 
          name: data?.name || '', 
          phone: data?.phone || '', 
          organizationName: data?.organizationName || '',
          region: data?.region || '',
          contactEmail: data?.contactEmail || '',
          contactPhone: data?.contactPhone || '',
          officeAddress: data?.officeAddress || '',
          password: '' 
        });

        if (transportsRes) {
          // Fetch succeeded — suppress lint, used in future transport grid
          void transportsRes;
        }
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setMsg(''); setError('');
    setSaving(true);
    try {
      const payload = {};
      if (form.name.trim())     payload.name     = form.name.trim();
      if (form.phone.trim())    payload.phone    = form.phone.trim();
      if (form.organizationName?.trim()) payload.organizationName = form.organizationName.trim();
      if (form.region?.trim())           payload.region           = form.region.trim();
      if (form.contactEmail?.trim())     payload.contactEmail     = form.contactEmail.trim();
      if (form.contactPhone?.trim())     payload.contactPhone     = form.contactPhone.trim();
      if (form.officeAddress?.trim())    payload.officeAddress    = form.officeAddress.trim();
      if (form.password.trim() && showPasswordModal) payload.password = form.password.trim();
      
      const res     = await updateProfile(payload);
      const updated = res.data?.data?.user || res.data?.user || res.data?.data || profile;
      setProfile(updated);
      setMsg(showPasswordModal ? 'Password updated successfully!' : 'Profile updated successfully!');
      
      setEditing(false);
      setShowPasswordModal(false);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-24 text-center">
        <Link to="/login" className="text-primary-600 font-bold hover:underline italic">Please login to view your profile.</Link>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      {/* Vivid Gradient Page Header */}
      <div className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #4f46e5 80%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(217,70,239,0.25)' }} />
          <div className="absolute bottom-0 -left-10 w-64 h-64 rounded-full blur-2xl" style={{ background: 'rgba(6,182,212,0.18)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-start gap-5">
            <div className="p-3.5 rounded-2xl shrink-0" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <BuildingIcon size={28} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-0.5">Authority Profile</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile?.organizationName || profile?.name || 'Authority'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/30">
                  <ShieldIcon size={12} /> Verified Authority
                </span>
                {profile?.region && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/15 text-blue-100 border border-white/20">
                    <GlobeIcon size={12} /> {profile.region}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Notifications */}
          {msg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <CheckCircleIcon size={18}/> {msg}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <AlertIcon size={18}/> {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton width={200} height={24} />
                <Skeleton width={100} height={36} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton width={80} height={10} />
                    <Skeleton height={20} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-6">
                {/* Personal / Account Info */}
                <div className="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}>
                          <UserIcon size={18} className="text-white" />
                        </span>
                        Account Information
                      </h2>
                      {!editing ? (
                      <button
                          className="btn-outline"
                          onClick={() => { setEditing(true); setMsg(''); setError(''); }}
                        >
                          <EditIcon size={14} /> Edit Profile
                        </button>
                      ) : (
                        <button 
                          className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                          onClick={() => setEditing(false)}
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    {!editing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: 'Name', value: profile?.name || '—' },
                          { label: 'Email', value: profile?.email || user.email },
                          { label: 'Role', value: 'Authority', isBadge: true, badgeColor: 'bg-purple-50 text-purple-600 border-purple-100' },
                          { label: 'Phone', value: profile?.phone || '—' },
                          { label: 'Account Status', value: profile?.isActive !== false ? 'Verified Active' : 'Inactive', isStatus: true, statusActive: profile?.isActive !== false },
                          { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                            {item.isBadge ? (
                              <span className={`w-max px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${item.badgeColor}`}>
                                {item.value}
                              </span>
                            ) : item.isStatus ? (
                              <div className={`flex items-center gap-2 font-bold ${item.statusActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.statusActive ? <CheckCircleIcon size={16} /> : <PauseIcon size={16} />} {item.value}
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-slate-700 ml-1">{item.value}</span>
                            )}
                          </div>
                        ))}
                        <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-100">
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm active:scale-95"
                            onClick={() => { setForm(p => ({ ...p, password: '' })); setShowPasswordModal(true); setMsg(''); setError(''); }}
                          >
                            <KeyIcon size={16}/> Reset Password
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                              value={form.name}
                              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (Registered)</label>
                            <input type="email" className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl outline-none cursor-not-allowed font-bold" value={profile?.email || ''} disabled />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                              type="tel"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                              value={form.phone}
                              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="pt-8 mb-4 border-t border-slate-100">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Organisation Details</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Organisation Name</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 outline-none font-bold text-slate-700" value={form.organizationName} onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Authority Code (read-only)</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl outline-none cursor-not-allowed font-bold" value={profile?.authorityCode || ''} disabled />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 outline-none font-bold text-slate-700" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 outline-none font-bold text-slate-700" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                              <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 outline-none font-bold text-slate-700" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Office Address</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 outline-none font-bold text-slate-700" value={form.officeAddress} onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))} />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-slate-100">
                          <button 
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                            onClick={handleSave} 
                            disabled={saving}
                          >
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Changes'}
                          </button>
                          <button 
                            className="px-8 py-3 border-2 border-slate-100 text-slate-400 hover:text-slate-600 font-black rounded-2xl transition-all active:scale-95"
                            onClick={() => setEditing(false)}
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organisation Details */}
                {!editing && (
                <div className="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3 mb-8">
                      <span className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                        <BuildingIcon size={18} className="text-white" />
                      </span>
                      Organisation Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Organisation Name', value: profile?.organizationName || '—' },
                        { label: 'Authority Code', value: profile?.authorityCode || '—', isCode: true },
                        { label: 'Region', value: profile?.region || '—' },
                        { label: 'Contact Email', value: profile?.contactEmail || '—' },
                        { label: 'Contact Phone', value: profile?.contactPhone || '—' },
                        { label: 'Office Address', value: profile?.officeAddress || '—', fullWidth: true },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex flex-col space-y-1.5 ${item.fullWidth ? 'md:col-span-2' : ''}`}>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                          {item.isCode ? (
                            <span className="w-max px-3 py-1 rounded-xl font-mono font-black bg-slate-900 text-primary-400 border border-slate-800 tracking-widest text-sm uppercase">
                              {item.value}
                            </span>
                          ) : (
                            <span className="text-lg font-bold text-slate-700 ml-1">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Covered Districts */}
                    <div className="mt-10 pt-8 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Covered Districts</label>
                      <div className="flex flex-wrap gap-2">
                        {(profile?.coveredDistricts || []).length > 0 ? (
                          profile.coveredDistricts.map((d, i) => (
                            <span key={i} className="px-4 py-2 rounded-2xl text-sm font-bold bg-slate-50 text-slate-600 border border-slate-200 shadow-sm">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-slate-400 italic">No districts specified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>

    </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h5 className="text-xl font-black tracking-tight flex items-center gap-2"><KeyIcon size={20}/> Security Setup</h5>
              <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowPasswordModal(false)}>
                <PlusIcon size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50/50 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="Enter new password…"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors flex-1" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 flex-2 flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={saving || !form.password}
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthorityProfile;
