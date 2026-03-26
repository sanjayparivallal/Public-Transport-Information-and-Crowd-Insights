import { useState } from 'react';
import { ClockIcon, WrenchIcon, AlertIcon, UsersIcon, ClipboardIcon, CheckCircleIcon, TrashIcon, LocationIcon, CalendarIcon, BusIcon, TrainIcon } from './icons';

const typeIcons = {
  delay:       { Icon: ClockIcon, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
  breakdown:   { Icon: WrenchIcon, color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' },
  accident:    { Icon: AlertIcon, color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' },
  overcrowding:{ Icon: UsersIcon, color: '#8b5cf6', bg: '#f5f3ff', border: '#ede9fe' },
  other:       { Icon: ClipboardIcon,  color: '#64748b', bg: '#f8fafc', border: '#f1f5f9' },
};

const IncidentList = ({ incidents = [], onDelete, onAction, actionLabel = 'Manage' }) => {
  const [previewImage, setPreviewImage] = useState(null);

  if (!incidents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon size={36} />
        </div>
        <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">System Status: Clear</h4>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active incidents reported</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {incidents.map((inc) => {
        const cfg = typeIcons[inc.incidentType] || typeIcons.other;
        const date = inc.reportedAt
          ? new Date(inc.reportedAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : null;

        return (
          <div key={inc._id} className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col">
            {/* Header: User & Actions */}
            <div className="flex items-start justify-between gap-3 mb-5 mt-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {inc.reportedBy?.name?.charAt(0) || inc.reporterRole?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-black text-slate-900 truncate">
                    {inc.reportedBy?.name || inc.reporterRole || 'Unknown'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    Reporter
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onAction && (
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
                    onClick={() => onAction(inc)}
                  >
                    <WrenchIcon size={14}/> {actionLabel}
                  </button>
                )}
                {onDelete && (
                  <button
                    className="p-1.5 border-2 border-red-100 text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                    onClick={() => onDelete(inc._id)}
                    title="Delete"
                  >
                    <TrashIcon size={16}/>
                  </button>
                )}
              </div>
            </div>

            {/* Transport context */}
            {inc.transportId && (
              <div className="flex items-center gap-2 mb-4">
                <div className={`text-${inc.transportId.type === 'train' ? 'violet' : 'blue'}-600`}>
                  {inc.transportId.type === 'train' ? <TrainIcon size={16} /> : <BusIcon size={16} />}
                </div>
                <div className="text-sm font-black text-slate-800 truncate">{inc.transportId.name}</div>
                <div className="text-xs font-bold text-slate-400">#{inc.transportId.transportNumber}</div>
              </div>
            )}

            {/* Image or Icon placeholder */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 mb-5 relative group-hover:border-slate-300 transition-colors">
              {inc.img ? (
                <img
                  src={inc.img}
                  alt="Incident evidence"
                  className="w-full h-48 object-contain cursor-zoom-in"
                  onClick={() => setPreviewImage(inc.img)}
                />
              ) : (
                <div className="h-32 flex items-center justify-center opacity-50" style={{ color: cfg.color }}>
                  <cfg.Icon size={32} />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <h4 className="text-lg font-black text-slate-900 capitalize tracking-tight m-0 mr-2">
                  {inc.incidentType}
                </h4>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-white text-red-600 border-red-200' : inc.severity === 'medium' ? 'bg-white text-amber-600 border-amber-200' : 'bg-white text-emerald-600 border-emerald-200'}`}>
                  {inc.severity}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${inc.status === 'open' ? 'bg-white text-indigo-600 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {inc.status}
                </span>
              </div>

              {inc.description && (
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                  {inc.description}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                {inc.location && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <LocationIcon size={14} className="text-slate-400" />
                    <span className="truncate">{inc.location}</span>
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 justify-end">
                    <CalendarIcon size={14} className="text-slate-400" />
                    {date}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {previewImage && (
      <div
        className="fixed inset-0 z-120 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
        onClick={() => setPreviewImage(null)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && setPreviewImage(null)}
      >
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 bg-white text-xs font-black uppercase tracking-wider transition-all"
            onClick={() => setPreviewImage(null)}
          >
            Close
          </button>
          <img
            src={previewImage}
            alt="Incident evidence preview"
            className="w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      </div>
    )}
    </>
  );
};

export default IncidentList;

