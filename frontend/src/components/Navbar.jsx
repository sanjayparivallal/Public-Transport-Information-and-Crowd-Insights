import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/authApi';
import { BusIcon, HomeIcon, SearchIcon, UserIcon, WrenchIcon, LogOutIcon } from './icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) { /* ignore */ }
    logout();
    navigate('/login');
  };

  const isAuthority = user?.role === 'authority';
  const isCommuter  = user?.role === 'commuter';
  const isStaff     = user?.role === 'driver' || user?.role === 'conductor';

  const dashboardPath = isAuthority
    ? '/dashboard/authority'
    : '/dashboard/commuter';

  return (
    <nav className="navbar navbar-expand-lg transit-navbar">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to={user ? dashboardPath : '/login'}>
          <BusIcon size={24} className="me-2" style={{ color: '#93c5fd' }} /> <span><span style={{ color: '#93c5fd' }}>Public</span>Transit</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ color: 'white' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto gap-1">
            {user && (
              <li className="nav-item">
                <NavLink
                  to={dashboardPath}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center${isActive ? ' active' : ''}`
                  }
                >
                  <HomeIcon size={18} className="me-1"/> Dashboard
                </NavLink>
              </li>
            )}

            {user && (
              <li className="nav-item">
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center${isActive ? ' active' : ''}`
                  }
                >
                  <SearchIcon size={18} className="me-1"/> Search Routes
                </NavLink>
              </li>
            )}

            {user && (
              <li className="nav-item">
                <NavLink
                  to={isAuthority ? '/profile/authority' : '/profile'}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center${isActive ? ' active' : ''}`
                  }
                >
                  <UserIcon size={18} className="me-1"/> Profile
                </NavLink>
              </li>
            )}

            {isAuthority && (
              <li className="nav-item">
                <NavLink
                  to="/authority/manage"
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center${isActive ? ' active' : ''}`
                  }
                >
                  <WrenchIcon size={18} className="me-1"/> Manage
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right side */}
          <ul className="navbar-nav align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <div className="user-badge">
                    <UserIcon size={16} />
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name || user.email}
                    </span>
                    <span className={`role-pill ${user.role}`}>{user.role}</span>
                  </div>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm fw-semibold d-flex align-items-center"
                    style={{
                      background: 'rgba(239,68,68,.15)',
                      border: '1px solid rgba(239,68,68,.4)',
                      color: '#fca5a5',
                      borderRadius: 8,
                      padding: '.35rem .9rem',
                    }}
                  >
                    <LogOutIcon size={16} className="me-1"/> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/signup/commuter"
                    className="btn btn-sm fw-semibold ms-1"
                    style={{
                      background: 'rgba(255,255,255,.15)',
                      border: '1px solid rgba(255,255,255,.3)',
                      color: 'white',
                      borderRadius: 8,
                      padding: '.35rem .9rem',
                      textDecoration: 'none',
                    }}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
