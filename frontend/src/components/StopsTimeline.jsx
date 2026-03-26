import { LocationIcon, ClockIcon } from './icons';

const StopsTimeline = ({ stops = [], currentStop }) => {
  if (!stops.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center mb-5 border border-slate-100">
           <LocationIcon size={32} />
        </div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No stop markers defined</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 sm:pl-10 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
      {stops.map((stop, idx) => {
        const isFirst    = idx === 0;
        const isLast     = idx === stops.length - 1;
        const isCurrent  = currentStop && stop.stopName?.trim().toLowerCase() === currentStop?.trim().toLowerCase();
        const stopTime   = stop.scheduledDeparture || stop.scheduledArrival || null;

        return (
          <div
            key={stop.stopOrder || idx}
            className={`group relative p-5 sm:p-6 rounded-[1.5rem] transition-all duration-300 border-2 ${isCurrent ? 'bg-primary-50/50 border-primary-200 shadow-[0_4px_20px_rgb(59,130,246,0.1)]' : 'bg-white border-slate-100/50 hover:border-slate-200 hover:shadow-sm'}`}
          >
            {/* Premium Timeline Node Indicator */}
            <div 
              className={`absolute -left-[2.1rem] sm:-left-[2.6rem] top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 bg-white z-10 transition-all duration-500 flex items-center justify-center shadow-sm ${isCurrent ? 'scale-110 border-primary-500' : isFirst ? 'border-emerald-500' : isLast ? 'border-rose-500' : 'border-slate-200 group-hover:border-primary-300'}`} 
            >
               <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isCurrent ? 'bg-primary-500 animate-pulse' : isFirst ? 'bg-emerald-500' : isLast ? 'bg-rose-500' : 'bg-slate-200 group-hover:bg-primary-400'} transition-colors duration-300`}></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0 space-y-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h6 className={`font-black text-xl sm:text-2xl tracking-tight transition-colors duration-300 ${isCurrent ? 'text-primary-700' : 'text-slate-800'}`}>
                    {stop.stopName}
                  </h6>
                  {isCurrent && (
                    <span className="flex items-center px-3 py-1 rounded-lg bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm shadow-primary-500/30">
                      Live Position
                    </span>
                  )}
                  {isFirst && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest shadow-sm">Origin Platform</span>}
                  {isLast  && <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 uppercase tracking-widest shadow-sm">Terminal Hub</span>}
                </div>
                
                <div className="flex flex-wrap gap-3 text-xs">
                  {stop.platformNumber && (
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border bg-slate-50 text-slate-500 border-slate-200">Plat {stop.platformNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {stopTime && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors duration-300 shadow-sm shrink-0 border border-slate-100 ${isCurrent ? 'bg-white' : 'bg-slate-50 group-hover:bg-white'}`}>
                  <ClockIcon size={14} className={isCurrent ? 'text-primary-500' : 'text-slate-400 group-hover:text-primary-500'} />
                  <span className={`text-sn font-black tracking-tight ${isCurrent ? 'text-primary-700' : 'text-slate-600 group-hover:text-slate-800'}`}>{stopTime}</span>
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

