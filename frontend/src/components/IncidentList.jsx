import { ClockIcon, WrenchIcon, AlertIcon, UsersIcon, ClipboardIcon, CheckCircleIcon, TrashIcon, LocationIcon, CalendarIcon } from './icons';

const typeIcons = {
  delay:       { Icon: ClockIcon, color: '#f59e0b', bg: '#fef3c7' },
  breakdown:   { Icon: WrenchIcon, color: '#ef4444', bg: '#fee2e2' },
  accident:    { Icon: AlertIcon, color: '#dc2626', bg: '#fee2e2' },
  overcrowding:{ Icon: UsersIcon, color: '#8b5cf6', bg: '#ede9fe' },
  other:       { Icon: ClipboardIcon,  color: '#64748b', bg: '#f1f5f9' },
};

const IncidentList = ({ incidents = [], onDelete }) => {
  if (!incidents.length) {
    return (
      <div className="text-muted d-flex align-items-center" style={{ fontSize: '.88rem', padding: '0.5rem 0' }}>
        <CheckCircleIcon size={16} className="text-success me-2"/> No incidents reported for this transport.
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
              <cfg.Icon size={16} />
            </div>
            <div className="flex-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span style={{ fontWeight: 600, fontSize: '.9rem', textTransform: 'capitalize' }}>
                  {inc.incidentType}
                </span>
                <span className={`severity-badge ${inc.severity}`}>{inc.severity}</span>
                <span className={`status-badge ${inc.status}`}>{inc.status}</span>
                {onDelete && (
                  <button
                    className="btn btn-sm btn-link text-danger ms-auto p-0 text-decoration-none"
                    onClick={() => onDelete(inc._id)}
                    title="Delete Incident"
                  >
                    <TrashIcon size={14} className="me-1"/> Delete
                  </button>
                )}
              </div>
              {inc.description && (
                <p style={{ fontSize: '.85rem', color: '#475569', margin: '0 0 .25rem' }}>
                  {inc.description}
                </p>
              )}
              <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>
                {inc.location && <span className="d-inline-flex align-items-center"><LocationIcon size={14} className="me-1"/> {inc.location}</span>}
                {inc.location && date && <span> · </span>}
                {date && <span className="d-inline-flex align-items-center"><CalendarIcon size={14} className="me-1"/> {date}</span>}
              </div>
              {inc.img && (
                <div className="mt-2 text-center text-sm-start">
                  <img
                    src={inc.img}
                    alt="Incident evidence"
                    style={{
                      maxHeight: '120px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncidentList;
