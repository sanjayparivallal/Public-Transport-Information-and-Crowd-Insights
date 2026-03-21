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

  const origin      = transport.origin      || '—';
  const destination = transport.destination || '—';
  const departure   = transport.schedule?.[0]?.departureTime || null;
  const arrival     = transport.schedule?.[0]?.arrivalTime   || null;

  const displayNumber = t.transportNumber || transport.transportNumber || '—';
  const displayName   = t.name            || transport.name            || '—';
  const displayType   = t.type            || transport.type            || 'bus';
  const displayOp     = t.operator        || transport.operator        || null;
  const crowdLevel    = transport.crowdLevel || null;
  const displayAvailableSeats = transport.availableSeats ?? t.availableSeats ?? t.totalSeats ?? '—';
  const displayTotalSeats = t.totalSeats || '?';

  return (
    <div
      className="group relative bg-white rounded-[1.9rem] p-6 mb-4 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.995] border-l-0"
      onClick={() => navigate(`/transport/${transportId}?routeId=${routeId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/transport/${transportId}?routeId=${routeId}`)}
    >
      {/* Decorative accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 transition-all duration-500 group-hover:w-3 ${displayType === 'bus' ? 'bg-primary-500' : 'bg-indigo-600'}`}></div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 grow">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-4 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-[10px] font-black tracking-[0.2em] border border-slate-200 shadow-sm">
              {displayNumber}
            </span>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${displayType === 'bus' ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
              {displayType === 'bus' ? <BusIcon size={14} /> : <TrainIcon size={14} />} 
              {displayType}
            </div>
            {displayOp && (
              <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <BuildingIcon size={14} className="mr-2 text-slate-300"/> 
                {displayOp}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1 duration-300">
            {displayName}
          </h3>
          
          <div className="flex items-center text-slate-500 font-bold bg-slate-50/50 w-fit px-4 py-2 rounded-2xl border border-slate-100 gap-3 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Origin</span>
              <span className="text-slate-700 font-black">{origin}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:border-primary-100 group-hover:rotate-360 transition-all duration-700">
              <ArrowRightIcon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Final Destination</span>
              <span className="text-slate-700 font-black">{destination}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3.5 shrink-0">
          <div className="scale-95 origin-right transition-transform group-hover:scale-105 duration-500">
            <CrowdBadge level={crowdLevel} />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-3">
            {departure && (
              <div className="flex flex-col items-end px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm group-hover:bg-emerald-100 transition-colors">
                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5 flex items-center">
                  <ClockIcon size={10} className="mr-1"/> Depart
                </label>
                <div className="text-emerald-700 font-black text-base leading-tight">{departure}</div>
              </div>
            )}
            {arrival && (
              <div className="flex flex-col items-end px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Arrive</label>
                <div className="text-slate-700 font-black text-base leading-tight">{arrival}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary-400 transition-colors">
            <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Live Status</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
            <span>Seats:</span>
            <span className={`px-2 py-0.5 rounded border ${displayAvailableSeats === '—' ? 'bg-slate-50 text-slate-600 border-slate-200' : (displayAvailableSeats > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200')}`}>
              {displayAvailableSeats}
            </span>
            <span className="text-slate-400">/ {displayTotalSeats}</span>
          </div>
        </div>
        
        <button className="flex items-center gap-2.5 px-5 py-2 bg-slate-900 group-hover:bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 group-hover:shadow-primary-200 group-hover:-translate-y-1">
          Inspect Details
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TransportCard;

