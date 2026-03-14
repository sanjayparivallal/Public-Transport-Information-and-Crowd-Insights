import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransportById } from '../../api/transportApi';
import { getCrowd } from '../../api/crowdApi';
import { getIncidentsByTransport } from '../../api/incidentApi';
import { addFavourite, removeFavourite } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import CrowdBadge from '../../components/CrowdBadge';
import StopsTimeline from '../../components/StopsTimeline';
import IncidentList from '../../components/IncidentList';

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [transport, setTransport]   = useState(null);
  const [crowd, setCrowd]           = useState(null);
  const [incidents, setIncidents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isFav, setIsFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favMsg, setFavMsg]         = useState('');

  // Fare calculator state
  const [fareFrom, setFareFrom]     = useState('');
  const [fareTo, setFareTo]         = useState('');
  const [fareResult, setFareResult] = useState(null);
  const [fareClass, setFareClass]   = useState('general');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [tRes, cRes, iRes] = await Promise.allSettled([
          getTransportById(id),
          getCrowd(id),
          getIncidentsByTransport(id, { status: 'open', limit: 10 }),
        ]);

        if (tRes.status === 'fulfilled') {
          // Backend sendSuccess wraps in { success, data: ... }
          const tPayload = tRes.value.data?.data || tRes.value.data;
          setTransport(tPayload?.transport || tPayload);
        } else {
          setError('Transport not found or access denied.');
          setLoading(false);
          return;
        }
        if (cRes.status === 'fulfilled') {
          // Crowd: { success, data: { crowdLevel, reports, livePosition } }
          const cPayload = cRes.value.data?.data || cRes.value.data;
          setCrowd(cPayload);
        }
        if (iRes.status === 'fulfilled') {
          const iPayload = iRes.value.data?.data || iRes.value.data;
          setIncidents(iPayload?.incidents || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load transport details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Check if already favourite
  useEffect(() => {
    if (transport && user?.favouriteTransports) {
      setIsFav(user.favouriteTransports.includes(id));
    }
  }, [transport, user, id]);

  const handleFavourite = async () => {
    setFavLoading(true);
    setFavMsg('');
    try {
      if (isFav) {
        await removeFavourite(id);
        setIsFav(false);
        setFavMsg('Removed from favourites.');
      } else {
        await addFavourite(id);
        setIsFav(true);
        setFavMsg('Added to favourites!');
      }
    } catch (err) {
      setFavMsg(err.message || 'Action failed.');
    } finally {
      setFavLoading(false);
      setTimeout(() => setFavMsg(''), 3000);
    }
  };

  const handleFareCalc = () => {
    if (!fareFrom || !fareTo) return;
    const route = transport?.routes?.[0];
    if (!route?.fareTable?.length) { setFareResult('No fare data available.'); return; }
    const entry = route.fareTable.find(
      f => f.fromStop.toLowerCase() === fareFrom.toLowerCase() &&
           f.toStop.toLowerCase()   === fareTo.toLowerCase() &&
           (f.fareClass || 'general') === fareClass
    );
    if (entry) {
      setFareResult(`₹${entry.fare} (${entry.fareClass})`);
    } else {
      setFareResult('Fare not found for this stop pair / class.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="loading-state">
          <div className="spinner-large" />
          <p>Loading transport details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert-custom alert-error mb-3">⚠️ {error}</div>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  if (!transport) return null;

  const primaryRoute  = transport.routes?.[0];
  const stops         = primaryRoute?.stops || [];
  const schedule      = primaryRoute?.schedule || [];
  const fareTable     = primaryRoute?.fareTable || [];
  const livePosition  = transport.livePosition || crowd?.livePosition || null;
  const crowdLevel    = transport.crowdLevel || crowd?.crowdLevel?.crowdLevel || null;

  return (
    <>
      {/* Hero Header */}
      <div className="page-header">
        <div className="container">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span
                  className="fw-bold"
                  style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: 20, fontSize: '.85rem' }}
                >
                  {transport.transportNumber}
                </span>
                <span
                  style={{ background: 'rgba(255,255,255,.15)', padding: '.2rem .6rem', borderRadius: 6, fontSize: '.8rem', textTransform: 'capitalize' }}
                >
                  {transport.type === 'bus' ? '🚌' : '🚂'} {transport.type}
                </span>
                <CrowdBadge level={crowdLevel} />
              </div>
              <h1 style={{ fontSize: '1.75rem' }}>{transport.name}</h1>
              {primaryRoute && (
                <p>
                  {primaryRoute.origin} → {primaryRoute.destination}
                  {primaryRoute.totalDistance && ` · ${primaryRoute.totalDistance} km`}
                  {primaryRoute.estimatedDuration && ` · ~${primaryRoute.estimatedDuration} min`}
                </p>
              )}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-sm fw-semibold"
                style={{ background: isFav ? '#fbbf24' : 'rgba(255,255,255,.2)', color: isFav ? '#1e293b' : 'white', border: 'none', borderRadius: 8, padding: '.4rem 1rem' }}
                onClick={handleFavourite}
                disabled={favLoading || !user || user.role === 'authority'}
              >
                {isFav ? '⭐ Saved' : '☆ Save'}
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8 }}
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
            </div>
          </div>
          {favMsg && <div className="mt-2" style={{ fontSize: '.85rem', color: '#fbbf24' }}>{favMsg}</div>}
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Basic Info */}
            <div className="detail-section">
              <div className="detail-section-title">ℹ️ Transport Information</div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Transport No.</label>
                  <span>{transport.transportNumber}</span>
                </div>
                <div className="info-item">
                  <label>Type</label>
                  <span style={{ textTransform: 'capitalize' }}>{transport.type}</span>
                </div>
                {transport.operator && (
                  <div className="info-item">
                    <label>Operator</label>
                    <span>{transport.operator}</span>
                  </div>
                )}
                {transport.vehicleNumber && (
                  <div className="info-item">
                    <label>Vehicle No.</label>
                    <span>{transport.vehicleNumber}</span>
                  </div>
                )}
                {transport.totalSeats && (
                  <div className="info-item">
                    <label>Total Seats</label>
                    <span>{transport.totalSeats}</span>
                  </div>
                )}
                {transport.amenities?.length > 0 && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <label>Amenities</label>
                    <span>{transport.amenities.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Position */}
            {livePosition && (
              <div className="detail-section">
                <div className="detail-section-title">📍 Live Position</div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Current Stop</label>
                    <span>{livePosition.currentStop || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label>Next Stop</label>
                    <span>{livePosition.nextStop || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span style={{ textTransform: 'capitalize' }}>{livePosition.status || '—'}</span>
                  </div>
                  {livePosition.delayMinutes > 0 && (
                    <div className="info-item">
                      <label>Delay</label>
                      <span style={{ color: '#ef4444' }}>+{livePosition.delayMinutes} min</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Route & Stops */}
            {stops.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">🛤️ Stops Timeline</div>
                {primaryRoute && (
                  <div className="mb-3" style={{ fontSize: '.85rem', color: '#64748b' }}>
                    {primaryRoute.routeName}
                    {primaryRoute.direction && ` · ${primaryRoute.direction}`}
                  </div>
                )}
                <StopsTimeline stops={stops} currentStop={livePosition?.currentStop} />
              </div>
            )}

            {/* Incidents */}
            <div className="detail-section">
              <div className="detail-section-title">⚠️ Active Incidents ({incidents.length})</div>
              <IncidentList incidents={incidents} />
            </div>
          </div>

          <div className="col-lg-4">
            {/* Crowd Level */}
            <div className="detail-section">
              <div className="detail-section-title">👥 Crowd Level</div>
              <div className="text-center py-2">
                <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>
                  {crowdLevel === 'empty' ? '😊' : crowdLevel === 'crowded' ? '😰' : crowdLevel === 'average' ? '😐' : '❓'}
                </div>
                <CrowdBadge level={crowdLevel || 'unknown'} />
                {crowd?.crowdLevel?.updatedAt && (
                  <div className="mt-2" style={{ fontSize: '.78rem', color: '#94a3b8' }}>
                    Updated: {new Date(crowd.crowdLevel.updatedAt).toLocaleTimeString('en-IN')}
                  </div>
                )}
                {!crowdLevel && (
                  <p className="text-muted mt-2" style={{ fontSize: '.85rem' }}>
                    No crowd data available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Schedule */}
            {schedule.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">🕐 Schedule</div>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {schedule.map((trip, idx) => (
                    <div
                      key={trip.tripId || idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '.86rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {trip.departureTime} → {trip.arrivalTime}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '.76rem' }}>
                          {trip.daysOfOperation?.join(', ')}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '.72rem', padding: '.15rem .5rem', borderRadius: 5,
                          background: trip.isActive ? '#d1fae5' : '#f1f5f9',
                          color: trip.isActive ? '#065f46' : '#94a3b8',
                          fontWeight: 700,
                        }}
                      >
                        {trip.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fare Calculator */}
            <div className="detail-section">
              <div className="detail-section-title">💰 Fare Calculator</div>
              {fareTable.length > 0 ? (
                <>
                  <div className="mb-2">
                    <label className="form-label">From Stop</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Salem"
                      value={fareFrom}
                      onChange={e => { setFareFrom(e.target.value); setFareResult(null); }}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">To Stop</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Chennai"
                      value={fareTo}
                      onChange={e => { setFareTo(e.target.value); setFareResult(null); }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Class</label>
                    <select className="form-select" value={fareClass} onChange={e => setFareClass(e.target.value)}>
                      <option value="general">General</option>
                      <option value="AC">AC</option>
                      <option value="sleeper">Sleeper</option>
                    </select>
                  </div>
                  <button className="btn btn-primary btn-sm w-100" onClick={handleFareCalc}>
                    Calculate Fare
                  </button>
                  {fareResult && (
                    <div className="mt-3 text-center">
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>
                        {fareResult}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted" style={{ fontSize: '.85rem' }}>
                  No fare table available for this transport.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransportDetail;
