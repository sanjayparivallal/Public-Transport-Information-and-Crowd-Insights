import { ClockIcon } from '../../components/icons';

const ScheduleSection = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-8 relative overflow-hidden group">
      {/* Top gradient stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

      <div className="flex items-center text-lg font-black text-slate-800 mb-8 pb-4 border-b border-slate-50 mt-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-4 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-indigo-500/40">
          <ClockIcon size={20} />
        </div>
        Operational Schedule
      </div>
      
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {schedule.map((trip, idx) => (
          <div
            key={trip.tripId || idx}
            className="group/item flex justify-between items-center p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                 <div className="text-sm font-black text-slate-800 tracking-tight">
                   {trip.departureTime}
                 </div>
                 <div className="h-[2px] w-4 bg-slate-200 rounded-full"></div>
                 <div className="text-sm font-black text-slate-800 tracking-tight">
                   {trip.arrivalTime}
                 </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {trip.daysOfOperation?.map((day, i) => (
                  <span key={i} className="text-[8px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-tighter bg-white">
                    {day.substring(0, 3)}
                  </span>
                ))}
              </div>
            </div>
            
            <span
              className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shrink-0 shadow-sm border ${trip.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
            >
              {trip.isActive ? 'Live' : 'Off'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-50 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Subject to real-time adjustments</p>
      </div>
    </div>
  );
};

export default ScheduleSection;
