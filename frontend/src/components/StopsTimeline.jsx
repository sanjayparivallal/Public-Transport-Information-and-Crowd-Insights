import { LocationIcon, ClockIcon } from './icons';

const StopsTimeline = ({ stops = [], currentStop }) => {
  if (!stops.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white text-slate-300 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
           <LocationIcon size={32} />
        </div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No stop markers defined</p>
      </div>
    );
  }

  return (
    <div className="relative pl-7 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:rounded-full">
      {stops.map((stop, idx) => {
        const isFirst    = idx === 0;
        const isLast     = idx === stops.length - 1;
        const isCurrent  = currentStop && stop.stopName?.trim().toLowerCase() === currentStop?.trim().toLowerCase();
        const stopTime   = stop.scheduledDeparture || stop.scheduledArrival || null;

        return (
          <div
            key={stop.stopOrder || idx}
            className={`group relative p-4 rounded-2xl transition-all duration-300 border ${isCurrent ? 'bg-primary-50/40 border-primary-200 shadow-sm shadow-primary-100/20' : 'bg-white border-slate-100 hover:shadow-sm'}`}
          >
            {/* Timeline Indicator */}
            <div 
              className={`absolute -left-5.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 bg-white z-10 transition-all duration-300 shadow-sm flex items-center justify-center ${isCurrent ? 'scale-110 border-primary-500 ring-2 ring-primary-50' : isFirst ? 'border-emerald-500' : isLast ? 'border-rose-500' : 'border-slate-200 group-hover:border-primary-400'}`} 
            >
               <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-primary-500' : isFirst ? 'bg-emerald-500' : isLast ? 'bg-rose-500' : 'bg-slate-200 group-hover:bg-primary-400'}`}></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h6 className={`font-black text-xl tracking-tight transition-colors duration-300 ${isCurrent ? 'text-primary-600' : 'text-slate-800'}`}>
                    {stop.stopName}
                  </h6>
                  {isCurrent && (
                    <span className="flex items-center px-2.5 py-0.5 rounded-full bg-primary-600 text-yellow-500 text-[8px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                      Current
                    </span>
                  )}
                  {isFirst && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">Origin Stop</span>}
                  {isLast  && <span className="text-[8px] font-black text-rose-600 bg-rose-50/80 px-2.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-widest shadow-sm">Terminal Stop</span>}
                </div>
                
                <div className="flex flex-wrap gap-3 text-xs">
                  {stop.platformNumber && (
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Berth</span>
                       <span className="font-black text-primary-600">Platform {stop.platformNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {stopTime && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl shadow-inner group-hover:bg-white transition-colors duration-300 group-hover:shadow-sm">
                  <ClockIcon size={12} className="text-primary-500" />
                  <span className="text-sm font-black text-slate-800 tracking-tight">{stopTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StopsTimeline;
