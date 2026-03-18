import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, SearchIcon, BusIcon, TrainIcon } from '../../components/icons';
import CrowdBadge from '../../components/CrowdBadge';

const DashboardFavouriteTransports = ({ favLoading, favRoutes, crowdMap }) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2">
          <StarIcon size={18} className="text-amber-500" filled />
          Favourite Transports
        </h2>
        <Link to="/search" className="btn-secondary text-sm">
          <SearchIcon size={15} />
          Add Favourite
        </Link>
      </div>

      {favLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card card-body h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : favRoutes.length === 0 ? (
        <div className="empty-state card card-body">
          <StarIcon size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No route favourites yet</p>
          <p className="text-sm mt-1">Search routes and star the ones you use regularly.</p>
          <button onClick={() => navigate('/search')} className="btn-secondary mt-4 text-sm">
            <SearchIcon size={15} /> Search Routes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favRoutes.map(r => {
            const t = r.transportId || r;
            return (
            <div
              key={r._id}
              className="card card-body cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
              onClick={() => t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <span className="badge badge-blue mb-1.5 text-xs">{t.transportNumber || '—'}</span>
                  <h4 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {r.origin} → {r.destination}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.name || '—'}</p>
                </div>
                <div className={`p-2 rounded-lg shrink-0 ${t.type === 'bus' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {t.type === 'bus' ? <BusIcon size={18} /> : <TrainIcon size={18} />}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <CrowdBadge level={crowdMap[r._id] || null} />
                <span className="text-xs text-blue-600 font-semibold group-hover:underline">View →</span>
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
