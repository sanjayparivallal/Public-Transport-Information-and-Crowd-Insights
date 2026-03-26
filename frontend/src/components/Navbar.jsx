import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/authApi';
import { BusIcon, HomeIcon, SearchIcon, UserIcon, WrenchIcon, LogOutIcon } from './icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const isAuthority = user?.role === 'authority';
  const dashboardPath = isAuthority ? '/dashboard/authority' : '/dashboard/commuter';

  const navItems = [
    { to: dashboardPath,      label: 'Dashboard',       icon: HomeIcon   },
    { to: '/search',          label: 'Search Routes',    icon: SearchIcon },
    ...(isAuthority ? [{ to: '/authority/manage', label: 'Fleet', icon: WrenchIcon }] : []),
    { to: isAuthority ? '/profile/authority' : '/profile', label: 'Profile', icon: UserIcon },
  ];

  const roleColors = {
    authority: { pill: 'bg-amber-100 text-amber-700 border-amber-200', ring: 'ring-amber-400' },
    driver:    { pill: 'bg-blue-100 text-blue-700 border-blue-200',     ring: 'ring-blue-400'  },
    conductor: { pill: 'bg-violet-100 text-violet-700 border-violet-200', ring: 'ring-violet-400' },
    commuter:  { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', ring: 'ring-emerald-400' },
  };
  const roleTheme = roleColors[user?.role] || roleColors.commuter;

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'text-blue-600 bg-blue-50 shadow-sm border border-blue-100'
        : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-transparent'
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-200/40'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link
            to={user ? dashboardPath : '/login'}
            className="flex items-center gap-2.5 no-underline shrink-0 group"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
              <BusIcon size={20} className="text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              Transit<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-black">Info</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1 mx-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navLinkCls}>
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <>
                {/* User chip */}
                <div className={`hidden md:flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white border border-slate-200/80 rounded-full shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-default ring-2 ring-offset-1 ${roleTheme.ring}/20`}>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black ring-2 ring-white shadow-sm`}>
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-[13px] leading-tight max-w-[110px] truncate">
                      {user.name || user.email}
                    </span>
                    <span className={`px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-black uppercase tracking-widest border w-fit leading-none ${roleTheme.pill}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
                  title="Sign Out"
                >
                  <LogOutIcon size={19} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Hamburger */}
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="md:hidden p-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all"
                  aria-label="Toggle menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {menuOpen
                      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                    }
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup/commuter"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 absolute w-full shadow-2xl shadow-slate-300/30 animate-scale-in">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{user.name || user.email}</p>
              <span className={`inline-flex px-2 py-0.5 mt-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${roleTheme.pill}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkCls} onClick={() => setMenuOpen(false)}>
                <Icon size={18} className="mr-1" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100">
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
            >
              <LogOutIcon size={17} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
