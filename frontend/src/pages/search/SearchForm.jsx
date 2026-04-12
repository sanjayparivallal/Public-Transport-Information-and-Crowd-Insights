import { memo } from 'react';
import SearchableCombobox from '../../components/SearchableCombobox';
import { SearchIcon, LocationIcon, BusIcon, TrainIcon } from '../../components/icons';

/**
 * @param {{ filters, options, loading, onFilterChange, onComboChange, onTypeChange, onSubmit, onClear }} props
 */
const SearchForm = memo(({ filters, options, loading, onFilterChange, onComboChange, onTypeChange, onSubmit, onClear }) => (
  <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-500/8 border border-slate-200/80 overflow-hidden">
    {/* Card header */}
    <div
      className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center gap-3"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%)' }}
    >
      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
        <LocationIcon size={18} className="text-white" />
      </div>
      <h2 className="text-base font-black text-slate-800 tracking-tight">Search Parameters</h2>
    </div>

    <form onSubmit={onSubmit} className="p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Origin */}
        <div className="space-y-1.5">
          <SearchableCombobox
            id="origin"
            label="Origin"
            options={options.origins}
            value={filters.origin}
            onChange={(v) => onComboChange('origin', v)}
            placeholder="e.g. Salem"
            allowCustom
          />
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <SearchableCombobox
            id="destination"
            label="Destination"
            options={options.destinations}
            value={filters.destination}
            onChange={(v) => onComboChange('destination', v)}
            placeholder="e.g. Chennai"
            allowCustom
          />
        </div>

        {/* Transport Name / No */}
        <div className="space-y-1.5">
          <SearchableCombobox
            id="busNo"
            label="Transport Name / No."
            options={options.identifiers}
            value={filters.busNo}
            onChange={(v) => onComboChange('busNo', v)}
            placeholder="e.g. Express or 12A"
            allowCustom
          />
        </div>

        {/* Vehicle Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Vehicle Type
          </label>
          <div className="flex gap-2">
            {[
              { val: '', label: 'All', icon: null },
              { val: 'bus', label: 'Bus', icon: BusIcon },
              { val: 'train', label: 'Train', icon: TrainIcon },
            ].map(({ val, label, icon: Icon }) => (
              <button
                key={val}
                type="button"
                onClick={() => onTypeChange(val)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                  filters.type === val
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {Icon && <Icon size={14} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Earliest Departure */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Earliest Departure
          </label>
          <input
            name="departureTime"
            type="time"
            className="form-field"
            value={filters.departureTime}
            onChange={onFilterChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-3 pt-1">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><SearchIcon size={16} /> Search</>
            )}
          </button>
          <button type="button" className="btn-ghost" onClick={onClear}>
            Reset
          </button>
        </div>

      </div>
    </form>
  </div>
));

SearchForm.displayName = 'SearchForm';

export default SearchForm;
