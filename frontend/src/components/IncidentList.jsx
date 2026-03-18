import { ClockIcon, WrenchIcon, AlertIcon, UsersIcon, ClipboardIcon, CheckCircleIcon, TrashIcon, LocationIcon, CalendarIcon, UserIcon } from './icons';

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
          <div key={inc._id} className="card shadow-sm border-0 mb-3" style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ color: cfg.color, background: cfg.bg, width: '40px', height: '40px' }}
              >
                <cfg.Icon size={20} />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: '.95rem', textTransform: 'capitalize', color: '#1e293b' }}>
                      {inc.incidentType}
                    </span>
                    <span className={`severity-badge ${inc.severity}`}>{inc.severity}</span>
                    <span className={`status-badge ${inc.status}`}>{inc.status}</span>
                  </div>
                  {onDelete && (
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center"
                      onClick={() => onDelete(inc._id)}
                      title="Delete Incident"
                    >
                      <TrashIcon size={14} className="me-1"/> Delete
                    </button>
                  )}
                </div>
                {inc.description && (
                  <p className="card-text mb-2 text-secondary" style={{ fontSize: '.88rem' }}>
                    {inc.description}
                  </p>
                )}
                <div className="d-flex flex-wrap gap-3 align-items-center text-muted" style={{ fontSize: '.8rem' }}>
                  <span className="d-flex align-items-center fw-medium" style={{ color: '#475569' }}>
                    <UserIcon size={14} className="me-1"/> 
                    {inc.reportedBy?.name ? `${inc.reportedBy.name}` : inc.reporterRole}
                  </span>
                  {inc.location && <span className="d-flex align-items-center"><LocationIcon size={14} className="me-1"/> {inc.location}</span>}
                  {date && <span className="d-flex align-items-center"><CalendarIcon size={14} className="me-1"/> {date}</span>}
                </div>
                {inc.img && (
                  <div className="mt-3 text-center text-sm-start bg-light rounded p-2 border">
                    <img
                      src={inc.img}
                      alt="Incident evidence"
                      style={{
                        maxHeight: '160px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncidentList;
