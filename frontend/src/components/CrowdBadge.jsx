const levelConfig = {
  empty:   { label: 'Empty',    icon: '🟢' },
  average: { label: 'Average',  icon: '🟡' },
  crowded: { label: 'Crowded',  icon: '🔴' },
};

const CrowdBadge = ({ level }) => {
  const cfg = levelConfig[level] || { label: 'Unknown', icon: '⚪' };
  const cls = level ? level : 'unknown';

  return (
    <span className={`crowd-badge ${cls}`}>
      <span className="crowd-dot" />
      {cfg.icon} {cfg.label}
    </span>
  );
};

export default CrowdBadge;
