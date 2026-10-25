import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  History,
  BarChart3,
  Settings,
  Activity,
  X,
  Stethoscope,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  Siren,
  HardDrive,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  getConnectionState,
  subscribeConnectionStatus,
} from '../lib/api';
import { useToast } from './ui';

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/skeletons', label: 'Esqueletos OSCE (Guia)', icon: Compass },
  { to: '/history', label: 'Histórico de Práticas', icon: History },
  { to: '/analytics', label: 'Análises e Desempenho', icon: BarChart3 },
  { to: '/settings', label: 'Backup & Ajustes', icon: Settings },
];

const QUICK_SPECIALTIES = [
  { slug: 'clinica-medica', name: 'Clínica Médica', icon: Stethoscope, color: '#3b82f6' },
  { slug: 'cirurgia', name: 'Cirurgia Geral', icon: Scissors, color: '#ef4444' },
  { slug: 'ginecologia-obstetricia', name: 'Ginecologia e Obstetrícia', icon: Baby, color: '#ec4899' },
  { slug: 'pediatria', name: 'Pediatria', icon: Heart, color: '#f59e0b' },
  { slug: 'medicina-familia', name: 'Medicina de Família', icon: Users, color: '#10b981' },
  { slug: 'saude-mental', name: 'Saúde Mental', icon: Brain, color: '#8b5cf6' },
  { slug: 'urgencia-emergencia', name: 'Urgência e Emergência', icon: Siren, color: '#f97316' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  const [connState, setConnState] = useState(() => getConnectionState());
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const unsub = subscribeConnectionStatus((st) => setConnState(st));
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      unsub();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      toast.info(
        'Para instalar no celular/PC: use o menu do navegador → "Adicionar à Tela de Início" ou "Instalar Aplicativo".'
      );
    }
  };

  const initials = (user?.name || 'MD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-slate-900">
                Revalida Tracker
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                OSCE • INEP PEP
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Local Storage Status & PWA Install Bar */}
        <div className="px-3 pt-3 space-y-2">
          <Link
            to="/settings"
            onClick={onClose}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100/70 transition-all"
          >
            <span className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
              <span>Salvo no Dispositivo</span>
            </span>
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {connState.stats?.stations || 16} estações
            </span>
          </Link>

          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallPwa}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Instalar App no Dispositivo</span>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Principal
            </p>
            <nav className="space-y-1">
              {MAIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* 7 Specialties Quick Access */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Especialidades OSCE (7)
              </p>
              <Link
                to="/skeletons"
                onClick={onClose}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Ver Esqueletos
              </Link>
            </div>
            <nav className="space-y-1">
              {QUICK_SPECIALTIES.map((sp) => {
                const Icon = sp.icon;
                const active = location.pathname === `/specialty/${sp.slug}`;
                return (
                  <NavLink
                    key={sp.slug}
                    to={`/specialty/${sp.slug}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: active
                          ? 'rgba(255,255,255,0.18)'
                          : `${sp.color}18`,
                        color: active ? '#ffffff' : sp.color,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{sp.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-4">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center justify-between gap-2 rounded-xl p-1 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {user?.name || 'Estudante Revalida'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  Perfil Local • Backup JSON
                </p>
              </div>
            </div>
            <Settings className="h-4 w-4 text-slate-400 shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
}
