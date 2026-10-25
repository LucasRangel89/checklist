import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  Copy,
  Printer,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Square,
  CheckSquare,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  UNIVERSAL_SKELETON,
  SPECIALTY_SKELETONS,
} from '../lib/skeletonsData';
import {
  SpecialtyIcon,
  Badge,
  Modal,
  useToast,
} from '../components/ui';

const CUSTOM_SKELETON_NOTES_KEY = 'revalida_custom_skeleton_items_v1';

export default function Skeletons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const initialSlug = searchParams.get('area') || 'todas';
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);

  // Blank by default! Ephemeral checkmarks only if user taps during mental rehearsal
  const [checkedIds, setCheckedIds] = useState({});

  // Toggle between detailed orientation vs pure clean topics ("Folha em Branco")
  const [showDetails, setShowDetails] = useState(true);
  const [showUniversal, setShowUniversal] = useState(true);

  // Optional custom items added by the student per specialty
  const [customItems, setCustomItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_SKELETON_NOTES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Modal to add custom topic to a specialty skeleton
  const [addModalSpec, setAddModalSpec] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicGuide, setNewTopicGuide] = useState('');

  useEffect(() => {
    const area = searchParams.get('area');
    if (area && area !== selectedSlug) {
      setSelectedSlug(area);
    }
  }, [searchParams]);

  const handleSelectSpecialty = (slug) => {
    setSelectedSlug(slug);
    if (slug === 'todas') {
      setSearchParams({});
    } else {
      setSearchParams({ area: slug });
    }
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClearChecks = () => {
    setCheckedIds({});
    toast.info('Folha reiniciada! Todos os itens voltaram a ficar em branco.');
  };

  const handleAddCustomTopic = (e) => {
    e.preventDefault();
    if (!addModalSpec || !newTopicTitle.trim()) return;

    const specSlug = addModalSpec.slug;
    const newItem = {
      id: `custom-${Date.now()}`,
      title: newTopicTitle.trim(),
      guide: newTopicGuide.trim(),
    };

    const updated = {
      ...customItems,
      [specSlug]: [...(customItems[specSlug] || []), newItem],
    };

    setCustomItems(updated);
    localStorage.setItem(CUSTOM_SKELETON_NOTES_KEY, JSON.stringify(updated));
    setNewTopicTitle('');
    setNewTopicGuide('');
    setAddModalSpec(null);
    toast.success(`Tópico adicionado ao esqueleto de ${addModalSpec.name}!`);
  };

  const handleRemoveCustomTopic = (specSlug, itemId) => {
    const updated = {
      ...customItems,
      [specSlug]: (customItems[specSlug] || []).filter((i) => i.id !== itemId),
    };
    setCustomItems(updated);
    localStorage.setItem(CUSTOM_SKELETON_NOTES_KEY, JSON.stringify(updated));
    toast.info('Tópico personalizado removido.');
  };

  const handleCopySkeleton = (spec) => {
    const lines = [
      `📋 ESQUELETO OSCE — ${spec.name.toUpperCase()} (REVALIDA / INEP)`,
      `Fluxo: ${spec.summary}`,
      '',
    ];

    spec.sections.forEach((sec) => {
      lines.push(sec.stage);
      sec.items.forEach((it) => {
        lines.push(`  [ ] ${it.title}`);
        if (showDetails && it.guide) {
          lines.push(`      → ${it.guide}`);
        }
      });
      lines.push('');
    });

    if (spec.neverForget?.length) {
      lines.push('⚠️ NUNCA ESQUECER NESTA ESPECIALIDADE:');
      spec.neverForget.forEach((nf) => lines.push(`  • ${nf}`));
    }

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => {
        toast.success(`Esqueleto de ${spec.name} copiado para a área de transferência!`);
      })
      .catch(() => {
        toast.error('Não foi possível copiar automaticamente.');
      });
  };

  const visibleSpecialties =
    selectedSlug === 'todas'
      ? SPECIALTY_SKELETONS
      : SPECIALTY_SKELETONS.filter((s) => s.slug === selectedSlug);

  const checkedCount = Object.values(checkedIds).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-indigo-100">
              <Compass className="h-3.5 w-3.5 text-amber-300" />
              <span>Guia de Estudo e Orientação Mental • Em Branco</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Esqueletos das 7 Especialidades (OSCE / INEP)
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Use estes roteiros em branco para memorizar a <strong>sequência lógica obrigatória</strong> de cada área antes de entrar na estação. Você pode estudar apenas os tópicos limpos, ver o guia detalhado do que verbalizar, ou marcar itens temporariamente durante um treino livre.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all"
            >
              {showDetails ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Modo Folha Limpa (Só Tópicos)</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Mostrar Guia Detalhado</span>
                </>
              )}
            </button>

            {checkedCount > 0 && (
              <button
                type="button"
                onClick={handleClearChecks}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Limpar Marcações ({checkedCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 text-xs font-extrabold shadow-sm transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specialty Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleSelectSpecialty('todas')}
          className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            selectedSlug === 'todas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Todas as 7 Áreas ({SPECIALTY_SKELETONS.length})
        </button>

        {SPECIALTY_SKELETONS.map((sp) => {
          const active = selectedSlug === sp.slug;
          return (
            <button
              key={sp.slug}
              type="button"
              onClick={() => handleSelectSpecialty(sp.slug)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              style={active ? { backgroundColor: sp.color } : undefined}
            >
              <SpecialtyIcon
                name={sp.icon}
                className="h-4 w-4"
                style={!active ? { color: sp.color } : undefined}
              />
              <span>{sp.name}</span>
            </button>
          );
        })}
      </div>

      {/* Universal Door Skeleton (Opening & Closing of every OSCE station) */}
      <div className="card overflow-hidden border-indigo-200/80">
        <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {UNIVERSAL_SKELETON.title}
              </h2>
              <p className="text-xs text-slate-600">
                {UNIVERSAL_SKELETON.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUniversal((v) => !v)}
            className="text-xs font-bold text-indigo-700 hover:underline"
          >
            {showUniversal ? 'Recolher' : 'Expandir'}
          </button>
        </div>

        {showUniversal && (
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
            {/* Opening */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="emerald">Abertura Padrão (Primeiros 45s)</Badge>
                <span className="text-xs text-slate-500">Ao entrar na estação</span>
              </div>
              <div className="space-y-2.5">
                {UNIVERSAL_SKELETON.opening.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`cursor-pointer flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isChecked
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.step}
                        </p>
                        {showDetails && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Closing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="indigo">Fechamento Padrão (Últimos 45s)</Badge>
                <span className="text-xs text-slate-500">Antes do apito final</span>
              </div>
              <div className="space-y-2.5">
                {UNIVERSAL_SKELETON.closing.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`cursor-pointer flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isChecked
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.step}
                        </p>
                        {showDetails && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specialty Skeletons */}
      <div className="space-y-8">
        {visibleSpecialties.map((spec) => {
          const userCustomList = customItems[spec.slug] || [];

          return (
            <div
              key={spec.slug}
              className="card overflow-hidden border-slate-200/90 shadow-xs"
            >
              {/* Top Color Accent */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: spec.color }}
              />

              {/* Specialty Header */}
              <div className="border-b border-slate-100 p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${spec.color}18`,
                        color: spec.color,
                      }}
                    >
                      <SpecialtyIcon name={spec.icon} className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Esqueleto Mental em Branco • OSCE
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        {spec.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddModalSpec(spec)}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Adicionar Tópico</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySkeleton(spec)}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Esqueleto</span>
                    </button>

                    <Link
                      to={`/specialty/${spec.slug}`}
                      className="btn-primary text-xs py-2 px-3.5"
                    >
                      <span>Ver Estações da Área</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Visual Flow Steps Pill Chain */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                    Linha do Tempo Mental (Sequência da Estação):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {spec.flowSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: spec.color }}
                          >
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                        {idx < spec.flowSteps.length - 1 && (
                          <span className="text-slate-400 font-bold text-xs">
                            →
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blank Checklist Sections */}
              <div className="p-6 sm:p-8 space-y-6">
                {spec.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-700">
                      <BookOpen
                        className="h-4 w-4 shrink-0"
                        style={{ color: spec.color }}
                      />
                      <span>{section.stage}</span>
                    </h3>

                    <div className="space-y-2.5">
                      {section.items.map((item) => {
                        const isChecked = !!checkedIds[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            className={`cursor-pointer flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                              isChecked
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/40'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                            )}

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold ${
                                  isChecked
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900'
                                }`}
                              >
                                {item.title}
                              </p>
                              {showDetails && item.guide && (
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                  <strong className="text-slate-700">
                                    O que verbalizar / fazer:{' '}
                                  </strong>
                                  {item.guide}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom User-Added Topics for this Specialty */}
                {userCustomList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700">
                      Seus Tópicos Personalizados ({userCustomList.length})
                    </h3>
                    <div className="space-y-2.5">
                      {userCustomList.map((cItem) => {
                        const isChecked = !!checkedIds[cItem.id];
                        return (
                          <div
                            key={cItem.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4"
                          >
                            <div
                              onClick={() => toggleCheck(cItem.id)}
                              className="cursor-pointer flex items-start gap-3.5 flex-1"
                            >
                              {isChecked ? (
                                <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p
                                  className={`text-sm font-bold ${
                                    isChecked
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {cItem.title}
                                </p>
                                {showDetails && cItem.guide && (
                                  <p className="mt-1 text-xs text-slate-600">
                                    {cItem.guide}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCustomTopic(spec.slug, cItem.id)
                              }
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Remover tópico"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Never Forget Box (Pontos Críticos / Armadilhas de Prova) */}
                {spec.neverForget?.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        O que NUNCA esquecer nas estações de {spec.name} (Pegadinhas Clássicas do INEP):
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-amber-950 font-medium list-disc pl-5">
                      {spec.neverForget.map((tip, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Custom Topic to Skeleton */}
      <Modal
        open={!!addModalSpec}
        onClose={() => setAddModalSpec(null)}
        title={`Adicionar Tópico ao Esqueleto — ${addModalSpec?.name || ''}`}
        subtitle="Crie um lembrete permanente no seu guia de estudo desta especialidade"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddModalSpec(null)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="add-skeleton-topic-form"
              className="btn-primary"
            >
              Adicionar ao Esqueleto
            </button>
          </>
        }
      >
        <form
          id="add-skeleton-topic-form"
          onSubmit={handleAddCustomTopic}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Título do Tópico / Etapa *
            </label>
            <input
              type="text"
              required
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Ex: Solicitar teste rápido de gravidez (β-hCG) em mulheres em idade fértil"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              O que verbalizar / Detalhes (opcional)
            </label>
            <textarea
              rows={3}
              value={newTopicGuide}
              onChange={(e) => setNewTopicGuide(e.target.value)}
              placeholder="Anotação de apoio para lembrar durante o estudo..."
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
