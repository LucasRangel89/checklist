import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  X,
  Stethoscope,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  Siren,
  Wifi,
  WifiOff,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  getConnectionState,
  subscribeConnectionStatus,
  setForceOffline,
} from '../lib/api';
import { useToast } from './ui';

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/history', label: 'Histórico de Práticas', icon: History },
  { to: '/analytics', label: 'Análises e Desempenho', icon: BarChart3 },
  { to: '/settings', label: 'Configurações', icon: Settings },
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
  const { user, logout } = useAuth();
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

  const handleToggleOffline = () => {
    const next = !connState.forcedOffline;
    setForceOffline(next);
    if (next) {
      toast.info(
        'Modo 100% Offline ativado! Todos os dados estão rodando localmente no dispositivo.'
      );
    } else {
      toast.success('Modo Online reconectado.');
    }
  };

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

        {/* Offline / Online Status & PWA Install Bar */}
        <div className="px-3 pt-3 space-y-2">
          <button
            type="button"
            onClick={handleToggleOffline}
            className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              connState.online
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70'
                : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
            title="Clique para alternar entre Modo Online e Modo 100% Offline"
          >
            <span className="flex items-center gap-2">
              {connState.online ? (
                <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-amber-600" />
              )}
              <span>
                {connState.online ? 'Online (Offline Pronto)' : 'Modo 100% Offline'}
              </span>
            </span>
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              Alternar
            </span>
          </button>

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
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Especialidades OSCE (7)
            </p>
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {user?.name || 'Estudante'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sair da conta"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
