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

  const inputClass = "block px-4 pb-2.5 pt-4 w-full text-sm font-bold text-slate-900 bg-transparent rounded-xl border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-colors";
  const labelClass = "absolute text-[10px] font-black uppercase tracking-widest text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-2 pointer-events-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-white border-b border-slate-100 p-6 text-slate-800 flex justify-between items-center">
          <h5 className="text-xl font-black tracking-tight flex items-center gap-2"><div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><UserIcon size={18}/></div> Assign Staff</h5>
          <button type="button" className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors" onClick={onClose}>
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-8 bg-white space-y-6">
            {transport && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm font-bold text-blue-700">
                Transport: <span className="text-slate-900">{transport.name} (#{transport.transportNumber})</span>
              </div>
            )}
            
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2"><AlertIcon size={18}/> {error}</div>}
            {success && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-bold flex items-center gap-2"><CheckCircleIcon size={18}/> {success}</div>}
            
            <div className="relative mt-2">
              <input
                type="email" 
                list="staff-candidates"
                id="floating_email"
                className={inputClass}
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
              <label htmlFor="floating_email" className={labelClass}>Commuter Email *</label>
              <datalist id="staff-candidates">
                {candidates.map(c => (
                  <option key={c._id} value={c.email}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </datalist>
            </div>
            
            <div className="relative mt-2">
              <select 
                id="floating_role"
                className={`${inputClass} bg-no-repeat`}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="driver">Driver</option>
                <option value="conductor">Conductor / TTR</option>
              </select>
              <label htmlFor="floating_role" className={labelClass}>Assign As</label>
            </div>
          </div>
          
          <div className="p-4 sm:px-6 bg-white border-t border-slate-100 flex gap-3">
            <button type="button" className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors flex-1" onClick={onClose}>Close</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex-[2] flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600" disabled={saving}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Assign Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStaffModal;
