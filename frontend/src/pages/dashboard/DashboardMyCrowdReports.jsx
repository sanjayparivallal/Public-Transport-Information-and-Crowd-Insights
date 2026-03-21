import { useState, useEffect } from 'react';
import { getAllCrowdReports, deleteCrowdReport } from '../../api/crowdApi';
import CrowdBadge from '../../components/CrowdBadge';
import { UsersIcon, ClockIcon, TrashIcon } from '../../components/icons';

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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2">
          <UsersIcon size={18} className="text-blue-600" />
          My Crowd Reports
        </h2>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">{reports.length} records</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-3xl border border-slate-200" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-3xl border border-red-200 p-6 sm:p-8 text-red-600 text-sm">{error}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center text-slate-500">
          <UsersIcon size={32} className="text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">No crowd reports yet</p>
          <p className="text-sm mt-1">Submit crowd levels on any transport page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {reports.map((r, i) => (
            <div key={r._id || i} className="flex items-center gap-4 px-5 py-3.5">
              <CrowdBadge level={r.crowdLevel} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {r.transport?.name || r.transportName || 'Transport'}
                  {r.transport?.transportNumber && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">{r.transport.transportNumber}</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <ClockIcon size={12} />
                  {fmtTime(r.createdAt || r.reportedAt)}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteReport(r._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Report"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardMyCrowdReports;
