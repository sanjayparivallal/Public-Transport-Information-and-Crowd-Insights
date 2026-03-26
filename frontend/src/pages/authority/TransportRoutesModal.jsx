import { useState, useEffect } from 'react';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../../api/transportApi';
import { EditIcon, CheckCircleIcon, AlertIcon, PlusIcon, TrashIcon, MapIcon, ChevronRightIcon } from '../../components/icons';
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

// Removed stringify parsing/raw since we use direct arrays now


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
      fares: rc.fareTable?.map(f => ({
        fromStop: f.fromStop || '',
        toStop: f.toStop || '',
        fare: f.fare || 0,
      })) || [],
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
      setDeleteTargetId(null);
      fetchTransportRoutes();
    } catch (err) {
      setError(err.message || 'Failed to delete route.');
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
        fareTable: form.fares.map(f => ({
          fromStop: f.fromStop || 'Unknown',
          toStop: f.toStop || 'Unknown',
          fare: Number(f.fare) || 0,
          fareClass: 'general'
        }))
      };

      if (editingRoute === 'new') {
        await createRoute(transport._id, payload);
        setSuccess("Route created successfully.");
      } else {
        await updateRoute(transport._id, editingRoute, payload);
        setSuccess("Route updated successfully.");
      }
      fetchTransportRoutes();
    } catch (err) {
      setError(err.message || 'Operation failed.');
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
  const addFare = () => setForm(p => ({ ...p, fares: [...p.fares, { fromStop: '', toStop: '', fare: 0 }] }));
  const updateFare = (index, field, value) => {
    const newFares = [...form.fares];
    newFares[index][field] = value;
    setForm(p => ({ ...p, fares: newFares }));
  };
  const removeFare = (index) => setForm(p => ({ ...p, fares: p.fares.filter((_, i) => i !== index) }));

  return (
    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <h5 className="flex items-center text-xl font-black tracking-tight">
            <MapIcon size={20} className="mr-2 text-primary-400" />
            Manage Routes &amp; Fares <span className="text-slate-400 ml-2 text-sm font-bold uppercase tracking-widest leading-none mt-1">— {transport?.name}</span>
          </h5>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="flex items-center p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <AlertIcon size={18} className="mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center p-4 mb-6 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <CheckCircleIcon size={18} className="mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {!editingRoute ? (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {routes.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-500 font-medium">No routes assigned yet.</p>
                      <button
                        className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg inline-flex items-center transition-colors shadow-sm"
                        onClick={handleAddNew}
                      >
                        <PlusIcon size={16} className="mr-2" /> Add Your First Route
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {routes.map((r) => (
                          <div
                            key={r._id}
                            className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow group"
                          >
                            <div>
                              <h6 className="font-bold text-slate-800 mb-1 flex items-center">
                                {r.routeName}
                                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">{r.routeNumber}</span>
                              </h6>
                              <div className="text-sm text-slate-500 flex items-center">
                                {r.origin} <span className="mx-2">➔</span> {r.destination}
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="font-medium">{r.stops?.length || 0} stops</span>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium inline-flex items-center transition-colors"
                                onClick={() => handleEditClick(r)}
                              >
                                <EditIcon size={14} className="mr-1.5" /> Edit
                              </button>
                              <button
                                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                                onClick={() => setDeleteTargetId(r._id)}
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl inline-flex items-center transition-colors shadow-sm w-fit mt-2"
                        onClick={handleAddNew}
                      >
                        <PlusIcon size={18} className="mr-2" /> Add New Route
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                <div className="floating-group">
                  <input
                    id="routeNumber" type="text"
                    className="floating-input"
                    required
                    value={form.routeNumber}
                    onChange={set('routeNumber')}
                    placeholder="e.g. R-101"
                  />
                  <label htmlFor="routeNumber" className="floating-label">Route Number <span className="text-red-500">*</span></label>
                </div>
                <div className="floating-group">
                  <input
                    id="routeName" type="text"
                    className="floating-input"
                    required
                    value={form.routeName}
                    onChange={set('routeName')}
                    placeholder="e.g. City Center Express"
                  />
                  <label htmlFor="routeName" className="floating-label">Route Name <span className="text-red-500">*</span></label>
                </div>
                <div className="floating-group md:col-span-1">
                  <input
                    id="origin" type="text"
                    className="floating-input"
                    required
                    value={form.origin}
                    onChange={set('origin')}
                    placeholder="Start Point"
                  />
                  <label htmlFor="origin" className="floating-label">Origin <span className="text-red-500">*</span></label>
                </div>
                <div className="floating-group md:col-span-1">
                  <input
                    id="destination" type="text"
                    className="floating-input"
                    required
                    value={form.destination}
                    onChange={set('destination')}
                    placeholder="End Point"
                  />
                  <label htmlFor="destination" className="floating-label">Destination <span className="text-red-500">*</span></label>
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
                <div className="md:col-span-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">
                      Stops <span className="text-red-500">*</span>
                    </label>
                    <button type="button" onClick={addStop} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary-500 text-primary-600 rounded-lg text-xs font-bold flex items-center shadow-sm">
                      <PlusIcon size={14} className="mr-1" /> Add Stop
                    </button>
                  </div>
                  {form.stops.length === 0 && <p className="text-xs text-slate-500 italic">No stops added yet.</p>}
                  <div className="space-y-3">
                    {form.stops.length > 0 && (
                      <div className="flex gap-3 px-1">
                        <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stop Name</div>
                        <div className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Distance</div>
                        <div className="w-[84px] text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</div>
                      </div>
                    )}
                    {form.stops.map((stop, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="e.g. Central"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
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
                              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                              value={stop.distanceFromOrigin}
                              onChange={(e) => updateStop(i, 'distanceFromOrigin', e.target.value)}
                              required
                              min="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">km</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 w-[84px] justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <button type="button" onClick={() => moveStopUp(i)} disabled={i === 0} className="p-[1px] text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-colors">
                              <ChevronRightIcon size={14} className="-rotate-90" />
                            </button>
                            <button type="button" onClick={() => moveStopDown(i)} disabled={i === form.stops.length - 1} className="p-[1px] text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-colors">
                              <ChevronRightIcon size={14} className="rotate-90" />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeStop(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">
                      Fare Table
                    </label>
                    <button type="button" onClick={addFare} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary-500 text-primary-600 rounded-lg text-xs font-bold flex items-center shadow-sm">
                      <PlusIcon size={14} className="mr-1" /> Add Fare
                    </button>
                  </div>
                  {form.fares.length === 0 && <p className="text-xs text-slate-500 italic">No fares added yet.</p>}
                  <div className="space-y-3">
                    {form.fares.length > 0 && (
                      <div className="flex gap-3 px-1">
                        <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Stop</div>
                        <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Stop</div>
                        <div className="w-28 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price</div>
                        <div className="w-8"></div>
                      </div>
                    )}
                    {form.fares.map((fare, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="From Stop"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                            value={fare.fromStop}
                            onChange={(e) => updateFare(i, 'fromStop', e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="To Stop"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                            value={fare.toStop}
                            onChange={(e) => updateFare(i, 'toStop', e.target.value)}
                            required
                          />
                        </div>
                        <div className="w-28">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              placeholder="0"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                              value={fare.fare}
                              onChange={(e) => updateFare(i, 'fare', e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFare(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5 opacity-0 group-hover:opacity-100">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-xl transition-colors"
                  onClick={() => setEditingRoute(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors"
                >
                  Save Route Details
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
