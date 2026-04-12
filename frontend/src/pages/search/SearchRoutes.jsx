import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { searchTransports } from '../../api/transportApi';
import SearchPageHeader from './SearchPageHeader';
import SearchForm from './SearchForm';
import SearchResultsPanel from './SearchResultsPanel';

const INITIAL_FILTERS = { busNo: '', type: '', origin: '', destination: '', departureTime: '' };

const SearchRoutes = () => {
  const [filters, setFilters]       = useState(INITIAL_FILTERS);
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);
  const [options, setOptions]       = useState({ origins: [], destinations: [], identifiers: [] });

  // Pre-load combobox options from the full dataset
  useEffect(() => {
    searchTransports({ limit: 500 })
      .then(res => {
        const payload = res.data?.data?.results || res.data?.results || [];
        const origins = new Set(), destinations = new Set(), identifiers = new Set();
        payload.forEach(r => {
          if (r.origin)      origins.add(r.origin);
          if (r.destination) destinations.add(r.destination);
          const t = r.transportId || {};
          if (t.transportNumber) identifiers.add(t.transportNumber);
          if (t.name)            identifiers.add(t.name);
        });
        setOptions({
          origins:      Array.from(origins).sort(),
          destinations: Array.from(destinations).sort(),
          identifiers:  Array.from(identifiers).sort(),
        });
      })
      .catch(() => {});
  }, []);

  const doSearch = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 20 };
      if (filters.busNo.trim())         params.busNo         = filters.busNo.trim().toLowerCase();
      if (filters.type)                 params.type          = filters.type;
      if (filters.origin.trim())        params.origin        = filters.origin.trim().toLowerCase();
      if (filters.destination.trim())   params.destination   = filters.destination.trim().toLowerCase();
      if (filters.departureTime.trim()) params.departureTime = filters.departureTime.trim();

      const res     = await searchTransports(params);
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

  const handleSubmit    = e  => { e.preventDefault(); doSearch(1); };
  const handleClear     = () => { setFilters(INITIAL_FILTERS); setResults([]); setSearched(false); setPagination(null); };
  const handleChange    = e  => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCombo     = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const handleTypeChange = val => setFilters(prev => ({ ...prev, type: val }));

  return (
    <div className="min-h-screen pb-20">
      <SearchPageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <SearchForm
            filters={filters}
            options={options}
            loading={loading}
            onFilterChange={handleChange}
            onComboChange={handleCombo}
            onTypeChange={handleTypeChange}
            onSubmit={handleSubmit}
            onClear={handleClear}
          />
          <SearchResultsPanel
            results={results}
            loading={loading}
            searched={searched}
            pagination={pagination}
            page={page}
            onPageChange={doSearch}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchRoutes;

