import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/userApi';
import { searchTransports } from '../../api/transportApi';
import { useAuth } from '../../context/AuthContext';
import CrowdBadge from '../../components/CrowdBadge';

const CommuterDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [favTransports, setFavTransports] = useState([]);

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
          <h1>👋 Welcome, {user.name || user.email}</h1>
          <p>Your commuter dashboard — search routes and track crowd levels</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="row g-4">
          {/* Quick Actions */}
          <div className="col-md-4">
            <div className="detail-section h-100">
              <div className="detail-section-title">⚡ Quick Actions</div>
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-primary w-100 text-start" onClick={() => navigate('/search')}>
                  🔍 Search Routes
                </button>
                <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/profile')}>
                  👤 View Profile
                </button>
              </div>
            </div>
          </div>
          {/* Profile Info */}
          <div className="col-md-8">
            <div className="detail-section">
              <div className="detail-section-title">👤 Your Account</div>
              {loading ? (
                <div className="loading-state"><div className="spinner-large" /></div>
              ) : (
                <div className="info-grid">
                  <div className="info-item"><label>Name</label><span>{profile?.name || user.name || '—'}</span></div>
                  <div className="info-item"><label>Email</label><span>{profile?.email || user.email || '—'}</span></div>
                  <div className="info-item"><label>Role</label><span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
                  <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
                  {user.role === 'driver' || user.role === 'conductor' ? (
                    <div className="info-item col-span-2">
                      <label>Assigned Transport</label>
                      <span>{profile?.assignedTransport || '—'}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="detail-section mt-4">
          <div className="detail-section-title">💡 Getting Started</div>
          <p style={{ color: '#64748b', fontSize: '.9rem', margin: 0 }}>
            Use the <strong>Search Routes</strong> page to find buses and trains between districts.
            Click any transport to view its stops, crowd level, schedule, and fare information.
          </p>
        </div>
      </div>
    </>
  );
};

export default CommuterDashboard;
