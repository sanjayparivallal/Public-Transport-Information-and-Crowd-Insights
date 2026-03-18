import {
  BrowserRouter, Routes, Route, Navigate, useLocation, Outlet,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login            from './pages/auth/Login';
import SignupCommuter   from './pages/auth/SignupCommuter';
import SignupAuthority  from './pages/auth/SignupAuthority';
import CommuterDashboard  from './pages/dashboard/CommuterDashboard';
import AuthorityDashboard from './pages/dashboard/AuthorityDashboard';
import SearchRoutes     from './pages/search/SearchRoutes';
import TransportDetail  from './pages/transport/TransportDetail';
import Profile          from './pages/profile/Profile';
import UserProfile      from './pages/profile/UserProfile';
import AuthorityProfile from './pages/profile/AuthorityProfile';
import ManageTransport  from './pages/authority/ManageTransport';

/* ── Auth pages (no Navbar) ─────────────────────────────── */
const AUTH_ROUTES = ['/login', '/signup/commuter', '/signup/authority'];

/* ── Protected Route wrapper ────────────────────────────── */
const PrivateRoute = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    // Redirect to /login, remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

/* ── Authority-only Route wrapper ───────────────────────── */
const AuthorityRoute = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== 'authority') {
    return <Navigate to="/dashboard/commuter" replace />;
  }
  return <Outlet />;
};

/* ── Root Redirect ──────────────────────────────────────── */
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'authority') return <Navigate to="/dashboard/authority" replace />;
  return <Navigate to="/dashboard/commuter" replace />;
};

/* ── Main App ───────────────────────────────────────────── */
const App = () => {
  const { pathname } = useLocation();
  const showNavbar = !AUTH_ROUTES.includes(pathname);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop theme="light" />
      {showNavbar && <Navbar />}
      <Routes>
        {/* ── Public routes (no auth needed) ── */}
        <Route path="/login"            element={<Login />} />
        <Route path="/signup/commuter"  element={<SignupCommuter />} />
        <Route path="/signup/authority" element={<SignupAuthority />} />

        {/* ── Protected routes ── */}
        <Route element={<PrivateRoute />}>
          {/* Dashboards */}
          <Route path="/dashboard"           element={<CommuterDashboard />} />
          <Route path="/dashboard/commuter"  element={<CommuterDashboard />} />
          <Route path="/dashboard/authority" element={<AuthorityDashboard />} />

          {/* Search & Transport */}
          <Route path="/search"         element={<SearchRoutes />} />
          <Route path="/transport/:id"  element={<TransportDetail />} />

          {/* Profile pages */}
          <Route path="/profile"          element={<Profile />} />
          <Route path="/profile/user"     element={<UserProfile />} />
        </Route>

        {/* ── Authority-only routes ── */}
        <Route element={<AuthorityRoute />}>
          <Route path="/profile/authority" element={<AuthorityProfile />} />
          <Route path="/authority/manage"  element={<ManageTransport />} />
        </Route>

        {/* ── Default redirects ── */}
        <Route path="/"  element={<RootRedirect />} />
        <Route path="*"  element={<RootRedirect />} />
      </Routes>
    </>
  );
};

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
