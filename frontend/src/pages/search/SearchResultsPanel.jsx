import TransportCard from '../../components/TransportCard';
import Pagination from '../../components/Pagination';
import Skeleton from '../../components/Skeleton';
import { AlertIcon, LocationIcon } from '../../components/icons';

/* ── Sub-components ─────────────────────────────────────────── */

const ResultsHeader = ({ results, pagination }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b-2 border-slate-100 pb-7 mb-8">
    <div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Search Results</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
        Live from global transport index
      </p>
    </div>
    <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-inner whitespace-nowrap">
      {results.length === 0 ? 'No matches' : `${pagination?.total ?? results.length} transport(s)`}
    </div>
  </div>
);

const NoResults = ({ onClear }) => (
  <div className="py-20 text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <AlertIcon size={32} />
    </div>
    <h3 className="text-2xl font-black text-slate-800 mb-3">No Results Found</h3>
    <p className="text-slate-500 font-medium max-w-md mx-auto mb-6 text-sm leading-relaxed">
      We couldn&apos;t find any routes matching your criteria. Try adjusting your filters.
    </p>
    <button className="btn-ghost" onClick={onClear}>Reset Filters</button>
  </div>
);

const PreSearchEmpty = () => (
  <div className="py-20 text-center relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
      />
    </div>
    <div className="relative">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform">
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
);

/* ── Main export ─────────────────────────────────────────────── */

/**
 * @param {{ results, loading, searched, pagination, page, onPageChange, onClear }} props
 */
const SearchResultsPanel = ({ results, loading, searched, pagination, page, onPageChange, onClear }) => (
  <div className="bg-white border-2 border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">

    {searched && <ResultsHeader results={results} pagination={pagination} />}

    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} variant="transport-card" />)}
      </div>
    ) : searched ? (
      results.length === 0 ? (
        <NoResults onClear={onClear} />
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
            onPageChange={onPageChange}
            loading={loading}
          />
        </div>
      )
    ) : (
      <PreSearchEmpty />
    )}

  </div>
);

export default SearchResultsPanel;
