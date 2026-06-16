import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PortalProvider, usePortal } from './contexts/PortalContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CybersecurityPage from './pages/CybersecurityPage';
import VaptPage from './pages/VaptPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

import PortalLogin from './pages/portal/PortalLogin';
import ClientDashboard from './pages/portal/ClientDashboard';
import AdminDashboard from './pages/portal/AdminDashboard';
import NewAssessment from './pages/portal/NewAssessment';
import AssessmentDetail from './pages/portal/AssessmentDetail';

function ProtectedPortalRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = usePortal();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/portal/dashboard" replace />;
  }
  
  return children;
}

function PortalRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PortalLogin />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedPortalRoute>
            <ClientDashboard />
          </ProtectedPortalRoute>
        } 
      />
      <Route 
        path="admin" 
        element={
          <ProtectedPortalRoute requireAdmin>
            <AdminDashboard />
          </ProtectedPortalRoute>
        } 
      />
      <Route 
        path="assessment/new" 
        element={
          <ProtectedPortalRoute>
            <NewAssessment />
          </ProtectedPortalRoute>
        } 
      />
      <Route 
        path="assessment/:id" 
        element={
          <ProtectedPortalRoute>
            <AssessmentDetail />
          </ProtectedPortalRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/portal/login" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPortal = location.pathname.startsWith('/portal');

  return (
    <>
      {!isAdmin && !isPortal && <Navbar />}
      <Routes>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/services/cybersecurity" element={<CybersecurityPage />} />
        <Route path="/portal/vapt-request"   element={<VaptPage />} />
        <Route path="/portfolio"             element={<PortfolioPage />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/contact"               element={<ContactPage />} />
        <Route path="/admin"                 element={<AdminPage />} />
        <Route path="/cybersecurity"         element={<CybersecurityPage />} />
        <Route path="/vapt"                  element={<VaptPage />} />
        <Route path="/portal/*"              element={<PortalRoutes />} />
        <Route path="*"                      element={<NotFoundPage />} />
      </Routes>
      {!isAdmin && !isPortal && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PortalProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PortalProvider>
    </AppProvider>
  );
}