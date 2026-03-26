import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/userApi';
import { getTransportById } from '../../api/transportApi';
import { getCrowd } from '../../api/crowdApi';
import DashboardAssignedTransport from './DashboardAssignedTransport';
import DashboardFavouriteTransports from './DashboardFavouriteTransports';
import DashboardMyIncidents from './DashboardMyIncidents';
import DashboardMyCrowdReports from './DashboardMyCrowdReports';
import DashboardLiveTracking from './DashboardLiveTracking';
import DashboardAccountInfo from './DashboardAccountInfo';
import DashboardAssignedIncidents from './DashboardAssignedIncidents';

/* ── Time-based greeting ────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const CommuterDashboard = () => {
  const { user } = useAuth();

  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [favTransports,  setFavTransports]  = useState([]);
  const [crowdMap,       setCrowdMap]       = useState({});
  const [assignedDetail, setAssignedDetail] = useState(null);
  const [favLoading,     setFavLoading]     = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await getProfile();
      const data = res.data?.data?.user || res.data?.user || res.data?.data || res.data;
      setProfile(data);

      // Favourite routes
      const favRoutes = data?.favouriteRoutes || [];
      if (favRoutes.length > 0) {
        setFavLoading(true);
        const valid = favRoutes.filter(r => r && r._id);
        setFavTransports(valid);

        const crowdResults = await Promise.all(
          valid.map(r => r.transportId?._id ? getCrowd(r.transportId._id).catch(() => null) : null)
        );
        const map = {};
        crowdResults.forEach((cr, i) => {
          if (valid[i]?._id && cr) {
            const d = cr.data?.data;
            const routeOff = d?.official?.find(o => String(o.routeId) === String(valid[i]._id));
            map[valid[i]._id] = routeOff?.crowdLevel || valid[i]?.crowdLevel || 'average';
          }
        });
        setCrowdMap(map);
        setFavLoading(false);
      } else {
        setFavTransports([]);
      }

      // Assigned transport (driver / conductor)
      const assignedId = data?.assignedTransport?._id || data?.assignedTransport;
      if (assignedId) {
        const tRes = await getTransportById(assignedId).catch(() => null);
        if (tRes) setAssignedDetail(tRes.data?.data?.transport || tRes.data?.data || tRes.data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <p>Please <Link to="/login" className="text-blue-600 font-semibold hover:underline">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  const isStaff = user.role === 'driver' || user.role === 'conductor';
  const displayName = profile?.name || user.name || user.email?.split('@')[0] || 'User';
  const assignedTransportFallback = profile?.assignedTransport
    ? (typeof profile.assignedTransport === 'object'
      ? (profile.assignedTransport._id || profile.assignedTransport.transportNumber || '—')
      : String(profile.assignedTransport))
    : null;

  const favCount = favTransports.length;

  return (

    <div className="min-h-screen pb-16">

      {/* ── Vivid Gradient Header ── */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
        style={{
          background: isStaff
            ? 'linear-gradient(135deg, #164e63 0%, #0891b2 50%, #3b82f6 100%)'
            : 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 80%, #06b6d4 100%)'
        }}
      >
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ background: isStaff ? 'rgba(59,130,246,0.30)' : 'rgba(20,184,166,0.30)' }} />
          <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full blur-2xl"
            style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: isStaff ? '#bae6fd' : '#a7f3d0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isStaff ? `Duty Dashboard · ${user.role}` : 'Commuter Portal'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()},{' '}
              <span style={{
                background: isStaff ? 'linear-gradient(90deg, #bae6fd, #c7d2fe)' : 'linear-gradient(90deg, #a7f3d0, #bae6fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {displayName}
              </span>
            </h1>
            <p className="mt-2 text-sm font-medium max-w-lg" style={{ color: 'rgba(255,255,255,0.70)' }}>
              {isStaff
                ? `You're logged in as a ${user.role}. Manage your assigned transport below.`
                : 'Your travel hub. Track favourite routes, stay updated with crowd levels, and manage incident alerts.'}
            </p>
          </div>

          {!loading && !isStaff && (
            <div className="flex items-center self-start sm:self-end">
              <div className="flex flex-col rounded-2xl px-5 py-3 shadow-sm"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Saved Routes</span>
                <div className="flex items-center gap-2">
                  <span className="flex w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-3xl font-black text-white leading-none">{favCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading dashboard…</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── Staff: Account Info, Live Tracking, Assigned Transport + Incidents ── */}
            {isStaff && (
              <>
                <DashboardAccountInfo profile={profile} user={user} />
                
                {assignedDetail && (
                  <DashboardLiveTracking transport={assignedDetail} />
                )}

                <DashboardAssignedTransport
                  assignedDetail={assignedDetail}
                  profile={profile}
                  assignedTransportFallback={assignedTransportFallback}
                />

                <DashboardAssignedIncidents assignedDetail={assignedDetail} />
              </>
            )}

            {/* ── Commuter: Favourite Transports ── */}
            {!isStaff && (
              <DashboardFavouriteTransports
                favLoading={favLoading}
                favTransports={favTransports}
                crowdMap={crowdMap}
                onRemove={fetchAll}
              />
            )}

            {/* ── My Incident Reports ── */}
            <DashboardMyIncidents />

            {/* ── My Crowd Reports ── */}
            <DashboardMyCrowdReports />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommuterDashboard;
