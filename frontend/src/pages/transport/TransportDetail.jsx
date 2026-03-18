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
import FareCalculator from './FareCalculator';
import ScheduleSection from './ScheduleSection';
import TransportInfo from './TransportInfo';
import { BusIcon, TrainIcon, UserIcon, AlertIcon, StarIcon, SearchIcon, ClockIcon, LocationIcon, ArrowRightIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [transport, setTransport]   = useState(null);
  const [crowd, setCrowd]           = useState(null);
  const [incidents, setIncidents]   = useState([]);
  const [incidentsPage, setIncidentsPage] = useState(1);
  const [incidentsPagination, setIncidentsPagination] = useState({ total: 0, pages: 1 });

  const [crowdReports, setCrowdReports] = useState([]);
  const [crowdPage, setCrowdPage] = useState(1);
  const [crowdPagination, setCrowdPagination] = useState({ total: 0, pages: 1 });

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isFav, setIsFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favMsg, setFavMsg]         = useState('');

  // Report Modals State
  const [showCrowdModal, setShowCrowdModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [crowdForm, setCrowdForm] = useState({ crowdLevel: 'average', boardingStop: '' });
  const [incidentForm, setIncidentForm] = useState({ incidentType: 'delay', severity: 'low', description: '', location: '', img: '' });

  const fetchCrowdData = async (page) => {
    try {
      const cRes = await getCrowd(id, { page, limit: 10 });
      const cPayload = cRes.data?.data || cRes.data;
      setCrowd(cPayload);
      setCrowdReports(cPayload?.reports || []);
      if (cPayload?.pagination) setCrowdPagination(cPayload.pagination);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIncidentsData = async (page) => {
    try {
      const iRes = await getIncidentsByTransport(id, { limit: 10, page });
      const iPayload = iRes.data?.data || iRes.data;
      setIncidents(iPayload?.incidents || []);
      if (iPayload?.pagination) setIncidentsPagination(iPayload.pagination);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const tRes = await getTransportById(id);
        const tPayload = tRes.data?.data || tRes.data;
        setTransport(tPayload?.transport || tPayload);
        
        await fetchCrowdData(crowdPage);
        await fetchIncidentsData(incidentsPage);
      } catch (err) {
        setError(err.message || 'Failed to load transport details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (transport) fetchIncidentsData(incidentsPage);
  }, [incidentsPage]);

  useEffect(() => {
    if (transport) fetchCrowdData(crowdPage);
  }, [crowdPage]);

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
      fetchCrowdData(1);
      setCrowdPage(1);
    } catch (err) {
      alert(err.message || 'Failed to report crowd');
    } finally {
      setReportLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setIncidentForm(prev => ({ ...prev, img: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const route = transport?.routes?.[0];
      await reportIncident({ transportId: id, routeId: route?._id, ...incidentForm });
      setShowIncidentModal(false);
      alert('Incident reported successfully!');
      fetchIncidentsData(1);
      setIncidentsPage(1);
    } catch (err) {
      alert(err.message || 'Failed to report incident');
    } finally {
      setReportLoading(false);
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
                    className="btn btn-sm fw-semibold d-flex align-items-center shadow-sm"
                    style={{ background: isFav ? '#fbbf24' : 'rgba(255,255,255,.2)', color: isFav ? '#1e293b' : 'white', border: 'none', borderRadius: 8, padding: '.5rem 1rem' }}
                    onClick={handleFavourite}
                    disabled={favLoading || !user || user.role === 'authority'}
                  >
                    <StarIcon size={16} className="me-2" filled={isFav}/> {isFav ? 'Saved' : 'Save'}
                  </button>
                  <button
                    className="btn btn-sm shadow-sm"
                    style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '.5rem 1rem' }}
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeftIcon size={16} className="me-2"/> Back
                  </button>
                </div>
              </div>
          </div>
          {favMsg && <div className="mt-2 text-end" style={{ fontSize: '.85rem', color: '#fbbf24' }}>{favMsg}</div>}
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Basic Info */}
            <TransportInfo transport={transport} />

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
                  {livePosition.availableSeats !== null && livePosition.availableSeats !== undefined && (
                    <div className="info-item">
                      <label>Available Seats</label>
                      <span className="fw-bold" style={{ color: livePosition.availableSeats > 10 ? 'var(--success)' : '#ef4444' }}>
                        {livePosition.availableSeats}
                      </span>
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
            <div className="detail-section p-4 bg-white rounded-4 shadow-sm">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4 flex-wrap gap-3">
                <h4 className="d-flex align-items-center fw-bold text-dark m-0">
                  <AlertIcon size={24} className="me-2 text-danger"/> All Incidents <span className="badge bg-light text-secondary ms-2 rounded-pill border">{incidentsPagination.total}</span>
                </h4>
                {user && user.role !== 'authority' && (
                  <button className="btn btn-danger btn-sm fw-medium rounded-pill px-3 shadow-sm d-flex align-items-center" onClick={() => setShowIncidentModal(true)}>
                    <AlertIcon size={16} className="me-2"/> Report Incident
                  </button>
                )}
              </div>
              <IncidentList 
                incidents={incidents}
                onDelete={user?.role === 'authority' ? handleDeleteIncident : undefined}
              />
              {incidentsPagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={incidentsPage === 1} onClick={() => setIncidentsPage(p => p - 1)}>
                    <ChevronLeftIcon size={16}/> Prev
                  </button>
                  <span style={{ fontSize: '.85rem', color: '#64748b' }}>Page {incidentsPage} of {incidentsPagination.pages}</span>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={incidentsPage === incidentsPagination.pages} onClick={() => setIncidentsPage(p => p + 1)}>
                    Next <ChevronRightIcon size={16}/>
                  </button>
                </div>
              )}
            </div>

            {/* Crowd Reports by Users */}
            <div className="detail-section p-4 bg-white rounded-4 shadow-sm">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4 flex-wrap gap-3">
                <h4 className="d-flex align-items-center fw-bold text-dark m-0">
                  <UserIcon size={24} className="me-2 text-primary"/> Commuter Crowd Reports <span className="badge bg-light text-secondary ms-2 rounded-pill border">{crowdPagination.total}</span>
                </h4>
                {user && user.role !== 'authority' && (
                  <button className="btn btn-primary btn-sm fw-medium rounded-pill px-3 shadow-sm d-flex align-items-center" onClick={() => setShowCrowdModal(true)}>
                    <UserIcon size={16} className="me-2"/> Report Crowd
                  </button>
                )}
              </div>
              
              {crowdReports.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border-dashed">
                  <UserIcon size={40} className="text-muted mb-2"/>
                  <h6 className="text-muted fw-normal m-0" style={{ fontSize: '.95rem' }}>No recent commuter reports.</h6>
                </div>
              ) : (
                <div className="row g-3">
                  {crowdReports.map(report => (
                    <div key={report._id} className="col-md-6">
                      <div className="card h-100 shadow-sm border-0 bg-light" style={{ borderRadius: '12px' }}>
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between mb-3">
                             <CrowdBadge level={report.crowdLevel} />
                             <span className="badge bg-white text-secondary border d-flex align-items-center" style={{ fontSize: '.75rem' }}>
                               <CalendarIcon size={12} className="me-1"/> {new Date(report.reportedAt).toLocaleDateString()}
                             </span>
                          </div>
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center mb-1">
                              <UserIcon size={16} className="me-2 text-primary"/>  {report.reportedBy?.name || 'Commuter'}
                            </div>
                            {report.boardingStop && (
                              <div className="text-secondary d-flex align-items-center" style={{ fontSize: '.85rem' }}>
                                <LocationIcon size={14} className="me-1"/> Boarded at <strong className="ms-1">{report.boardingStop}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {crowdPagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={crowdPage === 1} onClick={() => setCrowdPage(p => p - 1)}>
                    <ChevronLeftIcon size={16}/> Prev
                  </button>
                  <span style={{ fontSize: '.85rem', color: '#64748b' }}>Page {crowdPage} of {crowdPagination.pages}</span>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={crowdPage === crowdPagination.pages} onClick={() => setCrowdPage(p => p + 1)}>
                    Next <ChevronRightIcon size={16}/>
                  </button>
                </div>
              )}
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
            <ScheduleSection schedule={schedule} />

            {/* Fare Calculator */}
            <FareCalculator fareTable={fareTable} />
          </div>
        </div>
      </div>

      {/* Crowd Modal */}
      {showCrowdModal && (
        <div className="modal show d-block" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title d-flex align-items-center fw-bold"><UserIcon size={22} className="me-2 text-white-50"/> Report Crowd Level</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCrowdModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-light">
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
              <div className="modal-footer border-0 bg-white p-3 d-flex gap-2">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowCrowdModal(false)}>Cancel</button>
                <button type="submit" form="crowdForm" className="btn btn-primary rounded-pill px-4 fw-medium flex-grow-1 shadow-sm" disabled={reportLoading}>
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="modal show d-block" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header bg-danger text-white border-0 py-3">
                <h5 className="modal-title d-flex align-items-center fw-bold"><AlertIcon size={22} className="me-2 text-white-50"/> Report Incident</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowIncidentModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-light">
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
                  <div className="mb-3">
                    <label className="form-label">Photo Evidence (Optional)</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                    {incidentForm.img && (
                      <div className="mt-2">
                        <img src={incidentForm.img} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                        <button type="button" className="btn btn-sm btn-link text-danger mt-1 p-0" onClick={() => setIncidentForm(prev => ({ ...prev, img: '' }))}>Remove image</button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 bg-white p-3 d-flex gap-2">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowIncidentModal(false)}>Cancel</button>
                <button type="submit" form="incidentForm" className="btn btn-danger rounded-pill px-4 fw-medium flex-grow-1 shadow-sm" disabled={reportLoading}>
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
