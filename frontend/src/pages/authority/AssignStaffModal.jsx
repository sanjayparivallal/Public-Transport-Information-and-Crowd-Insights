import { useState, useEffect } from 'react';
import { assignStaff, getStaffCandidates } from '../../api/adminApi';
import SearchableCombobox from '../../components/SearchableCombobox';
import { UserIcon, PlusIcon, AlertIcon, CheckCircleIcon, BusIcon, TrainIcon } from '../../components/icons';

/* ── Assign Staff Modal ──────────────────────────────────── */
const AssignStaffModal = ({ transport, onSaved, onClose }) => {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('driver');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    setEmail(''); setRole('driver'); setError(''); setSuccess('');
    getStaffCandidates()
      .then(res => setCandidates(res.data?.data || []))
      .catch(() => {});
  }, [transport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Email is required.'); return; }
    try {
      setSaving(true);
      await assignStaff(transport._id, { email: email.trim(), assignRole: role });
      setSuccess(`Assigned as ${role} successfully!`);
      setEmail('');
      onSaved();
    } catch (err) {
      setError(err.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  // Build combobox options from candidates
  const emailOptions = candidates.map(c => ({
    label: `${c.name} (${c.email}) — ${c.role}`,
    value: c.email,
  }));

  const roleOptions = [
    { label: 'Driver', value: 'driver' },
    { label: 'Conductor / TTR', value: 'conductor' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        {/* Gradient header */}
        <div
          className="px-6 pt-6 pb-5 flex justify-between items-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ background: '#a78bfa' }} />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <UserIcon size={22} className="text-white" />
            </div>
            <div>
              <h5 className="text-lg font-black text-white tracking-tight">Assign Staff</h5>
              {transport && (
                <p className="text-blue-200 text-xs font-bold truncate max-w-[200px]">
                  {transport.name} · #{transport.transportNumber}
                </p>
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

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Transport info */}
            {transport && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-100"
                style={{ background: 'rgba(219,234,254,0.4)' }}>
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  {transport.type === 'train' ? <TrainIcon size={16} className="text-white" /> : <BusIcon size={16} className="text-white" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Assigning to</p>
                  <p className="font-black text-slate-800 text-sm">{transport.name}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                <AlertIcon size={18} className="shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-2">
                <CheckCircleIcon size={18} className="shrink-0" /> {success}
              </div>
            )}

            {/* Staff email combobox */}
            <SearchableCombobox
              id="staff-email"
              label="Search Commuter Email *"
              options={emailOptions}
              value={email}
              onChange={setEmail}
              placeholder="Type name or email…"
              allowCustom
            />

            {/* Role combobox */}
            <SearchableCombobox
              id="staff-role"
              label="Assign As *"
              options={roleOptions}
              value={role}
              onChange={setRole}
              placeholder="Select role…"
              allowCustom={false}
            />
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="flex-[1.6] btn-primary flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircleIcon size={17} /> Assign Staff</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStaffModal;
