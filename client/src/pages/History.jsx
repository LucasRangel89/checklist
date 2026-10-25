import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Filter,
  Download,
  Upload,
  Eye,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  RotateCcw,
  FileJson,
  Play,
} from 'lucide-react';
import api from '../lib/api';
import {
  Spinner,
  SpecialtyIcon,
  StatusBadge,
  EmptyState,
  Modal,
  useToast,
  formatDateTime,
  formatDuration,
} from '../components/ui';

export default function History() {
  const toast = useToast();

  const [attempts, setAttempts] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [specialtyId, setSpecialtyId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Attempt Detail Modal
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [attemptsList, specsList] = await Promise.all([
        api.getAttempts({
          specialty_id: specialtyId || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        }),
        specialties.length === 0 ? api.getSpecialties() : Promise.resolve(specialties),
      ]);
      setAttempts(Array.isArray(attemptsList) ? attemptsList : []);
      if (specialties.length === 0 && Array.isArray(specsList)) {
        setSpecialties(specsList);
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar histórico de tentativas.');
    } finally {
      setLoading(false);
    }
  }, [specialtyId, fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearFilters = () => {
    setSpecialtyId('');
    setFromDate('');
    setToDate('');
  };

  const handleViewDetails = async (attemptId) => {
    try {
      setDetailLoading(true);
      const data = await api.getAttempt(attemptId);
      setDetailData(data);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar detalhes da tentativa.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (!window.confirm('Deseja realmente excluir esta tentativa do histórico?')) {
      return;
    }

    // Optimistic removal
    const previous = attempts;
    setAttempts((curr) => curr.filter((a) => a.id !== attemptId));

    try {
      await api.deleteAttempt(attemptId);
      toast.success('Tentativa excluída do histórico.');
    } catch (err) {
      setAttempts(previous);
      toast.error(err.message || 'Erro ao excluir tentativa.');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await api.exportAttempts();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `revalida-tracker-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Backup exportado com sucesso (${data.attempts?.length || 0} tentativas)!`
      );
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportJsonText(String(ev.target?.result || ''));
      toast.info(`Arquivo "${file.name}" carregado para importação.`);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      toast.error('Cole o conteúdo JSON ou selecione um arquivo .json.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(importJsonText);
    } catch {
      toast.error('JSON inválido. Verifique a formatação do arquivo.');
      return;
    }

    setImporting(true);
    try {
      const result = await api.importAttempts(parsed);
      toast.success(
        `Importação concluída: ${result.importedAttempts} tentativa(s) e ${result.importedItems} item(ns) restaurados!`
      );
      setImportModalOpen(false);
      setImportJsonText('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Erro ao importar arquivo de backup.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export/Import Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Histórico de Tentativas
          </h1>
          <p className="text-sm text-slate-500">
            Revise suas práticas anteriores, compare com o PEP ou exporte/importe seu backup
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>{exporting ? 'Exportando...' : 'Exportar JSON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="btn-primary"
          >
            <Upload className="h-4 w-4" />
            <span>Importar JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-5">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Filtrar Histórico</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Especialidade
            </label>
            <select
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as especialidades (7)</option>
              {specialties.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Data Inicial
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Data Final
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-secondary w-full"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      {loading ? (
        <Spinner size="lg" label="Carregando histórico de práticas..." />
      ) : attempts.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nenhuma tentativa encontrada"
          description="Não há simulações registradas para os filtros selecionados. Que tal praticar uma estação agora?"
          actionLabel="Limpar Filtros"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => {
            const pct = Number(att.percentage) || 0;
            const badgeColor =
              pct >= 80
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : pct >= 60
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-rose-100 text-rose-800 border-rose-200';

            return (
              <div
                key={att.id}
                className="card p-5 hover:border-indigo-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: `${att.specialty_color}18`,
                          color: att.specialty_color,
                        }}
                      >
                        <SpecialtyIcon
                          name={att.specialty_icon}
                          className="h-3.5 w-3.5"
                        />
                        {att.specialty_name}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-extrabold ${badgeColor}`}
                      >
                        {pct}% ({att.total_score}/{att.max_score} pts)
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(att.performed_at)}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(att.duration_sec)}
                      </span>
                    </div>

                    <Link
                      to={`/station/${att.station_id}`}
                      className="block text-base sm:text-lg font-extrabold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {att.station_title}
                    </Link>

                    {att.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        {att.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold pt-0.5">
                      <span className="text-emerald-700">
                        ✓ {att.ok_count} Adequado
                      </span>
                      <span className="text-amber-700">
                        ◐ {att.parcial_count} Parcial
                      </span>
                      <span className="text-rose-700">
                        ✕ {att.erro_count} Erro
                      </span>
                      <span className="text-slate-500">
                        ○ {att.omitido_count} Omitido
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(att.id)}
                      disabled={detailLoading}
                      className="btn-secondary text-xs py-2 px-3.5"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Detalhes</span>
                    </button>

                    <Link
                      to={`/attempt/${att.station_id}`}
                      className="btn-primary text-xs py-2 px-3.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Refazer</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteAttempt(att.id)}
                      title="Excluir tentativa"
                      className="btn-ghost p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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

      {/* Modal: Attempt Details */}
      <Modal
        open={!!detailData}
        onClose={() => setDetailData(null)}
        title={
          detailData?.attempt
            ? `${detailData.attempt.station_title} (${detailData.attempt.percentage}%)`
            : 'Detalhes da Tentativa'
        }
        subtitle={
          detailData?.attempt
            ? `${detailData.attempt.specialty_name} • ${formatDateTime(
                detailData.attempt.performed_at
              )} • Tempo: ${formatDuration(
                detailData.attempt.duration_sec
              )} • Score: ${detailData.attempt.total_score}/${
                detailData.attempt.max_score
              } pts`
            : ''
        }
        maxWidth="max-w-3xl"
        footer={
          <button
            type="button"
            onClick={() => setDetailData(null)}
            className="btn-primary"
          >
            Fechar
          </button>
        }
      >
        {detailData && (
          <div className="space-y-4">
            {detailData.attempt.notes && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                <strong className="block font-bold text-slate-900 mb-1">
                  Observações Gerais da Tentativa:
                </strong>
                {detailData.attempt.notes}
              </div>
            )}

            <div className="space-y-3">
              {detailData.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-indigo-600 uppercase">
                      Item #{idx + 1} • {item.category} (Peso: {item.weight} pts)
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {item.description}
                  </p>

                  <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-950">
                    <div className="flex items-center gap-1.5 font-extrabold text-blue-800 mb-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Padrão Esperado de Procedimento (PEP):</span>
                    </div>
                    <p className="leading-relaxed">{item.expected_standard}</p>
                  </div>

                  {item.notes && (
                    <div className="rounded-lg bg-amber-50/70 border border-amber-200/70 px-3 py-2 text-xs text-amber-900">
                      <strong>Sua observação neste item:</strong> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Import JSON */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importar Backup de Tentativas (JSON)"
        subtitle="Faça upload de um arquivo exportado anteriormente ou cole o JSON abaixo"
        footer={
          <>
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="import-json-form"
              disabled={importing}
              className="btn-primary"
            >
              {importing ? 'Importando...' : 'Restaurar Tentativas'}
            </button>
          </>
        }
      >
        <form
          id="import-json-form"
          onSubmit={handleImportSubmit}
          className="space-y-4"
        >
          <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center">
            <FileJson className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
            <label className="cursor-pointer text-xs font-bold text-indigo-700 hover:underline">
              <span>Selecionar arquivo .json do computador</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="mt-1 text-[11px] text-slate-500">
              Estações inexistentes serão ignoradas automaticamente e os IDs serão remapeados.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Conteúdo JSON
            </label>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"version": "1.0.0", "attempts": [...], "items": [...]}'
              className="input-field font-mono text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
