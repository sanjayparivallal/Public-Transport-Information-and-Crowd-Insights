import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAuthorityProfile,
  getManagedTransports,
  getAllIncidentsForAuthority,
} from '../../api/adminApi';
import { deleteIncident } from '../../api/incidentApi';
import { BusIcon, TrainIcon, BuildingIcon, EditIcon, CheckCircleIcon, WrenchIcon, AlertIcon, ClockIcon, UsersIcon, ClipboardIcon, SearchIcon, UserIcon, ZapIcon, TrashIcon } from '../../components/icons';

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
        getAllIncidentsForAuthority({ limit: 100 }).catch(() => null),
      ]);

      if (profileRes) {
        const d = profileRes.data?.data;
        setProfile(d?.authorityProfile || d?.user || d);
      }
      if (transportsRes) {
        const d = transportsRes.data?.data || transportsRes.data;
        setTransports(d?.transports || d?.results || (Array.isArray(d) ? d : []));
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
            <h1 className="d-flex align-items-center"><BuildingIcon size={32} className="me-2"/> Authority Dashboard</h1>
            <p>Manage your transport fleet, monitor incidents, and track crowd levels</p>
          </div>
          <button className="btn btn-light fw-semibold d-flex align-items-center" onClick={() => navigate('/authority/manage')}>
            <WrenchIcon size={18} className="me-2"/> Manage Transports
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
                  <span className="d-flex align-items-center"><BuildingIcon size={20} className="me-2"/> Authority Profile</span>
                  <Link to="/profile" className="btn btn-sm btn-outline-primary d-flex align-items-center"><EditIcon size={14} className="me-1"/> Edit Profile</Link>
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
                    <span className="d-flex align-items-center"><BusIcon size={20} className="me-2"/> Managed Transports</span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate('/authority/manage')}
                    >
                      Manage All →
                    </button>
                  </div>

                  {transports.length === 0 ? (
                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                      <div className="empty-state-icon" style={{ color: '#3b82f6' }}><BusIcon size={48} /></div>
                      <p style={{ color: '#64748b', margin: 0 }}>No transports yet.</p>
                      <button
                        className="btn btn-primary btn-sm mt-3"
                        onClick={() => navigate('/authority/manage')}
                      >
                        Add First Transport
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
                                  {t.type === 'bus' ? <BusIcon size={16} className="me-1"/> : <TrainIcon size={16} className="me-1"/>} {t.type}
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

              {/* Categorized Incidents */}
              <div className="col-lg-5">
                <div className="detail-section h-100" style={{ marginBottom: 0 }}>
                  <div className="detail-section-title d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center"><AlertIcon size={20} className="me-2"/> Incidents by Transport</span>
                  </div>

                  {incidents.length === 0 ? (
                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                      <div className="empty-state-icon text-success"><CheckCircleIcon size={48} /></div>
                      <p style={{ color: '#64748b', margin: 0 }}>No active incidents reported.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {Object.entries(
                        incidents.reduce((acc, inc) => {
                          const tName = inc.transportId?.name || 'Unknown Transport';
                          if (!acc[tName]) acc[tName] = [];
                          acc[tName].push(inc);
                          return acc;
                        }, {})
                      ).map(([transportName, groupIncidents]) => (
                        <div key={transportName} className="border rounded p-3 bg-white shadow-sm">
                          <h6 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center text-primary">
                            <BusIcon size={16} className="me-2"/> {transportName}
                          </h6>
                          <div className="d-flex flex-column gap-2">
                            {groupIncidents.map((inc) => (
                              <div className="p-2 border rounded" key={inc._id} style={{ background: '#f8fafc' }}>
                                <div className="d-flex align-items-start justify-content-between">
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '.85rem' }}>
                                      {inc.incidentType}
                                    </span>
                                    <SeverityBadge severity={inc.severity} />
                                    <StatusBadge status={inc.status} />
                                  </div>
                                  <button
                                    className="btn btn-link text-danger p-0"
                                    title="Delete Incident"
                                    onClick={async () => {
                                      if (window.confirm('Delete this incident?')) {
                                        try {
                                          await deleteIncident(inc._id);
                                          fetchAll();
                                        } catch (e) { alert('Failed to delete'); }
                                      }
                                    }}
                                  >
                                    <TrashIcon size={14} />
                                  </button>
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: '.25rem' }}>
                                  {inc.description || inc.location ? (inc.description || inc.location) : 'No details provided'}
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                  <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>
                                    {inc.reportedAt ? new Date(inc.reportedAt).toLocaleDateString('en-IN') : ''}
                                  </span>
                                  <span style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>
                                    By: {inc.reportedBy?.name || inc.reporterRole}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="detail-section mt-4">
              <div className="detail-section-title d-flex align-items-center"><ZapIcon size={20} className="me-2"/> Quick Actions</div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary d-flex align-items-center" onClick={() => navigate('/authority/manage')}><WrenchIcon size={18} className="me-2"/> Manage Transports</button>
                <button className="btn btn-outline-primary d-flex align-items-center" onClick={() => navigate('/search')}><SearchIcon size={18} className="me-2"/> Search Routes</button>
                <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate('/profile')}><UserIcon size={18} className="me-2"/> View Profile</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuthorityDashboard;
