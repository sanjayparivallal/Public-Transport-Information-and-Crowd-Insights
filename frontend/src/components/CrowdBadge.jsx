// No icon imports needed – uses inline SVG span

const levelConfig = {
  empty:   {
    label: 'Empty',
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-400',
    cls: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
  },
  average: {
    label: 'Moderate',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-400',
    cls: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200',
  },
  crowded: {
    label: 'Crowded',
    color: '#f43f5e',
    gradient: 'from-rose-400 to-pink-400',
    cls: 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200',
  },
};

const CrowdBadge = ({ level }) => {
  const cfg = levelConfig[level] || {
    label: 'Unknown',
    color: '#94a3b8',
    gradient: 'from-slate-300 to-slate-400',
    cls: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${cfg.cls}`}>
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
      />
      {cfg.label}
    </span>
  );
};

export default CrowdBadge;
