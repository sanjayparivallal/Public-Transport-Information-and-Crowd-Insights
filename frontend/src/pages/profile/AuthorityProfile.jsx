import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/userApi';
import { getManagedTransports } from '../../api/adminApi';
import { BuildingIcon, UserIcon, EditIcon, CheckCircleIcon, AlertIcon, BusIcon, TrainIcon, WrenchIcon, UsersIcon, PauseIcon } from '../../components/icons';

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
      <div className="container py-5 text-center">
        <Link to="/login">Please login to view your profile.</Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="d-flex align-items-center"><BuildingIcon size={32} className="me-2"/> Authority Profile</h1>
          <p>View and manage your authority account and organisation details</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8">

            {msg   && <div className="alert-custom alert-success mb-3 d-flex align-items-center"><CheckCircleIcon size={18} className="me-2"/> {msg}</div>}
            {error && <div className="alert-custom alert-error   mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>}

            {loading ? (
              <div className="loading-state"><div className="spinner-large" /></div>
            ) : (
              <>
                {/* Personal / Account Info */}
                <div className="detail-section">
                  <div className="detail-section-title d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center"><UserIcon size={20} className="me-2"/> Account Information</span>
                    {!editing && (
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={() => { setEditing(true); setMsg(''); setError(''); }}
                      >
                        <EditIcon size={14} className="me-2"/> Edit
                      </button>
                    )}
                  </div>

                  {!editing ? (
                    <div className="info-grid">
                      <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
                      <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
                      <div className="info-item">
                        <label>Role</label>
                        <span><span className="role-pill authority">authority</span></span>
                      </div>
                      <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
                      <div className="info-item">
                        <label>Account Status</label>
                        <span style={{ color: profile?.isActive !== false ? 'var(--success)' : '#94a3b8', fontWeight: 700 }}>
                          {profile?.isActive !== false ? <span className="d-flex align-items-center"><CheckCircleIcon size={14} className="me-1"/> Active</span> : <span className="d-flex align-items-center"><PauseIcon size={14} className="me-1"/> Inactive</span>}
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
                      <div className="info-item mt-3 pt-3" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)' }}>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => { setForm(p => ({ ...p, password: '' })); setShowPasswordModal(true); setMsg(''); setError(''); }}
                        >
                          Change Password
                        </button>
                      </div>
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
                      <div className="mb-4">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-primary flex-fill" onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving…' : 'Save Profile'}
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

                {/* Organisation Details */}
                <div className="detail-section">
                  <div className="detail-section-title d-flex align-items-center"><BuildingIcon size={20} className="me-2"/> Organisation Details</div>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Organisation Name</label>
                      <span>{profile?.organizationName || '—'}</span>
                    </div>
                    <div className="info-item">
                      <label>Authority Code</label>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {profile?.authorityCode || '—'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Region</label>
                      <span>{profile?.region || '—'}</span>
                    </div>
                    <div className="info-item">
                      <label>Contact Email</label>
                      <span>{profile?.contactEmail || '—'}</span>
                    </div>
                    <div className="info-item">
                      <label>Contact Phone</label>
                      <span>{profile?.contactPhone || '—'}</span>
                    </div>
                    <div className="info-item">
                      <label>Office Address</label>
                      <span>{profile?.officeAddress || '—'}</span>
                    </div>
                  </div>

                  {/* Covered Districts */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '.77rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.5rem' }}>
                      Covered Districts
                    </div>
                    {(profile?.coveredDistricts || []).length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {profile.coveredDistricts.map((d, i) => (
                          <span key={i} className="meta-chip">{d}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '.9rem' }}>—</span>
                    )}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="detail-section">
                  <div className="detail-section-title d-flex align-items-center" style={{ color: '#ef4444' }}><AlertIcon size={20} className="me-2"/> Account Actions</div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => { logout(); navigate('/login'); }}
                    >
                      Logout
                    </button>
                    <Link to="/dashboard/authority" className="btn btn-outline-secondary btn-sm">
                      ← Back to Dashboard
                    </Link>
                    <Link to="/authority/manage" className="btn btn-outline-primary btn-sm d-flex align-items-center">
                      <WrenchIcon size={14} className="me-2"/> Manage Transports
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Fleet Summary */}
          <div className="col-lg-4">
            <div className="detail-section">
              <div className="detail-section-title d-flex align-items-center"><BusIcon size={20} className="me-2"/> Fleet Summary</div>
              {loading ? (
                <div className="loading-state" style={{ padding: '1rem' }}>
                  <div className="spinner-large" />
                </div>
              ) : transports.length === 0 ? (
                <div className="empty-state" style={{ padding: '1rem' }}>
                  <div className="empty-state-icon" style={{ color: '#3b82f6' }}><BusIcon size={48} /></div>
                  <p style={{ color: '#64748b', fontSize: '.85rem', margin: 0 }}>No transports yet.</p>
                  <Link to="/authority/manage" className="btn btn-primary btn-sm mt-2">Add Transport</Link>
                </div>
              ) : (
                <>
                  <div className="row g-2 mb-3">
                    {[
                      { label: 'Total',    value: transports.length,                                     color: 'var(--primary)' },
                      { label: 'Active',   value: transports.filter((t) => t.isActive !== false).length, color: 'var(--success)' },
                      { label: 'Buses',    value: transports.filter((t) => t.type === 'bus').length,     color: '#1d4ed8' },
                      { label: 'Trains',   value: transports.filter((t) => t.type === 'train').length,   color: '#7c3aed' },
                    ].map(({ label, value, color }) => (
                      <div className="col-6" key={label}>
                        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '.75rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
                          <div style={{ fontSize: '.75rem', color: '#64748b' }}>{label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
                    {transports.slice(0, 5).map((t) => (
                      <div
                        key={t._id}
                        className="d-flex align-items-center justify-content-between py-2"
                        style={{ borderBottom: '1px solid var(--border)', gap: '.5rem' }}
                      >
                        <div>
                          <span className="transport-number" style={{ fontSize: '.72rem' }}>{t.transportNumber}</span>
                          <div style={{ fontSize: '.82rem', fontWeight: 600, marginTop: '.15rem', color: 'var(--text)' }}>
                            {t.name || '—'}
                          </div>
                        </div>
                        <span className={`meta-chip ${t.type}`} style={{ fontSize: '.72rem', flexShrink: 0 }}>
                          {t.type === 'bus' ? <BusIcon size={14}/> : <TrainIcon size={14}/>}
                        </span>
                      </div>
                    ))}
                    {transports.length > 5 && (
                      <div className="text-center pt-2">
                        <Link to="/authority/manage" style={{ fontSize: '.82rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          View all {transports.length} →
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Staff Summary */}
            <div className="detail-section">
              <div className="detail-section-title d-flex align-items-center"><UsersIcon size={20} className="me-2"/> Staff Overview</div>
              <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="info-item">
                  <label>Drivers</label>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                    {(profile?.managedDrivers || []).length}
                  </span>
                </div>
                <div className="info-item">
                  <label>Conductors</label>
                  <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.2rem' }}>
                    {(profile?.managedConductors || []).length}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/authority/manage" className="btn btn-outline-primary btn-sm w-100">
                  Assign Staff via Transport →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorityProfile;
