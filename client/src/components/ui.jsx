import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Stethoscope,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  Siren,
  ClipboardList,
  MinusCircle,
} from 'lucide-react';

// Specialty Icon mapper
const ICON_MAP = {
  Stethoscope,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  Siren,
};

export function SpecialtyIcon({ name, className = 'w-5 h-5', style }) {
  const IconComp = ICON_MAP[name] || Stethoscope;
  return <IconComp className={className} style={style} />;
}

// Status configuration for OSCE checklist evaluation
export const STATUS_CONFIG = {
  ok: {
    key: 'ok',
    label: 'Adequado (OK)',
    shortLabel: 'OK (100%)',
    multiplier: 1.0,
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  parcial: {
    key: 'parcial',
    label: 'Parcialmente Adequado',
    shortLabel: 'Parcial (50%)',
    multiplier: 0.5,
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    activeBg: 'bg-amber-500 text-white border-amber-500 shadow-sm',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  erro: {
    key: 'erro',
    label: 'Inadequado (Erro)',
    shortLabel: 'Erro (0%)',
    multiplier: 0.0,
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    activeBg: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
  omitido: {
    key: 'omitido',
    label: 'Não Realizado (Omitido)',
    shortLabel: 'Omitido (0%)',
    multiplier: 0.0,
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    activeBg: 'bg-slate-700 text-white border-slate-700 shadow-sm',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: MinusCircle,
  },
};

export function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function getScoreVariant(pct) {
  const num = Number(pct) || 0;
  if (num >= 80) return 'emerald';
  if (num >= 60) return 'amber';
  return 'rose';
}

// Spinner
export function Spinner({ size = 'md', label = 'Carregando dados...' }) {
  const sizeClass =
    size === 'sm'
      ? 'w-4 h-4'
      : size === 'lg'
      ? 'w-9 h-9'
      : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <Loader2 className={`${sizeClass} animate-spin text-indigo-600`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
}

// Badge
export function Badge({ children, variant = 'slate', className = '', style }) {
  const variants = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        variants[variant] || variants.slate
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  const norm = String(difficulty || 'intermediário').toLowerCase();
  if (norm.includes('básic') || norm.includes('basic')) {
    return <Badge variant="emerald">Básico</Badge>;
  }
  if (norm.includes('avançad') || norm.includes('avancad')) {
    return <Badge variant="rose">Avançado</Badge>;
  }
  return <Badge variant="amber">Intermediário</Badge>;
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.omitido;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.shortLabel}
    </span>
  );
}

// Alert
export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  onClose,
}) {
  const styles = {
    info: {
      box: 'bg-blue-50/90 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      box: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    warning: {
      box: 'bg-amber-50/90 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    error: {
      box: 'bg-rose-50/90 border-rose-200 text-rose-900',
      icon: XCircle,
      iconColor: 'text-rose-600',
    },
  };

  const st = styles[variant] || styles.info;
  const Icon = st.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${st.box} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${st.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// EmptyState
export function EmptyState({
  icon: Icon = ClipboardList,
  title = 'Nenhum registro encontrado',
  description = 'Não há itens para exibir no momento.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary mt-5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Modal
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Toast system
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, variant = 'success', duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            variant={t.variant}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toast({ message, variant = 'success', onClose }) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-950 text-white',
    error: 'border-rose-200 bg-rose-950 text-white',
    info: 'border-indigo-200 bg-slate-900 text-white',
    warning: 'border-amber-200 bg-amber-950 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl animate-slide-in ${
        styles[variant] || styles.info
      }`}
    >
      {icons[variant] || icons.info}
      <span className="flex-1 leading-snug">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return ctx;
}
