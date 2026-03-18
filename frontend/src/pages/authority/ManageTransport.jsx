import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getManagedTransports,
  updateTransport,
  removeStaff,
} from '../../api/adminApi';
import { BusIcon, TrainIcon, EditIcon, CheckCircleIcon, UserIcon, WrenchIcon, AlertIcon, SearchIcon, TrashIcon, MapIcon, RefreshIcon, PlusIcon } from '../../components/icons';
import TransportRoutesModal from './TransportRoutesModal';
import TransportFormModal from './TransportFormModal';
import AssignStaffModal from './AssignStaffModal';
import DeleteModal from './DeleteModal';

/* ── Main Page ───────────────────────────────────────────── */
const ManageTransport = () => {
  const { user, isAuthority } = useAuth();
  const navigate               = useNavigate();

  const [transports, setTransports]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');

  // Modal visibility state
  const [showFormModal,   setShowFormModal]   = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);

  // Selection for modals
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [assignTarget,      setAssignTarget]       = useState(null);
  const [deleteTarget,      setDeleteTarget]       = useState(null);
  const [routeTarget,       setRouteTarget]        = useState(null);

  const fetchTransports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getManagedTransports();
      const d = res.data?.data || res.data;
      setTransports(d?.transports || (Array.isArray(d) ? d : []));
    } catch (err) {
      setError(err.message || 'Failed to load transports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransports(); }, [fetchTransports]);

  const handleRemoveStaff = async (transportId, role) => {
    if (!window.confirm(`Are you sure you want to remove the ${role}?`)) return;
    try {
      await removeStaff(transportId, role);
      fetchTransports();
    } catch (err) {
      setError(err.message || `Failed to remove ${role}`);
    }
  };

  const openAddModal = () => {
    setSelectedTransport(null);
    setShowFormModal(true);
  };

  const openEditModal = (t) => {
    setSelectedTransport(t);
    setShowFormModal(true);
  };

  const openAssignModal = (t) => {
    setAssignTarget(t);
    setShowAssignModal(true);
  };

  const openRoutesModal = (t) => {
    setRouteTarget(t);
    setShowRoutesModal(true);
  };

  const openDeleteModal = (t) => {
    setDeleteTarget(t);
    setShowDeleteModal(true);
  };

  // Access guard
  if (!user || !isAuthority) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-[2.5rem] p-16 shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <AlertIcon size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Access Restricted</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            Only Transport Authorities can access this management portal.
          </p>
          <button 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all shadow-sm active:scale-95"
            onClick={() => navigate('/login')}
          >
            Login as Authority
          </button>
        </div>
      </div>
    );
  }

  // Filtered list
  const filtered = transports.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.transportNumber?.toLowerCase().includes(q) ||
      t.operator?.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total:    transports.length,
    active:   transports.filter((t) => t.isActive !== false).length,
    buses:    transports.filter((t) => t.type === 'bus').length,
    trains:   transports.filter((t) => t.type === 'train').length,
  };

  const handlePause = async (t) => {
    try {
      await updateTransport(t._id, { isActive: t.isActive === false ? true : false });
      fetchTransports();
    } catch (err) { alert(err.message || 'Failed to toggle status.'); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2"><WrenchIcon size={22} className="text-blue-600" /> Manage Transport</h1>
            <p className="mt-1">Add, edit, assign staff and manage your entire fleet.</p>
          </div>
          <button className="btn-primary shrink-0" onClick={openAddModal}>
            <PlusIcon size={16} /> Add Transport
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
            <AlertIcon size={16}/> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Transport', value: stats.total,  icon: WrenchIcon, color: 'text-blue-600',   bg: 'bg-blue-50'   },
            { label: 'Total Bus',       value: stats.buses,  icon: BusIcon,    color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Total Train',     value: stats.trains, icon: TrainIcon,  color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div className="card card-body flex items-center gap-4" key={label}>
              <div className={`p-3 rounded-xl shrink-0 ${bg}`}><Icon size={20} className={color} /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-grow space-y-2 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <SearchIcon size={14}/> Find Vehicle
              </label>
              <div className="relative">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="ID, Name or Operator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Fleet</option>
                <option value="bus">Buses</option>
                <option value="train">Trains</option>
              </select>
            </div>
            
            <button 
              onClick={fetchTransports}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary-600 rounded-2xl transition-all shadow-sm active:scale-95"
              title="Refresh Fleet Data"
            >
              <RefreshIcon size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Fleet Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Route Strategy</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Personnel</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ops Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && transports.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-8">
                        <div className="h-14 bg-slate-50 rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">
                      <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <WrenchIcon size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Fleet Empty</h3>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto mb-10 text-lg leading-relaxed">
                        No vehicles matching your search criteria were found in our database.
                      </p>
                      <button 
                        onClick={() => { setSearch(''); setTypeFilter('all'); }}
                        className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:scale-110 ${t.type === 'bus' ? 'bg-primary-50 text-primary-600 border-primary-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {t.type === 'bus' ? <BusIcon size={24} /> : <TrainIcon size={24} />}
                          </div>
                          <div>
                            <div className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1.5 group-hover:text-primary-600 transition-colors">{t.name}</div>
                            <div className="flex items-center gap-2">
                               <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                #{t.transportNumber}
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">by {t.operator || 'Authority'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <button 
                          className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-900 group-hover:bg-slate-900 hover:text-white group-hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200"
                          onClick={() => openRoutesModal(t)}
                        >
                          <MapIcon size={16} /> Update Routes &amp; Fares
                        </button>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Driver</span>
                            {t.driverId ? (
                              <div className="flex items-center justify-between group/staff max-w-[120px]">
                                <span className="text-xs font-black text-slate-800 leading-none truncate">{t.driverId.name || t.driverId.email || 'Assigned'}</span>
                                <button className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/staff:opacity-100 transition-all ml-2" onClick={() => handleRemoveStaff(t._id, 'driver')} title="Deassign"><TrashIcon size={12}/></button>
                              </div>
                            ) : (
                              <button className="text-[10px] font-bold text-primary-500 hover:text-primary-600 text-left underline underline-offset-4 decoration-primary-200" onClick={() => openAssignModal(t)}>+ Assign Driver</button>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Conductor</span>
                            {t.conductorId ? (
                              <div className="flex items-center justify-between group/staff max-w-[120px]">
                                <span className="text-xs font-black text-slate-800 leading-none truncate">{t.conductorId.name || t.conductorId.email || 'Assigned'}</span>
                                <button className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/staff:opacity-100 transition-all ml-2" onClick={() => handleRemoveStaff(t._id, 'conductor')} title="Deassign"><TrashIcon size={12}/></button>
                              </div>
                            ) : (
                              <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 text-left underline underline-offset-4 decoration-indigo-200" onClick={() => openAssignModal(t)}>+ Assign Conductor</button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="scale-90 origin-left">
                          <StatusBadge isActive={t.isActive} />
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Pause / Resume */}
                          <button
                            className={`btn text-xs py-1.5 px-3 ${t.isActive !== false ? 'btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50' : 'btn-secondary text-green-600 border-green-200 hover:bg-green-50'}`}
                            onClick={() => handlePause(t)}
                            title={t.isActive !== false ? 'Pause transport' : 'Resume transport'}
                          >
                            {t.isActive !== false ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            className="p-2 btn-ghost text-slate-500 hover:text-blue-600"
                            onClick={() => openEditModal(t)}
                            title="Edit"
                          >
                            <EditIcon size={17} />
                          </button>
                          <button
                            className="p-2 btn-ghost text-slate-500 hover:text-red-600"
                            onClick={() => openDeleteModal(t)}
                            title="Delete"
                          >
                            <TrashIcon size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals — conditionally rendered based on React state */}
      {showFormModal && (
        <TransportFormModal
          transport={selectedTransport}
          onSaved={fetchTransports}
          onClose={() => setShowFormModal(false)}
        />
      )}
      {showAssignModal && (
        <AssignStaffModal
          transport={assignTarget}
          onSaved={fetchTransports}
          onClose={() => setShowAssignModal(false)}
        />
      )}
      {showRoutesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowRoutesModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <PlusIcon size={20} className="rotate-45" />
            </button>
            <TransportRoutesModal transport={routeTarget} onClose={() => setShowRoutesModal(false)} />
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteModal
          transport={deleteTarget}
          onDeleted={fetchTransports}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ManageTransport;
