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
  amenities: '',
};

const formFromTransport = (t) => ({
  transportNumber: t.transportNumber || '',
  name: t.name || '',
  type: t.type || 'bus',
  operator: t.operator || '',
  vehicleNumber: t.vehicleNumber || '',
  totalSeats: t.totalSeats != null ? String(t.totalSeats) : '',
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

  const inputClass = "block px-4 pb-2.5 pt-4 w-full text-sm font-bold text-slate-900 bg-transparent rounded-xl border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-colors";
  const labelClass = "absolute text-[10px] font-black uppercase tracking-widest text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-2 pointer-events-none";

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
              <div className="relative mt-2">
                <input
                  type="text"
                  id="floating_transport"
                  className={inputClass}
                  placeholder=" "
                  value={form.transportNumber}
                  onChange={set('transportNumber')}
                  required
                />
                <label htmlFor="floating_transport" className={labelClass}>Transport Number *</label>
              </div>
              
              <div className="relative mt-2">
                <input
                  type="text"
                  id="floating_name"
                  className={inputClass}
                  placeholder=" "
                  value={form.name}
                  onChange={set('name')}
                  required
                />
                <label htmlFor="floating_name" className={labelClass}>Name *</label>
              </div>
              
              <div className="relative mt-2">
                <select 
                  id="floating_type"
                  className={`${inputClass} bg-no-repeat`}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                  value={form.type} 
                  onChange={set('type')}
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
                <label htmlFor="floating_type" className={labelClass}>Type</label>
              </div>
              
              <div className="relative mt-2">
                <input
                  type="text"
                  id="floating_operator"
                  className={inputClass}
                  placeholder=" "
                  value={form.operator}
                  onChange={set('operator')}
                />
                <label htmlFor="floating_operator" className={labelClass}>Operator</label>
              </div>
              
              <div className="relative mt-2">
                <input
                  type="text"
                  id="floating_vehicle"
                  className={inputClass}
                  placeholder=" "
                  value={form.vehicleNumber}
                  onChange={set('vehicleNumber')}
                />
                <label htmlFor="floating_vehicle" className={labelClass}>Vehicle Reg No.</label>
              </div>
              
              <div className="relative mt-2">
                <input
                  type="number"
                  id="floating_totalseats"
                  className={inputClass}
                  placeholder=" "
                  min="1"
                  value={form.totalSeats}
                  onChange={set('totalSeats')}
                />
                <label htmlFor="floating_totalseats" className={labelClass}>Total Seats</label>
              </div>
              
              <div className="relative sm:col-span-2 mt-2">
                <input
                  type="text"
                  id="floating_amenities"
                  className={inputClass}
                  placeholder=" "
                  value={form.amenities}
                  onChange={set('amenities')}
                />
                <label htmlFor="floating_amenities" className={labelClass}>Amenities</label>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:px-6 bg-white border-t border-slate-100 flex justify-end gap-3 mt-auto shrink-0">
            <button type="button" className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-xl transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600" disabled={saving}>
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (transport ? 'Save Changes' : 'Add Transport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportFormModal;
