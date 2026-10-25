import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider, Spinner } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Specialty from './pages/Specialty';
import Station from './pages/Station';
import Attempt from './pages/Attempt';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function PathSync() {
  const navigate = useNavigate();

  useEffect(() => {
    // If user navigated to a non-root path without hash (e.g. /login, /analytics on localhost),
    // sync it into HashRouter automatically
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
      if (cleanPath !== '/') {
        navigate(cleanPath, { replace: true });
      }
    }
  }, [navigate]);

  return null;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" label="Carregando Revalida Tracker..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <HashRouter>
      <PathSync />
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
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
