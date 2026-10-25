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
            Escolha uma especialidade abaixo para praticar estações simuladas e revisar o{' '}
            <strong className="text-white font-semibold">
              Padrão Esperado de Procedimento (PEP)
            </strong>{' '}
            do Revalida/INEP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition-all"
          >
            <BarChart3 className="h-4 w-4 text-indigo-300" />
            <span>Ver Análises</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all"
          >
            <History className="h-4 w-4" />
            <span>Histórico Completo</span>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Especialidades do Revalida (7)
            </h2>
            <p className="text-sm text-slate-500">
              Clique em uma especialidade para visualizar seu esqueleto OSCE e praticar estações clínicas
            </p>
          </div>
          <Badge variant="indigo">{specialties.length} áreas médicas</Badge>
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
                <Link
                  key={sp.id}
                  to={`/specialty/${sp.slug}`}
                  className="card group relative flex flex-col justify-between overflow-hidden p-6 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  {/* Top color bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ backgroundColor: sp.color }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${sp.color}15`,
                          color: sp.color,
                        }}
                      >
                        <SpecialtyIcon name={sp.icon} className="h-6 w-6" />
                      </div>

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

                    <h3 className="mt-4 text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sp.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {sp.description}
                    </p>

                    {/* Mini Skeleton Preview */}
                    <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Esqueleto da Especialidade:
                      </span>
                      <p className="text-[11px] font-medium text-slate-700 line-clamp-2">
                        {sp.skeleton}
                      </p>
                    </div>
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
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Acessar <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                O que é o &ldquo;Esqueleto OSCE&rdquo; e como funciona a pontuação no Revalida?
              </h3>
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              Na segunda etapa do Revalida (INEP), o candidato tem <strong>10 minutos por estação</strong> para realizar tarefas clínicas avaliadas por um examinador com base no{' '}
              <strong>Padrão Esperado de Procedimento (PEP)</strong>. Cada grande área médica possui um{' '}
              <em>esqueleto mental estruturado</em> — uma sequência lógica que evita esquecer etapas críticas sob pressão (como apresentação, higienização das mãos, SIFE na MFC ou ABCDE na Cirurgia).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="rounded-xl bg-white border border-emerald-200 px-3 py-2 text-xs">
                <span className="font-bold text-emerald-700 block">OK (100% do peso)</span>
                <span className="text-slate-600">Executado integralmente conforme o PEP</span>
              </div>
              <div className="rounded-xl bg-white border border-amber-200 px-3 py-2 text-xs">
                <span className="font-bold text-amber-700 block">Parcial (50% do peso)</span>
                <span className="text-slate-600">Realizado de forma incompleta</span>
              </div>
              <div className="rounded-xl bg-white border border-rose-200 px-3 py-2 text-xs">
                <span className="font-bold text-rose-700 block">Erro (0% do peso)</span>
                <span className="text-slate-600">Conduta incorreta ou fora da técnica</span>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs">
                <span className="font-bold text-slate-700 block">Omitido (0% do peso)</span>
                <span className="text-slate-600">Item esquecido ou não verbalizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
