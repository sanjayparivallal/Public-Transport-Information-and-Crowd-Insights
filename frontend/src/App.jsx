import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VantaBackground from './components/VantaBackground';
import Chatbot from './components/Chatbot';
import PageTransition from './components/PageTransition';

/* ── Auth pages (eager — small, always needed) ─────────── */
import Login           from './pages/auth/Login';
import SignupCommuter  from './pages/auth/SignupCommuter';
import SignupAuthority from './pages/auth/SignupAuthority';

/* ── Lazy pages — code-split for faster initial load ──── */
const CommuterDashboard  = lazy(() => import('./pages/dashboard/CommuterDashboard'));
const AuthorityDashboard = lazy(() => import('./pages/dashboard/AuthorityDashboard'));
const SearchRoutes       = lazy(() => import('./pages/search/SearchRoutes'));
const TransportDetail    = lazy(() => import('./pages/transport/TransportDetail'));
const Profile            = lazy(() => import('./pages/profile/Profile'));
const UserProfile        = lazy(() => import('./pages/profile/UserProfile'));
const AuthorityProfile   = lazy(() => import('./pages/profile/AuthorityProfile'));
const ManageTransport    = lazy(() => import('./pages/authority/ManageTransport'));

/* ── Minimal full-screen fallback for Suspense ───────── */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading…</p>
    </div>
  </div>
);

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
      {/* VANTA NET — global transport network animated background */}
      <VantaBackground />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop theme="light" />
      {showNavbar && <Navbar />}
      {/* Chatbot — visible on all authenticated routes */}
      {showNavbar && <Chatbot />}
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={useLocation()} key={useLocation().pathname}>
            {/* ── Public routes (no auth needed) ── */}
            <Route path="/login"            element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup/commuter"  element={<PageTransition><SignupCommuter /></PageTransition>} />
            <Route path="/signup/authority" element={<PageTransition><SignupAuthority /></PageTransition>} />

            {/* ── Protected routes ── */}
            <Route element={<PrivateRoute />}>
              {/* Dashboards */}
              <Route path="/dashboard"           element={<PageTransition><CommuterDashboard /></PageTransition>} />
              <Route path="/dashboard/commuter"  element={<PageTransition><CommuterDashboard /></PageTransition>} />

              {/* Search & Transport */}
              <Route path="/search"         element={<PageTransition><SearchRoutes /></PageTransition>} />
              <Route path="/transport/:id"  element={<PageTransition><TransportDetail /></PageTransition>} />

              {/* Profile pages */}
              <Route path="/profile"          element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/profile/user"     element={<PageTransition><UserProfile /></PageTransition>} />
            </Route>

            {/* ── Authority-only routes ── */}
            <Route element={<AuthorityRoute />}>
              <Route path="/dashboard/authority" element={<PageTransition><AuthorityDashboard /></PageTransition>} />
              <Route path="/profile/authority" element={<PageTransition><AuthorityProfile /></PageTransition>} />
              <Route path="/authority/manage"  element={<PageTransition><ManageTransport /></PageTransition>} />
            </Route>

            {/* ── Default redirects ── */}
            <Route path="/"  element={<RootRedirect />} />
            <Route path="*"  element={<RootRedirect />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
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
