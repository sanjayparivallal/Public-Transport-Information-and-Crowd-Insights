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

  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-medium text-slate-800 text-sm";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h5 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            {transport ? <><div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><EditIcon size={18}/></div> Edit Transport</> : <><div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><PlusIcon size={18}/></div> Add New Transport</>}
          </h5>
          <button type="button" className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors" onClick={onClose}>
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertIcon size={16}/> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Transport Number *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. SLM-001"
                  value={form.transportNumber}
                  onChange={set('transportNumber')}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Salem–Chennai Exp"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Type</label>
                <select 
                  className={`${inputClass} appearance-none bg-no-repeat`}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                  value={form.type} 
                  onChange={set('type')}
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Operator</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. TNSTC"
                  value={form.operator}
                  onChange={set('operator')}
                />
              </div>
              
              <div>
                <label className={labelClass}>Vehicle Reg No.</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. TN 33 AB 1234"
                  value={form.vehicleNumber}
                  onChange={set('vehicleNumber')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total Seats</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 52"
                    min="1"
                    value={form.totalSeats}
                    onChange={set('totalSeats')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Available</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 40"
                    min="0"
                    value={form.availableSeats}
                    onChange={set('availableSeats')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Amenities</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. AC, WiFi, Sleeper (comma separated)"
                  value={form.amenities}
                  onChange={set('amenities')}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 mt-auto shrink-0">
            <button type="button" className="px-5 py-2.5 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (transport ? 'Save Changes' : 'Add Transport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportFormModal;
