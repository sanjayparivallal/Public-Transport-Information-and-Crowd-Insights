import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ManageTransport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'authority') {
    return (
      <div className="container py-5 text-center">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Access Restricted</h3>
          <p style={{ color: '#64748b' }}>Only Transport Authorities can access this page.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Login as Authority</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>🛠️ Manage Transports</h1>
          <p>Add, edit, and manage buses and trains under your authority</p>
        </div>
      </div>
      <div className="container pb-5">
        <div className="detail-section">
          <div className="detail-section-title">🚧 Coming Soon</div>
          <p style={{ color: '#64748b', fontSize: '.9rem' }}>
            The full transport management interface (add/edit/delete buses & trains, assign drivers and conductors)
            will be implemented here. Use the <strong>Search Routes</strong> page to browse existing transports.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/search')}>
            🔍 Browse Transports
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageTransport;
