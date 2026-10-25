import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  Compass,
  Calendar,
  BarChart3,
  History,
  Sparkles,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  Spinner,
  SpecialtyIcon,
  EmptyState,
  Badge,
  useToast,
} from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await api.getSpecialties();
        if (active) setSpecialties(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          toast.error(err.message || 'Erro ao carregar dados do dashboard.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Spinner size="lg" label="Carregando painel das especialidades OSCE..." />;
  }

  // Compute global statistics from specialties
  const totalStations = specialties.reduce(
    (sum, s) => sum + (Number(s.total_stations) || 0),
    0
  );
  const totalAttempts = specialties.reduce(
    (sum, s) => sum + (Number(s.total_attempts) || 0),
    0
  );
  const stationsPracticed = specialties.reduce(
    (sum, s) => sum + (Number(s.stations_attempted) || 0),
    0
  );

  // Weighted average across all attempts
  const weightedScoreSum = specialties.reduce((sum, s) => {
    const att = Number(s.total_attempts) || 0;
    const avg = Number(s.avg_score) || 0;
    return sum + att * avg;
  }, 0);
  const overallAvg =
    totalAttempts > 0
      ? Math.round((weightedScoreSum / totalAttempts) * 10) / 10
      : 0;

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const STAT_CARDS = [
    {
      label: 'Estações Disponíveis',
      value: totalStations,
      sub: 'Distribuídas nas 7 áreas',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Tentativas Realizadas',
      value: totalAttempts,
      sub: 'Simulações corrigidas pelo PEP',
      icon: ClipboardList,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Média Geral OSCE',
      value: `${overallAvg}%`,
      sub: overallAvg >= 75 ? 'Acima da meta recomendada' : 'Continue praticando!',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Estações Praticadas',
      value: `${stationsPracticed}/${totalStations}`,
      sub: `${
        totalStations > 0 ? Math.round((stationsPracticed * 100) / totalStations) : 0
      }% de cobertura total`,
      icon: CheckCircle2,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Greeting Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 capitalize">
            <Calendar className="h-3.5 w-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {user?.name || 'Doutor(a)'}! 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Escolha uma especialidade abaixo para praticar estações simuladas ou consulte os{' '}
            <strong className="text-white font-semibold">
              Esqueletos em Branco
            </strong>{' '}
            de cada área para orientar seus estudos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/skeletons"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-all"
          >
            <Compass className="h-4 w-4" />
            <span>Esqueletos em Branco (Guia)</span>
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition-all"
          >
            <BarChart3 className="h-4 w-4 text-indigo-300" />
            <span>Análises</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all"
          >
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="card p-5 flex items-start justify-between gap-4 hover:shadow-md"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {card.sub}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${card.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 7 Specialties Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Especialidades do Revalida (7)
            </h2>
            <p className="text-sm text-slate-500">
              Clique em uma especialidade para praticar estações ou abra seu esqueleto em branco
            </p>
          </div>
          <Link
            to="/skeletons"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-800"
          >
            <Compass className="h-4 w-4" />
            <span>Ver todos os 7 Esqueletos em Branco →</span>
          </Link>
        </div>

        {specialties.length === 0 ? (
          <EmptyState
            title="Nenhuma especialidade encontrada"
            description="Execute o seed do banco de dados para carregar as 7 especialidades do Revalida."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {specialties.map((sp) => {
              const totalSt = Number(sp.total_stations) || 0;
              const practicedSt = Number(sp.stations_attempted) || 0;
              const progressPct =
                totalSt > 0 ? Math.min(100, Math.round((practicedSt * 100) / totalSt)) : 0;
              const avgScore = sp.avg_score != null ? `${sp.avg_score}%` : '—';
              const attemptsCount = Number(sp.total_attempts) || 0;

              return (
                <div
                  key={sp.id}
                  className="card group relative flex flex-col justify-between overflow-hidden p-6 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  {/* Top color bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ backgroundColor: sp.color }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/specialty/${sp.slug}`}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${sp.color}15`,
                          color: sp.color,
                        }}
                      >
                        <SpecialtyIcon name={sp.icon} className="h-6 w-6" />
                      </Link>

                      <div className="flex items-center gap-2">
                        {sp.avg_score != null ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              sp.avg_score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sp.avg_score >= 60
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            Média: {avgScore}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            Não praticada
                          </span>
                        )}
                      </div>
                    </div>

                    <Link to={`/specialty/${sp.slug}`}>
                      <h3 className="mt-4 text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {sp.name}
                      </h3>
                    </Link>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {sp.description}
                    </p>

                    {/* Mini Skeleton Preview + Link to Full Blank Skeleton */}
                    <Link
                      to={`/skeletons?area=${sp.slug}`}
                      className="mt-4 block rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 p-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          Esqueleto em Branco (Guia):
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 underline">
                          Abrir folha limpa →
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 line-clamp-2">
                        {sp.skeleton}
                      </p>
                    </Link>
                  </div>

                  {/* Progress & Stats Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        Progresso ({practicedSt}/{totalSt} estações)
                      </span>
                      <span className="font-bold text-slate-900">{progressPct}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: sp.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                      <span>
                        {totalSt} {totalSt === 1 ? 'estação' : 'estações'} •{' '}
                        {attemptsCount} {attemptsCount === 1 ? 'tentativa' : 'tentativas'}
                      </span>
                      <Link
                        to={`/specialty/${sp.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform"
                      >
                        Estações <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info Card: What is the OSCE Skeleton? */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Guia de Esqueletos em Branco (Orientação de Estudos OSCE)
                </h3>
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              </div>
              <Link to="/skeletons" className="btn-primary text-xs py-2 px-3.5">
                <Compass className="h-4 w-4" />
                <span>Acessar Guia de Esqueletos em Branco</span>
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              Na segunda etapa do Revalida (INEP), o candidato tem <strong>10 minutos por estação</strong> para realizar tarefas clínicas avaliadas pelo{' '}
              <strong>Padrão Esperado de Procedimento (PEP)</strong>. Acesse a aba <strong>Esqueletos OSCE (Guia)</strong> para visualizar a estrutura passo a passo em branco de cada uma das 7 especialidades, sem nada preenchido, ideal para treino mental e revisão rápida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
