import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { deleteTransport } from '../../api/adminApi';
import { AlertIcon, TrashIcon, PlusIcon, BusIcon, TrainIcon } from '../../components/icons';

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
      toast.success('Transport deleted successfully');
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || 'Delete failed.');
      toast.error(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.60)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Top danger stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />

        <div className="p-8">
          {/* Header row with close */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <PlusIcon size={18} className="rotate-45" />
            </button>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <TrashIcon size={30} className="text-rose-600" />
          </div>

          {/* Title */}
          <h2
            id="delete-modal-title"
            className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight"
          >
            Delete Transport?
          </h2>

          {/* Transport info pill */}
          {transport && (
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100">
                {transport.type === 'train' ? <TrainIcon size={14} className="text-rose-500 shrink-0" /> : <BusIcon size={14} className="text-rose-500 shrink-0" />}
                <span className="text-sm font-black text-slate-800">{transport.name}</span>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">#{transport.transportNumber}</span>
              </div>
            </div>
          )}

          <p className="text-slate-500 text-sm text-center leading-relaxed font-medium mb-4">
            This action is <span className="text-rose-600 font-black">permanent</span> and cannot be undone. All routes, fares, and assigned staff will be removed.
          </p>

          {/* Error */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2 mb-4">
              <AlertIcon size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-[1.6] py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black rounded-xl shadow-lg shadow-rose-500/30 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleting
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><TrashIcon size={16} /> Yes, Delete</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
