import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getAuthorityProfile,
  getManagedTransports,
  getAllIncidentsForAuthority,
 } from '../../api';
import {  deleteIncident  } from '../../api';
import {
  BusIcon, TrainIcon, AlertIcon, ClipboardIcon,
  SearchIcon, WrenchIcon, ArrowRightIcon,
} from '../../components/icons';
import IncidentList from '../../components/IncidentList';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import Skeleton from '../../components/Skeleton';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* Stat card config — each has a unique gradient */
const STAT_CONFIG = [
  {
    label: 'Total Transport',
    key: 'total',
    icon: WrenchIcon,
    from: '#3b82f6',
    to:   '#6366f1',
    bg:   'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.18)',
  },
  {
    label: 'Buses',
    key: 'buses',
    icon: BusIcon,
    from: '#06b6d4',
    to:   '#3b82f6',
    bg:   'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.18)',
  },
  {
    label: 'Trains',
    key: 'trains',
    icon: TrainIcon,
    from: '#8b5cf6',
    to:   '#d946ef',
    bg:   'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.18)',
  },
  {
    label: 'Incident Reports',
    key: 'incidents',
    icon: ClipboardIcon,
    from: '#f43f5e',
    to:   '#f97316',
    bg:   'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.18)',
  },
];

const fleetAccents = [
  { from: '#3b82f6', to: '#4f46e5', light: '#ffffff', border: '#e2e8f0' }
];

const AuthorityDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [routes,        setRoutes]        = useState([]);
  const [transportsRaw, setTransportsRaw] = useState([]);
  const [incidents,     setIncidents]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [fleetPage,     setFleetPage]     = useState(1);
  const [deleteIncidentId, setDeleteIncidentId] = useState(null);

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

  const handleDeleteIncident = async () => {
    if (!deleteIncidentId) return;
    try {
      await deleteIncident(deleteIncidentId);
      setIncidents(p => p.filter(i => i._id !== deleteIncidentId));
    } catch { /* silent */ }
    finally { setDeleteIncidentId(null); }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p>Please <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">sign in</button> as an authority.</p>
      </div>
    );
  }

  const busCount   = transportsRaw.filter(t => t.type === 'bus').length;
  const trainCount = transportsRaw.filter(t => t.type === 'train').length;
  const statValues = { total: transportsRaw.length, buses: busCount, trains: trainCount, incidents: incidents.length };

  const displayName = profile?.name || user.name || user.email?.split('@')[0] || 'Authority';

  const filtered = routes.filter(r => {
    const t = r.transportId || {};
    return !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.transportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.origin?.toLowerCase().includes(search.toLowerCase()) ||
      r.destination?.toLowerCase().includes(search.toLowerCase());
  });

  const ITEMS_PER_PAGE   = 9;
  const totalFleetPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedFleet   = filtered.slice((fleetPage - 1) * ITEMS_PER_PAGE, fleetPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen pb-16">

      {/* ── Vivid Gradient Header ── */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #4f46e5 80%, #7c3aed 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.30)' }} />
          <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full blur-2xl" style={{ background: 'rgba(6,182,212,0.20)' }} />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full blur-2xl" style={{ background: 'rgba(244,63,94,0.12)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Authority Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2">
              {getGreeting()},{' '}
              <span style={{ background: 'linear-gradient(90deg, #bfdbfe, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {displayName}
              </span>
            </h1>
            <p className="text-blue-200/80 text-sm font-medium flex items-center gap-2">
              <ClipboardIcon size={15} className="text-blue-300" />
              {profile?.organizationName || 'Transport Authority Dashboard'}
            </p>
          </div>
          <Link
            to="/authority/manage"
            className="inline-flex items-center gap-2.5 px-7 py-3 text-xs font-black uppercase tracking-widest rounded-2xl border-2 border-white/40 text-white hover:bg-white hover:text-blue-700 transition-all duration-300 backdrop-blur-sm shrink-0 group"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <WrenchIcon size={15} className="group-hover:rotate-12 transition-transform" />
            Manage Fleet
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {loading ? (
          <>
            {/* Skeleton stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[0,1,2,3].map(i => <Skeleton key={i} variant="stat" />)}
            </div>
            {/* Skeleton fleet grid */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[0,1,2,3,4,5].map(i => <Skeleton key={i} variant="transport-card" />)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── Vivid Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {STAT_CONFIG.map(({ label, key, icon: Icon, from, to, bg, border }) => (
                <div
                  key={key}
                  className="relative rounded-[1.75rem] p-5 sm:p-6 overflow-hidden flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default"
                  style={{ background: bg, border: `1.5px solid ${border}`, boxShadow: `0 4px 20px ${bg}` }}
                >
                  {/* Gradient blob */}
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
                    style={{ background: `radial-gradient(circle, ${to}, transparent)` }} />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 leading-none">{statValues[key]}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fleet Overview ── */}
            <section className="bg-white border-2 border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
              {/* Fleet header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 pb-7 border-b-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 gap-1"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                    <BusIcon size={18} className="text-white" />
                    <TrainIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Fleet Overview</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mt-1">{filtered.length} routes in operation</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-bold text-slate-800 placeholder-slate-400 text-sm"
                      placeholder="Search fleet…"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setFleetPage(1); }}
                    />
                  </div>
                </div>
              </div>

              {/* Fleet grid */}
              {filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <div className="w-20 h-16 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 gap-2">
                    <BusIcon size={26} className="text-indigo-400" />
                    <TrainIcon size={26} className="text-indigo-400" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mb-2">No transports found</p>
                  <p className="text-sm font-medium text-slate-400">Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedFleet.map((r, idx) => {
                    const t = r.transportId || {};
                    const displayAvailable = r.availableSeats ?? r.livePosition?.availableSeats ?? t.totalSeats;
                    const displayTotal     = t.totalSeats || 1;
                    const seatPct = Math.round(((displayAvailable ?? 0) / displayTotal) * 100);
                    const isBus   = t.type === 'bus';
                    const accent  = fleetAccents[idx % fleetAccents.length];

                    return (
                      <div
                        key={r._id}
                        className="group relative rounded-[1.5rem] p-5 sm:p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md"
                      >
                        {/* Top gradient stripe */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem]"
                          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />

                        {/* Transport name + status */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}>
                              {isBus ? <BusIcon size={18} className="text-white" /> : <TrainIcon size={18} className="text-white" />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm leading-tight">{t.name || '—'}</p>
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                                style={{ background: `${accent.from}18`, color: accent.from }}>
                                {t.transportNumber} · {t.type}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${r.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${r.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            {r.isActive !== false ? 'Active' : 'Paused'}
                          </span>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">From</p>
                            <p className="text-sm font-black text-slate-800 truncate">{r.origin}</p>
                          </div>
                          <ArrowRightIcon size={16} className="text-slate-300 shrink-0 group-hover:-rotate-45 group-hover:text-blue-400 transition-all duration-500" style={{ color: accent.from }} />
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">To</p>
                            <p className="text-sm font-black text-slate-800 truncate">{r.destination}</p>
                          </div>
                        </div>

                        {/* Seat bar */}
                        <div className="mb-5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            <span>Availability</span>
                            <span className={seatPct <= 20 ? 'text-rose-500' : seatPct >= 70 ? 'text-emerald-500' : 'text-amber-500'}>
                              {displayAvailable ?? '—'} / {displayTotal}
                            </span>
                          </div>
                          <div className="h-2 rounded-full w-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(seatPct, 100)}%`,
                                background: seatPct <= 20
                                  ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                                  : seatPct >= 70
                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                              }}
                            />
                          </div>
                        </div>

                        {/* View button */}
                        <Link
                          to={`/transport/${t._id}?routeId=${r._id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            borderColor: accent.from,
                            color: accent.from,
                            background: 'transparent',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${accent.from}, ${accent.to})`;
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = accent.from;
                            e.currentTarget.style.borderColor = accent.from;
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalFleetPages > 1 && (
                <div className="mt-8">
                  <Pagination 
                    page={fleetPage}
                    totalPages={totalFleetPages}
                    onPageChange={setFleetPage}
                  />
                </div>
              )}
            </section>

            {/* ── Incident Reports ── */}
            <section>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)' }}>
                  <AlertIcon size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Recent Incidents</h2>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1">
                    {incidents.length > 0 ? `${incidents.length} active report${incidents.length > 1 ? 's' : ''}` : 'No active incidents'}
                  </p>
                </div>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[2rem] p-16 flex flex-col items-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 rounded-2xl flex items-center justify-center mb-5">
                    <ClipboardIcon size={30} className="text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mb-2">No incident reports</p>
                  <p className="text-sm font-medium text-slate-400">Your fleet is running smoothly. 🎉</p>
                </div>
              ) : (
                <IncidentList
                  incidents={incidents}
                  onDelete={(id) => setDeleteIncidentId(id)}
                  onAction={(inc) => navigate(`/authority/manage?transportId=${inc.transportId?._id}`)}
                  actionLabel="Manage"
                />
              )}
            </section>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteIncidentId}
        title="Delete Incident Report?"
        message="This will permanently remove the incident report from the system."
        confirmLabel="Delete Report"
        onConfirm={handleDeleteIncident}
        onCancel={() => setDeleteIncidentId(null)}
      />
    </div>
  );
};

export default AuthorityDashboard;
