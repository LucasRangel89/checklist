import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Menu,
  Activity,
  LayoutDashboard,
  Compass,
  History,
  BarChart3,
  Settings,
} from 'lucide-react';
import Sidebar from './Sidebar';

const MOBILE_TABS = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/skeletons', label: 'Esqueletos', icon: Compass },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/analytics', label: 'Análises', icon: BarChart3 },
  { to: '/settings', label: 'Ajustes', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 pb-20 lg:pb-0">
        {/* Mobile Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            aria-label="Abrir menu de especialidades"
          >
            <Menu className="h-4 w-4 text-indigo-600" />
            <span>Menu / 7 Áreas</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">
              Revalida OSCE
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar (Native PWA Feel) */}
        <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                    isActive
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
