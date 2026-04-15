import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {  getRoutes, createRoute, updateRoute, deleteRoute  } from '../../api';
import {
  EditIcon, CheckCircleIcon, AlertIcon, PlusIcon, TrashIcon,
  MapIcon, ChevronRightIcon, LocationIcon, MapPinIcon, ArrowRightIcon,
  SearchIcon,
} from '../../components/icons';
import ConfirmModal from '../../components/ConfirmModal';
import SearchableCombobox from '../../components/SearchableCombobox';

const EMPTY_ROUTE = {
  routeNumber: '',
  routeName: '',
  origin: '',
  destination: '',
  direction: 'forward',
  stops: [],
  fares: [],
};

const TransportRoutesModal = ({ transport, onClose }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingRoute, setEditingRoute] = useState(null);
  const [form, setForm] = useState(EMPTY_ROUTE);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (transport) {
      fetchTransportRoutes();
    } else {
      setRoutes([]);
      setEditingRoute(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transport]);

  const fetchTransportRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRoutes(transport._id);
      const data = res.data?.data || res.data;
      setRoutes(Array.isArray(data) ? data : (data?.routes || []));
      setEditingRoute(null);
    } catch {
      setError('Failed to fetch routes.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rc) => {
    setEditingRoute(rc._id);
    setForm({
      routeNumber: rc.routeNumber || '',
      routeName: rc.routeName || '',
      origin: rc.origin || '',
      destination: rc.destination || '',
      direction: rc.direction || 'forward',
      stops: rc.stops?.map(s => ({
        stopName: s.stopName || '',
        distanceFromOrigin: s.distanceFromOrigin || 0,
      })) || [],
      fares: rc.fareTable?.reduce((acc, f) => {
        const key = `${f.fromStop}|${f.toStop}`;
        let entry = acc.find(e => e.key === key);
        if (!entry) {
          entry = { key, fromStop: f.fromStop, toStop: f.toStop, general: '', AC: '', sleeper: '' };
          acc.push(entry);
        }
        entry[f.fareClass] = f.fare;
        return acc;
      }, []) || [],
    });
  };

  const handleAddNew = () => {
    setEditingRoute('new');
    setForm(EMPTY_ROUTE);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRoute(transport._id, deleteTargetId);
      setSuccess('Route deleted.');
      toast.success('Route deleted successfully');
      setDeleteTargetId(null);
      fetchTransportRoutes();
    } catch (err) {
      setError(err.message || 'Failed to delete route.');
      toast.error(err.message || 'Failed to delete route.');
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    try {
      const payload = {
        routeNumber: form.routeNumber,
        routeName: form.routeName,
        origin: form.origin,
        destination: form.destination,
        direction: form.direction,
        stops: form.stops.map((s, i) => ({
          stopName: s.stopName || `Stop ${i+1}`,
          stopOrder: i + 1,
          distanceFromOrigin: Number(s.distanceFromOrigin) || 0
        })),
        fareTable: form.fares.flatMap(f => {
          const entries = [];
          if (f.general !== '') entries.push({ fromStop: f.fromStop || 'Unknown', toStop: f.toStop || 'Unknown', fare: Number(f.general), fareClass: 'general' });
          if (f.AC !== '') entries.push({ fromStop: f.fromStop || 'Unknown', toStop: f.toStop || 'Unknown', fare: Number(f.AC), fareClass: 'AC' });
          if (f.sleeper !== '') entries.push({ fromStop: f.fromStop || 'Unknown', toStop: f.toStop || 'Unknown', fare: Number(f.sleeper), fareClass: 'sleeper' });
          return entries;
        })
      };

      if (editingRoute === 'new') {
        await createRoute(transport._id, payload);
        setSuccess("Route created successfully.");
        toast.success("Route created successfully.");
      } else {
        await updateRoute(transport._id, editingRoute, payload);
        setSuccess("Route updated successfully.");
        toast.success("Route updated successfully.");
      }
      fetchTransportRoutes();
    } catch (err) {
      setError(err.message || 'Operation failed.');
      toast.error(err.message || 'Operation failed.');
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  // Stop Actions
  const addStop = () => setForm(p => ({ ...p, stops: [...p.stops, { stopName: '', distanceFromOrigin: 0 }] }));
  const updateStop = (index, field, value) => {
    const newStops = [...form.stops];
    newStops[index][field] = value;
    setForm(p => ({ ...p, stops: newStops }));
  };
  const removeStop = (index) => setForm(p => ({ ...p, stops: p.stops.filter((_, i) => i !== index) }));
  
  const moveStopUp = (index) => {
    if (index === 0) return;
    setForm(p => {
      const newStops = [...p.stops];
      [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
      return { ...p, stops: newStops };
    });
  };

  const moveStopDown = (index) => {
    setForm(p => {
      if (index === p.stops.length - 1) return p;
      const newStops = [...p.stops];
      [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
      return { ...p, stops: newStops };
    });
  };

  // Fare Actions
  const addFare = () => setForm(p => ({ ...p, fares: [...p.fares, { fromStop: '', toStop: '', general: '', AC: '', sleeper: '' }] }));
  const updateFare = (index, field, value) => {
    const newFares = [...form.fares];
    newFares[index][field] = value;
    setForm(p => ({ ...p, fares: newFares }));
  };
  const removeFare = (index) => setForm(p => ({ ...p, fares: p.fares.filter((_, i) => i !== index) }));

  const amenitiesStr = (transport?.amenities || []).join(' ').toLowerCase();
  const hasAC = amenitiesStr.includes('ac');
  const hasSleeper = amenitiesStr.includes('sleeper');
  const hasGeneral = amenitiesStr.includes('general') || (!hasAC && !hasSleeper);

  return (
    // ENHANCED: .card base, animate-scale-in
    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
      {/* ENHANCED: gradient header replacing flat slate-900 */}
      <div
        className="px-6 py-5 text-white flex items-center justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        {/* ENHANCED: MapIcon with title + transport name badge */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center">
            <MapIcon size={20} className="text-white" />
          </div>
          <div>
            <h5 className="text-lg font-black text-white tracking-tight">Manage Routes &amp; Fares</h5>
            {/* ENHANCED: transport name as badge */}
            <span className="badge badge-indigo !bg-white/15 !text-white/80 !border-white/20">
              {transport?.name}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="relative p-2 hover:bg-white/20 rounded-xl transition-colors text-white/70 hover:text-white"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto">
        {/* ENHANCED: alert banners */}
        {error && (
          <div className="flex items-center p-4 mb-5 bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <AlertIcon size={18} className="mr-2 shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center p-4 mb-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <CheckCircleIcon size={18} className="mr-2 shrink-0" />
            <span className="text-sm font-bold">{success}</span>
          </div>
        )}

        {!editingRoute ? (
          <>
            {loading ? (
              // ENHANCED: .skeleton loading
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {routes.length === 0 ? (
                  // ENHANCED: .card empty state with MapIcon
                  <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapIcon size={28} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-2">No routes yet</h3>
                    <p className="text-sm font-bold text-slate-500 mb-6">Add your first route to get started with stops and fares.</p>
                    {/* ENHANCED: .btn-primary */}
                    <button className="btn-primary mx-auto" onClick={handleAddNew}>
                      <PlusIcon size={16} /> Add Your First Route
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {routes.map((r) => (
                        // ENHANCED: .card + .hover-lift for route list cards
                        <div
                          key={r._id}
                          className="card hover-lift p-4 flex justify-between items-center overflow-visible"
                        >
                          {/* ENHANCED: left accent border */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 to-indigo-500" />
                          <div className="pl-3">
                            <h6 className="font-extrabold text-slate-800 mb-1 flex items-center gap-2 flex-wrap text-sm">
                              {/* ENHANCED: gradient route name */}
                              <span className="gradient-text-cool">{r.routeName}</span>
                              {/* ENHANCED: .badge-indigo for route number */}
                              <span className="badge badge-indigo">{r.routeNumber}</span>
                            </h6>
                            {/* ENHANCED: origin → destination row inline */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                              <LocationIcon size={12} className="text-slate-400" />
                              {r.origin}
                              <ArrowRightIcon size={12} className="text-indigo-400" />
                              <MapPinIcon size={12} className="text-slate-400" />
                              {r.destination}
                              {/* ENHANCED: .badge-teal for stop count */}
                              <span className="badge badge-teal ml-2">{r.stops?.length || 0} stops</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {/* ENHANCED: .btn-ghost for edit, danger style for delete */}
                            <button
                              className="btn-ghost !py-1.5 !px-3 text-xs"
                              onClick={() => handleEditClick(r)}
                            >
                              <EditIcon size={14} /> Edit
                            </button>
                            <button
                              className="p-2 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                              onClick={() => setDeleteTargetId(r._id)}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* ENHANCED: .btn-primary for add new route */}
                    <button className="btn-primary w-fit mt-2" onClick={handleAddNew}>
                      <PlusIcon size={18} /> Add New Route
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ENHANCED: back button */}
            <button
              type="button"
              className="btn-ghost !py-1.5 !px-3 text-xs mb-1"
              onClick={() => setEditingRoute(null)}
            >
              ← Back to routes
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
              {/* ENHANCED: RouteNumber with SearchIcon */}
              <div className="relative floating-group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-slate-400">
                  <SearchIcon size={14} />
                </div>
                <input
                  id="routeNumber" type="text"
                  className="floating-input !pl-9"
                  required
                  value={form.routeNumber}
                  onChange={set('routeNumber')}
                  placeholder="e.g. R-101"
                />
                <label htmlFor="routeNumber" className="floating-label !left-9">
                  Route Number <span className="text-red-500">*</span>
                </label>
              </div>

              {/* ENHANCED: RouteName with MapIcon */}
              <div className="relative floating-group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-slate-400">
                  <MapIcon size={14} />
                </div>
                <input
                  id="routeName" type="text"
                  className="floating-input !pl-9"
                  required
                  value={form.routeName}
                  onChange={set('routeName')}
                  placeholder="e.g. City Center Express"
                />
                <label htmlFor="routeName" className="floating-label !left-9">
                  Route Name <span className="text-red-500">*</span>
                </label>
              </div>

              {/* ENHANCED: Origin with LocationIcon */}
              <div className="relative floating-group md:col-span-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-emerald-400">
                  <LocationIcon size={14} />
                </div>
                <input
                  id="origin" type="text"
                  className="floating-input !pl-9"
                  required
                  value={form.origin}
                  onChange={set('origin')}
                  placeholder="Start Point"
                />
                <label htmlFor="origin" className="floating-label !left-9">
                  Origin <span className="text-red-500">*</span>
                </label>
              </div>

              {/* ENHANCED: Destination with MapPinIcon */}
              <div className="relative floating-group md:col-span-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-violet-400">
                  <MapPinIcon size={14} />
                </div>
                <input
                  id="destination" type="text"
                  className="floating-input !pl-9"
                  required
                  value={form.destination}
                  onChange={set('destination')}
                  placeholder="End Point"
                />
                <label htmlFor="destination" className="floating-label !left-9">
                  Destination <span className="text-red-500">*</span>
                </label>
              </div>

              <div>
                <SearchableCombobox
                  id="route-direction"
                  label="Direction"
                  allowCustom={false}
                  options={[
                    { label: 'Forward', value: 'forward' },
                    { label: 'Return', value: 'return' },
                  ]}
                  value={form.direction}
                  onChange={(v) => setForm(p => ({ ...p, direction: v }))}
                />
              </div>

              {/* ENHANCED: Stops section with section-header styling */}
              <div className="md:col-span-2 bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* ENHANCED: LocationIcon for stops section */}
                    <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center">
                      <LocationIcon size={15} className="text-indigo-600" />
                    </div>
                    <label className="text-sm font-extrabold text-slate-700">
                      Stops <span className="text-red-500">*</span>
                    </label>
                    {form.stops.length > 0 && (
                      <span className="badge badge-indigo">{form.stops.length}</span>
                    )}
                  </div>
                  {/* ENHANCED: .btn-ghost for Add Stop */}
                  <button type="button" onClick={addStop} className="btn-ghost !py-1.5 !px-3 text-xs">
                    <PlusIcon size={13} /> Add Stop
                  </button>
                </div>
                {form.stops.length === 0 && (
                  <p className="text-xs text-slate-400 font-bold text-center py-4 italic">No stops added yet. Click "Add Stop" to begin.</p>
                )}
                {form.stops.length > 0 && (
                  <div className="flex gap-3 px-1 mb-2">
                    <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stop Name</div>
                    <div className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Distance</div>
                    <div className="w-[84px] text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</div>
                  </div>
                )}
                <div className="space-y-2">
                  {form.stops.map((stop, i) => (
                    // ENHANCED: stop row as mini .card
                    <div key={i} className="flex gap-3 items-start group bg-white rounded-xl border border-indigo-100 p-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. Central"
                          className="form-field !py-2 !text-sm"
                          value={stop.stopName}
                          onChange={(e) => updateStop(i, 'stopName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            className="form-field !py-2 !text-sm !pr-8"
                            value={stop.distanceFromOrigin}
                            onChange={(e) => updateStop(i, 'distanceFromOrigin', e.target.value)}
                            required min="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">km</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 w-[84px] justify-end mt-1">
                        <div className="flex flex-col gap-0.5">
                          <button type="button" onClick={() => moveStopUp(i)} disabled={i === 0} className="p-[1px] text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors">
                            <ChevronRightIcon size={14} className="-rotate-90" />
                          </button>
                          <button type="button" onClick={() => moveStopDown(i)} disabled={i === form.stops.length - 1} className="p-[1px] text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors">
                            <ChevronRightIcon size={14} className="rotate-90" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeStop(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENHANCED: Fare Table section with CurrencyIcon */}
              <div className="md:col-span-2 bg-amber-50/40 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* ENHANCED: CurrencyIcon (or use ₹ symbol in icon box) */}
                    <div className="w-8 h-8 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center text-amber-600 text-sm font-black">
                      ₹
                    </div>
                    <label className="text-sm font-extrabold text-slate-700">Fare Table</label>
                    {form.fares.length > 0 && (
                      <span className="badge badge-amber">{form.fares.length} entries</span>
                    )}
                  </div>
                  {/* ENHANCED: .btn-amber for Add Fare */}
                  <button type="button" onClick={addFare} className="btn-amber !py-1.5 !px-3 text-xs">
                    <PlusIcon size={13} /> Add Fare
                  </button>
                </div>
                {form.fares.length === 0 && (
                  <p className="text-xs text-slate-400 font-bold text-center py-4 italic">No fares added yet. Click "Add Fare" to define pricing.</p>
                )}
                {form.fares.length > 0 && (
                  <div className="flex gap-3 px-1 mb-2">
                    <div className="flex-[0.8] text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Stop</div>
                    <div className="flex-[0.8] text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Stop</div>
                    {hasGeneral && <div className="flex-1 min-w-[70px] text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">General</div>}
                    {hasAC && <div className="flex-1 min-w-[70px] text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">AC</div>}
                    {hasSleeper && <div className="flex-1 min-w-[70px] text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">Sleeper</div>}
                    <div className="w-8"></div>
                  </div>
                )}
                <div className="space-y-2">
                  {form.fares.map((fare, i) => (
                    // ENHANCED: fare row as mini .card with amber accent
                    <div key={i} className="flex gap-3 items-start group bg-white rounded-xl border border-amber-100 p-2">
                      <div className="flex-[0.8]">
                        <input
                          type="text"
                          placeholder="From Stop"
                          className="form-field !py-2 !text-sm"
                          value={fare.fromStop}
                          onChange={(e) => updateFare(i, 'fromStop', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex-[0.8]">
                        <input
                          type="text"
                          placeholder="To Stop"
                          className="form-field !py-2 !text-sm"
                          value={fare.toStop}
                          onChange={(e) => updateFare(i, 'toStop', e.target.value)}
                          required
                        />
                      </div>
                      {hasGeneral && (
                        <div className="flex-1 min-w-[70px]">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-amber-500">₹</span>
                            <input type="number" placeholder="0" className="form-field !py-2 !text-sm !pl-6 bg-white" value={fare.general} onChange={(e) => updateFare(i, 'general', e.target.value)} min="0" required />
                          </div>
                        </div>
                      )}
                      {hasAC && (
                        <div className="flex-1 min-w-[70px]">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-amber-500">₹</span>
                            <input type="number" placeholder="0" className="form-field !py-2 !text-sm !pl-6 bg-white" value={fare.AC} onChange={(e) => updateFare(i, 'AC', e.target.value)} min="0" />
                          </div>
                        </div>
                      )}
                      {hasSleeper && (
                        <div className="flex-1 min-w-[70px]">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-amber-500">₹</span>
                            <input type="number" placeholder="0" className="form-field !py-2 !text-sm !pl-6 bg-white" value={fare.sleeper} onChange={(e) => updateFare(i, 'sleeper', e.target.value)} min="0" />
                          </div>
                        </div>
                      )}
                      <button type="button" onClick={() => removeFare(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1">
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ENHANCED: .btn-ghost cancel + .btn-primary save */}
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-4">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditingRoute(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <CheckCircleIcon size={17} /> Save Route Details
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Route?"
        message="This route, all its stops, and fare table entries will be permanently removed."
        confirmLabel="Delete Route"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default TransportRoutesModal;
