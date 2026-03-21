import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../../api/incidentApi';
import IncidentList from '../../components/IncidentList';
import { ClipboardIcon } from '../../components/icons';

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
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden auto-rows-max mb-8">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <ClipboardIcon size={18} />
          </span>
          My Incident Reports
        </h2>
        <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 shadow-sm">
          {incidents.length} Records
        </span>
      </div>

      {loading ? (
        <div className="p-5 space-y-4">
          {[1, 2].map(i => <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-5">
          <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <ClipboardIcon size={20} className="text-red-500" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardIcon size={32} className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-700">No incident reports yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">Reports you submit will appear here. They help authorities manage active issues.</p>
        </div>
      ) : (
        <div className="p-0 sm:p-2 bg-slate-50/50">
          <IncidentList incidents={incidents} onDelete={handleDelete} />
        </div>
      )}
    </section>
  );
};

export default DashboardMyIncidents;

