import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/services/cybersecurity" element={<CybersecurityPage />} />
        <Route path="/portal/vapt-request"   element={<VaptPage />} />
        <Route path="/portfolio"             element={<PortfolioPage />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/contact"               element={<ContactPage />} />
        <Route path="/admin"                 element={<AdminPage />} />
        {/* Legacy redirects */}
        <Route path="/cybersecurity"         element={<CybersecurityPage />} />
        <Route path="/vapt"                  element={<VaptPage />} />
        <Route path="*"                      element={<NotFoundPage />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
