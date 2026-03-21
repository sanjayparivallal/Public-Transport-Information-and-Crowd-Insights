import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/authApi';
import { BusIcon, HomeIcon, SearchIcon, UserIcon, WrenchIcon, LogOutIcon } from './icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const isAuthority = user?.role === 'authority';
  const dashboardPath = isAuthority ? '/dashboard/authority' : '/dashboard/commuter';

  /* ── Active link class ── */
  const navCls = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all
     ${isActive
       ? 'text-blue-600 bg-blue-50/80 shadow-sm border border-blue-100/50'
       : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-transparent'
     }`;

  /* ── Nav items ── */
  const navItems = [
    { to: dashboardPath,      label: 'Dashboard',    icon: HomeIcon   },
    { to: '/search',          label: 'Search Routes', icon: SearchIcon },
    ...(isAuthority ? [{ to: '/authority/manage', label: 'Fleet Management', icon: WrenchIcon }] : []),
    { to: isAuthority ? '/profile/authority' : '/profile', label: 'Profile Settings', icon: UserIcon },
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'authority': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'driver':    return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'conductor': return 'bg-purple-100 text-purple-700 border-purple-200';
      default:          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to={user ? dashboardPath : '/login'}
            className="flex items-center gap-2.5 text-slate-900 no-underline shrink-0 group">
            <div className="p-2 bg-blue-600 rounded-xl shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <BusIcon size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Transport<span className="text-blue-600 font-black">Info</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 mx-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navCls}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-3 justify-end shrink-0">
            {user ? (
              <>
                {/* User chip — desktop */}
                <div className="hidden md:flex items-center gap-3 pl-1 pr-3 py-1 bg-slate-50
                                border border-slate-200/80 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200/50">
                    <UserIcon size={14} className="text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-[13px] leading-tight max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                    <span className={`px-2 py-0.5 mt-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 leading-none w-fit ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout — desktop */}
                <button onClick={handleLogout}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
                  title="Logout">
                  <LogOutIcon size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Hamburger — mobile */}
                <button onClick={() => setMenuOpen(v => !v)}
                  className="md:hidden p-2.5 rounded-xl border border-slate-200 text-slate-600 bg-slate-50 hover:bg-white hover:shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
                  aria-label="Toggle menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {menuOpen
                      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                    }
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
                <Link to="/signup/commuter" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">Start Riding</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 absolute w-full shadow-xl shadow-slate-200/50 animate-in slide-in-from-top-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 text-sm text-slate-600 border-b border-slate-100/80 mb-3 pb-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200/50 shrink-0">
               <UserIcon size={18} className="text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate font-bold text-slate-800 text-base">{user.name || user.email}</span>
              <span className={`mt-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200 leading-none w-fit ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navCls} onClick={() => setMenuOpen(false)}>
                <Icon size={18} className="mr-1" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100/80">
            <button onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50/50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors">
              <LogOutIcon size={18} />
              Sign Out Securely
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
