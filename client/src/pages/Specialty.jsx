import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Play,
  ClipboardList,
  Clock,
  Award,
  Layers,
  Eye,
  Trash2,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import api from '../lib/api';
import {
  Spinner,
  SpecialtyIcon,
  DifficultyBadge,
  EmptyState,
  Modal,
  useToast,
  formatDate,
} from '../components/ui';

const CATEGORIES = [
  'Acolhimento',
  'Anamnese',
  'Exame Físico',
  'Avaliação',
  'Procedimento',
  'Conduta',
  'Plano',
];

export default function Specialty() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [specialty, setSpecialty] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Station Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('intermediário');
  const [durationMin, setDurationMin] = useState(10);
  const [draftItems, setDraftItems] = useState([
    {
      category: 'Anamnese',
      description: '',
      expected_standard: '',
      weight: 1.0,
    },
  ]);

  const loadSpecialty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSpecialtyBySlug(slug);
      setSpecialty(data.specialty);
      setStations(Array.isArray(data.stations) ? data.stations : []);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar especialidade.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadSpecialty();
  }, [loadSpecialty]);

  const handleAddDraftItem = () => {
    setDraftItems((prev) => [
      ...prev,
      {
        category: 'Conduta',
        description: '',
        expected_standard: '',
        weight: 1.0,
      },
    ]);
  };

  const handleRemoveDraftItem = (idx) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDraftItemChange = (idx, field, value) => {
    setDraftItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('intermediário');
    setDurationMin(10);
    setDraftItems([
      {
        category: 'Anamnese',
        description: '',
        expected_standard: '',
        weight: 1.0,
      },
    ]);
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Preencha o título e o caso clínico da estação.');
      return;
    }

    const validItems = draftItems.filter(
      (it) => it.description.trim() && it.expected_standard.trim()
    );

    if (validItems.length === 0) {
      toast.error(
        'Adicione pelo menos 1 item de checklist com descrição e Padrão Esperado de Procedimento.'
      );
      return;
    }

    setSaving(true);
    try {
      const created = await api.createStation({
        specialty_id: specialty.id,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        duration_min: Number(durationMin) || 10,
        items: validItems.map((it, index) => ({
          category: it.category,
          order_idx: index + 1,
          description: it.description.trim(),
          expected_standard: it.expected_standard.trim(),
          weight: Number(it.weight) || 1.0,
        })),
      });

      toast.success('Nova estação clínica criada com sucesso!');
      setModalOpen(false);
      resetForm();
      if (created?.station?.id) {
        navigate(`/station/${created.station.id}`);
      } else {
        loadSpecialty();
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao criar estação.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (stationId, stationTitle) => {
    if (
      !window.confirm(
        `Deseja realmente remover a estação "${stationTitle}" e todos os seus itens?`
      )
    ) {
      return;
    }

    const previous = stations;
    setStations((prev) => prev.filter((s) => s.id !== stationId));

    try {
      await api.deleteStation(stationId);
      toast.success('Estação removida com sucesso.');
    } catch (err) {
      setStations(previous);
      toast.error(err.message || 'Erro ao excluir estação.');
    }
  };

  if (loading) {
    return <Spinner size="lg" label="Carregando estações da especialidade..." />;
  }

  if (!specialty) {
    return (
      <EmptyState
        title="Especialidade não encontrada"
        description="Não foi possível localizar esta especialidade."
        actionLabel="Voltar ao Dashboard"
        onAction={() => navigate('/')}
      />
    );
  }

  const skeletonSteps = String(specialty.skeleton || '')
    .split('→')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/skeletons?area=${specialty.slug}`}
            className="btn-secondary text-xs py-2.5 px-3.5"
          >
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Ver Esqueleto em Branco Completo</span>
          </Link>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Estação</span>
          </button>
        </div>
      </div>

      {/* Specialty Header + Skeleton Box */}
      <div className="card overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: specialty.color }}
        />
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs"
                style={{
                  backgroundColor: `${specialty.color}18`,
                  color: specialty.color,
                }}
              >
                <SpecialtyIcon name={specialty.icon} className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Especialidade Revalida • OSCE
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {specialty.name}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {specialty.description}
                </p>
              </div>
            </div>
          </div>

          {/* Highlighted Skeleton Box */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/40 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-800">
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>Esqueleto Mental da Especialidade (Sequência Esperada no OSCE)</span>
              </div>
              <Link
                to={`/skeletons?area=${specialty.slug}`}
                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 underline"
              >
                Abrir Guia de Estudo em Branco detalhado →
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {skeletonSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-indigo-200/80 px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                      style={{ backgroundColor: specialty.color }}
                    >
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                  {idx < skeletonSteps.length - 1 && (
                    <span className="text-indigo-400 font-bold text-sm">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total de Estações
            </p>
            <p className="mt-1.5 text-3xl font-extrabold text-slate-900">
              {stations.length}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {specialty.stations_attempted || 0} já praticadas por você
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tentativas na Área
            </p>
            <p className="mt-1.5 text-3xl font-extrabold text-slate-900">
              {specialty.total_attempts || 0}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Simulações registradas no histórico
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Média na Especialidade
            </p>
            <p className="mt-1.5 text-3xl font-extrabold text-slate-900">
              {specialty.avg_score != null ? `${specialty.avg_score}%` : '—'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Desempenho médio ponderado pelo PEP
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Stations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            Estações Clínicas ({stations.length})
          </h2>
        </div>

        {stations.length === 0 ? (
          <EmptyState
            title="Nenhuma estação cadastrada nesta especialidade"
            description="Crie sua primeira estação clínica personalizada com itens de checklist e Padrão Esperado de Procedimento."
            actionLabel="Criar Nova Estação"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {stations.map((st) => {
              const attempted = Number(st.attempt_count) > 0;
              return (
                <div
                  key={st.id}
                  className="card p-6 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={st.difficulty} />
                        {attempted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Praticada ({st.attempt_count}x)
                          </span>
                        )}
                        {st.avg_score != null && (
                          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            Média: {st.avg_score}%
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/station/${st.id}`}
                        className="block text-lg font-extrabold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {st.title}
                      </Link>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {st.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <ClipboardList className="h-4 w-4 text-slate-400" />
                          {st.item_count} itens no PEP ({st.max_score} pts)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Duração: {st.duration_min} min
                        </span>
                        {st.last_attempt_at && (
                          <span>
                            Última prática: {formatDate(st.last_attempt_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <Link
                        to={`/station/${st.id}`}
                        className="btn-secondary text-xs py-2 px-3.5"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Checklist</span>
                      </Link>

                      <Link
                        to={`/attempt/${st.id}`}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <Play className="h-4 w-4" />
                        <span>Praticar</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteStation(st.id, st.title)}
                        title="Excluir estação"
                        className="btn-ghost text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Nova Estação */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Nova Estação — ${specialty.name}`}
        subtitle="Cadastre o cenário clínico e os itens do Padrão Esperado de Procedimento (PEP)"
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-station-form"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Salvando...' : 'Criar Estação e Checklist'}
            </button>
          </>
        }
      >
        <form
          id="create-station-form"
          onSubmit={handleCreateStation}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Título da Estação Clínica *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cetoacidose Diabética na Emergência"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Dificuldade
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field"
                >
                  <option value="básico">Básico</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Minutos
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Descrição do Caso / Cenário de Porta *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os dados vitais, queixa principal e contexto do paciente simulado..."
              className="input-field"
            />
          </div>

          {/* Checklist Items Builder */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Itens do Checklist (PEP)
                </h4>
                <p className="text-xs text-slate-500">
                  Adicione as tarefas avaliadas e o Padrão Esperado de Procedimento detalhado
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDraftItem}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {draftItems.map((it, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-indigo-600 uppercase">
                      Item #{idx + 1}
                    </span>
                    {draftItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftItem(idx)}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Categoria
                      </label>
                      <select
                        value={it.category}
                        onChange={(e) =>
                          handleDraftItemChange(idx, 'category', e.target.value)
                        }
                        className="input-field py-2 text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Descrição da Ação *
                      </label>
                      <input
                        type="text"
                        required
                        value={it.description}
                        onChange={(e) =>
                          handleDraftItemChange(
                            idx,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Ex: Solicita ECG de 12 derivações em até 10 min"
                        className="input-field py-2 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Peso (pts)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        value={it.weight}
                        onChange={(e) =>
                          handleDraftItemChange(idx, 'weight', e.target.value)
                        }
                        className="input-field py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-blue-700">
                      Padrão Esperado de Procedimento (PEP - Critério Oficial) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={it.expected_standard}
                      onChange={(e) =>
                        handleDraftItemChange(
                          idx,
                          'expected_standard',
                          e.target.value
                        )
                      }
                      placeholder="Descreva exatamente o que o examinador espera que o candidato verbalize ou execute para receber pontuação máxima..."
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
