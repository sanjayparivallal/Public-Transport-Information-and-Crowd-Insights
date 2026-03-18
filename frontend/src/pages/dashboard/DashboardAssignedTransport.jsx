import { Link } from 'react-router-dom';
import { BusIcon, TrainIcon } from '../../components/icons';

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

            <Link to={`/transport/${assignedDetail._id}`} className="btn-primary shrink-0">
              View Duty Details →
            </Link>
          </div>
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
