import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

const AUTH_ROUTES = ['/login', '/signup/commuter', '/signup/authority'];

const App = () => {
  const { pathname } = useLocation();
  const showNavbar = !AUTH_ROUTES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? 'container mt-4' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup/commuter" element={<SignupCommuter />} />
          <Route path="/signup/authority" element={<SignupAuthority />} />

          <Route path="/dashboard" element={<CommuterDashboard />} />
          <Route path="/dashboard/commuter" element={<CommuterDashboard />} />
          <Route path="/dashboard/authority" element={<AuthorityDashboard />} />

          <Route path="/search" element={<SearchRoutes />} />
          <Route path="/transport/:id" element={<TransportDetail />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/authority/manage" element={<ManageTransport />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
