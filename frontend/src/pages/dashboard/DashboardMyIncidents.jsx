import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../../api/incidentApi';
import IncidentList from '../../components/IncidentList';
import { ClipboardIcon, BellIcon, ActivityIcon } from '../../components/icons';

const DashboardMyIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchMyIncidents = async () => {
    setLoading(true);
    try {
      const res = await getAllIncidents();
      const payload = res.data?.data || res.data;
      setIncidents(payload?.incidents || []);
    } catch {
      setError('Failed to load your incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyIncidents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident report?')) return;
    try {
      await deleteIncident(id);
      setIncidents(p => p.filter(i => i._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete.');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-10">
      {/* Crisp Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 m-0 tracking-tight">
          <span className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
            <ClipboardIcon size={20} />
          </span>
          My Incident Reports
        </h2>
        
        <div className="flex items-center gap-2">
          {incidents.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-50 border border-indigo-200 text-indigo-700">
              <BellIcon size={14} />
              {incidents.length} Records
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-3xl h-64 bg-slate-50 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-5 text-red-600 bg-white border-2 border-red-100 rounded-2xl shadow-sm">
            <ClipboardIcon size={24} className="text-red-500" />
            <p className="font-bold">{error}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-5">
              <ClipboardIcon size={32} />
            </div>
            <p className="text-xl font-black text-slate-900 mb-2 tracking-tight">No incident reports yet</p>
            <p className="text-sm font-bold text-slate-500 max-w-sm">Reports you submit will appear here. They help authorities manage active issues.</p>
          </div>
        ) : (
          <IncidentList incidents={incidents} onDelete={handleDelete} />
        )}
      </div>
    </section>
  );
};

export default DashboardMyIncidents;

