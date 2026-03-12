import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAuthorityProfile,
  getManagedTransports,
  getAllIncidentsForAuthority,
} from '../../api/adminApi';

/* ── Helpers ─────────────────────────────────────────────── */
const severityColors = {
  critical: { bg: '#fee2e2', color: '#991b1b' },
  high:     { bg: '#ffedd5', color: '#9a3412' },
  medium:   { bg: '#fef3c7', color: '#92400e' },
  low:      { bg: '#dbeafe', color: '#1e40af' },
};

const SeverityBadge = ({ severity }) => {
  const style = severityColors[severity] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="severity-badge" style={{ background: style.bg, color: style.color }}>
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${status}`}>{status}</span>
);

/* ── Page ────────────────────────────────────────────────── */
const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [transports, setTransports] = useState([]);
  const [incidents,  setIncidents]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, transportsRes, incidentsRes] = await Promise.all([
        getAuthorityProfile().catch(() => null),
        getManagedTransports().catch(() => null),
        getAllIncidentsForAuthority({ limit: 8 }).catch(() => null),
      ]);

      if (profileRes) {
        const d = profileRes.data?.data;
        setProfile(d?.authorityProfile || d?.user || d);
      }
      if (transportsRes) {
        const d = transportsRes.data?.data;
        setTransports(d?.results || d?.transports || (Array.isArray(d) ? d : []));
      }
      if (incidentsRes) {
        const d = incidentsRes.data?.data;
        setIncidents(d?.incidents || (Array.isArray(d) ? d : []));
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  const stats = {
    total:    transports.length,
    active:   transports.filter((t) => t.isActive !== false).length,
    open:     incidents.filter((i)  => i.status === 'open').length,
    critical: incidents.filter((i)  => i.severity === 'critical').length,
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1>🏛️ Authority Dashboard</h1>
            <p>Manage your transport fleet, monitor incidents, and track crowd levels</p>
          </div>
          <button className="btn btn-light fw-semibold" onClick={() => navigate('/authority/manage')}>
            🛠️ Manage Transports
          </button>
        </div>
      </div>

      <div className="container pb-5">

        {loading ? (
          <div className="loading-state"><div className="spinner-large" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Transports',  value: stats.total,    color: 'var(--primary)' },
                { label: 'Active',            value: stats.active,   color: 'var(--success)' },
                { label: 'Open Incidents',    value: stats.open,     color: 'var(--warning)' },
                { label: 'Critical Alerts',   value: stats.critical, color: 'var(--danger)' },
              ].map(({ label, value, color }) => (
                <div className="col-sm-6 col-lg-3" key={label}>
                  <div className="detail-section text-center py-4" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: '.82rem', color: '#64748b', marginTop: '.3rem' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Authority Profile Summary */}
            {profile && (
              <div className="detail-section">
                <div className="detail-section-title d-flex justify-content-between align-items-center">
                  <span>🏛️ Authority Profile</span>
                  <Link to="/profile" className="btn btn-sm btn-outline-primary">✏️ Edit Profile</Link>
                </div>
                <div className="info-grid">
                  <div className="info-item"><label>Name</label><span>{profile.name || user.name || '—'}</span></div>
                  <div className="info-item"><label>Email</label><span>{profile.email || user.email || '—'}</span></div>
                  <div className="info-item"><label>Organisation</label><span>{profile.organizationName || '—'}</span></div>
                  <div className="info-item"><label>Authority Code</label><span>{profile.authorityCode || '—'}</span></div>
                  <div className="info-item"><label>Region</label><span>{profile.region || '—'}</span></div>
                  <div className="info-item">
                    <label>Covered Districts</label>
                    <span>{(profile.coveredDistricts || []).join(', ') || '—'}</span>
                  </div>
                  {profile.officeAddress && (
                    <div className="info-item"><label>Office Address</label><span>{profile.officeAddress}</span></div>
                  )}
                  {profile.contactPhone && (
                    <div className="info-item"><label>Contact Phone</label><span>{profile.contactPhone}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Main content row */}
            <div className="row g-4">

              {/* Managed Transports */}
              <div className="col-lg-7">
                <div className="detail-section h-100" style={{ marginBottom: 0 }}>
                  <div className="detail-section-title d-flex justify-content-between align-items-center">
                    <span>🚌 Managed Transports</span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate('/authority/manage')}
                    >
                      Manage All →
                    </button>
                  </div>

                  {transports.length === 0 ? (
                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🚌</div>
                      <p style={{ color: '#64748b', margin: 0 }}>No transports yet.</p>
                      <button
                        className="btn btn-primary btn-sm mt-3"
                        onClick={() => navigate('/authority/manage')}
                      >
                        ➕ Add First Transport
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead>
                          <tr style={{ fontSize: '.82rem', color: '#64748b', textTransform: 'uppercase' }}>
                            <th style={{ fontWeight: 700, paddingLeft: 0 }}>Number</th>
                            <th style={{ fontWeight: 700 }}>Name</th>
                            <th style={{ fontWeight: 700 }}>Type</th>
                            <th style={{ fontWeight: 700 }}>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {transports.slice(0, 6).map((t) => (
                            <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ paddingLeft: 0 }}>
                                <span className="transport-number">{t.transportNumber}</span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{t.name || '—'}</div>
                                {t.operator && (
                                  <div style={{ fontSize: '.78rem', color: '#64748b' }}>{t.operator}</div>
                                )}
                              </td>
                              <td>
                                <span className={`meta-chip ${t.type}`}>
                                  {t.type === 'bus' ? '🚌' : '🚂'} {t.type}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '.72rem', fontWeight: 700, padding: '.18rem .5rem',
                                  borderRadius: 5,
                                  background: t.isActive !== false ? '#d1fae5' : '#f1f5f9',
                                  color: t.isActive !== false ? '#065f46' : '#64748b',
                                }}>
                                  {t.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <Link
                                  to={`/transport/${t._id}`}
                                  style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                                >
                                  View →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {transports.length > 6 && (
                        <div className="text-center pt-2 pb-1">
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => navigate('/authority/manage')}
                          >
                            View all {transports.length} transports →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="col-lg-5">
                <div className="detail-section h-100" style={{ marginBottom: 0 }}>
                  <div className="detail-section-title">🚨 Recent Incidents</div>

                  {incidents.length === 0 ? (
                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>✅</div>
                      <p style={{ color: '#64748b', margin: 0 }}>No incidents reported.</p>
                    </div>
                  ) : (
                    incidents.map((inc) => (
                      <div className="incident-item" key={inc._id}>
                        <div
                          className="incident-icon"
                          style={{
                            background: severityColors[inc.severity]?.bg || '#f1f5f9',
                            color: severityColors[inc.severity]?.color || '#64748b',
                          }}
                        >
                          {inc.incidentType === 'breakdown' ? '🔧'
                            : inc.incidentType === 'accident' ? '⚠️'
                            : inc.incidentType === 'delay' ? '⏱️'
                            : inc.incidentType === 'overcrowding' ? '👥'
                            : '📋'}
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '.9rem' }}>
                              {inc.incidentType}
                            </span>
                            <SeverityBadge severity={inc.severity} />
                            <StatusBadge status={inc.status} />
                          </div>
                          <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: '.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inc.location || inc.description || 'No details provided'}
                          </div>
                          <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: '.1rem' }}>
                            {inc.reportedAt ? new Date(inc.reportedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="detail-section mt-4">
              <div className="detail-section-title">⚡ Quick Actions</div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary"         onClick={() => navigate('/authority/manage')}>🛠️ Manage Transports</button>
                <button className="btn btn-outline-primary" onClick={() => navigate('/search')}>🔍 Search Routes</button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/profile')}>👤 View Profile</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuthorityDashboard;
