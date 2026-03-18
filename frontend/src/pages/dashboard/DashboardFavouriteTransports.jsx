import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, SearchIcon, BusIcon, TrainIcon, BuildingIcon } from '../../components/icons';
import CrowdBadge from '../../components/CrowdBadge';

const DashboardFavouriteTransports = ({ favLoading, favTransports, crowdMap }) => {
  const navigate = useNavigate();

  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex justify-content-between align-items-center">
        <span className="d-flex align-items-center"><StarIcon size={20} className="me-2" filled/> Favourite Transports</span>
        <Link to="/search" className="btn btn-sm btn-outline-primary">+ Add Favourite</Link>
      </div>

      {favLoading ? (
        <div className="loading-state" style={{ padding: '1.5rem' }}>
          <div className="spinner-large" />
        </div>
      ) : favTransports.length === 0 ? (
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <div className="empty-state-icon text-warning"><StarIcon size={48} filled /></div>
          <h5>No favourites yet</h5>
          <p style={{ color: '#64748b', fontSize: '.9rem' }}>
            Search for a route and click the <StarIcon size={16} className="mx-1" style={{verticalAlign: 'text-bottom'}} filled/> Favourite button to save it here.
          </p>
          <button className="btn btn-primary btn-sm mt-2 d-flex align-items-center justify-content-center mx-auto" onClick={() => navigate('/search')}>
            <SearchIcon size={16} className="me-2"/> Search Routes
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
                    {t.type === 'bus' ? <BusIcon size={16} className="me-1"/> : <TrainIcon size={16} className="me-1"/>} {t.type}
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
                    <span className="meta-chip"><BuildingIcon size={14} className="me-1"/> {t.operator}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardFavouriteTransports;
