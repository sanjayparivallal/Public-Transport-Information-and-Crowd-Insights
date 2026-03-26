import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCrowd } from '../../api/crowdApi';
import { removeFavourite } from '../../api/userApi';
import { BusIcon, TrainIcon, StarIcon, SearchIcon, MapPinIcon, ActivityIcon, ArrowRightIcon, HeartIcon, TrashIcon } from '../../components/icons';
import CrowdBadge from '../../components/CrowdBadge';

const DashboardFavouriteTransports = ({ favTransports = [], favLoading = false, onRemove }) => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [crowdMap, setCrowdMap] = useState({});
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    const fetchCrowd = async () => {
      const map = {};
      await Promise.all(
        favTransports.map(async (r) => {
          try {
            const res = await getCrowd(r._id);
            map[r._id] = res.data?.data?.crowdLevel || res.data?.crowdLevel || null;
          } catch { /* silent */ }
        })
      );
      setCrowdMap(map);
    };
    if (favTransports.length > 0) fetchCrowd();
  }, [favTransports]);

  const handleRemove = async (e, routeId) => {
    e.stopPropagation();
    setRemoving(prev => ({ ...prev, [routeId]: true }));
    try {
      await removeFavourite(routeId);
      onRemove?.();
    } catch {
      /* silent — could add toast */
    } finally {
      setRemoving(prev => ({ ...prev, [routeId]: false }));
    }
  };

  const favRoutes = user?.role === 'commuter'
    ? favTransports
    : favTransports.filter(r => r.transportId || r._id);

  // Accent palette rotating through cards
  const accents = [
    { from: '#3b82f6', to: '#6366f1', light: 'rgba(59,130,246,0.08)', icon: 'text-blue-600', border: 'rgba(99,102,241,0.18)' },
    { from: '#8b5cf6', to: '#6d28d9', light: 'rgba(139,92,246,0.08)', icon: 'text-violet-600', border: 'rgba(139,92,246,0.18)' },
    { from: '#14b8a6', to: '#0891b2', light: 'rgba(20,184,166,0.08)', icon: 'text-teal-600', border: 'rgba(20,184,166,0.18)' },
    { from: '#ec4899', to: '#8b5cf6', light: 'rgba(236,72,153,0.08)', icon: 'text-pink-600', border: 'rgba(236,72,153,0.18)' },
    { from: '#10b981', to: '#059669', light: 'rgba(16,185,129,0.08)', icon: 'text-emerald-600', border: 'rgba(16,185,129,0.18)' },
  ];

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 shrink-0">
            <StarIcon size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">Favourite Routes</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {favRoutes.length} saved transit{favRoutes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link to="/search" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600">
          <SearchIcon size={16} /> Add Route
        </Link>
      </div>

      {favLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 h-56 rounded-3xl" />)}
        </div>
      ) : favRoutes.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-16 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-amber-50 border border-amber-100">
            <StarIcon size={32} className="text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No saved routes yet</h3>
          <p className="text-sm font-bold text-slate-500 max-w-sm mx-auto mb-8">Star any transit route while browsing to pin it here for instant crowd & schedule updates.</p>
          <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600">
            <SearchIcon size={16} /> Browse Routes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favRoutes.map((r, idx) => {
            const t = r.transportId || r;
            const acc = accents[idx % accents.length];
            const isBus = t.type === 'bus';

            return (
              <div
                key={r._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col group cursor-pointer"
                onClick={() => t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && t._id && navigate(`/transport/${t._id}?routeId=${r._id}`)}
              >
                {/* Top color accent line */}
                <div className="absolute left-0 right-0 top-0 h-1.5 rounded-t-3xl" style={{ backgroundColor: acc.from }} />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5 mt-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: acc.light, border: `1px solid ${acc.border}` }}>
                      {isBus
                        ? <BusIcon size={24} className={acc.icon} />
                        : <TrainIcon size={24} className={acc.icon} />}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-1" style={{
                        background: acc.light,
                        color: acc.from,
                        border: `1px solid ${acc.border}`,
                      }}>
                        {t.transportNumber || (isBus ? 'Bus' : 'Train')}
                      </span>
                      <p className="text-sm text-slate-900 font-black truncate">
                        {t.name || 'Unknown Transit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    {/* Remove favourite button */}
                    <button
                      onClick={(e) => handleRemove(e, r._id)}
                      disabled={removing[r._id]}
                      title="Remove from favourites"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 transition-all active:scale-90 disabled:opacity-50"
                    >
                      {removing[r._id]
                        ? <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                        : <TrashIcon size={13} />}
                    </button>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 border border-slate-100 group-hover:border-blue-200 transition-colors">
                      <ArrowRightIcon size={14} />
                    </div>
                  </div>
                </div>

                {/* Route Flow */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <MapPinIcon size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Origin</p>
                      <p className="text-sm font-black text-slate-900 truncate">{r.origin}</p>
                    </div>
                  </div>
                  
                  <div className="flex mt-2 mb-2 ml-2 h-4 border-l-2 border-dashed border-slate-300"></div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-white shadow-sm shrink-0" style={{ backgroundColor: acc.from }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Destination</p>
                      <p className="text-sm font-black text-slate-900 truncate">{r.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Extra Data row */}
                <div className="flex justify-between items-center mb-5 px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                        <span className="text-xs font-black text-slate-700 capitalize">{t.type || 'Regular'} Service</span>
                    </div>
                    {t.capacity && (
                        <div className="flex flex-col text-right">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity</span>
                           <span className="text-xs font-black text-slate-700">{t.capacity} Seats</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <CrowdBadge level={crowdMap[r._id] || null} />
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"
                    style={{ color: acc.from }}>
                    <ActivityIcon size={14} /> Live
                  </div>
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
