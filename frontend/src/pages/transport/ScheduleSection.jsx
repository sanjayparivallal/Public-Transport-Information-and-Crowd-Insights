import { ClockIcon } from '../../components/icons';

const ScheduleSection = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden group">
      <div className="flex items-center text-lg font-black text-slate-800 mb-8 pb-4 border-b border-slate-50">
        <div className="p-2 bg-indigo-50 rounded-xl mr-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
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
