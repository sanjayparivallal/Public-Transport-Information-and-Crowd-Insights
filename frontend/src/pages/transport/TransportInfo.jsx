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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50 gap-3">
        <div className="flex items-center text-lg font-bold text-slate-800">
          <LocationIcon size={24} className="mr-3 text-primary-500" />
          Transport Information
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Crowd</div>
          <CrowdBadge level={crowdLevel || 'unknown'} />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Available Seats</div>
          <div className={`text-lg font-black ${hasSeatData ? (availableSeats > 10 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-500'}`}>
            {hasSeatData ? `${availableSeats} seats` : 'No live data'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Capacity</div>
          <div className="text-lg font-black text-slate-700">{transport.totalSeats || 'N/A'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {infoKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</div>
            <div className="text-lg font-black text-slate-700 wrap-break-word">{kpi.value}</div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2 lg:col-span-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Amenities</div>
          {transport.amenities?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {transport.amenities.map((amenity, i) => (
                <span key={i} className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                  {amenity}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-lg font-black text-slate-500">N/A</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportInfo;
