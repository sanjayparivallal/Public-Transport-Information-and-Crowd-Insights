import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { searchTransports } from '../../api/transportApi';
import TransportCard from '../../components/TransportCard';
import { SearchIcon, LocationIcon, AlertIcon, BuildingIcon, ArrowRightIcon, ArrowLeftIcon } from '../../components/icons';

const SearchRoutes = () => {


  const [filters, setFilters] = useState({
    busNo: '', type: '', origin: '', destination: '', departureTime: '',
  });
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]           = useState(1);
  const [options, setOptions]     = useState({ origins: [], destinations: [], identifiers: [] });

  useEffect(() => {
    searchTransports({ limit: 500 }).then(res => {
      const payload = res.data?.data?.results || res.data?.results || [];
      const origins = new Set();
      const destinations = new Set();
      const identifiers = new Set();
      
      payload.forEach(r => {
        if (r.origin) origins.add(r.origin);
        if (r.destination) destinations.add(r.destination);
        const t = r.transportId || {};
        if (t.transportNumber) identifiers.add(t.transportNumber);
        if (t.name) identifiers.add(t.name);
      });

      setOptions({
        origins: Array.from(origins).sort(),
        destinations: Array.from(destinations).sort(),
        identifiers: Array.from(identifiers).sort(),
      });
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      // Backend sendSuccess returns { success: true, data: { results, pagination } }
      // Axios puts that in res.data
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

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(1);
  };

  const handleClear = () => {
    setFilters({ busNo: '', type: '', origin: '', destination: '', departureTime: '' });
    setResults([]);
    setSearched(false);
    setPagination(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Page Header (SaaS Style) ── */}
      <div className="bg-white border-b border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.01)] py-10 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="max-w-7xl mx-auto flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <SearchIcon size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Transit Finder
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Search Routes</h1>
            <p className="mt-2 text-gray-500 font-medium text-sm max-w-lg">
              Find routes by name, number, origin, destination or type.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Search Form Card */}
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 p-6 sm:p-8 mb-10 relative overflow-hidden">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900 tracking-tight">
              <LocationIcon size={20} className="text-blue-600" /> Search Parameters
            </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Origin District</label>
                    <div className="relative group">
                      <LocationIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        name="origin" type="text" list="origins"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-200/60 rounded-[1.25rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400 font-bold text-gray-800 hover:border-gray-300"
                        placeholder="e.g. Salem"
                        value={filters.origin}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                      <datalist id="origins">
                        {options.origins.map(o => <option key={o} value={o} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Destination</label>
                    <div className="relative group">
                      <LocationIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        name="destination" type="text" list="destinations"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-200/60 rounded-[1.25rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400 font-bold text-gray-800 hover:border-gray-300"
                        placeholder="e.g. Chennai"
                        value={filters.destination}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                      <datalist id="destinations">
                        {options.destinations.map(d => <option key={d} value={d} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Transport Name or No.</label>
                    <div className="relative group">
                      <BuildingIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        name="busNo" type="text" list="identifiers"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-200/60 rounded-[1.25rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400 font-bold text-gray-800 hover:border-gray-300"
                        placeholder="e.g. Express or 12A"
                        value={filters.busNo}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                      <datalist id="identifiers">
                        {options.identifiers.map(i => <option key={i} value={i} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Vehicle Type</label>
                    <div className="relative">
                      <select 
                        name="type" 
                        className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200/60 rounded-[1.25rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all font-bold text-gray-800 hover:border-gray-300 appearance-none bg-no-repeat cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                        value={filters.type} 
                        onChange={handleChange}
                      >
                        <option value="">All Fleets</option>
                        <option value="bus">Buses Only</option>
                        <option value="train">Trains Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Earliest Departure</label>
                    <input
                      name="departureTime" type="time"
                      className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200/60 rounded-[1.25rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all font-bold text-gray-800 hover:border-gray-300"
                      value={filters.departureTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-end gap-3 lg:col-span-1 pt-2">
                    <button
                      type="submit"
                      className="grow py-3.5 px-6 font-black tracking-widest uppercase text-xs rounded-[1.25rem] flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        <><SearchIcon size={16} /> Search</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3.5 border-2 border-gray-200 text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 font-black tracking-widest uppercase text-xs rounded-[1.25rem] transition-all active:scale-95 whitespace-nowrap"
                      onClick={handleClear}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>

          {/* Results Section */}
          <section className="bg-white border-2 border-gray-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {searched && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-gray-100 pb-8 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight m-0">
                    Search Results
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Live from global transport index</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest shadow-inner whitespace-nowrap">
                    {results.length === 0 ? 'No matches found' : `${pagination?.total ?? results.length} transport(s)`}
                  </div>
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center gap-3 shrink-0 bg-white border border-gray-200 rounded-xl px-2 py-1 shadow-sm">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap pl-2">
                        <span className="text-blue-600">{page}</span> / {pagination.pages}
                      </span>
                      <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                        <button
                          onClick={() => doSearch(page - 1)}
                          disabled={page === 1 || loading}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowLeftIcon size={14} />
                        </button>
                        <button
                          onClick={() => doSearch(page + 1)}
                          disabled={page >= pagination.pages || loading}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowRightIcon size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-[2rem] p-10 border border-gray-100 animate-pulse flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-4 grow">
                      <div className="h-6 bg-gray-100 rounded-lg w-1/4"></div>
                      <div className="h-10 bg-gray-100 rounded-lg w-1/2"></div>
                      <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
                    </div>
                    <div className="h-24 bg-gray-100 rounded-[1.5rem] w-full md:w-32"></div>
                  </div>
                ))}
              </div>
            ) : searched ? (
              results.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <AlertIcon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-4 tracking-tight">No Results</h3>
                  <p className="text-gray-500 font-medium max-w-lg mx-auto mb-8 text-base leading-relaxed text-balance">
                    We couldn't find any fleets currently servicing this operational sector. Try broadening your geographic parameters.
                  </p>
                  <button 
                    className="px-4 py-2 bg-gray-900 border border-gray-800 text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                    onClick={handleClear}
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map(t => (
                    <TransportCard key={t._id} transport={t} />
                  ))}
                </div>
              )
            ) : (
                <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden group">
                {/* Background decorative spot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-50/50 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 font-sans">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transition-transform duration-700 group-hover:rotate-12">
                    <LocationIcon size={32} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4 tracking-tight">Your Network, <span className="text-primary-600">Unveiled</span></h3>
                  <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto leading-relaxed text-balance">
                    Initialize your journey parameters above to synchronize with the global transit grid and real-time crowd dynamics.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchRoutes;
