import { useState } from 'react';
import { ClockIcon, WrenchIcon, AlertIcon, UsersIcon, ClipboardIcon, CheckCircleIcon, TrashIcon, LocationIcon, CalendarIcon } from './icons';

const typeIcons = {
  delay:       { Icon: ClockIcon, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
  breakdown:   { Icon: WrenchIcon, color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' },
  accident:    { Icon: AlertIcon, color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' },
  overcrowding:{ Icon: UsersIcon, color: '#8b5cf6', bg: '#f5f3ff', border: '#ede9fe' },
  other:       { Icon: ClipboardIcon,  color: '#64748b', bg: '#f8fafc', border: '#f1f5f9' },
};

const IncidentList = ({ incidents = [], onDelete }) => {
  const [previewImage, setPreviewImage] = useState(null);

  if (!incidents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
        <div className="w-20 h-20 bg-white text-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-50 border border-emerald-50">
          <CheckCircleIcon size={36} />
        </div>
        <h4 className="text-xl font-black text-slate-800 mb-2 tracking-tight">System Status: Clear</h4>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No active incidents reported at this time</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {incidents.map((inc) => {
        const cfg = typeIcons[inc.incidentType] || typeIcons.other;
        const date = inc.reportedAt
          ? new Date(inc.reportedAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : null;

        return (
          <div key={inc._id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: cfg.color }}></div>

            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-black border border-white shadow-sm shrink-0">
                  {inc.reportedBy?.name?.charAt(0) || inc.reporterRole?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-sm font-black text-slate-800 truncate">
                  {inc.reportedBy?.name || inc.reporterRole || 'Unknown'}
                </div>
              </div>

              {onDelete && (
                <button
                  className="p-2 bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 rounded-xl transition-all shadow-sm active:scale-90"
                  onClick={() => onDelete(inc._id)}
                >
                  <TrashIcon size={16}/>
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 mb-3">
              {inc.img ? (
                <img
                  src={inc.img}
                  alt="Incident evidence"
                  className="w-full h-44 object-contain bg-slate-100 cursor-zoom-in"
                  onClick={() => setPreviewImage(inc.img)}
                />
              ) : (
                <div className="h-28 flex items-center justify-center text-slate-300">
                  <cfg.Icon size={24} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg font-black text-slate-800 capitalize tracking-tight m-0">
                  {inc.incidentType}
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : inc.severity === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {inc.severity}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${inc.status === 'open' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {inc.status}
                </span>
              </div>

              {inc.description && (
                <p className="text-slate-600 text-sm font-medium leading-snug">
                  {inc.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-50 space-y-2">
                {inc.location && (
                  <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                    <LocationIcon size={12} className="text-primary-500" />
                    {inc.location}
                  </div>
                )}

                {date && (
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                    <CalendarIcon size={12} className="text-primary-500" />
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
        className="fixed inset-0 z-120 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setPreviewImage(null)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && setPreviewImage(null)}
      >
        <div
          className="relative w-[75vw] h-[75vh] max-w-300 bg-slate-950 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-black uppercase tracking-wider"
            onClick={() => setPreviewImage(null)}
          >
            Close
          </button>
          <img
            src={previewImage}
            alt="Incident evidence preview"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    )}
    </>
  );
};

export default IncidentList;
