import React, { useState, useEffect } from 'react';
import {
  User,
  Download,
  Upload,
  Save,
  ShieldCheck,
  Database,
  FileJson,
  HardDrive,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import api, {
  getConnectionState,
  subscribeConnectionStatus,
  resetOfflineDb,
} from '../lib/api';
import {
  Modal,
  Alert,
  useToast,
} from '../components/ui';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || 'Dra. Ana Beatriz');
  const [savingProfile, setSavingProfile] = useState(false);

  const [connState, setConnState] = useState(() => getConnectionState());

  useEffect(() => {
    return subscribeConnectionStatus((st) => setConnState(st));
  }, []);

  // Backup Export / Import state
  const [exporting, setExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  const initials = (user?.name || 'MD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Informe seu nome para exibição no painel.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Nome atualizado com sucesso no dispositivo!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar nome.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetOfflineData = () => {
    if (
      !window.confirm(
        'Deseja restaurar o banco de dados local deste dispositivo para as 7 especialidades, 16 estações e 8 tentativas de demonstração?'
      )
    ) {
      return;
    }
    resetOfflineDb();
    setConnState(getConnectionState());
    toast.success('Banco de dados local restaurado para o padrão inicial!');
  };

  const handleExportBackup = async () => {
    try {
      setExporting(true);
      const data = await api.exportAttempts();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
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
        `Backup exportado (${data.attempts?.length || 0} tentativas)!`
      );
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar backup.');
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
      toast.info(`Arquivo "${file.name}" carregado.`);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      toast.error('Selecione um arquivo JSON ou cole o conteúdo.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(importJsonText);
    } catch {
      toast.error('Formato JSON inválido.');
      return;
    }

    setImporting(true);
    try {
      const res = await api.importAttempts(parsed);
      setConnState(getConnectionState());
      toast.success(
        `Backup restaurado: ${res.importedAttempts} tentativa(s) e ${res.importedItems} item(ns)!`
      );
      setImportModalOpen(false);
      setImportJsonText('');
    } catch (err) {
      toast.error(err.message || 'Erro ao importar backup.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Backup, Dados Locais e Ajustes
        </h1>
        <p className="text-sm text-slate-500">
          Seus dados ficam salvos diretamente neste dispositivo (100% offline) e podem ser exportados ou importados via arquivo JSON
        </p>
      </div>

      {/* Backup Export / Import Section */}
      <div className="card p-6 sm:p-8 space-y-5 border-indigo-200/80">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Exportar e Importar Backup (.json)
            </h2>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Transfira seu progresso entre celular, tablet e computador sem precisar de login ou nuvem: basta exportar o arquivo JSON e importar em outro aparelho.
            </p>
          </div>
        </div>

        <Alert variant="info" title="Portabilidade Total Sem Login">
          Durante a importação, o sistema faz o mapeamento automático{' '}
          <code className="font-mono font-bold">old_id → new_id</code> das tentativas, recalcula os pesos conforme o PEP e preserva todas as suas anotações.
        </Alert>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={exporting}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>
              {exporting ? 'Gerando JSON...' : 'Exportar Backup (.json)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="btn-primary"
          >
            <Upload className="h-4 w-4" />
            <span>Importar Backup (.json)</span>
          </button>
        </div>
      </div>

      {/* Local Storage Summary Card */}
      <div className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Armazenamento Local no Dispositivo (Offline)
            </h2>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Todas as 7 especialidades, estações clínicas, itens do PEP e tentativas estão gravados localmente no navegador deste aparelho.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-slate-900">
              {connState.stats?.specialties || 7}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Especialidades
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-slate-900">
              {connState.stats?.stations || 16}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Estações Salvas
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-slate-900">
              {connState.stats?.checklistItems || 83}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Itens do PEP
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-indigo-600">
              {connState.stats?.attempts || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Tentativas Registradas
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            Deseja voltar o banco local para os exemplos de fábrica?
          </span>
          <button
            type="button"
            onClick={handleResetOfflineData}
            className="btn-ghost text-xs text-slate-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Dados Demo de Fábrica</span>
          </button>
        </div>
      </div>

      {/* Student Name Customization */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-xl font-extrabold text-white shadow-md">
            {initials}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Acesso Livre • Sem Senha</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Personalizar Nome no Painel
            </h2>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Seu Nome / Como prefere ser chamado(a)
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dr. Lucas Rangel"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary shrink-0 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            <span>{savingProfile ? 'Salvando...' : 'Salvar Nome'}</span>
          </button>
        </form>
      </div>

      {/* Modal: Import Backup */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Restaurar Backup de Tentativas"
        subtitle="Selecione um arquivo .json exportado pelo Revalida Tracker ou cole o conteúdo abaixo"
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
              form="settings-import-form"
              disabled={importing}
              className="btn-primary"
            >
              {importing ? 'Importando...' : 'Importar Agora'}
            </button>
          </>
        }
      >
        <form
          id="settings-import-form"
          onSubmit={handleImportSubmit}
          className="space-y-4"
        >
          <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center">
            <FileJson className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
            <label className="cursor-pointer text-xs font-bold text-indigo-700 hover:underline">
              <span>Escolher arquivo .json do dispositivo</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              JSON de Backup
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
