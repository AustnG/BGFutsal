import React from 'react';

interface StatReadoutProps {
  label: string;
  value: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  surface?: 'light' | 'dark';
  accent?: 'none' | 'leader' | 'green' | 'blue';
}

export const StatReadout: React.FC<StatReadoutProps> = ({
  label,
  value,
  sublabel,
  badge,
  icon,
  surface = 'light',
  accent = 'none',
}) => {
  const isDark = surface === 'dark';

  const containerClass = isDark
    ? 'bg-[var(--color-pitch-ink)] border-[var(--color-border-dark)] text-white'
    : 'bg-[var(--color-surface)] border-[var(--color-border-hairline)] text-[var(--color-ink)]';

  const labelClass = isDark
    ? 'text-slate-400'
    : 'text-[var(--color-ink-subtle)]';

  const sublabelClass = isDark
    ? 'text-slate-300'
    : 'text-[var(--color-ink-muted)]';

  const iconBoxClass = isDark
    ? 'bg-[var(--color-pitch-surface)] border-[var(--color-border-dark)] text-emerald-400'
    : accent === 'blue'
    ? 'bg-blue-50 border-blue-200/80 text-[var(--color-brand-blue)]'
    : 'bg-emerald-50 border-emerald-200/80 text-[var(--color-brand-green)]';

  return (
    <div className={`relative overflow-hidden rounded-lg border ${containerClass}`}>
      {accent === 'leader' && <div className="h-[2px] w-full accent-rule-gradient" />}
      {accent === 'green' && <div className="h-[2px] w-full bg-[var(--color-brand-green)]" />}
      {accent === 'blue' && <div className="h-[2px] w-full bg-[var(--color-brand-blue)]" />}

      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${labelClass}`}
          >
            {label}
          </span>
          {icon && (
            <div
              className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${iconBoxClass}`}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-base sm:text-lg font-bold tracking-[-0.015em] leading-snug font-sans tabular-nums">
            {value}
          </div>

          {sublabel && (
            <p className={`text-xs leading-relaxed ${sublabelClass}`}>{sublabel}</p>
          )}
        </div>

        {badge && (
          <div className="pt-0.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-semibold tabular-nums border ${
                isDark
                  ? 'bg-[var(--color-pitch-surface)] border-[var(--color-border-dark)] text-emerald-300'
                  : 'bg-[var(--color-surface-muted)] border-[var(--color-border-hairline)] text-[var(--color-ink)]'
              }`}
            >
              {badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
