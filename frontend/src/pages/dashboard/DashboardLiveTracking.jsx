import { useState } from 'react';
import { updateLivePosition } from '../../api/crowdApi';
import { LocationIcon, ClockIcon, UserIcon, CheckCircleIcon, AlertIcon } from '../../components/icons';

const DashboardLiveTracking = ({ transport }) => {
  const primaryRoute = transport?.routes?.[0];
  const [form, setForm] = useState({
    routeId: primaryRoute?._id || '',
    currentStop: transport?.livePosition?.currentStop || '',
    nextStop: transport?.livePosition?.nextStop || '',
    delayMinutes: transport?.livePosition?.delayMinutes || 0,
    status: transport?.livePosition?.status || 'on-time',
    availableSeats: primaryRoute?.availableSeats || '',
    crowdLevel: transport?.crowdLevel || 'average',
  });

  const routeOptions = transport?.routes || [];
  const selectedRoute = routeOptions.find((r) => String(r._id) === String(form.routeId)) || primaryRoute;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'routeId') {
      const newRoute = routeOptions.find(r => String(r._id) === value);
      if (newRoute) {
        setForm(prev => ({
          ...prev,
          routeId: value,
          currentStop: newRoute.livePosition?.currentStop || '',
          nextStop: newRoute.livePosition?.nextStop || '',
          delayMinutes: newRoute.livePosition?.delayMinutes || 0,
          status: newRoute.livePosition?.status || 'on-time',
          availableSeats: newRoute.availableSeats || '',
          crowdLevel: newRoute.crowdLevel || 'average',
        }));
        return;
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const routeId = selectedRoute?._id;
    if (!routeId) {
      setMsg('No route assigned.');
      setLoading(false);
      return;
    }

    try {
      await updateLivePosition({
        transportId: transport._id,
        routeId,
        currentStop: form.currentStop,
        nextStop: form.nextStop,
        delayMinutes: Number(form.delayMinutes),
        status: form.status,
        availableSeats: form.availableSeats ? Number(form.availableSeats) : null,
      });

      setMsg('Live status updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!transport) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
        <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600 shadow-sm shadow-primary-100">
          <LocationIcon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 m-0">Live Duty Updates</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Report real-time position and status</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Route</label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
              name="routeId"
              value={form.routeId}
              onChange={handleChange}
            >
              {routeOptions.map((route) => (
                <option key={route._id} value={route._id}>
                  {(route.origin || 'Source')} -&gt; {(route.destination || 'Destination')}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stop</label>
            <input 
              type="text" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700" 
              name="currentStop" 
              value={form.currentStop} 
              onChange={handleChange} 
              placeholder="e.g. Central Station" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Stop</label>
            <input 
              type="text" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700" 
              name="nextStop" 
              value={form.nextStop} 
              onChange={handleChange} 
              placeholder="e.g. North Square" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delay (Min)</label>
            <input 
              type="number" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700" 
              name="delayMinutes" 
              min="0" 
              value={form.delayMinutes} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              name="status" 
              value={form.status} 
              onChange={handleChange}
            >
              <option value="on-time">On Time</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seats Free</label>
            <input 
              type="number" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700" 
              name="availableSeats" 
              min="0" 
              value={form.availableSeats} 
              onChange={handleChange} 
              placeholder="0" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Crowd</label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              name="crowdLevel" 
              value={form.crowdLevel} 
              onChange={handleChange}
            >
              <option value="empty">Empty</option>
              <option value="average">Average</option>
              <option value="crowded">Crowded</option>
            </select>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             {msg && (
               <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-in fade-in slide-in-from-left-2 ${msg.includes('success') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                 {msg.includes('success') ? <CheckCircleIcon size={16} /> : <AlertIcon size={16} />}
                 {msg}
               </div>
             )}
          </div>
          <button 
            type="submit" 
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><ClockIcon size={18} /> Update</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardLiveTracking;
