import React from 'react';
import { Search, ChevronDown, X, Star } from 'lucide-react';
import { Division, Season } from '../types/league';

interface SeasonDivisionControlsProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSelectSeason: (id: string) => void;
  divisions: Division[];
  selectedDivisionId: string;
  onSelectDivision: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  starredTeam: string | null;
  onlyMyTeam: boolean;
  onToggleOnlyMyTeam: () => void;
  variant?: 'bar' | 'card';
  showSeasonSelector?: boolean;
}

export const SeasonDivisionControls: React.FC<SeasonDivisionControlsProps> = ({
  seasons,
  selectedSeasonId,
  onSelectSeason,
  divisions,
  selectedDivisionId,
  onSelectDivision,
  searchQuery,
  onSearchChange,
  starredTeam,
  onlyMyTeam,
  onToggleOnlyMyTeam,
  variant = 'bar',
  showSeasonSelector = true,
}) => {
  const seasonDivisions = divisions.filter((d) => d.seasonId === selectedSeasonId);

  const innerControls = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
      {/* Season & Division Selectors */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {showSeasonSelector && (
          <>
            <div className="relative">
              <select
                value={selectedSeasonId}
                onChange={(e) => onSelectSeason(e.target.value)}
                aria-label="Select season"
                className="appearance-none bg-[var(--color-surface-muted)] hover:bg-slate-200/60 border border-[var(--color-border-hairline)] text-[var(--color-ink)] font-semibold text-xs rounded-md py-1.5 pl-2.5 pr-7 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer transition-colors"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <span className="text-slate-300 hidden sm:inline font-mono">/</span>
          </>
        )}

        {/* Division Segment Control */}
        <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-muted)] rounded-md border border-[var(--color-border-hairline)]">
          {seasonDivisions.map((div) => {
            const isSelected = selectedDivisionId === div.id;
            return (
              <button
                key={div.id}
                onClick={() => onSelectDivision(div.id)}
                className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--color-pitch-ink)] text-white font-semibold'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-medium'
                }`}
              >
                {div.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Club Search & Pinned Team Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search club..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search club"
            className="w-full bg-[var(--color-canvas)] border border-[var(--color-border-hairline)] text-[var(--color-ink)] text-xs rounded-md pl-8 pr-7 py-1.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {starredTeam && (
          <button
            onClick={onToggleOnlyMyTeam}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              onlyMyTeam
                ? 'bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border-hairline)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-strong)]'
            }`}
            title="Filter to My Team"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyMyTeam ? 'fill-white text-white' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">My Team</span>
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border-hairline)] p-2.5 sm:px-3.5 sm:py-2.5">
        {innerControls}
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--color-border-hairline)] bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {innerControls}
      </div>
    </div>
  );
};
