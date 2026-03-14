import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { searchTransports } from '../../api/transportApi';
import TransportCard from '../../components/TransportCard';
import { SearchIcon, LocationIcon, AlertIcon, BuildingIcon, ArrowRightIcon, ArrowLeftIcon } from '../../components/icons';

const SearchRoutes = () => {
  const navigate = useNavigate();

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
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="d-flex align-items-center"><SearchIcon size={32} className="me-2" /> Search Routes</h1>
          <p>Find buses and trains between districts across the network</p>
        </div>
      </div>

      <div className="container pb-5">
        {/* Search Form */}
        <div className="search-bar-card mb-4">
          <div className="section-title d-flex align-items-center"><LocationIcon size={20} className="me-2" /> Search Filters</div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Origin District</label>
                <input
                  name="origin" type="text"
                  className="form-control"
                  placeholder="e.g. Salem"
                  value={filters.origin}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Destination District</label>
                <input
                  name="destination" type="text"
                  className="form-control"
                  placeholder="e.g. Chennai"
                  value={filters.destination}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Bus / Train Number</label>
                <input
                  name="busNo" type="text"
                  className="form-control"
                  placeholder="e.g. 12A"
                  value={filters.busNo}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Transport Type</label>
                <select name="type" className="form-select" value={filters.type} onChange={handleChange}>
                  <option value="">All Types</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
              </div>
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Departure Time (HH:MM)</label>
                <input
                  name="departureTime" type="time"
                  className="form-control"
                  value={filters.departureTime}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 col-sm-12 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-primary fw-semibold px-4 flex-fill d-flex align-items-center justify-content-center" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Searching…
                    </>
                  ) : (
                    <><SearchIcon size={18} className="me-2" /> Search</>
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary px-3" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="spinner-large" />
            <p>Searching for routes…</p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            <div className="section-row">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                Search Results
              </h2>
              <span className="result-count">
                {results.length === 0
                  ? 'No results found'
                  : `${pagination?.total ?? results.length} transport(s) found`}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ color: '#ef4444' }}><AlertIcon size={48} /></div>
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>No transports found</h3>
                <p style={{ color: '#64748b', fontSize: '.9rem', maxWidth: 360, margin: '0 auto' }}>
                  Try adjusting your search filters — different origin/destination or transport type.
                </p>
              </div>
            ) : (
              <>
                {results.map(t => (
                  <TransportCard key={t._id} transport={t} />
                ))}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={page === 1}
                      onClick={() => doSearch(page - 1)}
                    >
                      <ArrowLeftIcon size={14} className="me-1"/> Prev
                    </button>
                    <span className="d-flex align-items-center px-3 text-muted" style={{ fontSize: '.88rem' }}>
                      Page {page} / {pagination.pages}
                    </span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={page >= pagination.pages}
                      onClick={() => doSearch(page + 1)}
                    >
                      Next <ArrowRightIcon size={14} className="ms-1"/>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Idle state */}
        {!loading && !searched && (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ color: '#3b82f6' }}><LocationIcon size={48} /></div>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Ready to search</h3>
            <p style={{ color: '#64748b', fontSize: '.9rem', maxWidth: 400, margin: '0 auto' }}>
              Enter your origin and destination above, or search by transport number to find available routes.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchRoutes;
