import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { searchTransports } from '../../api/transportApi';
import TransportCard from '../../components/TransportCard';
import SearchableCombobox from '../../components/SearchableCombobox';
import Pagination from '../../components/Pagination';
import { SearchIcon, LocationIcon, AlertIcon, BuildingIcon, BusIcon, TrainIcon } from '../../components/icons';

const SearchRoutes = () => {
  const [filters, setFilters] = useState({
    busNo: '', type: '', origin: '', destination: '', departureTime: '',
  });
  const [results, setResults]      = useState([]);
  const [loading, setLoading]      = useState(false);
  const [searched, setSearched]    = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]            = useState(1);
  const [options, setOptions]      = useState({ origins: [], destinations: [], identifiers: [] });

  useEffect(() => {
    searchTransports({ limit: 500 }).then(res => {
      const payload = res.data?.data?.results || res.data?.results || [];
      const origins = new Set(), destinations = new Set(), identifiers = new Set();
      payload.forEach(r => {
        if (r.origin) origins.add(r.origin);
        if (r.destination) destinations.add(r.destination);
        const t = r.transportId || {};
        if (t.transportNumber) identifiers.add(t.transportNumber);
        if (t.name) identifiers.add(t.name);
      });
      setOptions({
        origins:     Array.from(origins).sort(),
        destinations: Array.from(destinations).sort(),
        identifiers:  Array.from(identifiers).sort(),
      });
    }).catch(() => {});
  }, []);

  const handleChange = e => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const doSearch = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 20 };
      if (filters.busNo.trim())         params.busNo         = filters.busNo.trim().toLowerCase();
      if (filters.type)                 params.type          = filters.type;
      if (filters.origin.trim())        params.origin        = filters.origin.trim().toLowerCase();
      if (filters.destination.trim())   params.destination   = filters.destination.trim().toLowerCase();
      if (filters.departureTime.trim()) params.departureTime = filters.departureTime.trim();
      const res = await searchTransports(params);
      const payload = res.data?.data || res.data;
      setResults(payload.results || []);
      setPagination(payload.pagination || null);
      setPage(pageNum);
      setSearched(true);
    } catch (err) {
      toast.error(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = e => { e.preventDefault(); doSearch(1); };
  const handleClear  = () => {
    setFilters({ busNo: '', type: '', origin: '', destination: '', departureTime: '' });
    setResults([]); setSearched(false); setPagination(null);
  };

  return (
    <div className="min-h-screen pb-20">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #7c3aed 100%)' }}
      >
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'rgba(139,92,246,0.3)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-2xl"
            style={{ background: 'rgba(6,182,212,0.15)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start gap-5">
            <div className="p-3 rounded-2xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <SearchIcon size={28} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Transit Finder
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Search Routes</h1>
              <p className="mt-1.5 text-blue-100/80 font-medium text-sm max-w-lg">
                Find routes by name, number, origin, destination, or type.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Search Form Card ───────────────────────────── */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-500/8 border border-slate-200/80 overflow-hidden">
            {/* Card header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%)' }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                <LocationIcon size={18} className="text-white" />
              </div>
              <h2 className="text-base font-black text-slate-800 tracking-tight">Search Parameters</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Origin */}
                <div className="space-y-1.5">
                  <SearchableCombobox
                    id="origin"
                    label="Origin"
                    options={options.origins}
                    value={filters.origin}
                    onChange={(v) => setFilters(p => ({ ...p, origin: v }))}
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
                    onChange={(v) => setFilters(p => ({ ...p, destination: v }))}
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
                    onChange={(v) => setFilters(p => ({ ...p, busNo: v }))}
                    placeholder="e.g. Express or 12A"
                    allowCustom
                  />
                </div>

                {/* Type */}
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
                        onClick={() => setFilters(p => ({ ...p, type: val }))}
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

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Earliest Departure
                  </label>
                  <input
                    name="departureTime" type="time"
                    className="form-field"
                    value={filters.departureTime}
                    onChange={handleChange}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-3 pt-1">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><SearchIcon size={16} /> Search</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={handleClear}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ── Results Section ────────────────────────────── */}
          <div className="bg-white border-2 border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">

            {/* Results header */}
            {searched && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b-2 border-slate-100 pb-7 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Search Results</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Live from global transport index</p>
                </div>
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-inner whitespace-nowrap">
                  {results.length === 0 ? 'No matches' : `${pagination?.total ?? results.length} transport(s)`}
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              <div className="space-y-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-[2rem] p-8 border border-slate-100 animate-pulse flex gap-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-1/4" />
                      <div className="h-6 bg-slate-100 rounded w-1/2" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searched ? (
              results.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertIcon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">No Results Found</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto mb-6 text-sm leading-relaxed">
                    We couldn't find any routes matching your criteria. Try adjusting your filters.
                  </p>
                  <button className="btn-ghost" onClick={handleClear}>Reset Filters</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {results.map((t, i) => (
                    <div key={t._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                      <TransportCard transport={t} />
                    </div>
                  ))}
                  <Pagination
                    page={page}
                    totalPages={pagination?.pages || 1}
                    onPageChange={doSearch}
                    loading={loading}
                  />
                </div>
              )
            ) : (
              /* Empty state */
              <div className="py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
                </div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                    <LocationIcon size={36} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                    Your Network, <span className="gradient-text">Unveiled</span>
                  </h3>
                  <p className="text-slate-500 text-base font-medium max-w-lg mx-auto leading-relaxed">
                    Enter your journey parameters above to discover available routes and real-time crowd dynamics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchRoutes;
