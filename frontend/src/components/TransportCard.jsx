import { useNavigate } from 'react-router-dom';
import CrowdBadge from './CrowdBadge';
import { BusIcon, TrainIcon, ClockIcon, BuildingIcon, ArrowRightIcon, LocationIcon } from './icons';

const TransportCard = ({ transport, index = 0 }) => {
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

  const seatPct = Math.round(
    ((displayAvailableSeats === '—' ? 0 : displayAvailableSeats) / displayTotalSeats) * 100
  );

  // Seat bar gradient + text color
  const seatBarClass = seatPct > 60
    ? 'from-emerald-400 to-teal-500'
    : seatPct >= 30
    ? 'from-amber-400 to-orange-400'
    : 'from-red-400 to-pink-500';

  const seatTextClass = seatPct > 60 ? 'text-emerald-600' : seatPct >= 30 ? 'text-amber-500' : 'text-red-500';
  const seatLabel = seatPct > 60 ? 'Available' : seatPct >= 30 ? 'Limited' : 'Almost Full';

  // Type-specific accents
  const typeAccent = isBus
    ? { stripe: 'from-cyan-500 to-blue-600', iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600', routeBg: 'from-cyan-50/60 to-blue-50/40', routeBorder: 'border-cyan-100/60' }
    : { stripe: 'from-violet-500 to-purple-600', iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600', routeBg: 'from-violet-50/60 to-purple-50/40', routeBorder: 'border-violet-100/60' };

  return (
    <div
      className="card hover-lift group relative overflow-hidden flex flex-col cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => navigate(`/transport/${transportId}?routeId=${routeId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}?routeId=${routeId}`)}
    >
      {/* Gradient top accent bar — thicker on hover */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] group-hover:h-[4px] rounded-t-2xl bg-gradient-to-r ${typeAccent.stripe} transition-all duration-300`} />

      {/* Shimmer sweep overlay on hover */}
      <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden rounded-2xl">
        <div
          className="absolute top-0 -left-full h-full w-1/2 opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-700 ease-in-out"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          }}
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5 pt-7 relative z-10">

        {/* Left: Icon & Details */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon box with subtle glow on hover */}
          <div className={`w-13 h-13 w-12 h-12 shrink-0 rounded-2xl ${typeAccent.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
            {isBus ? <BusIcon size={22} className="text-white" /> : <TrainIcon size={22} className="text-white" />}
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`badge ${isBus ? 'badge-cyan' : 'badge-purple'}`}>
                {displayNumber}
              </span>
              <span className={`badge ${isBus ? 'badge-blue' : 'badge-indigo'}`}>
                {displayType}
              </span>
              {displayOp && (
                <span className="badge badge-indigo hidden sm:inline-flex truncate max-w-[120px]">
                  <BuildingIcon size={10} />
                  {displayOp}
                </span>
              )}
            </div>
            {/* Name grows on hover */}
            <h3 className="text-base font-extrabold gradient-text-cool tracking-tight truncate group-hover:tracking-normal transition-all duration-300">
              {displayName}
            </h3>
          </div>
        </div>

        {/* Origin → Destination — enhanced border + hover tint */}
        <div className={`flex items-center justify-between bg-gradient-to-r ${typeAccent.routeBg} rounded-2xl px-5 py-3.5 border ${typeAccent.routeBorder} group-hover:shadow-sm w-full sm:w-auto shrink-0 transition-all duration-300`}>
          <div className="flex flex-col text-right gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</span>
            <div className="flex items-center gap-1 justify-end">
              <LocationIcon size={11} className="text-emerald-400" />
              <span className="font-bold text-slate-800 text-sm truncate max-w-[90px]">{origin}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mx-3">
            <div className="h-px w-6 bg-gradient-to-r from-slate-200 via-cyan-300 to-slate-200 group-hover:w-8 transition-all duration-300" />
            {/* Rotating arrow on hover */}
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${typeAccent.stripe} flex items-center justify-center shadow-sm group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300`}>
              <ArrowRightIcon size={13} className="text-white" />
            </div>
            <div className="h-px w-6 bg-gradient-to-r from-slate-200 via-cyan-300 to-slate-200 group-hover:w-8 transition-all duration-300" />
          </div>
          <div className="flex flex-col text-left gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">To</span>
            <div className="flex items-center gap-1">
              <LocationIcon size={11} className="text-rose-400" />
              <span className="font-bold text-slate-800 text-sm truncate max-w-[90px]">{destination}</span>
            </div>
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

      {/* Footer — seat bar + status + button */}
      <div className="px-5 sm:px-6 pb-5 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Pulsing live dot */}
          <div className="relative flex w-3 h-3 shrink-0">
            <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {/* Seat bar */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Seats</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${seatBarClass} transition-all duration-700`}
                  style={{ width: `${Math.min(displayAvailableSeats === '—' ? 0 : seatPct, 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-black whitespace-nowrap text-slate-600">
                {displayAvailableSeats}<span className="text-slate-300"> / </span>{displayTotalSeats !== 1 ? displayTotalSeats : '?'}
              </span>
            </div>
            {/* Seat availability label */}
            <div className="flex items-center gap-2 pl-8">
              <span className={`text-[10px] font-extrabold tracking-wide ${seatTextClass}`}>{seatLabel}</span>
              {seatPct > 0 && seatPct <= 30 && (
                <span className="text-[9px] font-bold text-slate-400">— Book soon</span>
              )}
            </div>
          </div>
        </div>

        {/* View Details button */}
        <button className="btn-primary w-full md:w-auto overflow-hidden group/btn" tabIndex={-1}>
          View Details
          <ArrowRightIcon size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default TransportCard;
