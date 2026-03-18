import { ClockIcon } from '../../components/icons';

const ScheduleSection = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex align-items-center"><ClockIcon size={20} className="me-2"/> Schedule</div>
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {schedule.map((trip, idx) => (
          <div
            key={trip.tripId || idx}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '.86rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                {trip.departureTime} → {trip.arrivalTime}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '.76rem' }}>
                {trip.daysOfOperation?.join(', ')}
              </div>
            </div>
            <span
              style={{
                fontSize: '.72rem', padding: '.15rem .5rem', borderRadius: 5,
                background: trip.isActive ? '#d1fae5' : '#f1f5f9',
                color: trip.isActive ? '#065f46' : '#94a3b8',
                fontWeight: 700,
              }}
            >
              {trip.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;
