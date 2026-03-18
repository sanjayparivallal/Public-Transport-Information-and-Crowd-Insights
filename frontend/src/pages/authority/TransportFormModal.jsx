import { useState, useEffect } from 'react';
import { createTransport, updateTransport } from '../../api/adminApi';
import { EditIcon, PlusIcon, AlertIcon } from '../../components/icons';

/* ── Helpers ─────────────────────────────────────────────── */
const EMPTY_FORM = {
  transportNumber: '',
  name: '',
  type: 'bus',
  operator: '',
  vehicleNumber: '',
  totalSeats: '',
  availableSeats: '',
  amenities: '',
};

const formFromTransport = (t) => ({
  transportNumber: t.transportNumber || '',
  name: t.name || '',
  type: t.type || 'bus',
  operator: t.operator || '',
  vehicleNumber: t.vehicleNumber || '',
  totalSeats: t.totalSeats != null ? String(t.totalSeats) : '',
  availableSeats: t.availableSeats != null ? String(t.availableSeats) : '',
  amenities: (t.amenities || []).join(', '),
});

const toPayload = (form) => {
  const p = {
    transportNumber: form.transportNumber.trim(),
    name: form.name.trim(),
    type: form.type,
  };
  if (form.operator.trim())     p.operator      = form.operator.trim();
  if (form.vehicleNumber.trim()) p.vehicleNumber = form.vehicleNumber.trim();
  if (form.totalSeats.trim())   p.totalSeats    = Number(form.totalSeats);
  if (form.availableSeats.trim()) p.availableSeats = Number(form.availableSeats);
  if (form.amenities.trim()) {
    p.amenities = form.amenities.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return p;
};

/* ── Transport Form Modal (create / edit) ─────────────────── */
const TransportFormModal = ({ transport, onSaved, onClose }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    setForm(transport ? formFromTransport(transport) : EMPTY_FORM);
    setError('');
  }, [transport]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.transportNumber.trim() || !form.name.trim()) {
      setError('Transport Number and Name are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = toPayload(form);
      if (transport) {
        await updateTransport(transport._id, payload);
      } else {
        await createTransport(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h5 className="text-xl font-black tracking-tight flex items-center gap-2">
            {transport ? <><EditIcon size={20}/> Edit Transport</> : <><PlusIcon size={20}/> Add New Transport</>}
          </h5>
          <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={onClose}>
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-8 bg-slate-50/50 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                <AlertIcon size={18}/> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Transport Number *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. SLM-001"
                  value={form.transportNumber}
                  onChange={set('transportNumber')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. Salem–Chennai Express"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select 
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                  value={form.type} 
                  onChange={set('type')}
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operator</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. TNSTC"
                  value={form.operator}
                  onChange={set('operator')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle No. / Reg No.</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. TN 33 AB 1234"
                  value={form.vehicleNumber}
                  onChange={set('vehicleNumber')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Seats</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. 52"
                  min="1"
                  value={form.totalSeats}
                  onChange={set('totalSeats')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Available Seats</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="e.g. 40"
                  min="0"
                  value={form.availableSeats}
                  onChange={set('availableSeats')}
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                  placeholder="AC, WiFi, Sleeper"
                  value={form.amenities}
                  onChange={set('amenities')}
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 flex-[2] flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (transport ? 'Save Changes' : 'Add Transport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportFormModal;
