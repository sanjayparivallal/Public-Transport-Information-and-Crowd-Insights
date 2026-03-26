import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../../api/incidentApi';
import IncidentList from '../../components/IncidentList';
import ConfirmModal from '../../components/ConfirmModal';
import { ClipboardIcon, BellIcon } from '../../components/icons';

const DashboardMyIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIncident(deleteTarget);
      setIncidents(p => p.filter(i => i._id !== deleteTarget));
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden mb-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%)' }}
        >
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 m-0 tracking-tight">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ClipboardIcon size={20} />
            </span>
            My Incident Reports
          </h2>
          {incidents.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-50 border border-indigo-200 text-indigo-700">
              <BellIcon size={14} />
              {incidents.length} Record{incidents.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-3xl h-64 bg-slate-50 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-5 text-red-600 bg-rose-50 border-2 border-red-100 rounded-2xl shadow-sm">
              <ClipboardIcon size={24} className="text-red-500 shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 text-indigo-500 rounded-2xl flex items-center justify-center mb-5">
                <ClipboardIcon size={32} />
              </div>
              <p className="text-xl font-black text-slate-900 mb-2 tracking-tight">No incident reports yet</p>
              <p className="text-sm font-medium text-slate-500 max-w-sm">Reports you submit will appear here. They help authorities manage active issues.</p>
            </div>
          ) : (
            <IncidentList incidents={incidents} onDelete={(id) => setDeleteTarget(id)} />
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Incident Report?"
        message="This will permanently remove the incident report. Authorities will no longer see it."
        confirmLabel="Delete Report"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default DashboardMyIncidents;
