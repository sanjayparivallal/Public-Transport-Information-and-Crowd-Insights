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
    critical: 'badge-red',
    high:     'badge-amber',
    medium:   'badge-amber',
    low:      'badge-blue',
  };
  return <span className={`badge ${cls[severity] || 'badge-gray'} uppercase`}>{severity}</span>;
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const cls = {
    open:         'badge-red',
    acknowledged: 'badge-amber',
    resolved:     'badge-green',
  };
  return <span className={`badge ${cls[status] || 'badge-gray'} uppercase`}>{status}</span>;
};

/* ── Page ── */
const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [transports, setTransports] = useState([]);
  const [incidents,  setIncidents]  = useState([]);
  const [loading,    setLoading]    = useState(true);
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
        setTransports(d?.transports || d?.results || (Array.isArray(d) ? d : []));
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
      <div className="page-container text-center py-20">
        <p>Please <button onClick={() => navigate('/login/authority')} className="text-blue-600 font-semibold">sign in</button> as an authority.</p>
      </div>
    );
  }

  /* ── Computed stats ── */
  const busCount   = transports.filter(t => t.type === 'bus').length;
  const trainCount = transports.filter(t => t.type === 'train').length;
  const statCards = [
    { label: 'Total Transport', value: transports.length, icon: WrenchIcon,    color: 'text-blue-600',   bg: 'bg-blue-50'  },
    { label: 'Bus Count',       value: busCount,          icon: BusIcon,        color: 'text-indigo-600', bg: 'bg-indigo-50'},
    { label: 'Train Count',     value: trainCount,        icon: TrainIcon,      color: 'text-violet-600', bg: 'bg-violet-50'},
    { label: 'Reports Count',   value: incidents.length,  icon: ClipboardIcon,  color: 'text-red-600',    bg: 'bg-red-50'   },
  ];

  const displayName = profile?.name || user.name || user.email?.split('@')[0] || 'Authority';
  const filtered = transports.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.transportNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtTime = ts => ts ? new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1>
              {getGreeting()}, <span className="text-blue-600">{displayName}</span>
            </h1>
            <p className="mt-1">{profile?.organizationName || 'Transport Authority Dashboard'}</p>
          </div>
          <Link to="/authority/manage" className="btn-primary shrink-0">
            <WrenchIcon size={16} /> Manage Transport
          </Link>
        </div>
      </div>

      <div className="page-container space-y-8">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading dashboard…</p>
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card card-body flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${bg} shrink-0`}>
                    <Icon size={22} className={color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fleet Table ── */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="flex items-center gap-2">
                  <BusIcon size={18} className="text-blue-600" />
                  Fleet Under Control
                </h2>
                <div className="relative sm:w-64">
                  <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-9 text-sm"
                    placeholder="Search transport…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state card card-body">
                  <BusIcon size={32} className="text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-500">No transports found</p>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left">
                          <th className="px-4 py-3 font-semibold text-slate-500">Route No.</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Name</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Type</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Available Seats</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map(t => (
                          <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="badge badge-blue">{t.transportNumber}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">{t.name || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`badge flex items-center gap-1 w-fit ${t.type === 'bus' ? 'badge-blue' : 'badge-purple'}`}>
                                {t.type === 'bus' ? <BusIcon size={11}/> : <TrainIcon size={11}/>}
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {t.livePosition?.availableSeats ?? t.totalSeats ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                                {t.isActive !== false ? 'Active' : 'Paused'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Link to={`/transport/${t._id}`} className="btn-ghost text-xs py-1 px-2 text-blue-600">
                                View →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* ── Incident Reports ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2">
                  <AlertIcon size={18} className="text-red-500" />
                  Incident Reports
                </h2>
                <span className="badge badge-gray">{incidents.length} total</span>
              </div>

              {incidents.length === 0 ? (
                <div className="empty-state card card-body">
                  <ClipboardIcon size={32} className="text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-500">No incident reports under your fleet.</p>
                </div>
              ) : (
                <IncidentList
                  incidents={incidents}
                  onDelete={handleDeleteIncident}
                  onAction={(inc) => navigate(`/authority/manage?transportId=${inc.transportId?._id}`)}
                  actionLabel="Manage"
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
