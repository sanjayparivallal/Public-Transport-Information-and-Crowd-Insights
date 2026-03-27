// ENHANCED: Uses .badge-* from index.scss for all status indicators

const CrowdBadge = ({ level }) => {
  // ENHANCED: Pulsing dot component per design system
  const PulsingDot = ({ colorClass, pingClass }) => (
    <div className="relative flex w-2.5 h-2.5 shrink-0">
      <span className={`animate-ping absolute w-full h-full rounded-full ${pingClass} opacity-75`} />
      <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
    </div>
  );

  // ENHANCED: badge-* classes from index.scss — status → color map per design system
  if (level === 'empty') {
    return (
      <span className="badge badge-emerald">
        {/* ENHANCED: emerald pulsing live dot */}
        <PulsingDot colorClass="bg-emerald-500" pingClass="bg-emerald-400" />
        Empty
      </span>
    );
  }

  if (level === 'average') {
    return (
      <span className="badge badge-amber">
        {/* ENHANCED: amber pulsing dot for moderate */}
        <PulsingDot colorClass="bg-amber-500" pingClass="bg-amber-400" />
        Moderate
      </span>
    );
  }

  if (level === 'crowded') {
    return (
      // ENHANCED: badge-red for CROWDED per design system status map
      <span className="badge badge-red">
        <div className="relative flex w-2.5 h-2.5 shrink-0">
          <span className="animate-ping absolute w-full h-full rounded-full bg-red-400 opacity-75" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        </div>
        Crowded
      </span>
    );
  }

  // Unknown / null level
  return (
    <span className="badge" style={{ background: 'rgba(148,163,184,0.1)', color: '#64748b', border: '1px solid rgba(148,163,184,0.2)' }}>
      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
      Unknown
    </span>
  );
};

export default CrowdBadge;
