import { useState, useEffect } from 'react';
import { getAllCrowdReports, deleteCrowdReport } from '../../api/crowdApi';
import CrowdBadge from '../../components/CrowdBadge';
import { UsersIcon, ClockIcon, TrashIcon, ActivityIcon } from '../../components/icons';

const DashboardMyCrowdReports = () => {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await getAllCrowdReports();
      const payload = res.data?.data || res.data;
      setReports(payload?.crowdReports || payload?.reports || []);
    } catch {
      setError('Failed to load your crowd reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Delete this crowd report?")) return;
    try {
      await deleteCrowdReport(id);
      await fetchMyReports();
    } catch (err) {
      alert(err.message || "Failed to delete report.");
    }
  };

  const fmtTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-10">
      {/* Crisp Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 m-0 tracking-tight">
          <span className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <UsersIcon size={20} />
          </span>
          My Crowd Reports
        </h2>
        
        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-50 border border-blue-200 text-blue-700">
              <ActivityIcon size={14} />
              {reports.length} Records
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-5 text-red-600 bg-white border-2 border-red-100 rounded-2xl shadow-sm">
            <p className="font-bold">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5">
              <UsersIcon size={32} />
            </div>
            <p className="text-xl font-black text-slate-900 mb-2 tracking-tight">No crowd reports yet</p>
            <p className="text-sm font-bold text-slate-500 max-w-sm">Submit crowd levels on any transport page to see them here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((r, i) => (
              <div key={r._id || i}
                className="flex items-center justify-between gap-4 px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                
                <div className="flex items-center gap-5 min-w-0">
                  <div className="shrink-0">
                    <CrowdBadge level={r.crowdLevel} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <p className="text-base font-black text-slate-900 truncate flex items-center gap-2">
                      {r.transport?.name || r.transportName || 'Transport'}
                      {r.transport?.transportNumber && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                          #{r.transport.transportNumber}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-bold uppercase tracking-wider">
                      <ClockIcon size={12} className="text-slate-400" />
                      {fmtTime(r.createdAt || r.reportedAt)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleDeleteReport(r._id)}
                    className="p-2 border-2 border-slate-100 text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                    title="Delete Report"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardMyCrowdReports;
