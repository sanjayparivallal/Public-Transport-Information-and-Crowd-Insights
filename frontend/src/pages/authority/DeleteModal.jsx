import { useState, useEffect } from 'react';
import { deleteTransport } from '../../api/adminApi';
import { AlertIcon, PlusIcon } from '../../components/icons';

/* ── Delete Confirmation Modal ───────────────────────────── */
const DeleteModal = ({ transport, onDeleted, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { setError(''); }, [transport]);

  const handleDelete = async () => {
    if (!transport) return;
    try {
      setDeleting(true);
      await deleteTransport(transport._id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-red-600 p-6 text-white flex justify-between items-center">
          <h5 className="text-xl font-black tracking-tight flex items-center gap-2"><AlertIcon size={20}/> Delete Transport</h5>
          <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={onClose}>
            <PlusIcon size={20} className="rotate-45" />
          </button>
        </div>
        
        <div className="p-8 bg-slate-50/50">
          {error && <div className="p-4 bg-red-100 border border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2 mb-6"><AlertIcon size={18}/> {error}</div>}
          {transport && (
            <p className="text-slate-600 font-medium">
              Are you sure you want to delete <span className="font-black text-slate-800">{transport.name} (#{transport.transportNumber})</span>? This action is permanent and cannot be undone.
            </p>
          )}
        </div>
        
        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
          <button type="button" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors flex-1" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex-[2] flex items-center justify-center gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
