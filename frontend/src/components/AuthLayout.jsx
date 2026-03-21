import { Link } from 'react-router-dom';
import { BusIcon } from './icons';

/**
 * Shared auth page wrapper — split panel layout
 *
 * Props:
 *  title       : Main heading
 *  subtitle    : Sub text
 *  badge       : Role pill label  (e.g. "Normal Commuter")
 *  badgeClass  : Tailwind classes (default blue)
 *  maxWidth    : card width class  (default "max-w-md")
 *  children    : Form + footer
 */
const AuthLayout = ({
  title,
  subtitle,
  badge,
  badgeClass = 'badge-blue',
  maxWidth   = 'max-w-md',
  children,
}) => {
  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic-shadow">

      {/* ── Left: Brand Panel ───────────────────────────── */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between
                        bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700
                        p-12 relative overflow-hidden">
        {/* Subtle animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 -left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Brand */}
        <Link to="/" className="relative flex items-center gap-3 no-underline group transition-transform hover:scale-105 duration-300">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 group-hover:bg-white/30 transition-colors">
            <BusIcon size={28} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">
            Public<span className="text-blue-200">Transit</span>
          </span>
        </Link>

        {/* Centre copy */}
        <div className="relative space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full
                          border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-xl">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            Live Transport Intelligence
          </div>

          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Navigate Your <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-100 to-blue-300">City Smarter</span>
          </h2>

          <p className="text-blue-100/90 text-lg leading-relaxed max-w-md font-medium">
            Real-time crowd insights, incident reporting, and seamless route planning in the palm of your hand.
          </p>

          {/* Mini stats cards */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Live Routes', value: '250+' },
              { label: 'Cities',      value: '22'   },
              { label: 'Updates/hr',  value: '4k+' },
            ].map((s, idx) => (
              <div key={idx} 
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 
                           hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1">
                <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform origin-left">{s.value}</p>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <p className="text-blue-200/40 text-[10px] font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} PublicTransit AI
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-4 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      </aside>

      {/* ── Right: Form Panel ───────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center items-center bg-slate-50
                       px-6 py-6 lg:px-12 overflow-y-auto">
        <div className={`w-full ${maxWidth} transition-all duration-500 animate-in fade-in zoom-in-95`}>

          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-6 no-underline group">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <BusIcon size={24} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Public<span className="text-blue-600">Transit</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            {badge && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${badgeClass}`}>
                {badge}
              </span>
            )}
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-2 text-lg font-medium">{subtitle}</p>}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl shadow-slate-200/50">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
