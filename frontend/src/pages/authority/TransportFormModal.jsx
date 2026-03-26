import { useState, useEffect } from 'react';
import { createTransport, updateTransport } from '../../api/adminApi';
import { EditIcon, PlusIcon, AlertIcon, BusIcon, TrainIcon, CheckCircleIcon } from '../../components/icons';

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

/* ── Field component (for non-floating complex inputs) ── */
const Field = ({ label, required, children }) => (
  <div className="space-y-1.5 mb-5 block">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

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

  const inputCls = "floating-input";

  const isEdit = !!transport;
  const headerGradient = isEdit
    ? 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)'
    : 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Gradient header */}
        <div
          className="px-6 pt-6 pb-5 flex justify-between items-center relative overflow-hidden"
          style={{ background: headerGradient }}
        >
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full blur-3xl opacity-20 bg-white" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              {isEdit ? <EditIcon size={22} className="text-white" /> : <PlusIcon size={22} className="text-white" />}
            </div>
            <div>
              <h5 className="text-lg font-black text-white tracking-tight">
                {isEdit ? 'Edit Transport' : 'Add New Transport'}
              </h5>
              {isEdit && transport && (
                <p className="text-blue-100/80 text-xs font-bold">#{transport.transportNumber} · {transport.name}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="relative p-2 hover:bg-white/20 text-white/70 hover:text-white rounded-xl transition-colors"
            onClick={onClose}
          >
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertIcon size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Type selector */}
            <Field label="Vehicle Type">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'bus',   label: 'Bus',   Icon: BusIcon,   from: '#2563eb', to: '#4f46e5' },
                  { val: 'train', label: 'Train', Icon: TrainIcon, from: '#7c3aed', to: '#d946ef' },
                ].map(({ val, label, Icon, from, to }) => (
                  <label
                    key={val}
                    className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.type === val
                        ? 'border-transparent text-white shadow-lg'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                    style={form.type === val ? { background: `linear-gradient(135deg, ${from}, ${to})` } : {}}
                  >
                    <input
                      type="radio" name="type" value={val}
                      checked={form.type === val}
                      onChange={set('type')}
                      className="sr-only"
                    />
                    <Icon size={20} />
                    <span className="font-black text-sm">{label}</span>
                    {form.type === val && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-white/25 rounded-full flex items-center justify-center">
                        <CheckCircleIcon size={12} className="text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
              <div className="floating-group">
                <input
                  id="tf-number" type="text" className={inputCls} placeholder="e.g. 12A"
                  value={form.transportNumber} onChange={set('transportNumber')} required
                />
                <label htmlFor="tf-number" className="floating-label">Transport Number <span className="text-rose-500">*</span></label>
              </div>

              <div className="floating-group">
                <input
                  id="tf-name" type="text" className={inputCls} placeholder="e.g. Express Coimbatore"
                  value={form.name} onChange={set('name')} required
                />
                <label htmlFor="tf-name" className="floating-label">Name <span className="text-rose-500">*</span></label>
              </div>

              <div className="floating-group">
                <input
                  id="tf-operator" type="text" className={inputCls} placeholder="e.g. TNSTC"
                  value={form.operator} onChange={set('operator')}
                />
                <label htmlFor="tf-operator" className="floating-label">Operator</label>
              </div>

              <div className="floating-group">
                <input
                  id="tf-vehicleno" type="text" className={inputCls} placeholder="e.g. TN 01 AB 1234"
                  value={form.vehicleNumber} onChange={set('vehicleNumber')}
                />
                <label htmlFor="tf-vehicleno" className="floating-label">Vehicle Reg No.</label>
              </div>

              <div className="floating-group">
                <input
                  id="tf-seats" type="number" className={inputCls} placeholder="e.g. 48"
                  min="1" value={form.totalSeats} onChange={set('totalSeats')}
                />
                <label htmlFor="tf-seats" className="floating-label">Total Seats</label>
              </div>

              <div className="floating-group sm:col-span-2">
                <input
                  id="tf-amenities" type="text" className={inputCls} placeholder="AC, USB, WiFi (comma separated)"
                  value={form.amenities} onChange={set('amenities')}
                />
                <label htmlFor="tf-amenities" className="floating-label">Amenities</label>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50/60 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[1.6] btn-primary flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircleIcon size={17} /> {isEdit ? 'Save Changes' : 'Add Transport'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportFormModal;
