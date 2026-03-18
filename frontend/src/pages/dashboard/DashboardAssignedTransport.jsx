import { Link } from 'react-router-dom';
import { BusIcon, TrainIcon, ArrowRightIcon } from '../../components/icons';

const DashboardAssignedTransport = ({ assignedDetail, profile, assignedTransportFallback }) => {
  return (
    <section>
      <h2 className="flex items-center gap-2 mb-4">
        <BusIcon size={18} className="text-blue-600" />
        Assigned Transport
      </h2>

      {assignedDetail ? (
        <div className="card card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 flex-1">
              {[
                { label: 'Route No.',   value: <span className="badge badge-blue">{assignedDetail.transportNumber}</span> },
                { label: 'Name',        value: assignedDetail.name || '—' },
                { label: 'Type',        value: (
                  <span className={`badge ${assignedDetail.type === 'bus' ? 'badge-blue' : 'badge-purple'} flex items-center gap-1 w-fit`}>
                    {assignedDetail.type === 'bus' ? <BusIcon size={12}/> : <TrainIcon size={12}/>}
                    {assignedDetail.type}
                  </span>
                )},
                { label: 'Operator',    value: assignedDetail.operator || '—' },
                { label: 'Vehicle No.', value: assignedDetail.vehicleNumber || '—' },
                { label: 'Assigned',    value: profile?.assignedAt
                    ? new Date(profile.assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                  <div className="text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {assignedDetail.routes && assignedDetail.routes.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-widest">Assigned Routes</p>
              <div className="flex flex-col gap-2">
                {assignedDetail.routes.map(r => (
                  <div key={r._id} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full md:w-2/3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{r.origin}</span>
                      <ArrowRightIcon size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-700">{r.destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.direction && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                          {r.direction}
                        </span>
                      )}
                      <Link to={`/transport/${assignedDetail._id}?routeId=${r._id}`} className="btn-primary py-1 px-3 text-xs w-auto whitespace-nowrap">
                        View Duty Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : assignedTransportFallback ? (
        <div className="card card-body text-sm text-slate-600">
          <p>Current Assignment ID: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600">{assignedTransportFallback}</code></p>
          <p className="text-xs text-slate-400 mt-1">Vehicle details unavailable. Refresh or contact your supervisor.</p>
        </div>
      ) : (
        <div className="empty-state card card-body">
          <BusIcon size={32} className="text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">No transport assigned</p>
          <p className="text-sm mt-1">Contact your supervisor for shift assignment.</p>
        </div>
      )}
    </section>
  );
};

export default DashboardAssignedTransport;
