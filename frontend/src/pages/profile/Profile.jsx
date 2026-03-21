import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { UserIcon, CheckCircleIcon, AlertIcon, EditIcon, LogOutIcon, KeyIcon, PlusIcon, SaveIcon } from '../../components/icons';
import ProfileViewInfo from './ProfileViewInfo';
import ProfileEditForm from './ProfileEditForm';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [editing, setEditing]               = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', contactEmail: '', contactPhone: '',
    officeAddress: '', coveredDistricts: '',
  });
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await getProfile();
        const raw  = res.data?.data || res.data;
        const data = raw?.user || raw?.authorityProfile || raw;
        setProfile(data);
        setForm({
          name:             data?.name            || '',
          phone:            data?.phone           || '',
          contactEmail:     data?.contactEmail    || '',
          contactPhone:     data?.contactPhone    || '',
          officeAddress:    data?.officeAddress   || '',
          coveredDistricts: data?.coveredDistricts?.join(', ') || '',
        });
      } catch {
        setError('Failed to load profile.');
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      const payload = {};
      if (form.name.trim())             payload.name = form.name.trim();
      if (form.phone.trim())            payload.phone = form.phone.trim();
      if (form.contactEmail?.trim())    payload.contactEmail = form.contactEmail.trim();
      if (form.contactPhone?.trim())    payload.contactPhone = form.contactPhone.trim();
      if (form.officeAddress?.trim())   payload.officeAddress = form.officeAddress.trim();
      if (form.coveredDistricts?.trim()) {
        payload.coveredDistricts = form.coveredDistricts.split(',').map(d => d.trim()).filter(Boolean);
      }
      await updateProfile(payload);
      setMsg('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword.trim()) { setError('Current password is required.'); return; }
    if (!pwForm.newPassword.trim())     { setError('New password is required.'); return; }
    if (pwForm.newPassword.length < 6)  { setError('New password must be at least 6 characters.'); return; }
    setSaving(true); setMsg(''); setError('');
    try {
      await updateProfile({ currentPassword: pwForm.currentPassword, password: pwForm.newPassword });
      setMsg('Password changed successfully!');
      setShowPasswordModal(false);
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message || 'Password change failed.');
    } finally { setSaving(false); }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <Link to="/login" className="text-blue-600 font-semibold">Please login to view your profile</Link>
      </div>
    );
  }

  const assignedTransportLabel = profile?.assignedTransport
    ? (typeof profile.assignedTransport === 'object'
      ? `${profile.assignedTransport.transportNumber || '—'}${profile.assignedTransport.name ? ` – ${profile.assignedTransport.name}` : ''}`
      : String(profile.assignedTransport))
    : null;

  const initials = (profile?.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-6 lg:px-8 mb-8 sm:mb-10 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <h1>My Profile</h1>
              <p className="mt-0.5 capitalize">{user.role} account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Notifications */}
        {msg && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-6">
            <CheckCircleIcon size={16}/> {msg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
            <AlertIcon size={16}/> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading profile…</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* ── Main card ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <h2>Account Information</h2>
                <div className="flex gap-3">
                  {!editing && (
                    <>
                      <button
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                        onClick={() => { setPwForm({ currentPassword: '', newPassword: '' }); setShowPasswordModal(true); setMsg(''); setError(''); }}
                      >
                        <KeyIcon size={15}/> Change Password
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        onClick={() => { setEditing(true); setMsg(''); setError(''); }}
                      >
                        <EditIcon size={15} /> Edit
                      </button>
                    </>
                  )}
                  {editing && (
                    <button className="text-sm text-slate-400 hover:text-red-500 transition-colors" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {!editing ? (
                <ProfileViewInfo
                  user={user}
                  profile={profile}
                  assignedTransportLabel={assignedTransportLabel}
                  onChangePassword={() => { setPwForm({ currentPassword: '', newPassword: '' }); setShowPasswordModal(true); setMsg(''); setError(''); }}
                />
              ) : (
                <ProfileEditForm
                  user={user}
                  form={form}
                  setForm={setForm}
                  onSave={handleSave}
                  onCancel={() => setEditing(false)}
                  saving={saving}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2">
                <KeyIcon size={18} className="text-blue-600" /> Change Password
              </h3>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPasswordModal(false)}
              >
                <PlusIcon size={18} className="rotate-45" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <AlertIcon size={14}/> {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                  placeholder="Min. 6 characters"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button className="flex-1 inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md active:scale-95"
                onClick={handleChangePassword}
                disabled={saving || !pwForm.currentPassword || !pwForm.newPassword}
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><SaveIcon size={15}/> Update Password</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
