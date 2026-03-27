import { ArrowLeftIcon, ArrowRightIcon } from './icons';

/**
 * Pagination — numbered page navigation
 * ENHANCED: .btn-ghost for active/hover, btn-primary gradient for current page
 *
 * Props:
 *  page         current page (1-based)
 *  totalPages   total number of pages
 *  onPageChange (page: number) => void
 *  className    string (extra wrapper class)
 *  loading      boolean (disable while loading)
 */
const Pagination = ({
  page,
  totalPages,
  onPageChange,
  className  = '',
  loading    = false,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  // Build page list with ellipsis
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4)            pages.push('…');
    const start = Math.max(2, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('…');
    pages.push(totalPages);
  }

  return (
    // ENHANCED: uses divider as border-top
    <div className={`flex items-center justify-center gap-1.5 pt-6 mt-6 border-t border-slate-100 ${className}`}>
      {/* ENHANCED: .btn-ghost for prev/next arrows */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
        className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <ArrowLeftIcon size={15} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">
            …
          </span>
        ) : (
          // ENHANCED: .btn-primary for active, .btn-ghost for inactive pages
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:pointer-events-none ${
              p === page ? 'btn-primary !p-0 scale-105' : 'btn-ghost !p-0'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* ENHANCED: .btn-ghost for next arrow */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || loading}
        className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <ArrowRightIcon size={15} />
      </button>
    </div>
  );
};

export default Pagination;
