import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/userApi';
import { getTransportById } from '../../api/transportApi';
import { getCrowd } from '../../api/crowdApi';
import DashboardAccountInfo from './DashboardAccountInfo';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardAssignedTransport from './DashboardAssignedTransport';
import DashboardFavouriteTransports from './DashboardFavouriteTransports';
import DashboardGettingStarted from './DashboardGettingStarted';
import DashboardMyIncidents from './DashboardMyIncidents';
import DashboardLiveTracking from './DashboardLiveTracking';

const CommuterDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

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

        // Fetch favourite transports
        const favIds = data?.favouriteTransports || [];
        if (favIds.length > 0) {
          setFavLoading(true);
          const results = await Promise.all(
            favIds.map((item) => {
              const id = typeof item === 'object' ? item._id : item;
              return id ? getTransportById(id).catch(() => null) : null;
            })
          );
          const valid = results
            .filter(Boolean)
            .map((r) => r.data?.data?.transport || r.data?.data || r.data)
            .filter(Boolean);
          setFavTransports(valid);

          // Fetch crowd for each favourite
          const crowdResults = await Promise.all(
            valid.map((t) => t._id ? getCrowd(t._id).catch(() => null) : null)
          );
          const map = {};
          crowdResults.forEach((cr, i) => {
            if (valid[i]?._id && cr) {
              const d = cr.data?.data;
              map[valid[i]._id] = d?.officialCrowdLevel?.crowdLevel || d?.crowdLevel || null;
            }
          });
          setCrowdMap(map);
          setFavLoading(false);
        }

        // Fetch assigned transport detail (driver / conductor)
        const assignedId = data?.assignedTransport?._id || data?.assignedTransport;
        if (assignedId) {
          const tRes = await getTransportById(assignedId).catch(() => null);
          if (tRes) {
            setAssignedDetail(
              tRes.data?.data?.transport || tRes.data?.data || tRes.data
            );
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  const isStaff = user.role === 'driver' || user.role === 'conductor';
  const assignedTransportFallback = profile?.assignedTransport
    ? (typeof profile.assignedTransport === 'object'
      ? (profile.assignedTransport._id || profile.assignedTransport.transportNumber || '—')
      : String(profile.assignedTransport))
    : null;

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Welcome, {profile?.name || user.name || user.email}</h1>
          <p className="text-capitalize">
            {isStaff ? `${user.role} dashboard` : 'Your commuter dashboard — search routes and track crowd levels'}
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="loading-state"><div className="spinner-large" /></div>
        ) : (
          <>
            {/* Top row: Account Info + Quick Actions */}
            <div className="row g-4 mb-2">
              <div className="col-md-8">
                <DashboardAccountInfo profile={profile} user={user} />
              </div>
              <div className="col-md-4">
                <DashboardQuickActions isStaff={isStaff} assignedDetail={assignedDetail} />
              </div>
            </div>

            {/* Assigned Transport (Driver / Conductor) */}
            {isStaff && (
              <>
                <DashboardAssignedTransport 
                  assignedDetail={assignedDetail} 
                  profile={profile} 
                  assignedTransportFallback={assignedTransportFallback} 
                />
                <DashboardLiveTracking transport={assignedDetail} />
              </>
            )}

            {/* Favourite Transports (Commuter) */}
            {!isStaff && (
              <DashboardFavouriteTransports 
                favLoading={favLoading} 
                favTransports={favTransports} 
                crowdMap={crowdMap} 
              />
            )}

            {/* Getting Started tip (shown only when no favourites) */}
            {!isStaff && favTransports.length === 0 && (
              <DashboardGettingStarted />
            )}

            {/* My Incidents */}
            <DashboardMyIncidents />
          </>
        )}
      </div>
    </>
  );
};

export default CommuterDashboard;
