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
import { BusIcon, TrainIcon, UserIcon, AlertIcon, StarIcon, SearchIcon, ClockIcon, LocationIcon, ArrowRightIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../components/icons';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (transport) fetchIncidentsData(incidentsPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentsPage]);

  useEffect(() => {
    if (transport) fetchCrowdData(crowdPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Fleet Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertIcon size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">System Outage</h2>
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm mb-10 leading-relaxed">
            {error}
          </div>
          <button 
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-300 transform active:scale-95" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={20} /> Revert to Safety
          </button>
        </div>
      </div>
    );
  }

  if (!transport) return null;

  const primaryRoute  = transport.routes?.[0];
  const stops         = primaryRoute?.stops || [];
  const schedule      = primaryRoute?.schedule || [];
  const fareTable     = primaryRoute?.fareTable || [];
  const livePosition  = transport.livePosition || crowd?.livePosition || null;
  const crowdLevel    = crowd?.official?.crowdLevel || transport.crowdLevel || null;
  const role          = String(user?.role || '').toLowerCase();
  const canReport     = !!user && role !== 'authority';

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-sm font-bold tracking-wider text-slate-700">
                  {transport.transportNumber}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full text-sm font-medium capitalize text-primary-600">
                  {transport.type === 'bus' ? <BusIcon size={14} /> : <TrainIcon size={14} />} 
                  {transport.type}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900">
                {transport.name}
              </h1>

              {primaryRoute && (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-slate-500 font-medium">
                  <span className="text-slate-800">{primaryRoute.origin}</span>
                  <ArrowRightIcon size={16} className="text-slate-400" />
                  <span className="text-slate-800">{primaryRoute.destination}</span>
                  {primaryRoute.totalDistance && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
                      <span>{primaryRoute.totalDistance} km</span>
                    </>
                  )}
                  {primaryRoute.estimatedDuration && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
                      <span>{primaryRoute.estimatedDuration} min</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 ${isFav ? 'bg-amber-400 text-slate-900 border border-amber-500/40' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                onClick={handleFavourite}
                disabled={favLoading || !user || user.role === 'authority'}
              >
                <StarIcon size={20} filled={isFav}/>
                {isFav ? 'In Favourites' : 'Add to Favourites'}
              </button>

              <button
                className="p-3 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 group"
                onClick={() => navigate(-1)}
                title="Go Back"
              >
                <ArrowLeftIcon size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {favMsg && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="inline-block px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-amber-400 shadow-sm">
                {favMsg}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20 space-y-8">
        <TransportInfo transport={transport} crowdLevel={crowdLevel} availableSeats={livePosition?.availableSeats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Split */}
          <div className="lg:col-span-8 space-y-8">

            {livePosition && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                </div>
                
                <div className="flex items-center text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">
                  <LocationIcon size={24} className="mr-3 text-emerald-500" />
                  Live Tracking
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Stop</label>
                    <span className="text-slate-800 font-bold leading-tight">{livePosition.currentStop || 'No data'}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Next Stop</label>
                    <span className="text-slate-800 font-bold leading-tight">{livePosition.nextStop || 'No data'}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                    <span className="text-emerald-600 font-bold capitalize bg-emerald-50 px-2 py-0.5 rounded-lg w-fit text-sm">{livePosition.status || 'On track'}</span>
                  </div>
                  {livePosition.delayMinutes > 0 && (
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delay</label>
                      <span className="text-red-500 font-black">+{livePosition.delayMinutes} min</span>
                    </div>
                  )}
                  {livePosition.availableSeats !== null && livePosition.availableSeats !== undefined && (
                    <div className="flex flex-col mt-2 lg:mt-0">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Availability</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${livePosition.availableSeats > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {livePosition.availableSeats} Seats
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {stops.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center text-lg font-bold text-slate-800">
                    <ClockIcon size={24} className="mr-3 text-primary-500" />
                    Stops Timeline
                  </div>
                  {primaryRoute && (
                    <div className="hidden sm:block text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      {primaryRoute.routeName} {primaryRoute.direction && `• ${primaryRoute.direction}`}
                    </div>
                  )}
                </div>
                <StopsTimeline stops={stops} currentStop={livePosition?.currentStop} />
              </div>
            )}
          </div>

          {/* Right Split */}
          <div className="lg:col-span-4 space-y-8">
            <FareCalculator fareTable={fareTable} />
          </div>
        </div>

        <ScheduleSection schedule={schedule} />

        {/* Row 2: Incidents Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                    <AlertIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 m-0">Recent Incidents</h4>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{incidentsPagination.total} reports found</span>
                  </div>
                </div>
                
                {canReport && (
                  <button 
                    className="btn-danger" 
                    onClick={() => setShowIncidentModal(true)}
                  >
                    <PlusIcon size={18} className="mr-2" /> 
                    Report Incident
                  </button>
                )}
              </div>
              
              <IncidentList 
                incidents={incidents}
                onDelete={user?.role === 'authority' ? handleDeleteIncident : undefined}
              />
              
              {incidentsPagination.pages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
                  <button 
                    className="flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                    disabled={incidentsPage === 1} 
                    onClick={() => setIncidentsPage(p => p - 1)}
                  >
                    <ChevronLeftIcon size={18} className="mr-2"/> Prev
                  </button>
                  <span className="text-xs font-black text-slate-400 uppercase">Page {incidentsPage} / {incidentsPagination.pages}</span>
                  <button 
                    className="flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                    disabled={incidentsPage === incidentsPagination.pages} 
                    onClick={() => setIncidentsPage(p => p + 1)}
                  >
                    Next <ChevronRightIcon size={18} className="ml-2"/>
                  </button>
                </div>
              )}
            </div>

            {/* Commuter Crowd Reports */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 rounded-xl text-primary-500">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 m-0">Commuter Crowd Reports</h4>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{crowdPagination.total} recent updates</span>
                  </div>
                </div>
                
                {canReport && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowCrowdModal(true)}
                  >
                    <PlusIcon size={18} className="mr-2" /> 
                    Report Crowd
                  </button>
                )}
              </div>
              
              {crowdReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <UserIcon size={48} className="text-slate-300 mx-auto mb-4"/>
                  <p className="text-slate-500 font-semibold">No crowd reports yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to update others on the crowd level!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crowdReports.map(report => {
                    const reportedAt = report.reportedAt || report.createdAt || report.updatedAt;
                    const reporterName = report.reportedBy?.name || report.reportedBy?.email || report.reporterName || 'Unknown Commuter';

                    return (
                    <div key={report._id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center justify-between mb-4">
                         <CrowdBadge level={report.crowdLevel} />
                         <span className="text-[10px] font-black text-slate-400 uppercase">
                          {reportedAt ? new Date(reportedAt).toLocaleDateString('en-IN') : '--'}
                         </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                          <UserIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate leading-none mb-1">
                            {reporterName}
                          </div>
                          {report.boardingStop && (
                            <div className="text-xs text-slate-500 flex items-center truncate">
                              <LocationIcon size={12} className="mr-1 shrink-0"/> Boarded at <span className="font-bold ml-1 text-slate-700">{report.boardingStop}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
              
              {crowdPagination.pages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
                  <button 
                    className="flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                    disabled={crowdPage === 1} 
                    onClick={() => setCrowdPage(p => p - 1)}
                   >
                    <ChevronLeftIcon size={18} className="mr-2"/> Prev
                  </button>
                  <span className="text-xs font-black text-slate-400 uppercase">Page {crowdPage} / {crowdPagination.pages}</span>
                  <button 
                    className="flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                    disabled={crowdPage === crowdPagination.pages} 
                    onClick={() => setCrowdPage(p => p + 1)}
                  >
                    Next <ChevronRightIcon size={18} className="ml-2"/>
                  </button>
                </div>
              )}
            </div>
      </div>

      {/* Crowd Modal */}
      {showCrowdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2">
                <UserIcon size={18} className="text-blue-600" /> Report Crowd
              </h3>
              <button 
                onClick={() => setShowCrowdModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
               >
                <PlusIcon size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="crowdForm" onSubmit={handleCrowdSubmit} className="space-y-4">
                <div>
                  <label className="label">Crowd Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['empty', 'average', 'crowded'].map((level) => (
                      <label 
                        key={level}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${crowdForm.crowdLevel === level ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="crowdLevel" 
                            value={level} 
                            checked={crowdForm.crowdLevel === level}
                            onChange={e => setCrowdForm({...crowdForm, crowdLevel: e.target.value})}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="font-bold text-slate-700 capitalize">{level === 'empty' ? 'Seats Available' : level === 'average' ? 'Standing Room' : 'Full / Crowded'}</span>
                        </div>
                        <CrowdBadge level={level} />
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="label">Boarding Stop (Optional)</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Where did you board?" 
                    value={crowdForm.boardingStop} 
                    onChange={e => setCrowdForm({...crowdForm, boardingStop: e.target.value})} 
                  />
                </div>
              </form>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button 
                type="button" 
                className="btn-secondary flex-1 justify-center" 
                onClick={() => setShowCrowdModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="crowdForm" 
                className="btn-primary flex-1 justify-center" 
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Post Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="flex items-center gap-2">
                <AlertIcon size={18} className="text-red-600" /> Report Incident
              </h3>
              <button 
                onClick={() => setShowIncidentModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <PlusIcon size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="incidentForm" onSubmit={handleIncidentSubmit} className="space-y-4">
                <div>
                  <label className="label">Photo Evidence</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${incidentForm.img ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    {incidentForm.img ? (
                      <div className="relative inline-block">
                        <img src={incidentForm.img} alt="Preview" className="max-h-40 rounded-xl shadow-lg border border-white" />
                        <button 
                          type="button" 
                          className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                          onClick={() => setIncidentForm(prev => ({ ...prev, img: '' }))}
                        >
                          <PlusIcon size={16} className="rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="text-sm font-bold text-slate-500">
                          Click to upload or drag image
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Max size 5MB</p>
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type *</label>
                    <select 
                      className="input" 
                      value={incidentForm.incidentType} 
                      onChange={e => setIncidentForm({...incidentForm, incidentType: e.target.value})}
                    >
                      <option value="delay">Delay</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="accident">Accident</option>
                      <option value="overcrowding">Overcrowding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Severity</label>
                    <select 
                      className="input" 
                      value={incidentForm.severity} 
                      onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Location</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="E.g. Near Teynampet station" 
                    value={incidentForm.location} 
                    onChange={e => setIncidentForm({...incidentForm, location: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea 
                    className="input min-h-25" 
                    placeholder="Tell us what happened..." 
                    value={incidentForm.description} 
                    onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                  />
                </div>
              </form>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button 
                type="button" 
                className="btn-secondary flex-1 justify-center" 
                onClick={() => setShowIncidentModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="incidentForm" 
                className="btn-danger flex-1 justify-center" 
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportDetail;
