import { useNavigate } from 'react-router-dom';
import { ZapIcon, SearchIcon, EditIcon, BusIcon } from '../../components/icons';

const DashboardQuickActions = ({ isStaff, assignedDetail }) => {
  const navigate = useNavigate();
  return (
    <div className="detail-section h-100">
      <div className="detail-section-title d-flex align-items-center"><ZapIcon size={20} className="me-2"/> Quick Actions</div>
      <div className="d-flex flex-column gap-2">
        <button className="btn btn-primary w-100 text-start d-flex align-items-center" onClick={() => navigate('/search')}>
          <SearchIcon size={18} className="me-2"/> Search Routes
        </button>
        <button className="btn btn-outline-primary w-100 text-start d-flex align-items-center" onClick={() => navigate('/profile')}>
          <EditIcon size={18} className="me-2"/> Edit Profile
        </button>
        {isStaff && assignedDetail?._id && (
          <button
            className="btn btn-outline-warning w-100 text-start d-flex align-items-center"
            onClick={() => navigate(`/transport/${assignedDetail._id}`)}
          >
            <BusIcon size={18} className="me-2"/> View My Transport
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
