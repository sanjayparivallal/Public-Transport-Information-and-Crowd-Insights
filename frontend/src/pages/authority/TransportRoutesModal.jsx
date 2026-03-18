import { useState, useEffect } from 'react';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../../api/transportApi';
import { EditIcon, CheckCircleIcon, AlertIcon, PlusIcon, TrashIcon, MapIcon } from '../../components/icons';

const EMPTY_ROUTE = {
  routeNumber: '',
  routeName: '',
  origin: '',
  destination: '',
  direction: 'forward',
  stopsRaw: '', // User will type: Stop A:0, Stop B:5 (Name:Distance)
  fareRaw: '', // User will type: Stop A-Stop B:10 (From-To:Fare)
};

const parseStops = (raw) => {
  if (!raw) return [];
  return raw.split(',').map((s, i) => {
    const [name, dist] = s.split(':');
    return {
      stopName: name?.trim() || `Stop ${i+1}`,
      stopOrder: i + 1,
      distanceFromOrigin: Number(dist) || i * 5,
    };
  });
};

const parseFares = (raw) => {
  if (!raw) return [];
  return raw.split(',').map(f => {
    const [routeSpan, price] = f.split(':');
    const [from, to] = (routeSpan || '').split('-');
    return {
      fromStop: from?.trim() || 'Unknown',
      toStop: to?.trim() || 'Unknown',
      fare: Number(price) || 10,
      fareClass: 'general'
    };
  });
};

const stringifyStops = (stops) => {
  if (!stops || !stops.length) return '';
  return stops.map(s => `${s.stopName}:${s.distanceFromOrigin}`).join(', ');
};

const stringifyFares = (fares) => {
  if (!fares || !fares.length) return '';
  return fares.map(f => `${f.fromStop}-${f.toStop}:${f.fare}`).join(', ');
};

const TransportRoutesModal = ({ transport, onClose }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingRoute, setEditingRoute] = useState(null);
  const [form, setForm] = useState(EMPTY_ROUTE);

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
      setRoutes(data?.routes || []);
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
      stopsRaw: stringifyStops(rc.stops),
      fareRaw: stringifyFares(rc.fareTable)
    });
  };

  const handleAddNew = () => {
    setEditingRoute('new');
    setForm(EMPTY_ROUTE);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteRoute(transport._id, routeId);
      setSuccess("Route deleted.");
      fetchTransportRoutes();
    } catch (err) {
      setError(err.message || "Failed to delete route.");
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
        stops: parseStops(form.stopsRaw),
        fareTable: parseFares(form.fareRaw)
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
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium inline-flex items-center transition-colors"
                                onClick={() => handleDelete(r._id)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Route Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400"
                    required
                    value={form.routeNumber}
                    onChange={set('routeNumber')}
                    placeholder="e.g. R-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Route Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400"
                    required
                    value={form.routeName}
                    onChange={set('routeName')}
                    placeholder="e.g. City Center Express"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Origin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400"
                    required
                    value={form.origin}
                    onChange={set('origin')}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400"
                    required
                    value={form.destination}
                    onChange={set('destination')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Direction</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    value={form.direction}
                    onChange={set('direction')}
                  >
                    <option value="forward">Forward</option>
                    <option value="return">Return</option>
                  </select>
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Stops (Comma Separated) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-primary-600">StopName:DistanceFromOrigin</code>. Example: <code className="bg-slate-100 px-1 py-0.5 rounded">Central:0, North Square:5, Airport:12</code>
                  </p>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-mono text-sm"
                    rows="3"
                    value={form.stopsRaw}
                    onChange={set('stopsRaw')}
                    placeholder="Central:0, North Square:5"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Fares (Comma Separated)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-primary-600">FromStop-ToStop:Price</code>. Example: <code className="bg-slate-100 px-1 py-0.5 rounded">Central-North Square:15, Central-Airport:50</code>
                  </p>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-mono text-sm"
                    rows="3"
                    value={form.fareRaw}
                    onChange={set('fareRaw')}
                    placeholder="Central-North Square:15"
                  />
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
      </div>
  );
};

export default TransportRoutesModal;
