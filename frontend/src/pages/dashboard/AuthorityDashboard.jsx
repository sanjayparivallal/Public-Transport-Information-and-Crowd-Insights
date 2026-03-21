import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAuthorityProfile,
  getManagedTransports,
  getAllIncidentsForAuthority,
} from '../../api/adminApi';
import { deleteIncident } from '../../api/incidentApi';
import {
  BusIcon, TrainIcon, AlertIcon, ClockIcon, ClipboardIcon,
  SearchIcon, WrenchIcon, TrashIcon, UserIcon, UsersIcon,
} from '../../components/icons';
import IncidentList from '../../components/IncidentList';

/* ── Time-based greeting ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── Severity badge ── */
const SeverityBadge = ({ severity }) => {
  const cls = {
    critical: 'bg-red-100 text-red-700 border border-red-200',
    high:     'bg-amber-100 text-amber-700 border border-amber-200',
    medium:   'bg-amber-100 text-amber-700 border border-amber-200',
    low:      'bg-blue-100 text-blue-700 border border-blue-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cls[severity] || 'bg-slate-100 text-slate-700'}`}>{severity}</span>;
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const cls = {
    open:         'bg-red-100 text-red-700 border border-red-200',
    acknowledged: 'bg-amber-100 text-amber-700 border border-amber-200',
    resolved:     'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cls[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
};

/* ── Page ── */
const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [routes,        setRoutes]        = useState([]);
  const [transportsRaw, setTransportsRaw] = useState([]);
  const [incidents,     setIncidents]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,     setSearch]     = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, transportsRes, incidentsRes] = await Promise.all([
        getAuthorityProfile().catch(() => null),
        getManagedTransports().catch(() => null),
        getAllIncidentsForAuthority({ limit: 100 }).catch(() => null),
      ]);
      if (profileRes) {
        const d = profileRes.data?.data;
        setProfile(d?.authorityProfile || d?.user || d);
      }
      if (transportsRes) {
        const d = transportsRes.data?.data || transportsRes.data;
        setRoutes(d?.routes || []);
        setTransportsRaw(d?.transports || []);
      }
      if (incidentsRes) {
        const d = incidentsRes.data?.data;
        setIncidents(d?.incidents || (Array.isArray(d) ? d : []));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Delete this incident report?')) return;
    try {
      await deleteIncident(id);
      setIncidents(p => p.filter(i => i._id !== id));
    } catch (err) { alert(err.message || 'Failed to delete.'); }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-slate-600">Please <button onClick={() => navigate('/login/authority')} className="text-blue-600 font-bold hover:underline">sign in</button> as an authority.</p>
      </div>
    );
  }

  /* ── Computed stats ── */
  const busCount   = transportsRaw.filter(t => t.type === 'bus').length;
  const trainCount = transportsRaw.filter(t => t.type === 'train').length;
  const statCards = [
    { label: 'Total Transport', value: transportsRaw.length, icon: WrenchIcon,    color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100'  },
    { label: 'Bus Count',       value: busCount,          icon: BusIcon,        color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-100'},
    { label: 'Train Count',     value: trainCount,        icon: TrainIcon,      color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-100'},
    { label: 'Reports Count',   value: incidents.length,  icon: ClipboardIcon,  color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-100'   },
  ];

  const displayName = profile?.name || user.name || user.email?.split('@')[0] || 'Authority';
  const filtered = routes.filter(r => {
    const t = r.transportId || {};
    return !search || 
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.transportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.origin?.toLowerCase().includes(search.toLowerCase()) ||
      r.destination?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-6 lg:px-8 mb-8 sm:mb-10 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-blue-600">{displayName}</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 flex items-center gap-2">
              <ClipboardIcon size={16} className="text-slate-400" />
              {profile?.organizationName || 'Transport Authority Dashboard'}
            </p>
          </div>
          <Link to="/authority/manage" className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <WrenchIcon size={18} /> Manage Transport
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading dashboard…</p>
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className={`bg-white border ${border} rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`p-3.5 rounded-xl ${bg} shrink-0`}>
                      <Icon size={24} className={color} />
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fleet Table ── */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><BusIcon size={18} /></span>
                  Fleet Overview
                </h2>
                <div className="relative sm:w-72">
                  <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Search transport…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <BusIcon size={32} className="text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-700">No transports found</p>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Route Info</th>
                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Transport</th>
                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Available Seats</th>
                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(r => {
                        const t = r.transportId || {};
                        const displayAvailable = r.availableSeats ?? r.livePosition?.availableSeats ?? t.totalSeats;
                        const displayTotal = t.totalSeats || '?';
                        
                        return (
                        <tr key={r._id} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">{r.origin}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-sm font-bold text-slate-800">{r.destination}</span>
                              </div>
                              {r.direction && (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{r.direction}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{t.name || '—'}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{t.transportNumber}</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  t.type === 'bus' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-violet-50 text-violet-700 border-violet-100'
                                }`}>
                                  {t.type === 'bus' ? <BusIcon size={10}/> : <TrainIcon size={10}/>}
                                  <span className="uppercase">{t.type}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <UsersIcon size={14} className="text-slate-400" />
                              <span className={`text-sm font-black ${
                                (displayAvailable ?? 0) <= 5 ? 'text-red-600' : 
                                (displayAvailable ?? 0) > 20 ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {displayAvailable ?? '—'}
                              </span>
                              <span className="text-slate-400 text-[10px] font-bold">/ {displayTotal}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              r.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${r.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {r.isActive !== false ? 'Active' : 'Paused'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/transport/${t._id}?routeId=${r._id}`} className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Incident Reports ── */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><AlertIcon size={18} /></span>
                  Recent Incidents
                </h2>
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                  {incidents.length} Reports
                </span>
              </div>

              {incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <ClipboardIcon size={32} className="text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-700">No incident reports</p>
                  <p className="text-sm text-slate-500 mt-1">Your fleet is running smoothly.</p>
                </div>
              ) : (
                <div className="p-0 sm:p-2 bg-slate-50/50">
                   <IncidentList
                    incidents={incidents}
                    onDelete={handleDeleteIncident}
                    onAction={(inc) => navigate(`/authority/manage?transportId=${inc.transportId?._id}`)}
                    actionLabel="Manage"
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;

