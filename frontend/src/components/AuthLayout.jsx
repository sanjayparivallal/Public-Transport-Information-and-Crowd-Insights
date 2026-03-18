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
    <div className="min-h-screen flex">

      {/* ── Left: Brand Panel ───────────────────────────── */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between
                        bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700
                        p-12 relative overflow-hidden">
        {/* Subtle blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
        </div>

        {/* Brand */}
        <Link to="/" className="relative flex items-center gap-3 no-underline">
          <div className="p-2 bg-white/20 rounded-xl">
            <BusIcon size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Public<span className="text-blue-200">Transit</span>
          </span>
        </Link>

        {/* Centre copy */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full
                          border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Transport Network
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight">
            Real-Time <br />
            <span className="text-blue-200">Public Transit</span><br />
            Intelligence
          </h2>

          <p className="text-blue-100/80 leading-relaxed max-w-sm">
            Track crowds, report incidents, and navigate the city smarter — all in one place.
          </p>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { label: 'Live Routes', value: '200+' },
              { label: 'Cities',      value: '15'   },
              { label: 'Reports/day', value: '1.2k' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-blue-200/50 text-xs">
          © {new Date().getFullYear()} PublicTransit · Empowering everyday commuters
        </p>
      </aside>

      {/* ── Right: Form Panel ───────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center items-center bg-slate-50
                       px-6 py-12 sm:px-10 overflow-y-auto">
        <div className={`w-full ${maxWidth}`}>

          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 no-underline">
            <BusIcon size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-slate-900">
              Public<span className="text-blue-600">Transit</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            {badge && <span className={`badge mb-3 ${badgeClass}`}>{badge}</span>}
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </div>

          {/* Card */}
          <div className="card card-body">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
