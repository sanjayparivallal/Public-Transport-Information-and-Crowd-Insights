import { Link } from 'react-router-dom';
import { BusIcon } from './icons';

/**
 * AuthLayout — vibrant split-panel auth wrapper
 *
 * Props:
 *   title       Main heading
 *   subtitle    Sub text
 *   badge       Role pill label  (e.g. "Normal Commuter")
 *   badgeClass  Tailwind classes (default badge-blue)
 *   maxWidth    card width class (default "max-w-md")
 *   children    Form + footer
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

      {/* ── Left: Vibrant Brand Panel ─────────────────────── */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1e40af 0%, #3b82f6 35%, #6366f1 65%, #8b5cf6 100%)' }}
      >
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: 'rgba(139,92,246,0.25)' }} />
          <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ background: 'rgba(6,182,212,0.20)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full blur-2xl"
            style={{ background: 'rgba(244,63,94,0.10)', animationDelay: '.5s' }} />
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* Brand link */}
        <Link to="/" className="relative flex items-center gap-3 no-underline group p-10 pb-0">
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/25 group-hover:bg-white/30 transition-colors">
            <BusIcon size={28} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            Transit<span style={{ color: '#bfdbfe' }}>Info</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative px-10 space-y-8">
          {/* Live pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Transport Intelligence
          </div>

          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Navigate Your<br />
            <span style={{ background: 'linear-gradient(90deg, #bfdbfe, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              City Smarter
            </span>
          </h2>

          <p className="text-blue-100/90 text-lg leading-relaxed max-w-sm font-medium">
            Real-time crowd insights, incident reporting, and seamless route planning at your fingertips.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: 'Live Routes', value: '250+', color: '#60a5fa' },
              { label: 'Cities',      value: '22',    color: '#a78bfa' },
              { label: 'Updates/hr',  value: '4k+',   color: '#34d399' },
            ].map((s) => (
              <div key={s.label}
                className="border border-white/15 rounded-2xl p-4 hover:-translate-y-1 transition-transform duration-300 group"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform origin-left" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-blue-200/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-10 pb-8 flex items-center justify-between">
          <p className="text-blue-200/30 text-[10px] font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} TransitInfo AI
          </p>
          <div className="flex gap-3">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-4 h-1 bg-white/10 rounded-full" />
            <div className="w-2 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      </aside>

      {/* ── Right: Form Panel ─────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center items-center bg-slate-50 px-6 py-8 lg:px-12 overflow-y-auto">
        <div className={`w-full ${maxWidth} animate-scale-in`}>

          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2.5 mb-7 no-underline">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/30">
              <BusIcon size={22} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Transit<span className="text-blue-600">Info</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            {badge && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border ${badgeClass}`}>
                {badge}
              </span>
            )}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-1.5 text-base font-medium">{subtitle}</p>}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl shadow-slate-200/50">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
