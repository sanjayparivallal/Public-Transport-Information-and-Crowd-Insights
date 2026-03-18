import { Link } from 'react-router-dom';
import { BusIcon, TrainIcon } from '../../components/icons';

const DashboardAssignedTransport = ({ assignedDetail, profile, assignedTransportFallback }) => {
  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex align-items-center"><BusIcon size={20} className="me-2"/> Assigned Transport</div>
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
                  {assignedDetail.type === 'bus' ? <BusIcon size={16} className="me-1"/> : <TrainIcon size={16} className="me-1"/>} {assignedDetail.type}
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
      ) : assignedTransportFallback ? (
        <p style={{ color: '#64748b', margin: 0 }}>
          Transport ID: <code>{assignedTransportFallback}</code> — details unavailable.
        </p>
      ) : (
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <div className="empty-state-icon" style={{ color: '#3b82f6' }}><BusIcon size={48} /></div>
          <p style={{ color: '#64748b', margin: 0 }}>No transport assigned yet. Contact your authority.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardAssignedTransport;
