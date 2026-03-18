import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { UserIcon, CheckCircleIcon, AlertIcon, EditIcon, LogOutIcon } from '../../components/icons';
import ProfileViewInfo from './ProfileViewInfo';
import ProfileEditForm from './ProfileEditForm';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [form, setForm]         = useState({ 
    name: '', phone: '', password: '', 
    contactEmail: '', contactPhone: '', officeAddress: '', coveredDistricts: '' 
  });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const raw = res.data?.data || res.data;
        const data = raw?.user || raw?.authorityProfile || raw;
        setProfile(data);
        setForm({ 
          name: data?.name || '', 
          phone: data?.phone || '', 
          password: '',
          contactEmail: data?.contactEmail || '',
          contactPhone: data?.contactPhone || '',
          officeAddress: data?.officeAddress || '',
          coveredDistricts: data?.coveredDistricts?.join(', ') || ''
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(''); setError('');
    try {
      const payload = {};
      if (form.name.trim())     payload.name     = form.name.trim();
      if (form.phone.trim())    payload.phone    = form.phone.trim();
      if (form.password.trim() && showPasswordModal) payload.password = form.password.trim();
      
      if (form.contactEmail?.trim()) payload.contactEmail = form.contactEmail.trim();
      if (form.contactPhone?.trim()) payload.contactPhone = form.contactPhone.trim();
      if (form.officeAddress?.trim()) payload.officeAddress = form.officeAddress.trim();
      if (form.coveredDistricts?.trim()) {
        payload.coveredDistricts = form.coveredDistricts.split(',').map(d => d.trim()).filter(Boolean);
      }
      
      await updateProfile(payload);
      setMsg(showPasswordModal ? 'Password updated successfully!' : 'Profile updated successfully!');
      
      setEditing(false);
      setShowPasswordModal(false);
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  if (!user) {
    return <div className="container py-5 text-center"><Link to="/login">Please login</Link></div>;
  }

  const assignedTransportLabel = profile?.assignedTransport
    ? (typeof profile.assignedTransport === 'object'
      ? `${profile.assignedTransport.transportNumber || '—'}${profile.assignedTransport.name ? ` - ${profile.assignedTransport.name}` : ''}`
      : String(profile.assignedTransport))
    : null;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="d-flex align-items-center"><UserIcon size={32} className="me-2"/> My Profile</h1>
          <p>View and update your account information</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            {msg   && <div className="alert-custom alert-success mb-3 d-flex align-items-center"><CheckCircleIcon size={18} className="me-2"/> {msg}</div>}
            {error && <div className="alert-custom alert-error   mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>}

            {loading ? (
              <div className="loading-state"><div className="spinner-large" /></div>
            ) : (
              <div className="detail-section">
                <div className="detail-section-title d-flex justify-content-between align-items-center">
                  <span>Account Information</span>
                  {!editing && (
                    <button className="btn btn-sm btn-outline-primary d-flex align-items-center" onClick={() => setEditing(true)}>
                      <EditIcon size={14} className="me-1"/> Edit
                    </button>
                  )}
                </div>

                {!editing ? (
                  <ProfileViewInfo 
                    user={user} 
                    profile={profile} 
                    assignedTransportLabel={assignedTransportLabel} 
                    onChangePassword={() => { setForm(p => ({ ...p, password: '' })); setShowPasswordModal(true); setMsg(''); setError(''); }} 
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
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
              <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Change Password</h5>
                      <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={form.password}
                          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                          placeholder="Enter new password…"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <div className="modal-footer d-flex">
                      <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                      <button type="button" className="btn btn-warning flex-fill" onClick={handleSave} disabled={saving || !form.password}>
                        {saving ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-section mt-3">
              <div className="detail-section-title text-danger d-flex align-items-center"><AlertIcon size={20} className="me-2"/> Account Actions</div>
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center"
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOutIcon size={14} className="me-2"/> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
