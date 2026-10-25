import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui';

export default function Login() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@revalida.app');
  const [password, setPassword] = useState('demo1234');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleToggleMode = (targetMode) => {
    setMode(targetMode);
    if (targetMode === 'login' && !email) {
      setEmail('demo@revalida.app');
      setPassword('demo1234');
    } else if (targetMode === 'register' && email === 'demo@revalida.app') {
      setEmail('');
      setPassword('');
    }
  };

  const handleFillDemo = () => {
    setMode('login');
    setEmail('demo@revalida.app');
    setPassword('demo1234');
    toast.info('Credenciais de demonstração preenchidas!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        toast.success(`Bem-vindo(a) de volta, ${user.name}!`);
      } else {
        if (!name.trim()) {
          toast.error('Por favor, informe seu nome completo.');
          setSubmitting(false);
          return;
        }
        const user = await register(name, email, password);
        toast.success(`Conta criada com sucesso! Olá, ${user.name}.`);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  };

  const FEATURES = [
    {
      icon: ClipboardCheck,
      title: 'Padrão Esperado de Procedimento (PEP)',
      desc: 'Compare cada conduta com o critério oficial do INEP e avalie como Adequado, Parcial, Erro ou Omitido.',
    },
    {
      icon: Stethoscope,
      title: '7 Especialidades com Esqueleto OSCE',
      desc: 'Roteiros estruturados para Clínica Médica, Cirurgia, GO, Pediatria, MFC, Saúde Mental e Urgência.',
    },
    {
      icon: TrendingUp,
      title: 'Rastreamento de Erros Recorrentes',
      desc: 'Identifique lacunas por categoria clínica, acompanhe sua evolução em gráficos de 60 dias e exporte backups.',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Panel: Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-xl font-extrabold tracking-tight">
              Revalida Tracker
            </span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-indigo-200">
              Treinamento de Habilidades Clínicas • OSCE
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl space-y-8 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Preparação Prática 2ª Etapa Revalida / INEP</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Domine o checklist do{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-indigo-100">
              Padrão Esperado de Procedimento
            </span>
          </h1>

          <p className="text-base leading-relaxed text-indigo-100/90">
            Pratique estações clínicas cronometradas, corrija seu desempenho item a item com pesos reais e descubra exatamente quais condutas precisam de reforço antes da prova prática.
          </p>

          <div className="space-y-4 pt-2">
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/30 text-sky-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{f.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-indigo-100/80">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-indigo-200">
          <span>7 Especialidades Obrigatórias do Revalida</span>
          <span>100% Alinhado ao Formato OSCE</span>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex w-full lg:w-1/2 xl:w-5/12 flex-col justify-center px-6 py-12 sm:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Revalida Tracker
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Preparação OSCE • INEP
              </p>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            {/* Mode Toggle */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('register')}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {mode === 'login'
                  ? 'Acesse seu painel clínico'
                  : 'Comece sua preparação OSCE'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === 'login'
                  ? 'Use a conta de demonstração pré-preenchida ou entre com suas credenciais.'
                  : 'Cadastre-se gratuitamente para registrar suas estações e acompanhar sua evolução.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Nome Completo
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
              )}

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
                    placeholder="seu@email.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm mt-2"
              >
                <span>
                  {submitting
                    ? 'Autenticando...'
                    : mode === 'login'
                    ? 'Entrar no Revalida Tracker'
                    : 'Criar Conta e Acessar'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Demo Account Banner */}
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Credenciais Demo (Dra. Ana Beatriz)</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Preencher
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono bg-white/80 rounded-lg p-2 border border-indigo-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">E-mail:</span>
                  demo@revalida.app
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Senha:</span>
                  demo1234
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
