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

const TransportRoutesModal = ({ transport }) => {
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
  }, [transport]);

  const fetchTransportRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRoutes(transport._id);
      const data = res.data?.data || res.data;
      setRoutes(data?.routes || []);
      setEditingRoute(null);
    } catch (err) {
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
    <div className="modal fade" id="transportRoutesModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <MapIcon size={20} className="me-2"/> Manage Routes &amp; Fares for {transport?.name}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            {error && <div className="alert-custom alert-error mb-3">{error}</div>}
            {success && <div className="alert-custom alert-success mb-3">{success}</div>}
            
            {!editingRoute ? (
              <>
                {loading ? <p>Loading routes...</p> : (
                  <div className="d-flex flex-column gap-3">
                    {routes.length === 0 ? (
                      <p className="text-muted">No routes assigned yet.</p>
                    ) : (
                      routes.map(r => (
                        <div key={r._id} className="p-3 border rounded shadow-sm d-flex justify-content-between align-items-center bg-light">
                          <div>
                            <h6 className="fw-bold mb-1 text-primary">{r.routeName} ({r.routeNumber})</h6>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {r.origin} ➔ {r.destination} | {r.stops?.length || 0} stops
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(r)}><EditIcon size={14}/> Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}><TrashIcon size={14}/></button>
                          </div>
                        </div>
                      ))
                    )}
                    <button className="btn btn-primary align-self-start" onClick={handleAddNew}><PlusIcon size={16} className="me-1"/> Add New Route</button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Route Number <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" required value={form.routeNumber} onChange={set('routeNumber')} placeholder="e.g. R-101"/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Route Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" required value={form.routeName} onChange={set('routeName')} placeholder="e.g. City Center Express"/>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Origin <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" required value={form.origin} onChange={set('origin')}/>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Destination <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" required value={form.destination} onChange={set('destination')}/>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Direction</label>
                    <select className="form-select" value={form.direction} onChange={set('direction')}>
                      <option value="forward">Forward</option>
                      <option value="return">Return</option>
                    </select>
                  </div>
                  <div className="col-12 mt-4">
                    <label className="form-label fw-bold">Stops (Comma Separated)</label>
                    <div className="text-muted mb-2" style={{fontSize: '0.8rem'}}>Format: <code>StopName:DistanceFromOrigin</code>. Example: <code>Central:0, North Square:5, Airport:12</code></div>
                    <textarea className="form-control" rows="3" value={form.stopsRaw} onChange={set('stopsRaw')} placeholder="Central:0, North Square:5" />
                  </div>
                  <div className="col-12 mt-4">
                    <label className="form-label fw-bold">Fares (Comma Separated)</label>
                    <div className="text-muted mb-2" style={{fontSize: '0.8rem'}}>Format: <code>FromStop-ToStop:Price</code>. Example: <code>Central-North Square:15, Central-Airport:50</code></div>
                    <textarea className="form-control" rows="3" value={form.fareRaw} onChange={set('fareRaw')} placeholder="Central-North Square:15" />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingRoute(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Route Details</button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRoutesModal;
