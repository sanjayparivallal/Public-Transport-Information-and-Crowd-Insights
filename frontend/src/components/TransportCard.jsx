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
    ? { 
        stripe: 'from-cyan-400 via-blue-500 to-indigo-600', 
        iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/30', 
        routeBg: 'from-cyan-50/80 to-blue-50/60', 
        routeBorder: 'border-cyan-200/60',
        textColor: 'group-hover:text-blue-600'
      }
    : { 
        stripe: 'from-fuchsia-400 via-purple-500 to-violet-600', 
        iconBg: 'bg-gradient-to-br from-fuchsia-400 to-violet-600 shadow-purple-500/30', 
        routeBg: 'from-fuchsia-50/80 to-violet-50/60', 
        routeBorder: 'border-fuchsia-200/60',
        textColor: 'group-hover:text-purple-600'
      };

  return (
    <div
      className="bg-white rounded-[2rem] border-2 border-transparent hover:border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer animate-fade-in-up transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => navigate(`/transport/${transportId}?routeId=${routeId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}?routeId=${routeId}`)}
    >
      {/* Gradient top accent bar — thicker on hover, full gradient */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 group-hover:h-2 bg-gradient-to-r ${typeAccent.stripe} transition-all duration-300 opacity-90 group-hover:opacity-100`} />

      {/* Shimmer sweep overlay on hover */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
        <div
          className="absolute top-0 -left-[100%] w-[100%] h-full opacity-0 group-hover:opacity-20 group-hover:left-[100%] transition-all duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5 pt-7 relative z-10">

        {/* Left: Icon & Details */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Icon box with subtle glow on hover */}
          <div className={`w-14 h-14 shrink-0 rounded-2xl ${typeAccent.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative`}>
            {/* Soft backdrop glow behind icon */}
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>
            {isBus ? <BusIcon size={26} className="text-white drop-shadow-sm" /> : <TrainIcon size={26} className="text-white drop-shadow-sm" />}
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
            {/* Name shifts color on hover */}
            <h3 className={`text-lg font-extrabold text-slate-800 tracking-tight truncate transition-colors duration-300 ${typeAccent.textColor}`}>
              {displayName}
            </h3>
          </div>
        </div>

        {/* Origin → Destination — enhanced border + hover tint */}
        <div className={`flex items-center justify-between bg-gradient-to-r ${typeAccent.routeBg} rounded-[1.5rem] px-6 py-4 border-2 ${typeAccent.routeBorder} group-hover:shadow-md group-hover:border-transparent w-full sm:w-auto shrink-0 transition-all duration-300`}>
          <div className="flex flex-col text-right gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">From</span>
            <div className="flex items-center gap-1.5 justify-end">
              <LocationIcon size={14} className="text-emerald-500" />
              <span className="font-extrabold text-slate-800 text-base truncate max-w-[100px]">{origin}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mx-4">
            <div className={`h-[2px] w-8 rounded-full bg-gradient-to-r ${typeAccent.stripe} opacity-40 group-hover:w-10 group-hover:opacity-80 transition-all duration-300`} />
            {/* Rotating arrow on hover */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${typeAccent.stripe} flex items-center justify-center shadow-md group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300`}>
              <ArrowRightIcon size={14} className="text-white drop-shadow-sm" />
            </div>
            <div className={`h-[2px] w-8 rounded-full bg-gradient-to-r ${typeAccent.stripe} opacity-40 group-hover:w-10 group-hover:opacity-80 transition-all duration-300 flex-row-reverse`} />
          </div>
          <div className="flex flex-col text-left gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">To</span>
            <div className="flex items-center gap-1.5">
              <LocationIcon size={14} className="text-rose-500" />
              <span className="font-extrabold text-slate-800 text-base truncate max-w-[100px]">{destination}</span>
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
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Seats</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${seatBarClass} transition-all duration-1000 ease-out`}
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
        <button className="btn-primary w-full md:w-auto overflow-hidden group/btn px-6 py-2.5" tabIndex={-1}>
          <span className="relative z-10 font-bold">View Details</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>
    </div>
  );
};

export default TransportCard;
