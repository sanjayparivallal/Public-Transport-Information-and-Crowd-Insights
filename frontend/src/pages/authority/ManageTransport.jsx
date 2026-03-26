import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getManagedTransports,
  updateTransport,
  removeStaff,
} from '../../api/adminApi';
import { BusIcon, TrainIcon, EditIcon, WrenchIcon, AlertIcon, SearchIcon, TrashIcon, MapIcon, RefreshIcon, PlusIcon } from '../../components/icons';
import TransportRoutesModal from './TransportRoutesModal';
import TransportFormModal from './TransportFormModal';
import AssignStaffModal from './AssignStaffModal';
import DeleteModal from './DeleteModal';
import ConfirmModal from '../../components/ConfirmModal';
import SearchableCombobox from '../../components/SearchableCombobox';

/* ── Status Badge ───────────────────────────────────────── */
const StatusBadge = ({ isActive }) => {
  const active = isActive !== false;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
        active
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
          : 'bg-amber-50 text-amber-600 border-amber-100'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {active ? 'Active' : 'Paused'}
    </span>
  );
};

/* ── Main Page ───────────────────────────────────────────── */
const ManageTransport = () => {
  const { user, isAuthority } = useAuth();
  const navigate               = useNavigate();

  const [transports, setTransports]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const location = useLocation();

  // Modal visibility state
  const [showFormModal,   setShowFormModal]   = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);

  // Remove-staff confirm modal state
  const [removeStaffConfirm, setRemoveStaffConfirm] = useState({ open: false, transportId: null, role: '' });

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

  // Handle deep linking / highlighting
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tid = params.get('transportId');
    if (tid && transports.length > 0) {
      setHighlightedId(tid);
      // Wait for DOM to render the list
      setTimeout(() => {
        const el = document.getElementById(`transport-${tid}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      // Remove highlight after 5s
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search, transports]);

  const openRemoveStaffConfirm = (transportId, role) => {
    setRemoveStaffConfirm({ open: true, transportId, role });
  };

  const handleRemoveStaffConfirmed = async () => {
    const { transportId, role } = removeStaffConfirm;
    setRemoveStaffConfirm({ open: false, transportId: null, role: '' });
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-[2.5rem] p-16 shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <AlertIcon size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Access Restricted</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            Only Transport Authorities can access this management portal.
          </p>
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
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
    <div className="min-h-screen pb-12">
      {/* ── Vivid Page Header ── */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.30)' }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-2xl" style={{ background: 'rgba(6,182,212,0.18)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-blue-200 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Fleet Management
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-2">Manage Transport</h1>
            <p className="text-blue-100/70 text-sm font-medium">Add, edit, assign staff and manage your entire fleet.</p>
          </div>
          <button
            className="inline-flex items-center gap-2.5 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl flex-shrink-0 border-2 border-white/40 text-white hover:bg-white hover:text-blue-700 transition-all duration-300 backdrop-blur-sm group"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={openAddModal}
          >
            <PlusIcon size={16} />
            Add Transport
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold mb-6 shadow-sm">
            <AlertIcon size={18} className="text-red-500"/> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 mt-8">
          {[
            { label: 'Total Transport', value: stats.total,  icon: WrenchIcon, from: '#3b82f6', to: '#6366f1', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)' },
            { label: 'Total Buses',     value: stats.buses,  icon: BusIcon,    from: '#06b6d4', to: '#3b82f6', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.18)'  },
            { label: 'Total Trains',    value: stats.trains, icon: TrainIcon,  from: '#8b5cf6', to: '#d946ef', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
          ].map(({ label, value, icon: Icon, from, to, bg, border }) => (
            <div
              key={label}
              className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden flex items-center gap-5 hover:-translate-y-1 transition-all duration-300"
              style={{ background: bg, border: `1.5px solid ${border}` }}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${to}, transparent)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <Icon size={26} className="text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 leading-none">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Unified Fleet Management Section */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative flex flex-col">
          
          <div className="p-6 sm:p-8 border-b border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/20">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-grow space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5 mb-2">
                  <SearchIcon size={14}/> Find Vehicle
                </label>
                <div className="relative">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                    placeholder="ID, Name or Operator..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-64 space-y-2">
                <SearchableCombobox
                  id="type-filter"
                  label="Category"
                  allowCustom={false}
                  options={[
                    { label: 'All Fleet', value: 'all' },
                    { label: 'Buses', value: 'bus' },
                    { label: 'Trains', value: 'train' },
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
              
              <button 
                onClick={fetchTransports}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                title="Refresh Fleet Data"
              >
                <RefreshIcon size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b-2 border-indigo-100/50">
                  <th className="px-6 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Vehicle Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Route Strategy</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Active Personnel</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Ops Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && transports.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-6">
                        <div className="h-14 bg-slate-50 rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                        <WrenchIcon size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Fleet Empty</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                        No vehicles matching your search criteria were found in our database.
                      </p>
                      <button 
                        onClick={() => { setSearch(''); setTypeFilter('all'); }}
                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr 
                      key={t._id} 
                      id={`transport-${t._id}`}
                      className={`transition-all group border-l-[3px] border-l-transparent ${highlightedId === t._id ? 'bg-blue-50/50 border-l-blue-500 ring-1 ring-blue-200 ring-inset' : 'hover:bg-indigo-50/30 hover:border-l-indigo-400'}`}
                    >
                      <td className="px-6 py-5">
                        <Link to={`/transport/${t._id}`} className="flex items-center gap-4 group/link">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:scale-105 ${t.type === 'bus' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                            {t.type === 'bus' ? <BusIcon size={20} /> : <TrainIcon size={20} />}
                          </div>
                          <div>
                            <div className="text-base font-bold text-slate-900 tracking-tight leading-none mb-2 group-hover/link:text-blue-600 transition-colors">{t.name}</div>
                            <div className="flex items-center gap-2">
                               <div className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                #{t.transportNumber}
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">by {t.operator || 'Authority'}</span>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 bg-white hover:border-slate-800 hover:text-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 group"
                          onClick={() => openRoutesModal(t)}
                        >
                          <MapIcon size={14} className="group-hover:text-blue-600 transition-colors" /> Update Routes &amp; Fares
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Driver</span>
                            {t.assignedDriver ? (
                              <div className="flex items-center justify-between group/staff max-w-[140px]">
                                <span className="text-xs font-bold text-slate-800 leading-none truncate">{t.assignedDriver.name || t.assignedDriver.email || 'Assigned'}</span>
                                <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all ml-2" onClick={() => openRemoveStaffConfirm(t._id, 'driver')} title="Deassign Driver"><TrashIcon size={12}/></button>
                              </div>
                            ) : (
                              <button className="text-[10px] font-bold text-blue-500 hover:text-blue-600 text-left underline underline-offset-4 decoration-blue-200" onClick={() => openAssignModal(t)}>+ Assign Driver</button>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Conductor</span>
                            {t.assignedConductor ? (
                              <div className="flex items-center justify-between group/staff max-w-[140px]">
                                <span className="text-xs font-bold text-slate-800 leading-none truncate">{t.assignedConductor.name || t.assignedConductor.email || 'Assigned'}</span>
                                <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all ml-2" onClick={() => openRemoveStaffConfirm(t._id, 'conductor')} title="Deassign Conductor"><TrashIcon size={12}/></button>
                              </div>
                            ) : (
                              <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 text-left underline underline-offset-4 decoration-indigo-200" onClick={() => openAssignModal(t)}>+ Assign Conductor</button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="origin-left">
                          <StatusBadge isActive={t.isActive} />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View transport detail */}
                          <Link
                            to={`/transport/${t._id}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors border border-blue-200 shadow-sm text-xs"
                            title="View transport routes & details"
                          >
                            View
                          </Link>
                          {/* Pause / Resume */}
                          <button
                            className={`inline-flex items-center justify-center px-3 py-1.5 font-bold rounded-lg transition-colors border shadow-sm text-xs ${t.isActive !== false ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}
                            onClick={() => handlePause(t)}
                            title={t.isActive !== false ? 'Pause transport' : 'Resume transport'}
                          >
                            {t.isActive !== false ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(t)}
                            title="Edit"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            onClick={() => openDeleteModal(t)}
                            title="Delete"
                          >
                            <TrashIcon size={16} />
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

      {/* Remove Staff Confirm Modal */}
      <ConfirmModal
        isOpen={removeStaffConfirm.open}
        variant="warning"
        title={`Remove ${removeStaffConfirm.role === 'driver' ? 'Driver' : 'Conductor'}?`}
        message={`This will unassign the ${removeStaffConfirm.role} from this transport. You can reassign another staff member at any time.`}
        confirmLabel="Yes, Remove"
        cancelLabel="Keep Assigned"
        onConfirm={handleRemoveStaffConfirmed}
        onCancel={() => setRemoveStaffConfirm({ open: false, transportId: null, role: '' })}
      />
    </div>
  );
};

export default ManageTransport;
