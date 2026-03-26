import { useNavigate } from 'react-router-dom';
import CrowdBadge from './CrowdBadge';
import { BusIcon, TrainIcon, ClockIcon, BuildingIcon, ArrowRightIcon } from './icons';

const TransportCard = ({ transport }) => {
  const navigate = useNavigate();

  // Search results are Route documents with a nested `transportId` object.
  // The /transport/:id route expects a Transport _id, not a Route _id.
  const t = transport.transportId || transport; // nested transport doc, or flat doc
  const transportId = t._id || transport._id;  // actual transport's MongoDB _id
  const routeId = transport._id; // The query returns Route models basically.

  const origin = transport.origin || '—';
  const destination = transport.destination || '—';
  const departure = transport.schedule?.[0]?.departureTime || null;
  const arrival = transport.schedule?.[0]?.arrivalTime || null;

  const displayNumber = t.transportNumber || transport.transportNumber || '—';
  const displayName = t.name || transport.name || '—';
  const displayType = t.type || transport.type || 'bus';
  const displayOp = t.operator || transport.operator || null;
  const crowdLevel = transport.crowdLevel || null;
  const displayAvailableSeats = transport.availableSeats ?? t.availableSeats ?? t.totalSeats ?? '—';
  const displayTotalSeats = t.totalSeats || 1;
  const isBus = displayType === 'bus';

  const seatPct = Math.round(((displayAvailableSeats === '—' ? 0 : displayAvailableSeats) / displayTotalSeats) * 100);

  return (
    <div
      className="group bg-white rounded-[2rem] p-5 sm:p-6 mb-4 border-2 border-slate-100 hover:border-blue-200 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden relative flex flex-col"
      onClick={() => navigate(`/transport/${transportId}?routeId=${routeId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}?routeId=${routeId}`)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 w-full">
        {/* Left Side: Icon & Details */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 grow min-w-0">
          <div className="w-16 h-16 shrink-0 rounded-[1.25rem] border border-indigo-100 bg-indigo-50/80 text-indigo-600 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
             <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-white opacity-60 mix-blend-overlay"></div>
             {isBus ? <BusIcon size={28} /> : <TrainIcon size={28} />}
          </div>
          <div className="flex flex-col min-w-0 pr-4">
             <div className="flex items-center gap-2 mb-2 flex-wrap">
               <span className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border bg-slate-50 text-slate-600 border-slate-200 shadow-sm">{displayNumber}</span>
               <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm ${isBus ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{displayType}</span>
               {displayOp && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm bg-slate-50 text-slate-500 border-slate-200 truncate max-w-[150px] items-center gap-1.5">
                    <BuildingIcon size={12} className="text-slate-400" /> {displayOp}
                  </span>
               )}
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">
               {displayName}
             </h3>
          </div>
        </div>

        {/* Center: Route Block */}
        <div className="flex items-center justify-center gap-4 shrink-0 px-6 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 w-full sm:w-auto mt-2 lg:mt-0">
          <div className="text-right flex flex-col justify-center">
             <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">Origin</span>
             <span className="text-sm font-black text-slate-800 truncate max-w-[100px] sm:max-w-none">{origin}</span>
          </div>
          <div className="flex items-center justify-center px-2">
             <div className="w-12 sm:w-16 h-px bg-slate-300 relative group-hover:bg-blue-300 group-hover:w-20 sm:group-hover:w-24 transition-all duration-500">
                <ArrowRightIcon size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 bg-slate-50 px-1 group-hover:text-blue-500 group-hover:translate-x-3 transition-all duration-500" />
             </div>
          </div>
          <div className="text-left flex flex-col justify-center">
             <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">Destination</span>
             <span className="text-sm font-black text-slate-800 truncate max-w-[100px] sm:max-w-none">{destination}</span>
          </div>
        </div>

        {/* Right Side: Schedule & Details Button */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 w-full lg:w-auto mt-4 lg:mt-0 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
           <div className="flex items-center gap-4">
              {departure && (
                 <div className="flex flex-col items-start lg:items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><ClockIcon size={10} /> Depart</span>
                    <span className="text-sm font-black text-slate-900">{departure}</span>
                 </div>
              )}
              {departure && arrival && <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>}
              {arrival && (
                 <div className="flex flex-col items-start">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Arrive</span>
                    <span className="text-sm font-black text-slate-900">{arrival}</span>
                 </div>
              )}
           </div>
           
           <div className="scale-90 lg:scale-100 origin-left lg:origin-right flex justify-end">
              <CrowdBadge level={crowdLevel} />
           </div>
        </div>
      </div>

      {/* Footer: Live Status and Seats */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 w-full">
         <div className="flex lg:items-center gap-6 grow overflow-hidden flex-col lg:flex-row lg:pr-6">
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-sm"></div>
              <span className="text-[10px] font-black tracking-widest uppercase">Live Tracking Active</span>
            </div>
            
            {/* Seat Map Horizontal Bar */}
            <div className="flex-grow w-full lg:max-w-sm flex items-center gap-3">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Seats</span>
               <div className="h-2 grow bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                     width: `${Math.min(displayAvailableSeats === '—' ? 0 : seatPct, 100)}%`,
                     backgroundColor: displayAvailableSeats === '—' ? '#cbd5e1' : seatPct <= 20 ? '#ef4444' : seatPct >= 70 ? '#10b981' : '#f59e0b'
                  }} />
               </div>
               <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">
                  <span className={displayAvailableSeats === '—' ? 'text-slate-500' : seatPct <= 20 ? 'text-red-500' : seatPct >= 70 ? 'text-emerald-500' : 'text-amber-500'}>
                    {displayAvailableSeats}
                  </span> <span className="text-slate-300">/</span> {displayTotalSeats !== 1 ? displayTotalSeats : '?'}
               </span>
            </div>
         </div>
         
         {/* Button */}
         <button 
            className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-slate-50 text-slate-600 border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shrink-0 shadow-sm w-full md:w-auto"
            tabIndex={-1}
         >
            Inspect Details
            <ArrowRightIcon size={14} className="group-hover:translate-x-1 group-hover:opacity-100 opacity-60 transition-all" />
         </button>
      </div>
    </div>
  );
};

export default TransportCard;

