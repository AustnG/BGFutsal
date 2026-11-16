import React from 'react';
import { Star } from 'lucide-react';

export interface MatchTeamSide {
  name: string;
  color?: string;
  seed?: number;
  score?: number | null;
  pk?: number | null;
  isWinner?: boolean;
  isLoser?: boolean;
  isStarred?: boolean;
}

export interface MatchTickerCardProps {
  metaLeft: string;
  metaRight?: string;
  statusLabel?: string;
  statusTone?: 'final' | 'forfeit' | 'upcoming' | 'pk' | 'muted';
  home: MatchTeamSide;
  away: MatchTeamSide;
  isStarredMatch?: boolean;
  variant?: 'default' | 'compact' | 'championship';
  footerSlot?: React.ReactNode;
}

export const MatchTickerCard: React.FC<MatchTickerCardProps> = ({
  metaLeft,
  metaRight,
  statusLabel,
  statusTone = 'muted',
  home,
  away,
  isStarredMatch = false,
  variant = 'default',
  footerSlot,
}) => {
  const isChamp = variant === 'championship';
  const isCompact = variant === 'compact';

  const cardSurface = isChamp
    ? 'bg-[var(--color-pitch-ink)] border-[var(--color-border-dark)] text-white'
    : isStarredMatch
    ? 'bg-emerald-50/40 border-emerald-500 text-[var(--color-ink)]'
    : 'bg-[var(--color-surface)] border-[var(--color-border-hairline)] hover:border-[var(--color-border-strong)] text-[var(--color-ink)]';

  const statusToneClass = isChamp
    ? 'text-emerald-400 border-[var(--color-border-dark)] bg-[var(--color-pitch-surface)]'
    : statusTone === 'forfeit'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : statusTone === 'pk'
    ? 'text-amber-800 bg-amber-50 border-amber-200'
    : statusTone === 'upcoming'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : statusTone === 'final'
    ? 'text-slate-600 bg-slate-100 border-slate-200'
    : 'text-slate-500 bg-slate-100 border-slate-200';

  const renderTeamRow = (side: MatchTeamSide) => {
    const hasScore = side.score !== null && side.score !== undefined;
    const hasPk = side.pk !== null && side.pk !== undefined;

    const nameClass = isChamp
      ? side.isWinner
        ? 'font-bold text-emerald-300'
        : side.isLoser
        ? 'font-normal text-slate-400'
        : 'font-semibold text-white'
      : side.isWinner
      ? 'font-bold text-[var(--color-ink)]'
      : side.isLoser
      ? 'font-normal text-slate-500'
      : 'font-medium text-[var(--color-ink)]';

    const scoreBoxClass = isChamp
      ? side.isWinner
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold'
        : 'bg-[var(--color-pitch-surface)] text-slate-300 border-[var(--color-border-dark)] font-medium'
      : hasScore
      ? side.isWinner
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
        : 'bg-slate-100 text-slate-600 border-slate-200/70 font-medium'
      : 'text-slate-400 border-transparent';

    return (
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-0">
          {side.seed !== undefined && (
            <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
              #{side.seed}
            </span>
          )}
          {side.color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
              style={{ backgroundColor: side.color }}
            />
          )}
          <span className={`truncate ${nameClass}`}>{side.name}</span>
          {side.isStarred && (
            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500 shrink-0" />
          )}
        </div>

        <span
          className={`font-mono text-xs sm:text-sm px-2 py-0.5 rounded border text-center min-w-[32px] tabular-nums shrink-0 ${scoreBoxClass}`}
        >
          {hasScore ? (
            <>
              {side.score}
              {hasPk && (
                <span className="text-[10px] opacity-75 font-normal ml-0.5">({side.pk})</span>
              )}
            </>
          ) : (
            '—'
          )}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border transition-colors ${cardSurface}`}
    >
      {isChamp && <div className="h-[2px] w-full accent-rule-gradient" />}

      <div className={isCompact ? 'p-3 space-y-2' : 'p-3.5 sm:p-4 space-y-2.5'}>
        <div
          className={`flex items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px] tabular-nums pb-2 border-b ${
            isChamp ? 'border-[var(--color-border-dark)]' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span
              className={`font-semibold uppercase tracking-[0.06em] truncate ${
                isChamp ? 'text-emerald-400' : 'text-[var(--color-ink)]'
              }`}
            >
              {metaLeft}
            </span>
            {metaRight && (
              <>
                <span className={isChamp ? 'text-slate-600' : 'text-slate-300'}>·</span>
                <span className={isChamp ? 'text-slate-400' : 'text-[var(--color-ink-subtle)]'}>
                  {metaRight}
                </span>
              </>
            )}
          </div>

          {statusLabel && (
            <span
              className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider shrink-0 ${statusToneClass}`}
            >
              {statusLabel}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {renderTeamRow(home)}
          {renderTeamRow(away)}
        </div>

        {footerSlot && (
          <div
            className={`pt-2 border-t text-xs ${
              isChamp ? 'border-[var(--color-border-dark)]' : 'border-slate-100'
            }`}
          >
            {footerSlot}
          </div>
        )}
      </div>
    </div>
  );
};
