import { LocationIcon } from './icons';

const StopsTimeline = ({ stops = [], currentStop }) => {
  if (!stops.length) {
    return (
      <div className="text-muted" style={{ fontSize: '.88rem' }}>
        No stops information available.
      </div>
    );
  }

  return (
    <div className="stops-timeline">
      {stops.map((stop, idx) => {
        const isFirst    = idx === 0;
        const isLast     = idx === stops.length - 1;
        const isCurrent  = currentStop && stop.stopName === currentStop;

        let dotClass = '';
        if (isFirst)   dotClass = 'origin';
        if (isLast)    dotClass = 'destination';

        return (
          <div
            key={stop.stopOrder || idx}
            className="stop-item"
            style={isCurrent ? { background: '#eff6ff', borderRadius: 8, margin: '0 -8px' } : {}}
          >
            <span className={`stop-dot ${dotClass}`} />
            <div>
              <div className="stop-name d-flex align-items-center gap-2">
                {stop.stopName}
                {isCurrent && (
                  <span
                    className="badge"
                    style={{ background: '#2563eb', color: 'white', fontSize: '.68rem' }}
                  >
                    <LocationIcon size={12} className="me-1"/> Now here
                  </span>
                )}
                {isFirst   && <span style={{ fontSize: '.75rem', color: '#10b981', fontWeight: 700 }}>Origin</span>}
                {isLast    && <span style={{ fontSize: '.75rem', color: '#ef4444', fontWeight: 700 }}>Destination</span>}
              </div>
              <div className="stop-time">
                {stop.scheduledArrival && `Arr: ${stop.scheduledArrival}`}
                {stop.scheduledArrival && stop.scheduledDeparture && ' · '}
                {stop.scheduledDeparture && `Dep: ${stop.scheduledDeparture}`}
                {stop.distanceFromOrigin != null && ` · ${stop.distanceFromOrigin} km`}
                {stop.platformNumber && ` · Platform ${stop.platformNumber}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StopsTimeline;
