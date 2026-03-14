import { CircleIcon } from './icons';

const levelConfig = {
  empty:   { label: 'Empty',    color: '#10b981' },
  average: { label: 'Average',  color: '#f59e0b' },
  crowded: { label: 'Crowded',  color: '#ef4444' },
};

const CrowdBadge = ({ level }) => {
  const cfg = levelConfig[level] || { label: 'Unknown', icon: '⚪' };
  const cls = level ? level : 'unknown';

  return (
    <span className={`crowd-badge ${cls} d-inline-flex align-items-center`}>
      <CircleIcon size={12} className="me-1" fill={cfg.color || '#94a3b8'} stroke={cfg.color || '#94a3b8'} />
      {cfg.label}
    </span>
  );
};

export default CrowdBadge;
