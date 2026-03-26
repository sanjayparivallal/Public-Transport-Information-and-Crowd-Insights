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
  BusIcon, TrainIcon, AlertIcon, ClipboardIcon,
  SearchIcon, WrenchIcon, UsersIcon, ArrowLeftIcon, ArrowRightIcon,
} from '../../components/icons';
import IncidentList from '../../components/IncidentList';

/* ── Time-based greeting ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── Page ── */
const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [transportsRaw, setTransportsRaw] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fleetPage, setFleetPage] = useState(1);

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
        <p>Please <button onClick={() => navigate('/login/authority')} className="text-blue-600 font-bold hover:underline">sign in</button> as an authority.</p>
      </div>
    );
  }

  /* ── Computed stats ── */
  const busCount = transportsRaw.filter(t => t.type === 'bus').length;
  const trainCount = transportsRaw.filter(t => t.type === 'train').length;
  const statCards = [
    { label: 'Total Transport', value: transportsRaw.length, icon: WrenchIcon, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Bus Count', value: busCount, icon: BusIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Train Count', value: trainCount, icon: TrainIcon, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Reports Count', value: incidents.length, icon: ClipboardIcon, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
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

  const fleetAccents = [
    { from: '#3b82f6', to: '#6366f1', light: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)' },
    { from: '#8b5cf6', to: '#6d28d9', light: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
    { from: '#14b8a6', to: '#0891b2', light: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.18)' },
  ];

  const ITEMS_PER_PAGE = 9;
  const totalFleetPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedFleet = filtered.slice((fleetPage - 1) * ITEMS_PER_PAGE, fleetPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* ── Page Header (SaaS Style) ── */}
      <div className="bg-white border-b border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.01)] py-10 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-blue-50/50 border border-blue-100 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Authority Access</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-snug mb-3">
              {getGreeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {displayName}
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
              <ClipboardIcon size={16} className="text-slate-400" />
              {profile?.organizationName || 'Transport Authority Dashboard'}
            </p>
          </div>
          <Link to="/authority/manage"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl flex-shrink-0 border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600 group">
            <WrenchIcon size={16} className="transition-transform group-hover:rotate-12" /> Manage Fleet

          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#8b8fc7' }}>Loading dashboard…</p>
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="group bg-white border border-slate-200 hover:border-indigo-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] rounded-[2rem] p-5 sm:p-6 transition-all hover:-translate-y-1 relative overflow-hidden flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0 border border-white shadow-sm`}>
                    <Icon size={26} className={color} />
                  </div>
                  <div className="flex flex-col relative z-10 w-full">
                    <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 leading-none">{value}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fleet Overview ── */}
            <section className="bg-white border-2 border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0 ring-1 ring-blue-100">
                    <BusIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5">Fleet Overview</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{filtered.length} routes in operation</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-[22rem]">
                    <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-0 shadow-sm transition-colors font-bold text-slate-800 placeholder-slate-400 hover:border-slate-400"
                      placeholder="Search fleet…"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setFleetPage(1); }}
                    />
                  </div>

                  {totalFleetPages > 1 && (
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        <span className="text-slate-800">{fleetPage}</span> / {totalFleetPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setFleetPage(p => Math.max(1, p - 1))}
                          disabled={fleetPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowLeftIcon size={14} />
                        </button>
                        <button
                          onClick={() => setFleetPage(p => Math.min(totalFleetPages, p + 1))}
                          disabled={fleetPage === totalFleetPages}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowRightIcon size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                    <BusIcon size={32} className="text-indigo-400" />
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight mb-2">No transports found</p>
                  <p className="text-sm font-bold text-slate-500">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedFleet.map((r, idx) => {
                    const t = r.transportId || {};
                    const displayAvailable = r.availableSeats ?? r.livePosition?.availableSeats ?? t.totalSeats;
                    const displayTotal = t.totalSeats || 1;
                    const seatPct = Math.round(((displayAvailable ?? 0) / displayTotal) * 100);
                    const isBus = t.type === 'bus';

                    return (
                      <div key={r._id} className="group bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md rounded-[1.5rem] transition-all duration-300 relative flex flex-col p-5 sm:p-6 h-full">
                        <div className="flex-grow">
                          {/* Transport name + badge */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                {isBus ? <BusIcon size={18} className="text-indigo-600" /> : <TrainIcon size={18} className="text-indigo-600" />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-base leading-tight mb-0.5 group-hover:text-indigo-600 transition-colors">{t.name || '—'}</p>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100">
                                  {t.transportNumber} · {t.type}
                                </span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${r.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${r.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              {r.isActive !== false ? 'Active' : 'Paused'}
                            </span>
                          </div>

                          {/* Route Block */}
                          <div className="flex items-center justify-between mb-8 transition-colors">
                            <div className="flex flex-col flex-1 overflow-hidden pr-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-blue-500 transition-colors">Origin</span>
                              <span className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{r.origin}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 group-hover:border-blue-300 group-hover:text-blue-500 group-hover:-rotate-45 transition-all duration-500 mx-2">
                              <ArrowRightIcon size={14} />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden pl-2 text-right">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-blue-500 transition-colors">Destination</span>
                              <span className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{r.destination}</span>
                            </div>
                          </div>

                          {/* Seat availability bar */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                              <span>Seats Available</span>
                              <span className={seatPct <= 20 ? 'text-red-500' : seatPct >= 70 ? 'text-emerald-500' : 'text-amber-500'}>
                                {displayAvailable ?? '—'} <span className="text-slate-300">/</span> {displayTotal}
                              </span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{
                                width: `${Math.min(seatPct, 100)}%`,
                                backgroundColor: seatPct <= 20 ? '#ef4444' : seatPct >= 70 ? '#10b981' : '#f59e0b'
                              }} />
                            </div>
                          </div>

                          <Link to={`/transport/${t._id}?routeId=${r._id}`}
                            className="flex items-center justify-center w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600 ease-in-out">
                            View Details

                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}


            </section>

            {/* ── Incident Reports ── */}
            <section className="mt-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                  <AlertIcon size={24} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Recent Incidents</h2>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {incidents.length > 0 ? `${incidents.length} active report${incidents.length > 1 ? 's' : ''}` : 'No active incidents'}
                  </p>
                </div>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                    <ClipboardIcon size={32} className="text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight mb-2">No incident reports</p>
                  <p className="text-sm font-bold text-slate-500">Your fleet is running smoothly. 🎉</p>
                </div>
              ) : (
                <div className="mt-8">
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
