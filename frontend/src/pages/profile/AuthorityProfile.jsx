import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/userApi';
import { getManagedTransports } from '../../api/adminApi';
import { BuildingIcon, UserIcon, EditIcon, CheckCircleIcon, AlertIcon, BusIcon, TrainIcon, WrenchIcon, UsersIcon, PauseIcon, KeyIcon, PlusIcon } from '../../components/icons';

/**
 * AuthorityProfile.jsx
 * Profile page for the authority role.
 * Shows all authority-specific fields (organization, region, districts, etc.)
 * and allows updating personal information.
 *
 * Route: to be wired by routing teammate (e.g. /profile/authority)
 */
const AuthorityProfile = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [transports, setTransports] = useState([]);
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
        setForm({ name: data?.name || '', phone: data?.phone || '', password: '' });

        if (transportsRes) {
          const d = transportsRes.data?.data;
          setTransports(d?.results || d?.transports || (Array.isArray(d) ? d : []));
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
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="flex items-center text-2xl sm:text-3xl font-bold text-slate-900">
            <BuildingIcon size={30} className="mr-3 text-blue-600" /> Authority Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your organisation details and account settings
          </p>
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
            <div className="bg-white rounded-xl p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Authority Data...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-6">
                {/* Personal / Account Info */}
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <UserIcon size={24} className="text-primary-600" /> Account Information
                      </h2>
                      {editing && (
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
                        <div className="flex gap-4 pt-8 border-t border-slate-100">
                          <button 
                            className="flex-1 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
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
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3 mb-8">
                      <BuildingIcon size={24} className="text-primary-600" /> Organisation Details
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
