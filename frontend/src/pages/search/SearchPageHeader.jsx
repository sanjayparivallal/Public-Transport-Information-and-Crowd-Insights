import { SearchIcon } from '../../components/icons';

const SearchPageHeader = () => (
  <div
    className="relative overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #7c3aed 100%)' }}
  >
    {/* Decorations */}
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'rgba(139,92,246,0.3)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-2xl"
        style={{ background: 'rgba(6,182,212,0.15)' }}
      />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start gap-5">
        <div
          className="p-3 rounded-2xl shrink-0"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <SearchIcon size={28} className="text-white" />
        </div>
        <div>
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Transit Finder
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Search Routes
          </h1>
          <p className="mt-1.5 text-blue-100/80 font-medium text-sm max-w-lg">
            Find routes by name, number, origin, destination, or type.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SearchPageHeader;
