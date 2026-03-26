import { LocationIcon } from '../../components/icons';
import CrowdBadge from '../../components/CrowdBadge';

const TransportInfo = ({ transport, crowdLevel, availableSeats }) => {
  const hasSeatData = availableSeats !== null && availableSeats !== undefined;
  const infoKpis = [
    { label: 'Transport No.', value: transport.transportNumber || 'N/A' },
    { label: 'Type', value: transport.type ? String(transport.type).toUpperCase() : 'N/A' },
    { label: 'Operator', value: transport.operator || 'N/A' },
    { label: 'Vehicle No.', value: transport.vehicleNumber || 'N/A' },
    { label: 'Total Seats', value: transport.totalSeats || 'N/A' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 mb-8 relative overflow-hidden">
      {/* Top gradient stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <LocationIcon size={120} />
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100 gap-3 relative z-10 mt-2">
        <div className="flex items-center text-xl font-black text-slate-800 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mr-4 shadow-md shadow-blue-500/20">
            <LocationIcon size={20} />
          </div>
          Transport Identity
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 relative z-10">
        <div className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Live Crowd status
          </div>
          <div className="mt-1">
             <CrowdBadge level={crowdLevel || 'unknown'} />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${hasSeatData ? 'bg-emerald-400' : 'bg-slate-300'}`}></span> Available Seats
          </div>
          <div className={`text-2xl tracking-tight font-black ${hasSeatData ? (availableSeats > 10 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
            {hasSeatData ? `${availableSeats} seats` : 'Offline'}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Total Capacity
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">{transport.totalSeats || 'N/A'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 relative z-10">
        {infoKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{kpi.label}</div>
            <div className="text-sm font-black text-slate-800 break-words">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Onboard Amenities
        </div>
        {transport.amenities?.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {transport.amenities.map((amenity, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-black border border-slate-200 shadow-sm flex items-center gap-1">
                {amenity}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm font-black text-slate-400">No amenities listed</div>
        )}
      </div>
    </div>
  );
};

export default TransportInfo;

