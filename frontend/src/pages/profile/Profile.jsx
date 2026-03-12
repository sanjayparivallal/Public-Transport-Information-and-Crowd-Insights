import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: '', phone: '', password: '' });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const data = res.data?.user || res.data;
        setProfile(data);
        setForm({ name: data?.name || '', phone: data?.phone || '', password: '' });
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
      if (form.password.trim()) payload.password = form.password.trim();
      await updateProfile(payload);
      setMsg('Profile updated successfully!');
      setEditing(false);
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  if (!user) {
    return <div className="container py-5 text-center"><Link to="/login">Please login</Link></div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>👤 My Profile</h1>
          <p>View and update your account information</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            {msg   && <div className="alert-custom alert-success mb-3">✅ {msg}</div>}
            {error && <div className="alert-custom alert-error   mb-3">⚠️ {error}</div>}

            {loading ? (
              <div className="loading-state"><div className="spinner-large" /></div>
            ) : (
              <div className="detail-section">
                <div className="detail-section-title d-flex justify-content-between align-items-center">
                  <span>Account Information</span>
                  {!editing && (
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="info-grid">
                    <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
                    <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
                    <div className="info-item"><label>Role</label><span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
                    <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
                    {profile?.organizationName && (
                      <div className="info-item"><label>Organisation</label><span>{profile.organizationName}</span></div>
                    )}
                    {profile?.region && (
                      <div className="info-item"><label>Region</label><span>{profile.region}</span></div>
                    )}
                    {profile?.assignedTransport && (
                      <div className="info-item"><label>Assigned Transport</label><span>{profile.assignedTransport}</span></div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">New Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                      <input type="password" className="form-control" value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Enter new password…" />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary flex-fill" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : '💾 Save Changes'}
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="detail-section mt-3">
              <div className="detail-section-title text-danger">⚠️ Account Actions</div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => { logout(); navigate('/login'); }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
