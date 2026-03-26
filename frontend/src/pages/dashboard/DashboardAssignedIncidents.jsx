import { useState, useEffect, useCallback } from 'react';
import { getIncidentsByTransport } from '../../api/incidentApi';
import IncidentList from '../../components/IncidentList';
import { AlertIcon, BellIcon } from '../../components/icons';

const DashboardAssignedIncidents = ({ assignedDetail }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchIncidents = useCallback(async () => {
    if (!assignedDetail?._id) return;
    setLoading(true);
    try {
      const res = await getIncidentsByTransport(assignedDetail._id);
      const payload = res.data?.data || res.data;
      setIncidents(payload?.incidents || []);
    } catch {
      setError('Failed to load incidents for your assigned route.');
    } finally {
      setLoading(false);
    }
  }, [assignedDetail]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  if (!assignedDetail) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden mb-10 mt-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' }}
      >
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 m-0 tracking-tight">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <AlertIcon size={20} />
          </span>
          Incidents on Assigned Route
        </h2>
        {incidents.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-50 border border-rose-200 text-rose-700">
            <BellIcon size={14} />
            {incidents.length} Active{incidents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="rounded-3xl h-64 bg-slate-50 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-5 text-red-600 bg-rose-50 border-2 border-red-100 rounded-2xl shadow-sm">
            <AlertIcon size={24} className="text-red-500 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/50 rounded-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="text-lg font-black text-slate-900 mb-1 tracking-tight">All Clear</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Active Incidents Right Now</p>
          </div>
        ) : (
          <IncidentList incidents={incidents} />
        )}
      </div>
    </section>
  );
};

export default DashboardAssignedIncidents;
