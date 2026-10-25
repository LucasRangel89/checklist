import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ClipboardList,
  XCircle,
  MinusCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  BookOpen,
  Play,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import api from '../lib/api';
import {
  Spinner,
  EmptyState,
  Badge,
  useToast,
} from '../components/ui';

export default function Analytics() {
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAnalyticsSummary();
        if (active) setData(res);
      } catch (err) {
        if (active) {
          toast.error(err.message || 'Erro ao carregar análises de desempenho.');
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
    return (
      <Spinner
        size="lg"
        label="Calculando métricas estatísticas e curvas de evolução..."
      />
    );
  }

  const summary = data?.summary || {
    avgScore: 0,
    totalAttempts: 0,
    totalErrors: 0,
    totalOmitted: 0,
    totalParcial: 0,
    totalOk: 0,
  };
  const bySpecialty = Array.isArray(data?.bySpecialty) ? data.bySpecialty : [];
  const byCategory = Array.isArray(data?.byCategory) ? data.byCategory : [];
  const topErrors = Array.isArray(data?.topErrors) ? data.topErrors : [];
  const timeline = Array.isArray(data?.timeline) ? data.timeline : [];

  const timelineFormatted = timeline.map((pt, idx) => {
    const shortDate = pt.date
      ? pt.date.slice(5).split('-').reverse().join('/')
      : `#${idx + 1}`;
    return {
      ...pt,
      label: `${shortDate}`,
      attemptLabel: `${shortDate} — ${pt.station_title}`,
    };
  });

  const statusDistribution = [
    { name: 'Adequado (OK)', value: Number(summary.totalOk) || 0, color: '#10b981' },
    { name: 'Parcial (50%)', value: Number(summary.totalParcial) || 0, color: '#f59e0b' },
    { name: 'Erro (0%)', value: Number(summary.totalErrors) || 0, color: '#f43f5e' },
    { name: 'Omitido (0%)', value: Number(summary.totalOmitted) || 0, color: '#64748b' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Análises de Desempenho OSCE
        </h1>
        <p className="text-sm text-slate-500">
          Diagnóstico completo da sua preparação por especialidade, categoria clínica, evolução temporal e pontos críticos do PEP
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Média Geral
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {summary.avgScore}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {summary.stationsPracticed || 0} estações diferentes praticadas
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total de Tentativas
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {summary.totalAttempts}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {summary.totalItemsEvaluated || 0} itens do PEP corrigidos
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itens com Erro
            </p>
            <p className="mt-2 text-3xl font-extrabold text-rose-600">
              {summary.totalErrors}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Condutas inadequadas (+ {summary.totalParcial} parciais)
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itens Omitidos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-700">
              {summary.totalOmitted}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Etapas esquecidas na execução
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <MinusCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {summary.totalAttempts === 0 ? (
        <EmptyState
          title="Sem dados suficientes para gráficos"
          description="Realize pelo menos uma estação prática para visualizar os gráficos de desempenho e pontos de atenção."
        />
      ) : (
        <>
          {/* Row 1: Chart 1 (Horizontal Bar by Specialty) & Chart 2 (Line Timeline 60 days) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Desempenho por Especialidade */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Desempenho por Especialidade (%)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Média percentual nas 7 áreas do Revalida
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bySpecialty}
                    layout="vertical"
                    margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      fontSize={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      fontSize={11}
                    />
                    <Tooltip
                      formatter={(val) => [`${val}%`, 'Média']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="avg_score" name="Média (%)" radius={[0, 8, 8, 0]}>
                      {bySpecialty.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Evolução nos Últimos 60 Dias */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Evolução nos Últimos 60 Dias
                    </h2>
                    <p className="text-xs text-slate-500">
                      Progressão das notas por tentativa realizada
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineFormatted}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      fontSize={11}
                    />
                    <Tooltip
                      formatter={(val, _name, props) => [
                        `${val}% (${props?.payload?.station_title || ''})`,
                        'Score',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score (%)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Chart 3 (Stacked Bar by Category) & Chart 4 (Pie Distribution) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Chart 3: Desempenho por Categoria (Stacked Bar) */}
            <div className="card p-6 space-y-4 lg:col-span-7">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Desempenho por Etapa / Categoria Clínica
                  </h2>
                  <p className="text-xs text-slate-500">
                    Proporção de itens Adequados, Parciais, Erros e Omitidos por etapa do checklist
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byCategory}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="ok"
                      name="Adequado (OK)"
                      stackId="a"
                      fill="#10b981"
                    />
                    <Bar
                      dataKey="parcial"
                      name="Parcial"
                      stackId="a"
                      fill="#f59e0b"
                    />
                    <Bar
                      dataKey="erro"
                      name="Erro"
                      stackId="a"
                      fill="#f43f5e"
                    />
                    <Bar
                      dataKey="omitido"
                      name="Omitido"
                      stackId="a"
                      fill="#94a3b8"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Distribuição Global de Status */}
            <div className="card p-6 space-y-4 lg:col-span-5">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Distribuição Global de Status no PEP
                  </h2>
                  <p className="text-xs text-slate-500">
                    Total de {summary.totalItemsEvaluated} itens avaliados nas simulações
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={95}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} itens`, 'Quantidade']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top 10 Items with Most Errors / Omissions (Pontos de Atenção) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Top 10 Itens com Mais Erros e Omissões (Pontos de Atenção)
              </h2>
              <p className="text-xs text-slate-500">
                Condutas do Padrão Esperado de Procedimento que você mais errou, omitiu ou executou parcialmente
              </p>
            </div>
          </div>
        </div>

        {topErrors.length === 0 ? (
          <EmptyState
            title="Nenhum erro recorrente identificado"
            description="Parabéns! Você ainda não possui itens marcados com erro ou omissão."
          />
        ) : (
          <div className="space-y-3">
            {topErrors.map((errItem, idx) => (
              <div
                key={errItem.item_id}
                className="card p-5 space-y-3 hover:border-rose-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-xs font-extrabold text-white">
                      #{idx + 1}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: `${errItem.specialty_color}18`,
                        color: errItem.specialty_color,
                      }}
                    >
                      {errItem.specialty_name}
                    </span>
                    <Badge variant="indigo">{errItem.category}</Badge>
                    <Badge variant="slate">Peso: {errItem.weight} pts</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    {errItem.erro_count > 0 && (
                      <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5">
                        {errItem.erro_count} Erro(s)
                      </span>
                    )}
                    {errItem.omitido_count > 0 && (
                      <span className="rounded-full bg-slate-200 text-slate-800 px-2.5 py-0.5">
                        {errItem.omitido_count} Omitido(s)
                      </span>
                    )}
                    {errItem.parcial_count > 0 && (
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5">
                        {errItem.parcial_count} Parcial(is)
                      </span>
                    )}

                    <Link
                      to={`/attempt/${errItem.station_id}`}
                      className="btn-secondary text-xs py-1 px-3 ml-1"
                    >
                      <Play className="h-3 w-3 text-indigo-600" />
                      <span>Treinar Estação</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <Link
                    to={`/station/${errItem.station_id}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Estação: {errItem.station_title}
                  </Link>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {errItem.description}
                  </h3>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950">
                  <div className="flex items-center gap-1.5 font-extrabold text-blue-800 mb-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Revisão do Padrão Esperado de Procedimento (PEP):</span>
                  </div>
                  <p className="leading-relaxed">{errItem.expected_standard}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
