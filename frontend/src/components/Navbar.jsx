import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {  logoutUser  } from '../api';
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
    { to: dashboardPath,      label: 'Dashboard',      icon: HomeIcon   },
    { to: '/search',          label: 'Search Routes',   icon: SearchIcon },
    ...(isAuthority ? [{ to: '/authority/manage', label: 'Fleet', icon: WrenchIcon }] : []),
    { to: isAuthority ? '/profile/authority' : '/profile', label: 'Profile', icon: UserIcon },
  ];

  // ENHANCED: design system role color map
  const roleColors = {
    authority: { pill: 'badge badge-cyan',    ring: 'ring-cyan-300' },
    driver:    { pill: 'badge badge-blue',    ring: 'ring-blue-300' },
    conductor: { pill: 'badge badge-purple',  ring: 'ring-purple-300' },
    commuter:  { pill: 'badge badge-indigo',  ring: 'ring-indigo-300' },
  };
  const roleTheme = roleColors[user?.role] || roleColors.commuter;

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ENHANCED: indigo active state matching .btn-ghost style
  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'text-indigo-700 bg-indigo-50 shadow-sm border border-indigo-200'
        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 border border-transparent'
    }`;

  return (
    // ENHANCED: glass-strong on scroll, clean white at top
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong border-b border-white/60 shadow-lg shadow-slate-200/40' : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ENHANCED: brand with gradient bg-gradient-blue icon box */}
          <Link
            to={user ? dashboardPath : '/login'}
            className="flex items-center gap-2.5 no-underline shrink-0 group"
          >
            <div className="relative p-2 rounded-xl bg-gradient-blue shadow-md group-hover:scale-105 transition-all duration-300">
              <BusIcon size={20} className="text-white relative z-10" />
              {/* ENHANCED: pulsing live dot correctly positioned outside the normal document flow inside the relative container */}
              <div className="absolute -top-1 -right-1 flex w-3 h-3 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
              </div>
            </div>
            {/* ENHANCED: gradient-text brand name */}
            <span className="font-black text-xl tracking-tight text-slate-900">
              Transit<span className="gradient-text-cool font-black">Info</span>
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
                {/* ENHANCED: glass user chip with badge-* role pill */}
                <div className={`hidden md:flex items-center gap-2.5 pl-1.5 pr-3 py-1 glass border border-white/60 rounded-full shadow-sm hover:shadow-md transition-all cursor-default ring-2 ring-offset-1 ${roleTheme.ring}/20`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black ring-2 ring-white shadow-sm">
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-[13px] leading-tight max-w-[110px] truncate">
                      {user.name || user.email}
                    </span>
                    {/* ENHANCED: .badge-* per role */}
                    <span className={roleTheme.pill}>
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
                {/* ENHANCED: .btn-primary for CTA */}
                <Link to="/signup/commuter" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        // ENHANCED: glass-strong mobile drawer with animate-scale-in
        <div className="md:hidden border-t border-slate-100 glass-strong px-4 py-4 space-y-2 absolute w-full shadow-2xl animate-scale-in">
          {/* ENHANCED: glass-card mobile user info */}
          <div className="flex items-center gap-3 p-3 glass-card border border-indigo-100 rounded-2xl mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{user.name || user.email}</p>
              <span className={roleTheme.pill}>{user.role}</span>
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
            {/* ENHANCED: .btn-danger for sign out */}
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="btn-danger w-full"
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
