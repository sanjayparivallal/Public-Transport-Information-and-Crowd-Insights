import { useNavigate } from 'react-router-dom';
import CrowdBadge from './CrowdBadge';

const TransportCard = ({ transport }) => {
  const navigate = useNavigate();
  const route = transport.routes?.[0]; // first route for preview

  const origin = route?.origin || transport.origin || '—';
  const destination = route?.destination || transport.destination || '—';
  const departure = route?.schedule?.[0]?.departureTime || null;
  const arrival   = route?.schedule?.[0]?.arrivalTime   || null;

  return (
    <div
      className="transport-card mb-3"
      onClick={() => navigate(`/transport/${transport._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transport._id}`)}
    >
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        <div>
          <span className="transport-number">{transport.transportNumber}</span>
          <div className="transport-name mt-1">{transport.name}</div>
          <div className="route-flow mt-1">
            <span>{origin}</span>
            <span className="arrow">→</span>
            <span>{destination}</span>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <span className={`meta-chip ${transport.type}`}>
            {transport.type === 'bus' ? '🚌' : '🚂'} {transport.type}
          </span>
          <CrowdBadge level={transport.crowdLevel} />
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
        {departure && (
          <span className="meta-chip">
            🕐 Dep: {departure}
          </span>
        )}
        {arrival && (
          <span className="meta-chip">
            🕓 Arr: {arrival}
          </span>
        )}
        {transport.operator && (
          <span className="meta-chip">
            🏢 {transport.operator}
          </span>
        )}
        <span className="ms-auto text-primary fw-semibold" style={{ fontSize: '.84rem' }}>
          View Details →
        </span>
      </div>
    </div>
  );
};

export default TransportCard;
