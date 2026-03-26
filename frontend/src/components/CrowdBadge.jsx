import { CircleIcon } from './icons';

const levelConfig = {
  empty:   { label: 'Empty',    color: '#10b981', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  average: { label: 'Average',  color: '#f59e0b', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  crowded: { label: 'Crowded',  color: '#ef4444', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const CrowdBadge = ({ level }) => {
  const cfg = levelConfig[level] || { label: 'Unknown', color: '#94a3b8', cls: 'bg-slate-50 text-slate-500 border-slate-200' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.cls}`}>
      <CircleIcon size={8} fill={cfg.color} stroke={cfg.color} />
      {cfg.label}
    </span>
  );
};

export default CrowdBadge;
