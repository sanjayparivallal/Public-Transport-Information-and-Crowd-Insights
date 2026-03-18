import { LocationIcon } from '../../components/icons';

const TransportInfo = ({ transport }) => {
  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex align-items-center"><LocationIcon size={20} className="me-2"/> Transport Information</div>
      <div className="info-grid">
        <div className="info-item">
          <label>Transport No.</label>
          <span>{transport.transportNumber}</span>
        </div>
        <div className="info-item">
          <label>Type</label>
          <span style={{ textTransform: 'capitalize' }}>{transport.type}</span>
        </div>
        {transport.operator && (
          <div className="info-item">
            <label>Operator</label>
            <span>{transport.operator}</span>
          </div>
        )}
        {transport.vehicleNumber && (
          <div className="info-item">
            <label>Vehicle No.</label>
            <span>{transport.vehicleNumber}</span>
          </div>
        )}
        {transport.totalSeats && (
          <div className="info-item">
            <label>Total Seats</label>
            <span>{transport.totalSeats}</span>
          </div>
        )}
        {transport.amenities?.length > 0 && (
          <div className="info-item" style={{ gridColumn: 'span 2' }}>
            <label>Amenities</label>
            <span>{transport.amenities.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportInfo;
