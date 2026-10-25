import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Clock,
  Pause,
  Play,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Sparkles,
  FileText,
  RotateCcw,
} from 'lucide-react';
import api from '../lib/api';
import {
  Spinner,
  Badge,
  EmptyState,
  STATUS_CONFIG,
  formatDuration,
  useToast,
} from '../components/ui';

const STATUS_OPTIONS = [
  {
    key: 'ok',
    title: 'Adequado (OK)',
    subtitle: '100% do peso',
    desc: 'Executou integralmente conforme o PEP',
    icon: CheckCircle2,
    idleClass:
      'border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100/70',
    activeClass:
      'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30',
  },
  {
    key: 'parcial',
    title: 'Parcial',
    subtitle: '50% do peso',
    desc: 'Executou de forma incompleta',
    icon: AlertTriangle,
    idleClass:
      'border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/70',
    activeClass:
      'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30',
  },
  {
    key: 'erro',
    title: 'Inadequado (Erro)',
    subtitle: '0% do peso',
    desc: 'Executou conduta errada',
    icon: XCircle,
    idleClass:
      'border-rose-200 bg-rose-50/50 text-rose-900 hover:bg-rose-100/70',
    activeClass:
      'border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600/30',
  },
  {
    key: 'omitido',
    title: 'Omitido',
    subtitle: '0% do peso',
    desc: 'Não realizou ou esqueceu de verbalizar',
    icon: MinusCircle,
    idleClass:
      'border-slate-200 bg-slate-100/70 text-slate-800 hover:bg-slate-200/70',
    activeClass:
      'border-slate-800 bg-slate-800 text-white shadow-md shadow-slate-800/20 ring-2 ring-slate-800/30',
  },
];

export default function Attempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const draftKey = `revalida_attempt_draft_${id}`;

  const [station, setStation] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active item index in the 2-column view
  const [currentIndex, setCurrentIndex] = useState(0);

  // Show/hide Expected Standard (visible by default as required)
  const [showStandard, setShowStandard] = useState(true);

  // Timer state
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Evaluations map: { [itemId]: { status: 'ok'|'parcial'|'erro'|'omitido', notes: '' } }
  const [evaluations, setEvaluations] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await api.getStation(id);
        if (!active) return;
        setStation(data.station);
        const loadedItems = Array.isArray(data.items) ? data.items : [];
        setItems(loadedItems);

        const initialMap = {};
        loadedItems.forEach((it) => {
          initialMap[it.id] = { status: null, notes: '' };
        });

        // Restore offline auto-saved draft if present
        try {
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.evaluations) {
              Object.keys(initialMap).forEach((k) => {
                if (parsed.evaluations[k]) {
                  initialMap[k] = parsed.evaluations[k];
                }
              });
            }
            if (parsed.generalNotes) setGeneralNotes(parsed.generalNotes);
            if (parsed.elapsedSec) setElapsedSec(Number(parsed.elapsedSec) || 0);
          }
        } catch {
          // ignore
        }

        setEvaluations(initialMap);
      } catch (err) {
        if (active) {
          toast.error(err.message || 'Erro ao carregar estação para prática.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, draftKey]);

  // Persist draft in localStorage automatically for offline resilience
  useEffect(() => {
    if (loading || items.length === 0) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          evaluations,
          generalNotes,
          elapsedSec,
          updatedAt: Date.now(),
        })
      );
    } catch {
      // ignore
    }
  }, [evaluations, generalNotes, elapsedSec, loading, items.length, draftKey]);

  // Stopwatch effect
  useEffect(() => {
    if (!timerRunning || loading) return;
    const interval = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, loading]);

  const handleSelectStatus = (itemId, statusKey) => {
    setEvaluations((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { notes: '' }),
        status: statusKey,
      },
    }));
  };

  const handleItemNoteChange = (itemId, text) => {
    setEvaluations((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { status: null }),
        notes: text,
      },
    }));
  };

  const handleResetDraft = () => {
    const clean = {};
    items.forEach((it) => {
      clean[it.id] = { status: null, notes: '' };
    });
    setEvaluations(clean);
    setGeneralNotes('');
    setElapsedSec(0);
    setCurrentIndex(0);
    localStorage.removeItem(draftKey);
    toast.info('Marcações e cronômetro reiniciados.');
  };

  // Live score & progress computation
  const stats = useMemo(() => {
    let answeredCount = 0;
    let currentScore = 0;
    let maxScore = 0;

    items.forEach((it) => {
      const w = Number(it.weight) || 1.0;
      maxScore += w;
      const ev = evaluations[it.id];
      if (ev?.status) {
        answeredCount++;
        if (ev.status === 'ok') currentScore += w;
        else if (ev.status === 'parcial') currentScore += w * 0.5;
      }
    });

    const progressPct =
      items.length > 0 ? Math.round((answeredCount * 100) / items.length) : 0;
    const scorePct =
      maxScore > 0 ? Math.round((currentScore * 1000) / maxScore) / 10 : 0;

    return {
      answeredCount,
      totalCount: items.length,
      progressPct,
      currentScore: Math.round(currentScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      scorePct,
    };
  }, [items, evaluations]);

  const handleSaveAttempt = async () => {
    if (items.length === 0) return;

    const unanswered = items.filter((it) => !evaluations[it.id]?.status);
    if (unanswered.length > 0) {
      const confirmUnanswered = window.confirm(
        `Você ainda tem ${unanswered.length} item(ns) sem marcação (eles serão salvos como "Omitido"). Deseja finalizar e salvar mesmo assim?`
      );
      if (!confirmUnanswered) return;
    }

    setSaving(true);
    try {
      const payload = {
        station_id: station.id,
        duration_sec: elapsedSec,
        notes: generalNotes.trim(),
        items: items.map((it) => ({
          checklist_item_id: it.id,
          status: evaluations[it.id]?.status || 'omitido',
          notes: evaluations[it.id]?.notes || '',
        })),
      };

      const res = await api.createAttempt(payload);
      localStorage.removeItem(draftKey);
      const pct = res?.attempt?.percentage ?? stats.scorePct;
      toast.success(
        `Tentativa salva com sucesso! Pontuação final: ${pct}% (${res?.attempt?.total_score}/${res?.attempt?.max_score} pts)`
      );
      navigate(`/station/${station.id}`);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar tentativa.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        size="lg"
        label="Preparando estação clínica e cronômetro OSCE..."
      />
    );
  }

  if (!station || items.length === 0) {
    return (
      <EmptyState
        title="Estação indisponível para prática"
        description="Esta estação não foi encontrada ou ainda não possui itens cadastrados no checklist."
        actionLabel="Voltar"
        onAction={() => navigate(-1)}
      />
    );
  }

  const currentItem = items[currentIndex] || items[0];
  const currentEval = evaluations[currentItem.id] || {
    status: null,
    notes: '',
  };

  const targetSec = (Number(station.duration_min) || 10) * 60;
  const isOvertime = elapsedSec > targetSec;

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Topbar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Station Title & Back */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to={`/station/${station.id}`}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title="Voltar para detalhes da estação"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: station.specialty_color }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {station.specialty_name}
                  </span>
                </div>
                <h1 className="truncate text-sm sm:text-base font-extrabold text-slate-900">
                  {station.title}
                </h1>
              </div>
            </div>

            {/* Stopwatch + Live Score + Save Button */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Stopwatch */}
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold ${
                  isOvertime
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-100 text-slate-800'
                }`}
              >
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>{formatDuration(elapsedSec)}</span>
                <span className="text-xs font-normal text-slate-400">
                  / {station.duration_min}:00
                </span>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="ml-1 rounded-lg p-1 hover:bg-white text-slate-600"
                  title={timerRunning ? 'Pausar cronômetro' : 'Retomar cronômetro'}
                >
                  {timerRunning ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetDraft}
                className="btn-ghost p-2 text-slate-500"
                title="Reiniciar estação e cronômetro"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Live Score Pill */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-extrabold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Score: {stats.scorePct}% ({stats.currentScore}/{stats.maxScore})
                </span>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveAttempt}
                disabled={saving}
                className="btn-primary py-2 px-4 text-xs sm:text-sm"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Tentativa'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${stats.progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 shrink-0">
              {stats.answeredCount}/{stats.totalCount} avaliados ({stats.progressPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Case Scenario Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Cenário de Porta da Estação:
            </span>
            <p className="text-sm text-slate-700 leading-relaxed mt-0.5">
              {station.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (8 cols): Active Checklist Item Evaluation */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card p-6 sm:p-8 space-y-6">
            {/* Item Header: Index, Category, Weight, PEP Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-8 items-center rounded-xl bg-slate-900 px-3 text-xs font-extrabold text-white">
                  Item {currentIndex + 1} de {items.length}
                </span>
                <Badge variant="indigo">{currentItem.category}</Badge>
                <Badge variant="slate">Peso: {currentItem.weight} pts</Badge>
              </div>

              <button
                type="button"
                onClick={() => setShowStandard((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {showStandard ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Ocultar Padrão Esperado</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Mostrar Padrão Esperado</span>
                  </>
                )}
              </button>
            </div>

            {/* Item Description */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tarefa / Conduta Avaliada:
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {currentItem.description}
              </h2>
            </div>

            {/* Highlighted Blue Box: Padrão Esperado de Procedimento (PEP) */}
            {showStandard && (
              <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50/70 to-indigo-50/40 p-5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-800 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Padrão Esperado de Procedimento (PEP — Critério INEP)</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed font-medium text-blue-950">
                  {currentItem.expected_standard}
                </p>
              </div>
            )}

            {/* 4 Status Buttons */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Selecione sua autoavaliação neste item:
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = currentEval.status === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectStatus(currentItem.id, opt.key)}
                      className={`flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected ? opt.activeClass : opt.idleClass
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold">
                            {opt.title}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-white/80 text-slate-700'
                            }`}
                          >
                            {opt.subtitle}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-xs ${
                            isSelected ? 'text-white/90' : 'opacity-80'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Notes */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Observações específicas deste item (opcional)
              </label>
              <textarea
                rows={2}
                value={currentEval.notes}
                onChange={(e) =>
                  handleItemNoteChange(currentItem.id, e.target.value)
                }
                placeholder="Anote o que esqueceu de verbalizar ou pontos de atenção neste item..."
                className="input-field"
              />
            </div>

            {/* Previous / Next Navigation */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="btn-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Item Anterior</span>
              </button>

              {currentIndex < items.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(items.length - 1, i + 1))
                  }
                  className="btn-primary"
                >
                  <span>Próximo Item</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAttempt}
                  disabled={saving}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {saving ? 'Finalizando...' : 'Concluir e Salvar Estação'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* General Attempt Notes */}
          <div className="card p-6 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Reflexão Geral da Tentativa (opcional)
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Resumo geral da sua performance nesta estação (ex: controle de tempo, sequência do esqueleto, dúvidas teóricas)..."
              className="input-field"
            />
          </div>
        </div>

        {/* Right Column (4 cols): Progress Sidebar & Item Thumbnails */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Mapa do Checklist ({stats.answeredCount}/{stats.totalCount})
                </h3>
                <p className="text-xs text-slate-500">
                  Rascunho salvo automaticamente offline
                </p>
              </div>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                {stats.scorePct}%
              </span>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {items.map((it, idx) => {
                const ev = evaluations[it.id];
                const stKey = ev?.status;
                const stCfg = stKey ? STATUS_CONFIG[stKey] : null;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                        : stCfg
                        ? `${stCfg.bg} ${stCfg.border}`
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                        stCfg
                          ? `${stCfg.dot} text-white`
                          : isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {it.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {it.weight} pts
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-slate-900 line-clamp-2">
                        {it.description}
                      </p>
                      {stCfg && (
                        <span
                          className={`mt-1 inline-block text-[10px] font-extrabold uppercase ${stCfg.text}`}
                        >
                          {stCfg.shortLabel}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSaveAttempt}
              disabled={saving}
              className="btn-primary w-full py-3"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Salvando...' : 'Finalizar e Calcular Score'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
