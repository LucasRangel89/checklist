import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Skeletons from './pages/Skeletons';
import Specialty from './pages/Specialty';
import Station from './pages/Station';
import Attempt from './pages/Attempt';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function PathSync() {
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, hash } = window.location;
    if (
      (!hash || hash === '#/' || hash === '#') &&
      pathname &&
      pathname !== '/' &&
      !pathname.endsWith('/index.html') &&
      !pathname.endsWith('/checklist') &&
      !pathname.endsWith('/checklist/')
    ) {
      const cleanPath = pathname.replace(/^\/checklist/, '') || '/';
      if (cleanPath !== '/' && cleanPath !== '/login') {
        navigate(cleanPath, { replace: true });
      }
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <PathSync />
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Redirect /login directly to Dashboard (no login wall) */}
            <Route path="/login" element={<Navigate to="/" replace />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="skeletons" element={<Skeletons />} />
              <Route path="specialty/:slug" element={<Specialty />} />
              <Route path="station/:id" element={<Station />} />
              <Route path="attempt/:id" element={<Attempt />} />
              <Route path="history" element={<History />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
