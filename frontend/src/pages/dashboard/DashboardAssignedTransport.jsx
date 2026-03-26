import { Link } from 'react-router-dom';
import { BusIcon, TrainIcon, ArrowRightIcon, MapPinIcon } from '../../components/icons';

const InfoCell = ({ label, children }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
    <div className="text-sm font-bold">{children}</div>
  </div>
);

const DashboardAssignedTransport = ({ assignedDetail, profile, assignedTransportFallback }) => {
  const isBus = assignedDetail?.type === 'bus';

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-50 border border-cyan-100 shrink-0">
          {assignedDetail?.type === 'train' ? <TrainIcon size={20} className="text-cyan-600" /> : <BusIcon size={20} className="text-cyan-600" />}
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">Assigned Duty</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Your active transport</p>
        </div>
      </div>

      {assignedDetail ? (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.09)] transition-all duration-300">
          {/* Top accent */}
          <div
            className="h-1.5 w-full"
            style={{ background: isBus ? 'linear-gradient(90deg, #2563eb, #6366f1)' : 'linear-gradient(90deg, #7c3aed, #d946ef)' }}
          />

          {/* Main body */}
          <div className="p-6 sm:p-8">
            {/* Transport identity */}
            <div className="flex items-start gap-4 mb-7 pb-6 border-b border-slate-100">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border"
                style={isBus
                  ? { background: 'rgba(219,234,254,0.5)', borderColor: 'rgba(59,130,246,0.2)' }
                  : { background: 'rgba(237,233,254,0.5)', borderColor: 'rgba(139,92,246,0.2)' }}
              >
                {isBus
                  ? <BusIcon size={26} className="text-blue-600" />
                  : <TrainIcon size={26} className="text-violet-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                    style={isBus
                      ? { background: 'rgba(219,234,254,0.6)', color: '#2563eb', borderColor: 'rgba(59,130,246,0.2)' }
                      : { background: 'rgba(237,233,254,0.6)', color: '#7c3aed', borderColor: 'rgba(139,92,246,0.2)' }}
                  >
                    #{assignedDetail.transportNumber}
                  </span>
                  <span className="inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Active
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{assignedDetail.name}</h3>
                {assignedDetail.operator && (
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{assignedDetail.operator}</p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6 mb-7">
              <InfoCell label="Vehicle Type">
                <span className="capitalize text-slate-800">{assignedDetail.type || '—'}</span>
              </InfoCell>
              <InfoCell label="Vehicle No.">
                <span className="text-slate-800">{assignedDetail.vehicleNumber || '—'}</span>
              </InfoCell>
              <InfoCell label="Total Seats">
                <span className="text-slate-800">{assignedDetail.totalSeats || '—'}</span>
              </InfoCell>
              <InfoCell label="Assigned Date">
                <span className="text-slate-800">
                  {profile?.assignedAt
                    ? new Date(profile.assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </InfoCell>
            </div>

            {/* Routes */}
            {assignedDetail.routes && assignedDetail.routes.length > 0 && (
              <div className="pt-5 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">
                  Routes on this Duty
                </p>
                <div className="flex flex-col gap-3">
                  {assignedDetail.routes.map(r => (
                    <div
                      key={r._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/70 hover:bg-slate-50 px-5 py-4 rounded-2xl border border-slate-200/60 transition-all duration-200 gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MapPinIcon size={15} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-black text-slate-800 truncate">{r.origin}</span>
                        <ArrowRightIcon size={14} className="text-slate-300 shrink-0" />
                        <span className="text-sm font-black text-slate-800 truncate">{r.destination}</span>
                        {r.direction && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                            {r.direction}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/transport/${assignedDetail._id}?routeId=${r._id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                      >
                        View Route <ArrowRightIcon size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : assignedTransportFallback ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
          <p className="font-black text-slate-800 text-sm mb-1">
            Assignment ID: <code className="bg-white border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700 text-xs ml-1">{assignedTransportFallback}</code>
          </p>
          <p className="text-xs text-amber-600 font-bold">Full vehicle details unavailable. Please refresh or contact your supervisor.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-14 flex flex-col items-center text-center shadow-sm">
          <div className="w-20 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 gap-2">
            <BusIcon size={24} className="text-slate-300" />
            <TrainIcon size={24} className="text-slate-300" />
          </div>
          <p className="text-base font-black text-slate-700 mb-1">No transport assigned</p>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            You currently don't have an active vehicle assignment. Contact your supervisor for shift details.
          </p>
        </div>
      )}
    </section>
  );
};

export default DashboardAssignedTransport;
