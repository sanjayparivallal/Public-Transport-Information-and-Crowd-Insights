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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2">
          <ClipboardIcon size={18} className="text-blue-600" />
          My Incident Reports
        </h2>
        <span className="badge badge-gray">{incidents.length} records</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}
        </div>
      ) : error ? (
        <div className="card card-body text-red-600 text-sm border-red-200 bg-red-50">{error}</div>
      ) : incidents.length === 0 ? (
        <div className="empty-state card card-body">
          <ClipboardIcon size={32} className="text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">No incident reports yet</p>
          <p className="text-sm mt-1">Reports you submit will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <IncidentList incidents={incidents} onDelete={handleDelete} />
        </div>
      )}
    </section>
  );
};

export default DashboardMyIncidents;
