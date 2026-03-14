const typeIcons = {
  delay:       { icon: '⏰', color: '#f59e0b', bg: '#fef3c7' },
  breakdown:   { icon: '🔧', color: '#ef4444', bg: '#fee2e2' },
  accident:    { icon: '🚨', color: '#dc2626', bg: '#fee2e2' },
  overcrowding:{ icon: '👥', color: '#8b5cf6', bg: '#ede9fe' },
  other:       { icon: '⚠️',  color: '#64748b', bg: '#f1f5f9' },
};

const IncidentList = ({ incidents = [] }) => {
  if (!incidents.length) {
    return (
      <div className="text-muted" style={{ fontSize: '.88rem', padding: '0.5rem 0' }}>
        ✅ No incidents reported for this transport.
      </div>
    );
  }

  return (
    <div>
      {incidents.map((inc) => {
        const cfg = typeIcons[inc.incidentType] || typeIcons.other;
        const date = inc.reportedAt
          ? new Date(inc.reportedAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : null;

        return (
          <div key={inc._id} className="incident-item">
            <div
              className="incident-icon"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {cfg.icon}
            </div>
            <div className="flex-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span style={{ fontWeight: 600, fontSize: '.9rem', textTransform: 'capitalize' }}>
                  {inc.incidentType}
                </span>
                <span className={`severity-badge ${inc.severity}`}>{inc.severity}</span>
                <span className={`status-badge ${inc.status}`}>{inc.status}</span>
              </div>
              {inc.description && (
                <p style={{ fontSize: '.85rem', color: '#475569', margin: '0 0 .25rem' }}>
                  {inc.description}
                </p>
              )}
              <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>
                {inc.location && <span>📍 {inc.location}</span>}
                {inc.location && date && <span> · </span>}
                {date && <span>📅 {date}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncidentList;
