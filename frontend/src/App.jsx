import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import SignupCommuter from './pages/auth/SignupCommuter';
import SignupAuthority from './pages/auth/SignupAuthority';
import CommuterDashboard from './pages/dashboard/CommuterDashboard';
import AuthorityDashboard from './pages/dashboard/AuthorityDashboard';
import SearchRoutes from './pages/search/SearchRoutes';
import TransportDetail from './pages/transport/TransportDetail';
import Profile from './pages/profile/Profile';
import ManageTransport from './pages/authority/ManageTransport';

// Auth pages don't show the Navbar
const AUTH_ROUTES = ['/login', '/signup/commuter', '/signup/authority'];

const App = () => {
  const { pathname } = useLocation();
  const showNavbar = !AUTH_ROUTES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? '' : ''}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login"             element={<Login />} />
          <Route path="/signup/commuter"   element={<SignupCommuter />} />
          <Route path="/signup/authority"  element={<SignupAuthority />} />

          {/* Dashboard routes */}
          <Route path="/dashboard"           element={<CommuterDashboard />} />
          <Route path="/dashboard/commuter"  element={<CommuterDashboard />} />
          <Route path="/dashboard/authority" element={<AuthorityDashboard />} />

          {/* Search & Transport */}
          <Route path="/search"          element={<SearchRoutes />} />
          <Route path="/transport/:id"   element={<TransportDetail />} />

          {/* Profile & Authority manage */}
          <Route path="/profile"          element={<Profile />} />
          <Route path="/authority/manage" element={<ManageTransport />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </div>
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
