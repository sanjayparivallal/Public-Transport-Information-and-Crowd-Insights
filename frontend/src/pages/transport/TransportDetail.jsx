import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {  getTransportById  } from '../../api';
import {  getCrowd, submitCrowdReport, updateCrowdLevel, updateLivePosition, deleteCrowdReport  } from '../../api';
import {  getIncidentsByTransport, deleteIncident, reportIncident  } from '../../api';
import {  addFavourite, removeFavourite  } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CrowdBadge from '../../components/CrowdBadge';
import StopsTimeline from '../../components/StopsTimeline';
import IncidentList from '../../components/IncidentList';
import FareCalculator from './FareCalculator';
import TransportInfo from './TransportInfo';
import { BusIcon, TrainIcon, UserIcon, AlertIcon, StarIcon, ClockIcon, LocationIcon, ArrowRightIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import ConfirmModal from '../../components/ConfirmModal';
import Skeleton from '../../components/Skeleton';

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRouteId = queryParams.get('routeId');
  const { user, setUser } = useAuth();

  const [transport, setTransport]   = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(initialRouteId);
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
  const [showLiveUpdateModal, setShowLiveUpdateModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [crowdForm, setCrowdForm] = useState({ crowdLevel: 'average', boardingStop: '' });
  const [incidentForm, setIncidentForm] = useState({ incidentType: 'delay', severity: 'low', description: '', location: '', img: '' });
  const [liveForm, setLiveForm] = useState({
    routeId: '',
    currentStop: '',
    nextStop: '',
    delayMinutes: 0,
    status: 'on-time',
    availableSeats: '',
    crowdLevel: 'average',
  });

  // Confirm modal state
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });
  const [inlineMsg, setInlineMsg] = useState('');

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
        const transportData = tPayload?.transport || tPayload;
        setTransport(transportData);
        if (!selectedRouteId && transportData?.routes?.[0]) {
          setSelectedRouteId(transportData.routes[0]._id);
        }
        
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
    if (transport && selectedRouteId && user?.favouriteRoutes) {
      const isRouteFav = user.favouriteRoutes.some(r => {
         const rId = typeof r === 'object' ? r._id : r;
         return String(rId) === String(selectedRouteId);
      });
      setIsFav(isRouteFav);
    } else {
      setIsFav(false);
    }
  }, [transport, user, selectedRouteId]);

  useEffect(() => {
    if (!transport) return;
    const route = transport.routes?.find(r => r._id === selectedRouteId) || transport.routes?.[0];
    const current = route?.livePosition || transport.livePosition || null;
    const off = crowd?.official?.find(o => o.routeId === route?._id || o.routeId?._id === route?._id);
    setLiveForm((prev) => ({
      ...prev,
      routeId: route?._id || '',
      currentStop: current?.currentStop || '',
      nextStop: current?.nextStop || '',
      delayMinutes: current?.delayMinutes || 0,
      status: current?.status || 'on-time',
      availableSeats: route?.availableSeats ?? '',
      crowdLevel: off?.crowdLevel || route?.crowdLevel || 'average',
    }));
  }, [transport, crowd, selectedRouteId]);

  const handleFavourite = async () => {
    if (!selectedRouteId) {
      setFavMsg('No route selected.');
      return;
    }
    setFavLoading(true);
    setFavMsg('');
    try {
      if (isFav) {
        const res = await removeFavourite(selectedRouteId);
        setIsFav(false);
        if (user) {
          const updatedFavs = res.data?.data || (user.favouriteRoutes || []).filter(x => String(typeof x === 'object' ? x._id : x) !== String(selectedRouteId));
          const updatedUser = { ...user, favouriteRoutes: Array.isArray(updatedFavs) ? updatedFavs : [] };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setFavMsg('Removed from favourites.');
      } else {
        const res = await addFavourite(selectedRouteId);
        setIsFav(true);
        if (user) {
          const updatedFavs = res.data?.data || [...(user.favouriteRoutes || []), selectedRouteId];
          const updatedUser = { ...user, favouriteRoutes: Array.isArray(updatedFavs) ? updatedFavs : [] };
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

  const handleDeleteIncident = (incidentId) => {
    openConfirm(
      'Delete Incident Report?',
      'This incident will be permanently removed and authorities will no longer see it.',
      async () => {
        try {
          await deleteIncident(incidentId);
          const iRes = await getIncidentsByTransport(id, { status: 'open', limit: 10 });
          const iPayload = iRes.data?.data || iRes.data;
          setIncidents(iPayload?.incidents || []);
        } catch (err) {
          setInlineMsg(err.message || 'Failed to delete incident.');
          setTimeout(() => setInlineMsg(''), 3500);
        }
        closeConfirm();
      }
    );
  };

  const handleDeleteCrowdReport = (reportId) => {
    openConfirm(
      'Delete Crowd Report?',
      'Your crowd report will be permanently removed from this route.',
      async () => {
        try {
          await deleteCrowdReport(reportId);
          await fetchCrowdData(crowdPage);
        } catch (err) {
          setInlineMsg(err.message || 'Failed to delete report.');
          setTimeout(() => setInlineMsg(''), 3500);
        }
        closeConfirm();
      }
    );
  };

  const handleCrowdSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const route = transport?.routes?.find(r => r._id === selectedRouteId) || transport?.routes?.[0];
      await submitCrowdReport({ routeId: route?._id, ...crowdForm });
      setShowCrowdModal(false);
      setInlineMsg('✔ Crowd reported successfully!');
      setTimeout(() => setInlineMsg(''), 3000);
      fetchCrowdData(1);
      setCrowdPage(1);
    } catch (err) {
      setInlineMsg(err.message || 'Failed to report crowd');
      setTimeout(() => setInlineMsg(''), 3500);
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
      const route = transport?.routes?.find(r => r._id === selectedRouteId) || transport?.routes?.[0];
      await reportIncident({ transportId: id, routeId: route?._id, ...incidentForm });
      setShowIncidentModal(false);
      setInlineMsg('✔ Incident reported successfully!');
      setTimeout(() => setInlineMsg(''), 3000);
      fetchIncidentsData(1);
      setIncidentsPage(1);
    } catch (err) {
      setInlineMsg(err.message || 'Failed to report incident');
      setTimeout(() => setInlineMsg(''), 3500);
    } finally {
      setReportLoading(false);
    }
  };

  const handleLiveUpdateSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const route = (transport?.routes || []).find((r) => String(r._id) === String(liveForm.routeId)) || transport?.routes?.[0];
      const routeId = route?._id;
      if (!routeId) throw new Error('No route assigned for this transport');

      await updateLivePosition({
        transportId: id,
        routeId,
        currentStop: liveForm.currentStop || null,
        nextStop: liveForm.nextStop || null,
        delayMinutes: Number(liveForm.delayMinutes || 0),
        status: liveForm.status,
        availableSeats: liveForm.availableSeats === '' ? null : Number(liveForm.availableSeats),
      });

      await updateCrowdLevel({
        transportId: id,
        routeId,
        crowdLevel: liveForm.crowdLevel,
        currentStop: liveForm.currentStop || null,
        manualSeats: liveForm.availableSeats === '' ? null : Number(liveForm.availableSeats),
      });

      const tRes = await getTransportById(id);
      const tPayload = tRes.data?.data || tRes.data;
      setTransport(tPayload?.transport || tPayload);

      setShowLiveUpdateModal(false);
      setInlineMsg('✔ Live position and crowd level updated!');
      setTimeout(() => setInlineMsg(''), 3000);
      await fetchCrowdData(1);
      setCrowdPage(1);
    } catch (err) {
      setInlineMsg(err.message || 'Failed to update live details');
      setTimeout(() => setInlineMsg(''), 3500);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        {/* Skeleton Header */}
        <div className="h-56 animate-pulse" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
          <div className="max-w-7xl mx-auto px-6 py-10 space-y-4">
            <Skeleton width={100} height={12} className="!bg-white/20 rounded-full" />
            <Skeleton width={260} height={28} className="!bg-white/20" />
            <Skeleton width={180} height={14} className="!bg-white/15" />
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <Skeleton variant="card" height={220} />
                <Skeleton variant="card" height={320} />
              </div>
              <div className="lg:col-span-4">
                <Skeleton variant="card" height={460} />
              </div>
            </div>
            <Skeleton variant="card" height={280} />
          </div>
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
            className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={18} /> Revert to Safety
          </button>
        </div>
      </div>
    );
  }

  if (!transport) return null;

  const primaryRoute  = transport.routes?.find(r => r._id === selectedRouteId) || transport.routes?.[0];
  const stops         = primaryRoute?.stops || [];
  const fareTable     = primaryRoute?.fareTable || [];
  
  // Look for the most recent live position across all routes of this transport
  const allLivePositions = (transport.routes || [])
    .map(r => r.livePosition)
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  const livePosition = primaryRoute?.livePosition || allLivePositions[0] || transport.livePosition || null;
  const displayAvailableSeats = primaryRoute?.availableSeats ?? null;
  const officialCrowd = crowd?.official?.find(o => String(o.routeId?._id || o.routeId) === String(primaryRoute?._id));
  const crowdLevel    = officialCrowd?.crowdLevel || primaryRoute?.crowdLevel || null;
  
  const filteredCrowdReports = crowdReports.filter(r => String(r.routeId?._id || r.routeId) === String(primaryRoute?._id));
  const role          = String(user?.role || '').toLowerCase();
  const canReportIncident = !!user && role !== 'authority';
  const canReportCrowd = !!user && ['commuter', 'authority', 'driver', 'conductor'].includes(role);
  const currentUserId = user?._id || user?.id || null;
  const authorityId = transport?.authorityId?._id || transport?.authorityId?.id || transport?.authorityId || null;
  const assignedDriverId = transport?.assignedDriver?._id || transport?.assignedDriver?.id || transport?.assignedDriver || null;
  const assignedConductorId = transport?.assignedConductor?._id || transport?.assignedConductor?.id || transport?.assignedConductor || null;
  const assignedTransportId = user?.assignedTransport?._id || user?.assignedTransport?.id || user?.assignedTransport || null;
  const isAuthorityTransport = role === 'authority' && authorityId && currentUserId && String(authorityId) === String(currentUserId);
  const isDriverTransport = role === 'driver' && currentUserId && (
    (assignedDriverId && String(assignedDriverId) === String(currentUserId)) ||
    (assignedTransportId && String(assignedTransportId) === String(transport?._id))
  );
  const isConductorTransport = role === 'conductor' && currentUserId && (
    (assignedConductorId && String(assignedConductorId) === String(currentUserId)) ||
    (assignedTransportId && String(assignedTransportId) === String(transport?._id))
  );
  const canOperateLive = !!user && (isAuthorityTransport || isDriverTransport || isConductorTransport);

  return (
    <>
    <div className="min-h-screen pb-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-sm font-bold tracking-wider text-slate-700">
                  {transport.transportNumber}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium capitalize text-blue-600">
                  {transport.type === 'bus' ? <BusIcon size={14} /> : <TrainIcon size={14} />} 
                  {transport.type}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900">
                {transport.name}
              </h1>

              {transport.routes?.length > 1 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit border border-slate-200">
                    {transport.routes.map((route) => (
                      <button
                        key={route._id}
                        onClick={() => setSelectedRouteId(route._id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedRouteId === route._id
                            ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{route.origin}</span>
                        <ArrowRightIcon size={14} className={selectedRouteId === route._id ? "text-blue-400" : "text-slate-400"} />
                        <span>{route.destination}</span>
                      </button>
                    ))}
                  </div>
                  {primaryRoute && (
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-slate-500 font-medium text-sm ml-1">
                      {primaryRoute.totalDistance && (
                        <span>{primaryRoute.totalDistance} km</span>
                      )}
                      {primaryRoute.totalDistance && primaryRoute.estimatedDuration && (
                        <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
                      )}
                      {primaryRoute.estimatedDuration && (
                        <span>{primaryRoute.estimatedDuration} min</span>
                      )}
                    </div>
                  )}
                </div>
              ) : primaryRoute && (
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
              {(!user || user.role === 'commuter') && (
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 ${isFav ? 'bg-amber-400 text-slate-900 border border-amber-500/40' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                  onClick={handleFavourite}
                  disabled={favLoading || !user}
                >
                  <StarIcon size={20} filled={isFav}/>
                  {isFav ? 'In Favourites' : 'Add to Favourites'}
                </button>
              )}
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
        <TransportInfo transport={transport} crowdLevel={crowdLevel} availableSeats={displayAvailableSeats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Split */}
          <div className="lg:col-span-8 space-y-8">

            {(livePosition || canOperateLive) && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-200/80 p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                </div>
                
                <div className="flex items-center text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">
                  <LocationIcon size={24} className="mr-3 text-emerald-500" />
                  <span className="flex-1">Live Tracking</span>
                  {canOperateLive && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                      onClick={() => setShowLiveUpdateModal(true)}
                    >
                      <EditIcon size={16} /> Update Live Status
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Stop</label>
                    <span className="text-slate-800 font-bold leading-tight">{livePosition?.currentStop || 'No data'}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Next Stop</label>
                    <span className="text-slate-800 font-bold leading-tight">{livePosition?.nextStop || 'No data'}</span>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                    <span className="text-emerald-600 font-bold capitalize bg-emerald-50 px-2 py-0.5 rounded-lg w-fit text-sm">{livePosition?.status || 'On track'}</span>
                  </div>
                  {(livePosition?.delayMinutes || 0) > 0 && (
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delay</label>
                      <span className="text-red-500 font-black">+{livePosition?.delayMinutes} min</span>
                    </div>
                  )}
                  {displayAvailableSeats !== null && displayAvailableSeats !== undefined && (
                    <div className="flex flex-col mt-2 lg:mt-0">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Availability</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${displayAvailableSeats > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {displayAvailableSeats} Seats
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {stops.length > 0 && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-200/80 p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center text-lg font-bold text-slate-800">
                    <ClockIcon size={24} className="mr-3 text-blue-500" />
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

        {/* Incidents Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-200/80 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-2xl text-red-500">
                    <AlertIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 m-0">Recent Incidents</h4>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{incidentsPagination.total} reports found</span>
                  </div>
                </div>
                
                {canReportIncident && (
                  <button 
                    className="inline-flex items-center justify-center px-5 py-2.5 font-bold rounded-xl bg-red-50 border-2 border-red-600 text-red-600 hover:bg-white focus:ring-4 focus:ring-red-100 transition-all active:scale-95" 
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
            {/* Crowd Reports */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-200/80 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-2xl text-blue-500">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 m-0">Crowd Reports</h4>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{crowdPagination.total} recent updates</span>
                  </div>
                </div>
                
                {canReportCrowd && (
                  <button 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600" 
                    onClick={() => setShowCrowdModal(true)}
                  >
                    <PlusIcon size={18} className="mr-2" /> 
                    Report Crowd
                  </button>
                )}
              </div>
              
              {filteredCrowdReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <UserIcon size={48} className="text-slate-300 mx-auto mb-4"/>
                  <p className="text-slate-500 font-semibold">No crowd reports yet for this route.</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to update others on the crowd level!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCrowdReports.map(report => {
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
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <UserIcon size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
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

                        {(String(report.reportedBy?._id || report.reportedBy) === String(currentUserId) || role === 'authority') && (
                          <button
                            onClick={() => handleDeleteCrowdReport(report._id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Report"
                          >
                            <TrashIcon size={16} />
                          </button>
                        )}
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Crowd Level Estimate</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['empty', 'average', 'crowded'].map((level) => {
                       const isSelected = crowdForm.crowdLevel === level;
                       return (
                         <label 
                           key={level}
                           className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-blue-50 border-blue-600 shadow-md shadow-blue-500/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                         >
                           <input 
                             type="radio" 
                             name="crowdLevel" 
                             value={level} 
                             checked={isSelected}
                             onChange={e => setCrowdForm({...crowdForm, crowdLevel: e.target.value})}
                             className="sr-only"
                           />
                           
                           {/* Conditional Icons based on Crowd Level */}
                           {level === 'empty' && (
                             <div className={`mb-2 transition-colors ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`}>
                               <UserIcon size={32} />
                             </div>
                           )}
                           {level === 'average' && (
                             <div className={`flex items-center justify-center mb-2 transition-colors ${isSelected ? 'text-amber-500' : 'text-slate-400'}`}>
                               <UserIcon size={24} className="-mr-2 opacity-80"/>
                               <UserIcon size={28} className="z-10"/>
                             </div>
                           )}
                           {level === 'crowded' && (
                             <div className={`flex items-center justify-center mb-2 transition-colors ${isSelected ? 'text-rose-500' : 'text-slate-400'}`}>
                               <UserIcon size={20} className="-mr-2 opacity-60"/>
                               <UserIcon size={24} className="z-10 opacity-90"/>
                               <UserIcon size={28} className="-ml-3 z-20"/>
                             </div>
                           )}
                           
                           <span className={`text-[10px] font-black uppercase tracking-widest text-center mt-2 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                              {level === 'empty' ? 'Seats Avail' : level === 'average' ? 'Standing' : 'Crowded'}
                           </span>
                           
                           {isSelected && (
                             <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                               <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                             </div>
                           )}
                         </label>
                       );
                    })}
                  </div>
                </div>
                
                <div className="floating-group mt-6">
                  <input 
                    type="text" 
                    id="floating_boarding"
                    className="floating-input" 
                    placeholder="Boarding Stop (Optional)" 
                    value={crowdForm.boardingStop} 
                    onChange={e => setCrowdForm({...crowdForm, boardingStop: e.target.value})} 
                  />
                  <label htmlFor="floating_boarding" className="floating-label">Boarding Stop (Optional)</label>
                </div>
              </form>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button 
                type="button" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm" 
                onClick={() => setShowCrowdModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="crowdForm" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-black uppercase tracking-widest text-[11px] rounded-xl bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95" 
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                ) : 'Post Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Update Modal */}
      {showLiveUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2">
                <LocationIcon size={18} className="text-blue-600" /> Update Live Status
              </h3>
              <button
                onClick={() => setShowLiveUpdateModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <PlusIcon size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <form id="liveUpdateForm" onSubmit={handleLiveUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Route</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.routeId}
                      onChange={(e) => setLiveForm((p) => ({ ...p, routeId: e.target.value }))}
                    >
                      {(transport?.routes || []).map((route) => (
                        <option key={route._id} value={route._id}>
                          {(route.origin || 'Source')} → {(route.destination || 'Destination')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Crowd Level</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.crowdLevel}
                      onChange={(e) => setLiveForm((p) => ({ ...p, crowdLevel: e.target.value }))}
                    >
                      <option value="empty">Empty</option>
                      <option value="average">Average</option>
                      <option value="crowded">Crowded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Stop</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.currentStop}
                      onChange={(e) => setLiveForm((p) => ({ ...p, currentStop: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Next Stop</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.nextStop}
                      onChange={(e) => setLiveForm((p) => ({ ...p, nextStop: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.status}
                      onChange={(e) => setLiveForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="on-time">On Time</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Delay (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.delayMinutes}
                      onChange={(e) => setLiveForm((p) => ({ ...p, delayMinutes: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Available Seats</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800"
                      value={liveForm.availableSeats}
                      onChange={(e) => setLiveForm((p) => ({ ...p, availableSeats: e.target.value }))}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                onClick={() => setShowLiveUpdateModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="liveUpdateForm"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md active:scale-95"
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Update Live'}
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Photo Evidence</label>
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Type *</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800" 
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Severity</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-semibold text-slate-800" 
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

                <div className="floating-group mt-6">
                  <input 
                    type="text" 
                    id="floating_location"
                    className="floating-input"
                    placeholder="Location" 
                    value={incidentForm.location} 
                    onChange={e => setIncidentForm({...incidentForm, location: e.target.value})} 
                  />
                  <label htmlFor="floating_location" className="floating-label">Location</label>
                </div>

                <div className="floating-group mt-6">
                  <textarea 
                    id="floating_desc"
                    className="floating-input min-h-[100px]" 
                    placeholder="Description (What happened...)" 
                    value={incidentForm.description} 
                    onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                  />
                  <label htmlFor="floating_desc" className="floating-label">Description (What happened...)</label>
                </div>
              </form>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button 
                type="button" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm" 
                onClick={() => setShowIncidentModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="incidentForm" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 font-black uppercase tracking-widest text-[11px] rounded-xl bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95" 
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                ) : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Inline toast-style message */}
    {inlineMsg && (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] animate-slide-up">
        <div className={`px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 ${
          inlineMsg.startsWith('✔')
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {inlineMsg}
        </div>
      </div>
    )}

    {/* Confirm Modal */}
    <ConfirmModal
      isOpen={confirmState.open}
      title={confirmState.title}
      message={confirmState.message}
      onConfirm={confirmState.onConfirm}
      onCancel={closeConfirm}
    />
  </>
  );
};

export default TransportDetail;
