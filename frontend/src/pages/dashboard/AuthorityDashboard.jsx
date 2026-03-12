import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data?.user || res.data);
      } catch (_) {}
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>🏛️ Authority Dashboard</h1>
          <p>Manage your transport fleet, monitor incidents, and track crowd levels</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          {/* Quick Actions */}
          <div className="col-md-4">
            <div className="detail-section">
              <div className="detail-section-title">⚡ Quick Actions</div>
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-primary w-100 text-start" onClick={() => navigate('/authority/manage')}>
                  🛠️ Manage Transports
                </button>
                <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/search')}>
                  🔍 Search Routes
                </button>
                <button className="btn btn-outline-secondary w-100 text-start" onClick={() => navigate('/profile')}>
                  👤 View Profile
                </button>
              </div>
            </div>
          </div>
          {/* Authority Info */}
          <div className="col-md-8">
            <div className="detail-section">
              <div className="detail-section-title">🏛️ Authority Profile</div>
              {loading ? (
                <div className="loading-state"><div className="spinner-large" /></div>
              ) : (
                <div className="info-grid">
                  <div className="info-item"><label>Name</label><span>{profile?.name || user.name || '—'}</span></div>
                  <div className="info-item"><label>Email</label><span>{profile?.email || user.email || '—'}</span></div>
                  <div className="info-item"><label>Organisation</label><span>{profile?.organizationName || '—'}</span></div>
                  <div className="info-item"><label>Authority Code</label><span>{profile?.authorityCode || '—'}</span></div>
                  <div className="info-item"><label>Region</label><span>{profile?.region || '—'}</span></div>
                  <div className="info-item">
                    <label>Districts</label>
                    <span>{profile?.coveredDistricts?.join(', ') || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorityDashboard;
