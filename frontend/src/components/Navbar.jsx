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
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
     ${isActive
       ? 'text-blue-600 bg-blue-50'
       : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
     }`;

  /* ── Nav items ── */
  const navItems = [
    { to: dashboardPath,      label: 'Dashboard',    icon: HomeIcon   },
    { to: '/search',          label: 'Search Route', icon: SearchIcon },
    ...(isAuthority ? [{ to: '/authority/manage', label: 'Manage Transport', icon: WrenchIcon }] : []),
    { to: isAuthority ? '/profile/authority' : '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link to={user ? dashboardPath : '/login'}
            className="flex items-center gap-2 text-slate-900 no-underline shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <BusIcon size={18} className="text-white" />
            </div>
            <span className="font-bold text-base">
              Transport<span className="text-blue-600">Info</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1 mx-6 flex-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navCls}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User chip — desktop */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50
                                border border-slate-200 rounded-full text-sm">
                  <span className="font-medium text-slate-700 max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <span className={`badge text-[10px] font-bold uppercase ${
                    user.role === 'authority'  ? 'badge-amber'  :
                    user.role === 'driver'     ? 'badge-blue'   :
                    user.role === 'conductor'  ? 'badge-purple' :
                    'badge-green'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Logout — desktop */}
                <button onClick={handleLogout}
                  className="hidden md:flex btn-ghost items-center gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600">
                  <LogOutIcon size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>

                {/* Hamburger — mobile */}
                <button onClick={() => setMenuOpen(v => !v)}
                  className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
                  aria-label="Toggle menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {menuOpen
                      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                    }
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup/commuter" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border-b border-slate-100 mb-2 pb-3">
            <UserIcon size={16} className="text-slate-400" />
            <span className="truncate font-medium">{user.name || user.email}</span>
            <span className={`badge text-[10px] font-bold uppercase ml-auto ${
              user.role === 'authority' ? 'badge-amber' : 'badge-green'
            }`}>{user.role}</span>
          </div>

          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navCls} onClick={() => setMenuOpen(false)}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <button onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md">
            <LogOutIcon size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
