import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, SearchIcon } from './icons';

/**
 * SearchableCombobox — replaces <select> and datalist
 *
 * Props:
 *  options      string[] | { label: string, value: string }[]
 *  value        string
 *  onChange     (value: string) => void
 *  placeholder  string
 *  label        string  (optional, shown above)
 *  id           string
 *  disabled     boolean
 *  allowCustom  boolean  (allow values not in list, default true)
 *  className    string   (wrapper class)
 */
const SearchableCombobox = ({
  options      = [],
  value        = '',
  onChange,
  placeholder  = 'Search or select…',
  label,
  id,
  disabled     = false,
  allowCustom  = true,
  className    = '',
}) => {
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);

  // Normalize options to { label, value }
  const normalized = options.map(o =>
    typeof o === 'string' ? { label: o, value: o } : o
  );

  // Filter by query
  const filtered = query
    ? normalized.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalized;

  const select = useCallback((val) => {
    onChange?.(val);
    setQuery('');
    setOpen(false);
    setHighlighted(-1);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const onOut = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  const displayText = value
    ? (normalized.find(o => o.value === value)?.label || value)
    : '';

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!open) setOpen(true);
    if (allowCustom) onChange?.(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true); return;
    }
    if (e.key === 'ArrowDown') setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    if (e.key === 'ArrowUp')   setHighlighted(h => Math.max(h - 1, 0));
    if (e.key === 'Enter' && highlighted >= 0) { select(filtered[highlighted].value); e.preventDefault(); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <div className={`relative flex items-center bg-white border-2 rounded-xl transition-all ${
        open ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <SearchIcon size={16} />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={open ? 'Type to search…' : (placeholder)}
          value={open ? query : displayText}
          onChange={handleInputChange}
          onFocus={() => { setOpen(true); setQuery(''); }}
          onKeyDown={handleKeyDown}
          className="flex-1 pl-9 pr-8 py-2.5 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-400 min-w-0"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen(o => !o); inputRef.current?.focus(); }}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <ChevronDownIcon
            size={16}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden animate-scale-in">
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold">
                {allowCustom ? `Press Enter to use "${query}"` : 'No options found'}
              </div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    highlighted === i
                      ? 'bg-blue-50 text-blue-700'
                      : opt.value === value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => { e.preventDefault(); select(opt.value); }}
                >
                  {opt.label}
                  {opt.value === value && (
                    <span className="ml-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Selected</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCombobox;
