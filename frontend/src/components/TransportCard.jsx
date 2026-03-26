import { useNavigate } from 'react-router-dom';
import CrowdBadge from './CrowdBadge';
import { BusIcon, TrainIcon, ClockIcon, BuildingIcon, ArrowRightIcon } from './icons';

// Per-type color theme
const typeTheme = {
  bus: {
    iconBg:    'from-blue-500 to-indigo-500',
    iconText:  'text-white',
    stripe:    'from-blue-500 to-indigo-500',
    badgeBg:   'bg-blue-50 text-blue-600 border-blue-100',
    hoverBorder: 'hover:border-blue-400',
    btn:       'group-hover:bg-blue-600 group-hover:border-blue-600',
  },
  train: {
    iconBg:    'from-violet-500 to-purple-600',
    iconText:  'text-white',
    stripe:    'from-violet-500 to-purple-600',
    badgeBg:   'bg-violet-50 text-violet-600 border-violet-100',
    hoverBorder: 'hover:border-violet-400',
    btn:       'group-hover:bg-violet-600 group-hover:border-violet-600',
  },
};

const TransportCard = ({ transport }) => {
  const navigate = useNavigate();

  const t = transport.transportId || transport;
  const transportId = t._id || transport._id;
  const routeId = transport._id;

  const origin = transport.origin || '—';
  const destination = transport.destination || '—';
  const departure = transport.schedule?.[0]?.departureTime || null;
  const arrival   = transport.schedule?.[0]?.arrivalTime   || null;

  const displayNumber = t.transportNumber || transport.transportNumber || '—';
  const displayName   = t.name || transport.name || '—';
  const displayType   = t.type || transport.type || 'bus';
  const displayOp     = t.operator || transport.operator || null;
  const crowdLevel    = transport.crowdLevel || null;
  const displayAvailableSeats = transport.availableSeats ?? t.availableSeats ?? t.totalSeats ?? '—';
  const displayTotalSeats     = t.totalSeats || 1;
  const isBus = displayType === 'bus';
  const theme = typeTheme[displayType] || typeTheme.bus;

  const seatPct = Math.round(
    ((displayAvailableSeats === '—' ? 0 : displayAvailableSeats) / displayTotalSeats) * 100
  );
  const seatColor = displayAvailableSeats === '—' ? '#cbd5e1'
    : seatPct <= 20 ? '#f43f5e'
    : seatPct >= 70 ? '#10b981'
    : '#f59e0b';

  return (
    <div
      className={`group relative bg-white rounded-[2rem] border-2 border-slate-100 ${theme.hoverBorder} shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col`}
      onClick={() => navigate(`/transport/${transportId}?routeId=${routeId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}?routeId=${routeId}`)}
    >
      {/* Gradient top stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.stripe}`} />

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5">

        {/* Left: Icon & Details */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${theme.iconBg} ${theme.iconText} flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500`}>
            {isBus ? <BusIcon size={26} /> : <TrainIcon size={26} />}
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm ${theme.badgeBg}`}>
                {displayNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm ${isBus ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                {displayType}
              </span>
              {displayOp && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm bg-slate-50 text-slate-500 border-slate-200 truncate max-w-[120px]">
                  <BuildingIcon size={10} className="text-slate-400" />
                  {displayOp}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">
              {displayName}
            </h3>
          </div>
        </div>

        {/* Center: Route */}
        <div className="flex items-center justify-center gap-4 shrink-0 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 w-full sm:w-auto">
          <div className="text-right flex flex-col">
            <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">Origin</span>
            <span className="text-sm font-black text-slate-800 truncate max-w-[90px] sm:max-w-none">{origin}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-px bg-gradient-to-r from-blue-200 via-indigo-300 to-violet-200 relative group-hover:w-14 transition-all duration-500">
              <ArrowRightIcon size={11} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 bg-slate-50 px-0.5 group-hover:translate-x-1 transition-all duration-500" />
            </div>
          </div>
          <div className="text-left flex flex-col">
            <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">Destination</span>
            <span className="text-sm font-black text-slate-800 truncate max-w-[90px] sm:max-w-none">{destination}</span>
          </div>
        </div>

        {/* Right: Schedule + CrowdBadge */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
          <div className="flex items-center gap-4">
            {departure && (
              <div className="flex flex-col items-start lg:items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <ClockIcon size={10} /> Depart
                </span>
                <span className="text-sm font-black text-slate-900">{departure}</span>
              </div>
            )}
            {departure && arrival && <div className="w-px h-6 bg-slate-200 hidden sm:block" />}
            {arrival && (
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Arrive</span>
                <span className="text-sm font-black text-slate-900">{arrival}</span>
              </div>
            )}
          </div>
          <CrowdBadge level={crowdLevel} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Live + Seat bar */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase hidden sm:block">Live</span>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Seats</span>
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(displayAvailableSeats === '—' ? 0 : seatPct, 100)}%`,
                  background: `linear-gradient(90deg, ${seatColor}99, ${seatColor})`,
                  boxShadow: `0 0 6px ${seatColor}40`,
                }}
              />
            </div>
            <span className="text-[11px] font-black whitespace-nowrap" style={{ color: seatColor }}>
              {displayAvailableSeats}<span className="text-slate-300"> / </span>{displayTotalSeats !== 1 ? displayTotalSeats : '?'}
            </span>
          </div>
        </div>

        {/* Details button */}
        <button
          className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 border-2 border-slate-150 ${theme.btn} group-hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shrink-0 w-full md:w-auto`}
          tabIndex={-1}
        >
          View Details
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TransportCard;
