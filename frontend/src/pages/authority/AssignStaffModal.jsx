import { useState, useEffect } from 'react';
import { assignStaff, getStaffCandidates } from '../../api/adminApi';
import { UserIcon, PlusIcon, AlertIcon, CheckCircleIcon } from '../../components/icons';

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
      setSuccess(`Assigned ${role} successfully!`);
      setEmail('');
      onSaved();
    } catch (err) {
      setError(err.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h5 className="text-xl font-black tracking-tight flex items-center gap-2"><UserIcon size={20}/> Assign Staff</h5>
          <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={onClose}>
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-8 bg-slate-50/50 space-y-6">
            {transport && (
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 text-sm font-bold text-primary-700">
                Transport: <span className="text-slate-900">{transport.name} (#{transport.transportNumber})</span>
              </div>
            )}
            
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2"><AlertIcon size={18}/> {error}</div>}
            {success && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-2"><CheckCircleIcon size={18}/> {success}</div>}
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Commuter Email *</label>
              <input
                type="email" list="staff-candidates"
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700"
                placeholder="Type or select email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
              <datalist id="staff-candidates">
                {candidates.map(c => (
                  <option key={c._id} value={c.email}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </datalist>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">The commuter's role will be updated to the assigned role.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assign As</label>
              <select 
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="driver">Driver</option>
                <option value="conductor">Conductor / TTR</option>
              </select>
            </div>
          </div>
          
          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors flex-1" onClick={onClose}>Close</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 flex-[2] flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Assign Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStaffModal;
