import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, SearchIcon, BusIcon, TrainIcon } from '../../components/icons';
import CrowdBadge from '../../components/CrowdBadge';

const DashboardFavouriteTransports = ({ favLoading, favRoutes, crowdMap }) => {
  const navigate = useNavigate();

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
          <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
            <StarIcon size={18} filled />
          </span>
          Favourite Routes
        </h2>
        <Link to="/search" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold transition-colors shadow-sm">
          <SearchIcon size={16} />
          Add Favourite
        </Link>
      </div>

      {favLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : favRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <StarIcon size={32} className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-700">No route favourites yet</p>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm">Search for transits and star the ones you use regularly for quick access to live status.</p>
          <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <SearchIcon size={16} /> Search Routes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {favRoutes.map(r => {
            const t = r.transportId || r;
            return (
            <div
              key={r._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group flex flex-col"
              onClick={() => t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 mb-2">
                    {t.transportNumber || '—'}
                  </span>
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors title-font">
                    {r.origin} <span className="text-slate-400 mx-1">→</span> {r.destination}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1 truncate">{t.name || '—'}</p>
                </div>
                <div className={`p-2.5 rounded-xl shrink-0 ${t.type === 'bus' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                  {t.type === 'bus' ? <BusIcon size={20} /> : <TrainIcon size={20} />}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <CrowdBadge level={crowdMap[r._id] || null} />
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:underline">View <span className="text-lg leading-none group-hover:translate-x-0.5 transition-transform">→</span></span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DashboardFavouriteTransports;

