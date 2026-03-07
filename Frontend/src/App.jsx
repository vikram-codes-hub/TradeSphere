import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

import Navbar          from './Components/Utils/Navbar';
import Footer          from './Components/Utils/Footer';

import Home            from './Pages/Home';
import Authpage        from './Pages/Authpage';
import HowItWorks      from './Pages/Howitworks';
import AboutUs         from './Pages/Aboutus';
import ContactUs       from './Pages/Contactus';
import NotFoundPage    from './Pages/NotFoundPage';

import UpgradePage     from './Pages/Upgrade';
import ProfilePage     from './Pages/Profile';
import Dashboard       from './Pages/DashboardPage';
import MarketsPage     from './Pages/MarketPage';
import LeaderboardPage from './Pages/LeaderboardPage';
import WatchlistPage   from './Pages/Watchlist';
import PortfolioPage   from './Pages/PortfolioPage';
import TradePage       from './Pages/TradePage';
import PredictionsPage from './Pages/PredictionPage';
import AdminPage       from './Pages/AdminPage';

/* ============================================================
   GUARDS
   ============================================================ */

// Must be logged in
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/auth/login" replace />;
};

// Must be premium or admin
const PremiumRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== "premium" && user.role !== "admin")
    return <Navigate to="/upgrade" replace />;
  return children;
};

// Must be admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

// Already logged in → redirect away from /auth/*
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

/* ── Tiny full-page loader ───────────────────────────────── */
const PageLoader = () => (
  <div style={{
    minHeight: "100vh", background: "#090e1a",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      width: "36px", height: "36px",
      border: "3px solid rgba(45,126,247,0.2)",
      borderTop: "3px solid #2d7ef7",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ============================================================
   APP
   ============================================================ */
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ── Public ──────────────────────────────────────── */}
        <Route path="/"             element={<Home />}         />
        <Route path="/how-it-works" element={<HowItWorks />}   />
        <Route path="/about"        element={<AboutUs />}      />
        <Route path="/contact"      element={<ContactUs />}    />
        <Route path="/leaderboard"  element={<LeaderboardPage />} />

        {/* ── Guest only (redirect to dashboard if logged in) */}
        <Route path="/auth/:type" element={
          <GuestRoute><Authpage /></GuestRoute>
        } />

        {/* ── Logged in ───────────────────────────────────── */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/market" element={
          <PrivateRoute><MarketsPage /></PrivateRoute>
        } />
        <Route path="/portfolio" element={
          <PrivateRoute><PortfolioPage /></PrivateRoute>
        } />
        <Route path="/my-profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="/upgrade" element={
          <PrivateRoute><UpgradePage /></PrivateRoute>
        } />
        <Route path="/trade/:symbol" element={
          <PrivateRoute><TradePage /></PrivateRoute>
        } />

        {/* ── Premium + Admin only ────────────────────────── */}
        <Route path="/watchlist" element={
          <PremiumRoute><WatchlistPage /></PremiumRoute>
        } />
        <Route path="/predictions" element={
          <PremiumRoute><PredictionsPage /></PremiumRoute>
        } />

        {/* ── Admin only ──────────────────────────────────── */}
        <Route path="/admin" element={
          <AdminRoute><AdminPage /></AdminRoute>
        } />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;