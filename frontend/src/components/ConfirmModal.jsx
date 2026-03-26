import { useEffect, useRef } from 'react';
import { AlertIcon, TrashIcon, PlusIcon } from './icons';

/**
 * ConfirmModal — Replaces window.confirm()
 *
 * Props:
 *  isOpen       boolean
 *  onConfirm    () => void
 *  onCancel     () => void
 *  title        string
 *  message      string
 *  confirmLabel string  (default "Delete")
 *  cancelLabel  string  (default "Cancel")
 *  variant      "danger" | "warning" (default "danger")
 */
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title      = 'Are you sure?',
  message    = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  variant    = 'danger',
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    // Focus cancel by default for safety
    cancelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger  = variant === 'danger';
  const iconBg    = isDanger ? 'bg-rose-100' : 'bg-amber-100';
  const iconColor = isDanger ? 'text-rose-600' : 'text-amber-600';
  const btnBg     = isDanger
    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/30'
    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-scale-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        {/* Top gradient stripe */}
        <div className={`h-1.5 w-full ${isDanger ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

        <div className="p-8">
          {/* Close */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <PlusIcon size={18} className="rotate-45" />
            </button>
          </div>

          {/* Icon */}
          <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
            {isDanger ? (
              <TrashIcon size={30} className={iconColor} />
            ) : (
              <AlertIcon size={30} className={iconColor} />
            )}
          </div>

          {/* Content */}
          <h2
            id="confirm-title"
            className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight"
          >
            {title}
          </h2>
          <p className="text-slate-500 text-sm text-center leading-relaxed font-medium mb-8">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              ref={cancelRef}
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95 text-sm"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-[1.6] py-3 px-4 ${btnBg} text-white font-black rounded-xl shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2`}
            >
              {isDanger && <TrashIcon size={16} />}
              {!isDanger && <AlertIcon size={16} />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
