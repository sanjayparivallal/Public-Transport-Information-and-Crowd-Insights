import { LocationIcon, ClockIcon } from './icons';

// ENHANCED: Full design system StopsTimeline — uses .badge-* from index.scss

const StopsTimeline = ({ stops = [], currentStop }) => {
  if (!stops.length) {
    return (
      // ENHANCED: .card base for empty state
      <div className="card flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
          <LocationIcon size={24} />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No stop markers defined</p>
      </div>
    );
  }

  return (
    // ENHANCED: gradient vertical line wrapper
    <div className="relative pl-10">
      {/* ENHANCED: gradient timeline line cyan → violet → slate */}
      <div
        className="absolute left-4 top-3 bottom-3 w-0.5 rounded-full"
        style={{ background: 'linear-gradient(to bottom, #0891b2, rgba(124,58,237,0.3), #e2e8f0)' }}
      />

      <div className="space-y-4">
        {stops.map((stop, idx) => {
          const isFirst   = idx === 0;
          const isLast    = idx === stops.length - 1;
          const isCurrent = currentStop && stop.stopName?.trim().toLowerCase() === currentStop?.trim().toLowerCase();
          const currentIdx = stops.findIndex(s => s.stopName?.trim().toLowerCase() === currentStop?.trim().toLowerCase());
          const isPast    = currentIdx > -1 && idx < currentIdx;
          const stopTime  = stop.scheduledDeparture || stop.scheduledArrival || null;

          return (
            // ENHANCED: .card + .animate-fade-in-up stagger + cyan bg for current stop
            <div
              key={stop.stopOrder || idx}
              className={`card animate-fade-in-up relative ${
                isCurrent ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200' : ''
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* ENHANCED: status left border for current stop */}
              {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-cyan-400 to-blue-500" />}

              {/* ENHANCED: stop dot on timeline */}
              <div className="absolute -left-[1.65rem] top-1/2 -translate-y-1/2 z-10">
                {isCurrent ? (
                  // ENHANCED: current — cyan pulsing dot
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <span className="animate-ping absolute w-full h-full rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white shadow-lg" />
                  </div>
                ) : isPast ? (
                  // ENHANCED: completed — emerald checkmark dot
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow-sm flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="1.5 5.5 4 8 8.5 2.5" /></svg>
                  </div>
                ) : isFirst ? (
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow-sm" />
                ) : isLast ? (
                  // ENHANCED: last — violet (terminal)
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-white shadow-sm" />
                ) : (
                  // ENHANCED: upcoming — outlined white dot
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white" />
                )}
              </div>

              <div className="p-4 pl-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h6 className={`font-extrabold text-lg tracking-tight ${isCurrent ? 'text-cyan-700' : 'text-slate-800'}`}>
                        {stop.stopName}
                      </h6>
                      {/* ENHANCED: .badge-* for all status indicators */}
                      {isCurrent && (
                        <span className="badge badge-cyan">
                          <div className="relative flex w-2 h-2">
                            <span className="animate-ping absolute w-full h-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                          </div>
                          Live Position
                        </span>
                      )}
                      {isFirst && <span className="badge badge-emerald">Origin Platform</span>}
                      {isLast  && <span className="badge badge-purple">Terminal Hub</span>}
                    </div>

                    {stop.platformNumber && (
                      <span className="badge badge-indigo">Plat {stop.platformNumber}</span>
                    )}
                  </div>

                  {stopTime && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shrink-0 border ${
                      isCurrent ? 'bg-white border-cyan-200' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <ClockIcon size={14} className={isCurrent ? 'text-cyan-500' : 'text-slate-400'} />
                      <span className={`text-sm font-black tracking-tight ${isCurrent ? 'text-cyan-700' : 'text-slate-600'}`}>
                        {stopTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StopsTimeline;
