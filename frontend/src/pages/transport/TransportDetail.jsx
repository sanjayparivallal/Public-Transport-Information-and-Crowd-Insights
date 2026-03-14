import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransportById } from '../../api/transportApi';
import { getCrowd, submitCrowdReport } from '../../api/crowdApi';
import { getIncidentsByTransport, deleteIncident, reportIncident } from '../../api/incidentApi';
import { addFavourite, removeFavourite } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import CrowdBadge from '../../components/CrowdBadge';
import StopsTimeline from '../../components/StopsTimeline';
import IncidentList from '../../components/IncidentList';
import { BusIcon, TrainIcon, UserIcon, WrenchIcon, AlertIcon, EditIcon, StarIcon, CheckCircleIcon, SearchIcon, ClockIcon, LocationIcon, ArrowRightIcon, ArrowLeftIcon } from '../../components/icons';

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

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

  // Report Modals State
  const [showCrowdModal, setShowCrowdModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [crowdForm, setCrowdForm] = useState({ crowdLevel: 'average', boardingStop: '' });
  const [incidentForm, setIncidentForm] = useState({ incidentType: 'delay', severity: 'low', description: '', location: '' });

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
        if (user) {
          const updatedFavs = (user.favouriteTransports || []).filter(x => x !== id);
          const updatedUser = { ...user, favouriteTransports: updatedFavs };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setFavMsg('Removed from favourites.');
      } else {
        await addFavourite(id);
        setIsFav(true);
        if (user) {
          const updatedFavs = [...(user.favouriteTransports || []), id];
          const updatedUser = { ...user, favouriteTransports: updatedFavs };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setFavMsg('Added to favourites!');
      }
    } catch (err) {
      setFavMsg(err.message || 'Action failed.');
    } finally {
      setFavLoading(false);
      setTimeout(() => setFavMsg(''), 3000);
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm("Are you sure you want to delete this incident?")) return;
    try {
      await deleteIncident(incidentId);
      const iRes = await getIncidentsByTransport(id, { status: 'open', limit: 10 });
      const iPayload = iRes.data?.data || iRes.data;
      setIncidents(iPayload?.incidents || []);
    } catch (err) {
      alert(err.message || 'Failed to delete incident.');
    }
  };

  const handleCrowdSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const route = transport?.routes?.[0];
      await submitCrowdReport({ transportId: id, routeId: route?._id, ...crowdForm });
      setShowCrowdModal(false);
      alert('Crowd reported successfully!');
      const cRes = await getCrowd(id);
      setCrowd(cRes.data?.data || cRes.data);
    } catch (err) {
      alert(err.message || 'Failed to report crowd');
    } finally {
      setReportLoading(false);
    }
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const route = transport?.routes?.[0];
      await reportIncident({ transportId: id, routeId: route?._id, ...incidentForm });
      setShowIncidentModal(false);
      alert('Incident reported successfully!');
      const iRes = await getIncidentsByTransport(id, { status: 'open', limit: 10 });
      const iPayload = iRes.data?.data || iRes.data;
      setIncidents(iPayload?.incidents || []);
    } catch (err) {
      alert(err.message || 'Failed to report incident');
    } finally {
      setReportLoading(false);
    }
  };

  const handleFareCalc = () => {
    if (!fareFrom || !fareTo) return;
    const route = transport?.routes?.[0];
    if (!route?.fareTable?.length) { setFareResult('No fare data available.'); return; }
    const entry = route.fareTable.find(
      f => ((f.fromStop.toLowerCase() === fareFrom.toLowerCase() &&
             f.toStop.toLowerCase()   === fareTo.toLowerCase()) || 
            (f.fromStop.toLowerCase() === fareTo.toLowerCase() &&
             f.toStop.toLowerCase()   === fareFrom.toLowerCase())) &&
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
        <div className="alert-custom alert-error mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>
        <button className="btn btn-outline-primary d-flex align-items-center" onClick={() => navigate(-1)}><ArrowLeftIcon size={16} className="me-2"/> Go Back</button>
      </div>
    );
  }

  if (!transport) return null;

  const primaryRoute  = transport.routes?.[0];
  const stops         = primaryRoute?.stops || [];
  const schedule      = primaryRoute?.schedule || [];
  const fareTable     = primaryRoute?.fareTable || [];
  const livePosition  = transport.livePosition || crowd?.livePosition || null;
  const crowdLevel    = transport.crowdLevel || crowd?.officialCrowdLevel?.crowdLevel || crowd?.crowdLevel?.crowdLevel || null;

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
                  className="d-flex align-items-center"
                >
                  {transport.type === 'bus' ? <BusIcon size={14} className="me-1"/> : <TrainIcon size={14} className="me-1"/>} {transport.type}
                </span>
                <CrowdBadge level={crowdLevel} />
              </div>
              <h1 style={{ fontSize: '1.75rem' }}>{transport.name}</h1>
              {primaryRoute && (
                <p>
                  {primaryRoute.origin} <ArrowRightIcon size={14} className="mx-1"/> {primaryRoute.destination}
                  {primaryRoute.totalDistance && ` · ${primaryRoute.totalDistance} km`}
                  {primaryRoute.estimatedDuration && ` · ~${primaryRoute.estimatedDuration} min`}
                </p>
              )}
            </div>
            <div className="d-flex flex-column align-items-end gap-2">
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-sm fw-semibold d-flex align-items-center"
                  style={{ background: isFav ? '#fbbf24' : 'rgba(255,255,255,.2)', color: isFav ? '#1e293b' : 'white', border: 'none', borderRadius: 8, padding: '.4rem 1rem' }}
                  onClick={handleFavourite}
                  disabled={favLoading || !user || user.role === 'authority'}
                >
                  <StarIcon size={16} className="me-2" filled={isFav}/> {isFav ? 'Saved' : 'Save'}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8 }}
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeftIcon size={16} className="me-2"/> Back
                </button>
              </div>
              {user && user.role !== 'authority' && (
                <div className="d-flex gap-2 flex-wrap mt-1">
                  <button className="btn btn-sm d-flex align-items-center" style={{ background: 'white', color: '#0f172a', fontWeight: 600, border: 'none', borderRadius: 8 }} onClick={() => setShowCrowdModal(true)}>
                    <UserIcon size={16} className="me-1"/> Report Crowd
                  </button>
                  <button className="btn btn-sm d-flex align-items-center" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 600, border: 'none', borderRadius: 8 }} onClick={() => setShowIncidentModal(true)}>
                    <AlertIcon size={16} className="me-1"/> Report Incident
                  </button>
                </div>
              )}
            </div>
          </div>
          {favMsg && <div className="mt-2 text-end" style={{ fontSize: '.85rem', color: '#fbbf24' }}>{favMsg}</div>}
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Basic Info */}
            <div className="detail-section">
              <div className="detail-section-title d-flex align-items-center"><LocationIcon size={20} className="me-2"/> Transport Information</div>
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
                <div className="detail-section-title d-flex align-items-center"><LocationIcon size={20} className="me-2"/> Live Position</div>
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
                <div className="detail-section-title d-flex align-items-center"><ClockIcon size={20} className="me-2"/> Stops Timeline</div>
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
              <div className="detail-section-title d-flex align-items-center"><AlertIcon size={20} className="me-2"/> Active Incidents ({incidents.length})</div>
              <IncidentList 
                incidents={incidents}
                onDelete={user?.role === 'authority' ? handleDeleteIncident : undefined}
              />
            </div>
          </div>

          <div className="col-lg-4">
            {/* Crowd Level */}
            <div className="detail-section">
              <div className="detail-section-title d-flex align-items-center"><UserIcon size={20} className="me-2"/> Crowd Level</div>
              <div className="text-center py-2">
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
                <div className="detail-section-title d-flex align-items-center"><ClockIcon size={20} className="me-2"/> Schedule</div>
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
              <div className="detail-section-title d-flex align-items-center"><SearchIcon size={20} className="me-2"/> Fare Calculator</div>
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

      {/* Crowd Modal */}
      {showCrowdModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center"><UserIcon size={20} className="me-2"/> Report Crowd Level</h5>
                <button type="button" className="btn-close" onClick={() => setShowCrowdModal(false)}></button>
              </div>
              <div className="modal-body">
                <form id="crowdForm" onSubmit={handleCrowdSubmit}>
                  <div className="mb-3">
                    <label className="form-label">How crowded is it?</label>
                    <select className="form-select" value={crowdForm.crowdLevel} onChange={e => setCrowdForm({...crowdForm, crowdLevel: e.target.value})}>
                      <option value="empty">Empty / Seats Available</option>
                      <option value="average">Average / Standing Room</option>
                      <option value="crowded">Crowded / Full</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Boarding Stop (Optional)</label>
                    <input type="text" className="form-control" placeholder="Where are you boarding?" value={crowdForm.boardingStop} onChange={e => setCrowdForm({...crowdForm, boardingStop: e.target.value})} />
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button type="button" className="btn btn-light" onClick={() => setShowCrowdModal(false)}>Cancel</button>
                <button type="submit" form="crowdForm" className="btn btn-primary" disabled={reportLoading}>
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center"><AlertIcon size={20} className="me-2"/> Report Incident</h5>
                <button type="button" className="btn-close" onClick={() => setShowIncidentModal(false)}></button>
              </div>
              <div className="modal-body">
                <form id="incidentForm" onSubmit={handleIncidentSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Incident Type *</label>
                    <select className="form-select" value={incidentForm.incidentType} onChange={e => setIncidentForm({...incidentForm, incidentType: e.target.value})}>
                      <option value="delay">Delay</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="accident">Accident</option>
                      <option value="overcrowding">Overcrowding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Severity</label>
                    <select className="form-select" value={incidentForm.severity} onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location (Optional)</label>
                    <input type="text" className="form-control" placeholder="E.g. near Main St" value={incidentForm.location} onChange={e => setIncidentForm({...incidentForm, location: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea className="form-control" rows="2" placeholder="More details..." value={incidentForm.description} onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button type="button" className="btn btn-light" onClick={() => setShowIncidentModal(false)}>Cancel</button>
                <button type="submit" form="incidentForm" className="btn btn-danger" disabled={reportLoading}>
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransportDetail;
