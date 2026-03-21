import { Link } from 'react-router-dom';
import { BusIcon, TrainIcon, ArrowRightIcon } from '../../components/icons';

const DashboardAssignedTransport = ({ assignedDetail, profile, assignedTransportFallback }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
          <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
            <BusIcon size={18} />
          </span>
          Assigned Duty
        </h2>
      </div>

      {assignedDetail ? (
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-6 w-full">
              {[
                { label: 'Route No.',   value: <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">{assignedDetail.transportNumber}</span> },
                { label: 'Name',        value: <span className="text-slate-900 font-semibold">{assignedDetail.name || '—'}</span> },
                { label: 'Type',        value: (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${assignedDetail.type === 'bus' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-violet-50 text-violet-700 border-violet-100'} w-fit`}>
                    {assignedDetail.type === 'bus' ? <BusIcon size={12}/> : <TrainIcon size={12}/>}
                    <span className="uppercase tracking-wide">{assignedDetail.type}</span>
                  </span>
                )},
                { label: 'Operator',    value: <span className="text-slate-700">{assignedDetail.operator || '—'}</span> },
                { label: 'Vehicle No.', value: <span className="text-slate-700">{assignedDetail.vehicleNumber || '—'}</span> },
                { label: 'Assigned Date',    value: <span className="text-slate-700">{profile?.assignedAt
                    ? new Date(profile.assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}</span> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{label}</p>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {assignedDetail.routes && assignedDetail.routes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Assigned Routes for this Duty</p>
              <div className="flex flex-col gap-3">
                {assignedDetail.routes.map(r => (
                  <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 hover:bg-slate-100/80 px-5 py-4 rounded-xl border border-slate-200/60 shadow-sm transition-colors w-full lg:w-3/4 gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">{r.origin}</span>
                      <ArrowRightIcon size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-bold text-slate-800">{r.destination}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {r.direction && (
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          {r.direction}
                        </span>
                      )}
                      <Link to={`/transport/${assignedDetail._id}?routeId=${r._id}`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : assignedTransportFallback ? (
        <div className="p-5 sm:p-6 bg-amber-50 border-t border-amber-100 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Current Assignment ID: <code className="bg-white border border-amber-200 px-2 py-1 rounded-md text-amber-700 text-xs ml-1 shadow-sm">{assignedTransportFallback}</code></p>
          <p className="text-xs text-amber-600 font-medium mt-2">Full vehicle details are currently unavailable. Please refresh or contact your supervisor.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <BusIcon size={32} className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-700">No transport assigned</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">You currently do not have an active vehicle assignment. Contact your supervisor for your shift details.</p>
        </div>
      )}
    </section>
  );
};

export default DashboardAssignedTransport;

