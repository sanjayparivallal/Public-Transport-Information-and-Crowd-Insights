import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/userApi';
import { getTransportById } from '../../api/transportApi';
import { getCrowd } from '../../api/crowdApi';
import CrowdBadge from '../../components/CrowdBadge';

const CommuterDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [favTransports,  setFavTransports]  = useState([]);
  const [crowdMap,       setCrowdMap]       = useState({});
  const [assignedDetail, setAssignedDetail] = useState(null);
  const [favLoading,     setFavLoading]     = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res  = await getProfile();
        const data = res.data?.data?.user || res.data?.user || res.data?.data || res.data;
        setProfile(data);

        // Fetch favourite transports
        const favIds = data?.favouriteTransports || [];
        if (favIds.length > 0) {
          setFavLoading(true);
          const results = await Promise.all(
            favIds.map((id) => getTransportById(id).catch(() => null))
          );
          const valid = results
            .filter(Boolean)
            .map((r) => r.data?.data?.transport || r.data?.data || r.data)
            .filter(Boolean);
          setFavTransports(valid);

          // Fetch crowd for each favourite
          const crowdResults = await Promise.all(
            valid.map((t) => t._id ? getCrowd(t._id).catch(() => null) : null)
          );
          const map = {};
          crowdResults.forEach((cr, i) => {
            if (valid[i]?._id && cr) {
              const d = cr.data?.data;
              map[valid[i]._id] = d?.officialCrowdLevel?.crowdLevel || d?.crowdLevel || null;
            }
          });
          setCrowdMap(map);
          setFavLoading(false);
        }

        // Fetch assigned transport detail (driver / conductor)
        const assignedId = data?.assignedTransport;
        if (assignedId) {
          const tRes = await getTransportById(assignedId).catch(() => null);
          if (tRes) {
            setAssignedDetail(
              tRes.data?.data?.transport || tRes.data?.data || tRes.data
            );
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  const isStaff = user.role === 'driver' || user.role === 'conductor';

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>👋 Welcome, {profile?.name || user.name || user.email}</h1>
          <p className="text-capitalize">
            {isStaff ? `${user.role} dashboard` : 'Your commuter dashboard — search routes and track crowd levels'}
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="loading-state"><div className="spinner-large" /></div>
        ) : (
          <>
            {/* Top row: Account Info + Quick Actions */}
            <div className="row g-4 mb-2">
              {/* Account Info */}
              <div className="col-md-8">
                <div className="detail-section">
                  <div className="detail-section-title">👤 Your Account</div>
                  <div className="info-grid">
                    <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
                    <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
                    <div className="info-item">
                      <label>Role</label>
                      <span>
                        <span className={`role-pill ${user.role}`}>{user.role}</span>
                      </span>
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
                      <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="col-md-4">
                <div className="detail-section h-100">
                  <div className="detail-section-title">⚡ Quick Actions</div>
                  <div className="d-flex flex-column gap-2">
                    <button className="btn btn-primary w-100 text-start" onClick={() => navigate('/search')}>
                      🔍 Search Routes
                    </button>
                    <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/profile')}>
                      ✏️ Edit Profile
                    </button>
                    {isStaff && assignedDetail?._id && (
                      <button
                        className="btn btn-outline-warning w-100 text-start"
                        onClick={() => navigate(`/transport/${assignedDetail._id}`)}
                      >
                        🚌 View My Transport
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Transport (Driver / Conductor) */}
            {isStaff && (
              <div className="detail-section">
                <div className="detail-section-title">🚌 Assigned Transport</div>
                {assignedDetail ? (
                  <div className="row g-3 align-items-center">
                    <div className="col-md-8">
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Transport Number</label>
                          <span><span className="transport-number">{assignedDetail.transportNumber}</span></span>
                        </div>
                        <div className="info-item">
                          <label>Name</label>
                          <span>{assignedDetail.name || '—'}</span>
                        </div>
                        <div className="info-item">
                          <label>Type</label>
                          <span className={`meta-chip ${assignedDetail.type}`}>
                            {assignedDetail.type === 'bus' ? '🚌' : '🚂'} {assignedDetail.type}
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Operator</label>
                          <span>{assignedDetail.operator || '—'}</span>
                        </div>
                        <div className="info-item">
                          <label>Vehicle No.</label>
                          <span>{assignedDetail.vehicleNumber || '—'}</span>
                        </div>
                        <div className="info-item">
                          <label>Assigned By</label>
                          <span>{profile?.assignedAt ? `Assigned ${new Date(profile.assignedAt).toLocaleDateString('en-IN')}` : '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <Link
                        to={`/transport/${assignedDetail._id}`}
                        className="btn btn-outline-primary"
                      >
                        View Full Details →
                      </Link>
                    </div>
                  </div>
                ) : profile?.assignedTransport ? (
                  <p style={{ color: '#64748b', margin: 0 }}>
                    Transport ID: <code>{profile.assignedTransport}</code> — details unavailable.
                  </p>
                ) : (
                  <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🚌</div>
                    <p style={{ color: '#64748b', margin: 0 }}>No transport assigned yet. Contact your authority.</p>
                  </div>
                )}
              </div>
            )}

            {/* Favourite Transports (Commuter) */}
            {!isStaff && (
              <div className="detail-section">
                <div className="detail-section-title d-flex justify-content-between align-items-center">
                  <span>⭐ Favourite Transports</span>
                  <Link to="/search" className="btn btn-sm btn-outline-primary">+ Add Favourite</Link>
                </div>

                {favLoading ? (
                  <div className="loading-state" style={{ padding: '1.5rem' }}>
                    <div className="spinner-large" />
                  </div>
                ) : favTransports.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>⭐</div>
                    <h5>No favourites yet</h5>
                    <p style={{ color: '#64748b', fontSize: '.9rem' }}>
                      Search for a route and click the ⭐ Favourite button to save it here.
                    </p>
                    <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate('/search')}>
                      🔍 Search Routes
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {favTransports.map((t) => (
                      <div className="col-md-6 col-lg-4" key={t._id}>
                        <div
                          className="transport-card"
                          onClick={() => navigate(`/transport/${t._id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && navigate(`/transport/${t._id}`)}
                        >
                          <div className="d-flex align-items-start justify-content-between">
                            <div>
                              <span className="transport-number">{t.transportNumber}</span>
                              <div className="transport-name mt-1">{t.name || '—'}</div>
                            </div>
                            <span className={`meta-chip ${t.type}`}>
                              {t.type === 'bus' ? '🚌' : '🚂'} {t.type}
                            </span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mt-3">
                            <CrowdBadge level={crowdMap[t._id] || null} />
                            <span className="text-primary fw-semibold" style={{ fontSize: '.84rem' }}>
                              View →
                            </span>
                          </div>
                          {t.operator && (
                            <div className="mt-2">
                              <span className="meta-chip">🏢 {t.operator}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Getting Started tip (shown only when no favourites) */}
            {!isStaff && favTransports.length === 0 && (
              <div className="detail-section">
                <div className="detail-section-title">💡 Getting Started</div>
                <p style={{ color: '#64748b', fontSize: '.9rem', margin: 0 }}>
                  Use the <strong>Search Routes</strong> page to find buses and trains between districts.
                  Click any transport to view its stops, crowd level, schedule, and fare — then save it
                  as a favourite for quick access here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CommuterDashboard;
