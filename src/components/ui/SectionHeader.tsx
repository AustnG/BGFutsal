import React from 'react';

interface SectionHeaderProps {
  title: string;
  kicker?: string;
  countLabel?: string;
  accent?: 'green' | 'blue' | 'amber' | 'leader';
  rightSlot?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  kicker,
  countLabel,
  accent = 'green',
  rightSlot,
}) => {
  const accentClass =
    accent === 'leader'
      ? 'accent-rule-gradient'
      : accent === 'amber'
      ? 'bg-[var(--color-status-amber)]'
      : accent === 'blue'
      ? 'bg-[var(--color-brand-blue)]'
      : 'bg-[var(--color-brand-green)]';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--color-border-hairline)]">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-1 h-4 rounded-xs shrink-0 ${accentClass}`} />
        <div className="min-w-0">
          {kicker && (
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)] block leading-none mb-1">
              {kicker}
            </span>
          )}
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-ink)] tracking-[-0.015em] leading-tight">
              {title}
            </h2>
            {countLabel && (
              <span className="font-mono text-[11px] text-[var(--color-ink-subtle)] tabular-nums">
                {countLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {rightSlot && <div className="shrink-0 self-start sm:self-auto">{rightSlot}</div>}
    </div>
  );
};
