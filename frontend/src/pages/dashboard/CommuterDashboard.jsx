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

  useEffect(() => {
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
    fetchAll();
  }, []);

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
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Page Header (SaaS Style) ── */}
      <div className="bg-white border-b border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.01)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {isStaff ? `Duty Dashboard · ${user.role}` : 'Commuter Portal'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {getGreeting()},{' '}
              <span className="text-blue-600">
                {displayName}
              </span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium text-sm max-w-lg">
              {isStaff
                ? `You're logged in as a ${user.role}. Manage your assigned transport below.`
                : 'Your travel hub. Track favourite routes, stay updated with crowd levels, and manage incident alerts efficiently.'}
            </p>
          </div>

          {/* Quick stats chips */}
          {!loading && !isStaff && (
            <div className="flex items-center self-start sm:self-end">
              <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Saved Routes</span>
                <div className="flex items-center gap-2">
                  <span className="flex w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-3xl font-black text-slate-900 leading-none">{favCount}</span>
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

            {/* ── Staff: Assigned Transport + Incidents for assigned transport ── */}
            {isStaff && (
              <>
                <DashboardAssignedTransport
                  assignedDetail={assignedDetail}
                  profile={profile}
                  assignedTransportFallback={assignedTransportFallback}
                />

                {/* Incidents for allotted transport */}
                {assignedDetail && (
                  <section>
                    <h2 className="mb-4">Incidents on Assigned Route</h2>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 text-sm text-slate-500">
                      <Link to={`/transport/${assignedDetail._id}`} className="text-blue-600 font-semibold hover:underline">
                        View all incidents for {assignedDetail.name || assignedDetail.transportNumber} →
                      </Link>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── Commuter: Favourite Transports ── */}
            {!isStaff && (
              <DashboardFavouriteTransports
                favLoading={favLoading}
                favRoutes={favTransports}
                crowdMap={crowdMap}
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
