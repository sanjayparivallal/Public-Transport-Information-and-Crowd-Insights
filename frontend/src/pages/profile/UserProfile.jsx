import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/userApi';
import { getTransportById } from '../../api/transportApi';

/**
 * UserProfile.jsx
 * Profile page for commuter, driver, and conductor roles.
 * Displays personal info, assigned transport (for staff), favourites count,
 * and allows editing name / phone / password.
 *
 * Route: to be wired by routing teammate (e.g. /profile/user)
 */
const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [profile,         setProfile]         = useState(null);
  const [assignedDetail,  setAssignedDetail]  = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [editing,         setEditing]         = useState(false);
  const [form,            setForm]            = useState({ name: '', phone: '', password: '' });
  const [saving,          setSaving]          = useState(false);
  const [msg,             setMsg]             = useState('');
  const [error,           setError]           = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res  = await getProfile();
        const data = res.data?.data?.user || res.data?.user || res.data?.data || res.data;
        setProfile(data);
        setForm({ name: data?.name || '', phone: data?.phone || '', password: '' });

        if (data?.assignedTransport) {
          const tRes = await getTransportById(data.assignedTransport).catch(() => null);
          if (tRes) {
            setAssignedDetail(
              tRes.data?.data?.transport || tRes.data?.data || tRes.data
            );
          }
        }
      } catch (err) {
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
      if (form.password.trim()) payload.password = form.password.trim();
      const res  = await updateProfile(payload);
      const updated = res.data?.data?.user || res.data?.user || res.data?.data || profile;
      setProfile(updated);
      setMsg('Profile updated successfully!');
      setEditing(false);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <Link to="/login">Please login to view your profile.</Link>
      </div>
    );
  }

  const isStaff = user.role === 'driver' || user.role === 'conductor';

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>👤 User Profile</h1>
          <p>View and update your personal account information</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {msg   && <div className="alert-custom alert-success mb-3">✅ {msg}</div>}
            {error && <div className="alert-custom alert-error   mb-3">⚠️ {error}</div>}

            {loading ? (
              <div className="loading-state"><div className="spinner-large" /></div>
            ) : (
              <>
                {/* Account Information */}
                <div className="detail-section">
                  <div className="detail-section-title d-flex justify-content-between align-items-center">
                    <span>📋 Account Information</span>
                    {!editing && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => { setEditing(true); setMsg(''); setError(''); }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {!editing ? (
                    <div className="info-grid">
                      <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
                      <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
                      <div className="info-item">
                        <label>Role</label>
                        <span><span className={`role-pill ${user.role}`}>{user.role}</span></span>
                      </div>
                      <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
                      <div className="info-item">
                        <label>Account Status</label>
                        <span style={{ color: profile?.isActive !== false ? 'var(--success)' : '#94a3b8', fontWeight: 700 }}>
                          {profile?.isActive !== false ? '✅ Active' : '⏸ Inactive'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Member Since</label>
                        <span>
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      {!isStaff && (
                        <div className="info-item">
                          <label>Saved Favourites</label>
                          <span>{(profile?.favouriteTransports || []).length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={profile?.email || ''} disabled />
                        <div className="form-text">Email cannot be changed.</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label">
                          New Password{' '}
                          <span style={{ color: '#94a3b8', fontWeight: 400 }}>(leave blank to keep current)</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={form.password}
                          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                          placeholder="Enter new password…"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-primary flex-fill" onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving…' : '💾 Save Changes'}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => { setEditing(false); setMsg(''); setError(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assigned Transport (Driver / Conductor) */}
                {isStaff && (
                  <div className="detail-section">
                    <div className="detail-section-title">🚌 Assigned Transport</div>
                    {assignedDetail ? (
                      <div className="row g-3 align-items-center">
                        <div className="col-md-9">
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Transport Number</label>
                              <span><span className="transport-number">{assignedDetail.transportNumber}</span></span>
                            </div>
                            <div className="info-item"><label>Name</label><span>{assignedDetail.name || '—'}</span></div>
                            <div className="info-item">
                              <label>Type</label>
                              <span className={`meta-chip ${assignedDetail.type}`}>
                                {assignedDetail.type === 'bus' ? '🚌' : '🚂'} {assignedDetail.type}
                              </span>
                            </div>
                            <div className="info-item"><label>Operator</label><span>{assignedDetail.operator || '—'}</span></div>
                            <div className="info-item"><label>Vehicle No.</label><span>{assignedDetail.vehicleNumber || '—'}</span></div>
                            <div className="info-item">
                              <label>Assigned On</label>
                              <span>{profile?.assignedAt ? new Date(profile.assignedAt).toLocaleDateString('en-IN') : '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 text-end">
                          <Link to={`/transport/${assignedDetail._id}`} className="btn btn-outline-primary btn-sm">
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ) : profile?.assignedTransport ? (
                      <p style={{ color: '#64748b', margin: 0 }}>
                        Assigned transport ID: <code>{profile.assignedTransport}</code>
                      </p>
                    ) : (
                      <div className="empty-state" style={{ padding: '1rem' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>No transport assigned yet. Contact your authority.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Favourites summary for commuter */}
                {!isStaff && (
                  <div className="detail-section">
                    <div className="detail-section-title d-flex justify-content-between align-items-center">
                      <span>⭐ Favourite Transports</span>
                      <Link to="/search" className="btn btn-sm btn-outline-primary">Search & Add</Link>
                    </div>
                    {(profile?.favouriteTransports || []).length === 0 ? (
                      <p style={{ color: '#64748b', margin: 0, fontSize: '.9rem' }}>
                        No favourites saved. <Link to="/search">Search routes</Link> and add them.
                      </p>
                    ) : (
                      <p style={{ color: '#64748b', margin: 0, fontSize: '.9rem' }}>
                        You have <strong>{profile.favouriteTransports.length}</strong> saved transport{profile.favouriteTransports.length !== 1 ? 's' : ''}.
                        View them on your <Link to="/dashboard/commuter">dashboard</Link>.
                      </p>
                    )}
                  </div>
                )}

                {/* Account Actions */}
                <div className="detail-section">
                  <div className="detail-section-title" style={{ color: '#ef4444' }}>⚠️ Account Actions</div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => { logout(); navigate('/login'); }}
                    >
                      🚪 Logout
                    </button>
                    <Link to="/dashboard/commuter" className="btn btn-outline-secondary btn-sm">
                      ← Back to Dashboard
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
