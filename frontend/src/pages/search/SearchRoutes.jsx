import { useState } from 'react';

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
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <SearchIcon size={20} className="text-blue-600" />
          <div>
            <h1>Search Routes</h1>
            <p className="mt-0.5">Find routes by name, number, origin, destination or type.</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="max-w-5xl mx-auto">
          {/* Search Form Card */}
          <div className="card card-body mb-8">
            <h2 className="mb-4 flex items-center gap-2">
              <LocationIcon size={18} className="text-blue-600" /> Search Parameters
            </h2>

              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origin District</label>
                    <div className="relative">
                      <LocationIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        name="origin" type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700 shadow-inner"
                        placeholder="e.g. Salem"
                        value={filters.origin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                    <div className="relative">
                      <LocationIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        name="destination" type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700 shadow-inner"
                        placeholder="e.g. Chennai"
                        value={filters.destination}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus / Train No.</label>
                    <div className="relative">
                      <BuildingIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        name="busNo" type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-500 outline-none transition-all placeholder-slate-300 font-bold text-slate-700 shadow-inner"
                        placeholder="e.g. 12A"
                        value={filters.busNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                    <div className="relative">
                      <select 
                        name="type" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-500 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat shadow-inner"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Earliest Departure</label>
                    <input
                      name="departureTime" type="time"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                      value={filters.departureTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-end gap-3 lg:col-span-1">
                    <button 
                      type="submit" 
                      className="grow py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-300/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><SearchIcon size={20} className="group-hover:rotate-12 transition-transform" /> Search Routes</>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 whitespace-nowrap" 
                      onClick={handleClear}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>

          {/* Results Section */}
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {searched && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight m-0">
                    Search Results
                  </h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Live from global transport index</p>
                </div>
                <div className="px-6 py-2 bg-white border border-slate-200 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest shadow-sm">
                  {results.length === 0
                    ? 'No matches found'
                    : `${pagination?.total ?? results.length} transport(s) identified`}
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-[2rem] p-10 border border-slate-100 animate-pulse flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-4 grow">
                      <div className="h-6 bg-slate-100 rounded-lg w-1/4"></div>
                      <div className="h-10 bg-slate-100 rounded-lg w-1/2"></div>
                      <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
                    </div>
                    <div className="h-24 bg-slate-100 rounded-[1.5rem] w-full md:w-32"></div>
                  </div>
                ))}
              </div>
            ) : searched ? (
              results.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
                  <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <AlertIcon size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Access Denied: No Results</h3>
                  <p className="text-slate-500 font-medium max-w-lg mx-auto mb-10 text-lg leading-relaxed text-balance">
                    We couldn't find any fleets currently servicing this operational sector. Try broadening your geographic parameters.
                  </p>
                  <button 
                    className="px-10 py-4 bg-slate-900 border-2 border-slate-800 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 transform active:scale-95"
                    onClick={handleClear}
                  >
                    Reset Grid Systems
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map(t => (
                    <TransportCard key={t._id} transport={t} />
                  ))}

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-16 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 w-fit mx-auto border-b-4 border-b-primary-600">
                      <button
                        className="p-3 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-400 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        disabled={page === 1}
                        onClick={() => doSearch(page - 1)}
                      >
                        <ArrowLeftIcon size={24} />
                      </button>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-8 border-x border-slate-100 whitespace-nowrap">
                        Index <span className="text-primary-600 text-xl font-black ml-1 mr-1">{page}</span> / {pagination.pages}
                      </div>
                      <button
                        className="p-3 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-400 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        disabled={page >= pagination.pages}
                        onClick={() => doSearch(page + 1)}
                      >
                        <ArrowRightIcon size={24} />
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="bg-white rounded-[3rem] p-32 text-center shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
                {/* Background decorative spot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-50/50 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 font-sans">
                  <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-sm transition-transform duration-700 group-hover:rotate-12">
                    <LocationIcon size={48} />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tighter">Your Network, <span className="text-primary-600">Unveiled</span></h3>
                  <p className="text-slate-400 text-xl font-medium max-w-xl mx-auto leading-relaxed text-balance">
                    Initialize your journey parameters above to synchronize with the global transit grid and real-time crowd dynamics.
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
