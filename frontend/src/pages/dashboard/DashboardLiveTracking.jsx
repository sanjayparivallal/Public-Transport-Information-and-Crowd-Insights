import { useState } from 'react';
import { updateLivePosition, updateCrowdLevel } from '../../api/crowdApi';
import { LocationIcon, ClockIcon, UserIcon, CheckCircleIcon } from '../../components/icons';

const DashboardLiveTracking = ({ transport }) => {
  const [form, setForm] = useState({
    currentStop: transport?.livePosition?.currentStop || '',
    nextStop: transport?.livePosition?.nextStop || '',
    delayMinutes: transport?.livePosition?.delayMinutes || 0,
    status: transport?.livePosition?.status || 'on-time',
    availableSeats: transport?.livePosition?.availableSeats || '',
    crowdLevel: transport?.crowdLevel || 'average',
    tripId: transport?.livePosition?.tripId || `TRIP-${new Date().toISOString().split('T')[0]}`
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const routeId = transport.routes?.[0]?._id;
    if (!routeId) {
      setMsg('No route assigned to this transport to update live tracking.');
      setLoading(false);
      return;
    }

    try {
      // 1. Update Live Position
      await updateLivePosition({
        transportId: transport._id,
        routeId,
        tripId: form.tripId,
        currentStop: form.currentStop,
        nextStop: form.nextStop,
        delayMinutes: Number(form.delayMinutes),
        status: form.status,
        availableSeats: form.availableSeats ? Number(form.availableSeats) : null,
      });

      // 2. Update Official Crowd Level
      await updateCrowdLevel({
        transportId: transport._id,
        routeId,
        tripId: form.tripId,
        crowdLevel: form.crowdLevel,
        currentStop: form.currentStop
      });

      setMsg('Live status updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Failed to update live status.');
    } finally {
      setLoading(false);
    }
  };

  if (!transport) return null;

  return (
    <div className="card-custom p-4 mt-4">
      <h3 className="card-title-custom d-flex align-items-center mb-3">
        <LocationIcon size={20} className="me-2 text-primary" /> Live Duty Updates
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Current Stop</label>
            <input type="text" className="form-control" name="currentStop" value={form.currentStop} onChange={handleChange} placeholder="e.g. Central Station" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Next Stop</label>
            <input type="text" className="form-control" name="nextStop" value={form.nextStop} onChange={handleChange} placeholder="e.g. North Square" />
          </div>
          
          <div className="col-md-3">
            <label className="form-label">Delay (Mins)</label>
            <input type="number" className="form-control" name="delayMinutes" min="0" value={form.delayMinutes} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="on-time">On Time</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Available Seats</label>
            <input type="number" className="form-control" name="availableSeats" min="0" value={form.availableSeats} onChange={handleChange} placeholder="e.g. 15" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Official Crowd</label>
            <select className="form-select" name="crowdLevel" value={form.crowdLevel} onChange={handleChange}>
              <option value="empty">Empty</option>
              <option value="average">Average</option>
              <option value="crowded">Crowded</option>
            </select>
          </div>
        </div>
        <div className="mt-3 d-flex align-items-center justify-content-between">
          <div style={{ fontSize: '.85rem', color: msg.includes('success') ? 'var(--success)' : '#ef4444' }}>
            {msg && <><CheckCircleIcon size={16} className="me-1"/> {msg}</>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Live Status'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardLiveTracking;
