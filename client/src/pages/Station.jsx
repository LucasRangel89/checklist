import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Plus,
  Edit3,
  Trash2,
  ClipboardList,
  Clock,
  Award,
  BookOpen,
  History,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import api from '../lib/api';
import {
  Spinner,
  SpecialtyIcon,
  DifficultyBadge,
  Badge,
  StatusBadge,
  EmptyState,
  Modal,
  useToast,
  formatDateTime,
  formatDuration,
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

export default function Station() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [station, setStation] = useState(null);
  const [items, setItems] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Item Add/Edit Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemCategory, setItemCategory] = useState('Avaliação');
  const [itemDescription, setItemDescription] = useState('');
  const [itemExpectedStandard, setItemExpectedStandard] = useState('');
  const [itemWeight, setItemWeight] = useState(1.0);
  const [savingItem, setSavingItem] = useState(false);

  // Station Metadata Edit Modal
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('intermediário');
  const [editDuration, setEditDuration] = useState(10);
  const [savingStation, setSavingStation] = useState(false);

  // Attempt Detail Modal
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetailsLoading, setAttemptDetailsLoading] = useState(false);

  const loadStation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getStation(id);
      setStation(data.station);
      setItems(Array.isArray(data.items) ? data.items : []);
      setRecentAttempts(
        Array.isArray(data.recentAttempts) ? data.recentAttempts : []
      );
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar estação clínica.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStation();
  }, [loadStation]);

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemCategory('Conduta');
    setItemDescription('');
    setItemExpectedStandard('');
    setItemWeight(1.0);
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setItemCategory(item.category || 'Avaliação');
    setItemDescription(item.description || '');
    setItemExpectedStandard(item.expected_standard || '');
    setItemWeight(item.weight || 1.0);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemDescription.trim() || !itemExpectedStandard.trim()) {
      toast.error('Preencha a descrição e o Padrão Esperado de Procedimento.');
      return;
    }

    setSavingItem(true);
    try {
      const payload = {
        category: itemCategory,
        description: itemDescription.trim(),
        expected_standard: itemExpectedStandard.trim(),
        weight: Number(itemWeight) || 1.0,
      };

      if (editingItem) {
        await api.updateChecklistItem(station.id, editingItem.id, payload);
        toast.success('Item do checklist atualizado!');
      } else {
        await api.addChecklistItem(station.id, payload);
        toast.success('Novo item adicionado ao checklist!');
      }

      setItemModalOpen(false);
      loadStation();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar item.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Remover o item "${item.description}" do checklist?`)) {
      return;
    }

    const prev = items;
    setItems((curr) => curr.filter((i) => i.id !== item.id));

    try {
      await api.deleteChecklistItem(station.id, item.id);
      toast.success('Item removido do checklist.');
    } catch (err) {
      setItems(prev);
      toast.error(err.message || 'Erro ao excluir item.');
    }
  };

  const openEditStationModal = () => {
    if (!station) return;
    setEditTitle(station.title);
    setEditDesc(station.description);
    setEditDifficulty(station.difficulty);
    setEditDuration(station.duration_min);
    setStationModalOpen(true);
  };

  const handleSaveStation = async (e) => {
    e.preventDefault();
    setSavingStation(true);
    try {
      const updated = await api.updateStation(station.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        difficulty: editDifficulty,
        duration_min: Number(editDuration) || 10,
      });
      setStation(updated.station);
      setStationModalOpen(false);
      toast.success('Dados da estação atualizados!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar estação.');
    } finally {
      setSavingStation(false);
    }
  };

  const handleInspectAttempt = async (attemptId) => {
    try {
      setAttemptDetailsLoading(true);
      const data = await api.getAttempt(attemptId);
      setSelectedAttempt(data);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar detalhes da tentativa.');
    } finally {
      setAttemptDetailsLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" label="Carregando checklist e Padrão Esperado..." />;
  }

  if (!station) {
    return (
      <EmptyState
        title="Estação não encontrada"
        description="Esta estação pode ter sido removida."
        actionLabel="Voltar ao Dashboard"
        onAction={() => navigate('/')}
      />
    );
  }

  const maxPoints =
    Math.round(
      items.reduce((sum, it) => sum + (Number(it.weight) || 1.0), 0) * 100
    ) / 100;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/specialty/${station.specialty_slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para {station.specialty_name}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openEditStationModal}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Edit3 className="h-4 w-4" />
            <span>Editar Estação</span>
          </button>

          <button
            type="button"
            onClick={openAddItemModal}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Item no PEP</span>
          </button>

          <Link to={`/attempt/${station.id}`} className="btn-primary">
            <Play className="h-4 w-4" />
            <span>Praticar Estação Agora</span>
          </Link>
        </div>
      </div>

      {/* Station Header Card */}
      <div className="card overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: station.specialty_color }}
        />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: `${station.specialty_color}18`,
                color: station.specialty_color,
              }}
            >
              <SpecialtyIcon name={station.specialty_icon} className="h-3.5 w-3.5" />
              {station.specialty_name}
            </span>
            <DifficultyBadge difficulty={station.difficulty} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {station.title}
          </h1>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cenário Clínico / Instruções ao Candidato:
            </span>
            <p className="text-sm leading-relaxed text-slate-700">
              {station.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itens do Checklist
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {items.length}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Etapas avaliadas no PEP
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Duração da Estação
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {station.duration_min} min
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Tempo padrão OSCE / INEP
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pontuação Máxima
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {maxPoints} pts
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Soma dos pesos dos itens
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Checklist Items with Expected Standard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Padrão Esperado de Procedimento (PEP)
            </h2>
            <p className="text-sm text-slate-500">
              Critérios oficiais de avaliação da estação ({items.length} itens)
            </p>
          </div>
          <button
            type="button"
            onClick={openAddItemModal}
            className="btn-secondary text-xs py-2 px-3"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Item</span>
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Nenhum item cadastrado nesta estação"
            description="Adicione itens ao checklist com seu respectivo Padrão Esperado de Procedimento para poder praticar."
            actionLabel="Adicionar Primeiro Item"
            onAction={openAddItemModal}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="card p-5 sm:p-6 space-y-4 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-extrabold text-white shadow-xs">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="indigo">{item.category}</Badge>
                        <Badge variant="slate">Peso: {item.weight} pts</Badge>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.description}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(item)}
                      className="btn-ghost p-2 text-slate-400 hover:text-indigo-600"
                      title="Editar item"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="btn-ghost p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Highlighted Blue Box: Padrão Esperado de Procedimento */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-800 mb-1.5">
                    <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Padrão Esperado de Procedimento (PEP)</span>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-950">
                    {item.expected_standard}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attempts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">
              Tentativas Recentes nesta Estação ({recentAttempts.length})
            </h2>
          </div>
          {recentAttempts.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Ver todo o histórico →
            </Link>
          )}
        </div>

        {recentAttempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Você ainda não praticou esta estação.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Inicie uma prática cronometrada e marque cada item comparando com o PEP.
            </p>
            <Link
              to={`/attempt/${station.id}`}
              className="btn-primary mt-4 inline-flex"
            >
              <Play className="h-4 w-4" />
              <span>Iniciar Primeira Tentativa</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="card p-4 flex items-center justify-between gap-4 hover:border-indigo-200"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                        att.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.percentage >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.percentage}% ({att.total_score}/{att.max_score} pts)
                    </span>
                    <span className="text-xs text-slate-500">
                      ⏱ {formatDuration(att.duration_sec)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Realizada em {formatDateTime(att.performed_at)}
                  </p>
                  {att.notes && (
                    <p className="text-xs text-slate-500 truncate">{att.notes}</p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] font-semibold pt-1">
                    <span className="text-emerald-600">{att.ok_count} OK</span>
                    <span>•</span>
                    <span className="text-amber-600">
                      {att.parcial_count} Parcial
                    </span>
                    <span>•</span>
                    <span className="text-rose-600">{att.erro_count} Erro</span>
                    <span>•</span>
                    <span className="text-slate-500">
                      {att.omitido_count} Omitido
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInspectAttempt(att.id)}
                  disabled={attemptDetailsLoading}
                  className="btn-secondary text-xs py-2 px-3 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Detalhes</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Checklist Item */}
      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={
          editingItem
            ? 'Editar Item do Checklist'
            : 'Adicionar Item ao Checklist'
        }
        subtitle={station.title}
        footer={
          <>
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="item-form"
              disabled={savingItem}
              className="btn-primary"
            >
              {savingItem ? 'Salvando...' : 'Salvar Item'}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Categoria Clínica
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Peso na Estação (pontos)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                required
                value={itemWeight}
                onChange={(e) => setItemWeight(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Descrição do Item Avaliado *
            </label>
            <input
              type="text"
              required
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Ex: Prescreve dupla antiagregação plaquetária e anticoagulação"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-700">
              Padrão Esperado de Procedimento (PEP) *
            </label>
            <textarea
              rows={4}
              required
              value={itemExpectedStandard}
              onChange={(e) => setItemExpectedStandard(e.target.value)}
              placeholder="Descreva em detalhes os critérios esperados pelo INEP para considerar o item Adequado (OK)..."
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Station Metadata */}
      <Modal
        open={stationModalOpen}
        onClose={() => setStationModalOpen(false)}
        title="Editar Metadados da Estação"
        footer={
          <>
            <button
              type="button"
              onClick={() => setStationModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="station-meta-form"
              disabled={savingStation}
              className="btn-primary"
            >
              {savingStation ? 'Salvando...' : 'Atualizar Estação'}
            </button>
          </>
        }
      >
        <form
          id="station-meta-form"
          onSubmit={handleSaveStation}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Título da Estação
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Dificuldade
              </label>
              <select
                value={editDifficulty}
                onChange={(e) => setEditDifficulty(e.target.value)}
                className="input-field"
              >
                <option value="básico">Básico</option>
                <option value="intermediário">Intermediário</option>
                <option value="avançado">Avançado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Duração (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Descrição / Caso Clínico
            </label>
            <textarea
              rows={4}
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Attempt Details */}
      <Modal
        open={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        title={`Revisão da Tentativa — ${selectedAttempt?.attempt?.percentage || 0}%`}
        subtitle={
          selectedAttempt?.attempt
            ? `Realizada em ${formatDateTime(
                selectedAttempt.attempt.performed_at
              )} • Duração: ${formatDuration(
                selectedAttempt.attempt.duration_sec
              )}`
            : ''
        }
        maxWidth="max-w-3xl"
        footer={
          <button
            type="button"
            onClick={() => setSelectedAttempt(null)}
            className="btn-primary"
          >
            Fechar Revisão
          </button>
        }
      >
        {selectedAttempt && (
          <div className="space-y-4">
            {selectedAttempt.attempt.notes && (
              <div className="rounded-xl bg-slate-100 p-3.5 text-xs text-slate-700">
                <strong className="block text-slate-900 mb-0.5">
                  Observações gerais da tentativa:
                </strong>
                {selectedAttempt.attempt.notes}
              </div>
            )}

            <div className="space-y-3">
              {selectedAttempt.items.map((it, i) => (
                <div
                  key={it.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      #{i + 1} • {it.category} (Peso {it.weight})
                    </span>
                    <StatusBadge status={it.status} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {it.description}
                  </p>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5 text-xs text-blue-950">
                    <strong className="block text-blue-800 mb-0.5">
                      Padrão Esperado (PEP):
                    </strong>
                    {it.expected_standard}
                  </div>
                  {it.notes && (
                    <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg">
                      Nota: {it.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
