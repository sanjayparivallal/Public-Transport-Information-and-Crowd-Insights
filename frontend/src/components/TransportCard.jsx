import { useNavigate } from 'react-router-dom';
import CrowdBadge from './CrowdBadge';

const TransportCard = ({ transport }) => {
  const navigate = useNavigate();

  // Search results are Route documents with a nested `transportId` object.
  // The /transport/:id route expects a Transport _id, not a Route _id.
  const t = transport.transportId || transport; // nested transport doc, or flat doc
  const transportId = t._id || transport._id;  // actual transport's MongoDB _id

  const origin      = transport.origin      || '—';
  const destination = transport.destination || '—';
  const departure   = transport.schedule?.[0]?.departureTime || null;
  const arrival     = transport.schedule?.[0]?.arrivalTime   || null;

  const displayNumber = t.transportNumber || transport.transportNumber || '—';
  const displayName   = t.name            || transport.name            || '—';
  const displayType   = t.type            || transport.type            || 'bus';
  const displayOp     = t.operator        || transport.operator        || null;
  const crowdLevel    = transport.crowdLevel || null;

  return (
    <div
      className="transport-card mb-3"
      onClick={() => navigate(`/transport/${transportId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}`)}
    >
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        <div>
          <span className="transport-number">{displayNumber}</span>
          <div className="transport-name mt-1">{displayName}</div>
          <div className="route-flow mt-1">
            <span>{origin}</span>
            <span className="arrow">→</span>
            <span>{destination}</span>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <span className={`meta-chip ${displayType}`}>
            {displayType === 'bus' ? '🚌' : '🚂'} {displayType}
          </span>
          <CrowdBadge level={crowdLevel} />
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
        {displayOp && (
          <span className="meta-chip">
            🏢 {displayOp}
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

