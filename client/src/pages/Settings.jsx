import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Download,
  Upload,
  LogOut,
  Save,
  ShieldCheck,
  Database,
  FileJson,
  WifiOff,
  Wifi,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import api, {
  getConnectionState,
  subscribeConnectionStatus,
  setForceOffline,
  resetOfflineDb,
} from '../lib/api';
import {
  Modal,
  Alert,
  useToast,
  formatDate,
} from '../components/ui';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
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
    if (!name.trim() || !email.trim()) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleOfflineMode = () => {
    const next = !connState.forcedOffline;
    setForceOffline(next);
    setConnState(getConnectionState());
    if (next) {
      toast.info(
        'Modo 100% Offline ativado! O app está operando sem depender de internet ou servidor.'
      );
    } else {
      toast.success('Modo Online ativado.');
    }
  };

  const handleResetOfflineData = () => {
    if (
      !window.confirm(
        'Deseja restaurar o banco de dados local (Offline) para as 7 especialidades, 16 estações e 8 tentativas de demonstração?'
      )
    ) {
      return;
    }
    resetOfflineDb();
    setConnState(getConnectionState());
    toast.success('Banco de dados offline restaurado para o padrão inicial!');
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
          Configurações da Conta e Modo Offline
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie seus dados de perfil, modo de operação 100% offline (PWA) e backups JSON
        </p>
      </div>

      {/* Offline Mode & Local Database Card */}
      <div className="card p-6 sm:p-8 space-y-5 border-indigo-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                connState.online
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {connState.online ? (
                <Wifi className="h-6 w-6" />
              ) : (
                <WifiOff className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Modo de Operação Offline (PWA Autônomo)
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                O Revalida Tracker possui um banco de dados completo embutido no navegador. Você pode praticar estações, criar checklists e analisar gráficos mesmo <strong>sem internet (Modo Avião)</strong> ou sem servidor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleOfflineMode}
            className={connState.online ? 'btn-secondary shrink-0' : 'btn-primary shrink-0'}
          >
            {connState.online ? (
              <>
                <WifiOff className="h-4 w-4 text-amber-600" />
                <span>Ativar Modo 100% Offline</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4" />
                <span>Voltar ao Modo Online</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-slate-900">
              {connState.stats?.specialties || 7}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Especialidades Salvas
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center">
            <span className="block text-xl font-extrabold text-slate-900">
              {connState.stats?.stations || 16}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Estações Offline
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
              Tentativas Locais
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            Status atual:{' '}
            <strong className="text-slate-800">
              {connState.online
                ? 'Conectado (com espelhamento offline automático)'
                : 'Operando 100% Offline no dispositivo'}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleResetOfflineData}
            className="btn-ghost text-xs text-slate-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Dados Demo Locais</span>
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-slate-100 pb-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/20">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Candidato Revalida • OSCE</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {user?.name}
            </h2>
            <p className="text-sm text-slate-500">
              {user?.email} • Conta criada em {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Nome de Exibição
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
            >
              <Save className="h-4 w-4" />
              <span>{savingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup Export / Import Section */}
      <div className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Backup e Portabilidade de Dados (JSON)
            </h2>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Exporte todo o seu histórico de tentativas e itens avaliados em um arquivo JSON estruturado, ou restaure um backup anterior em qualquer dispositivo (funciona online e offline).
            </p>
          </div>
        </div>

        <Alert variant="info" title="Mapeamento Inteligente de IDs">
          Durante a importação, o sistema faz o mapeamento automático{' '}
          <code className="font-mono font-bold">old_id → new_id</code> das tentativas, recalcula os pesos conforme o PEP e ignora estações inexistentes com segurança.
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

      {/* Session / Logout Section */}
      <div className="card border-rose-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Encerrar Sessão
          </h2>
          <p className="text-sm text-slate-500">
            Desconectar sua conta deste navegador. Seus dados permanecem salvos localmente.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="btn-danger shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Conta</span>
        </button>
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
