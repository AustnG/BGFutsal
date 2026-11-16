import React, { useMemo, useState } from 'react';
import { Star, ArrowUpDown } from 'lucide-react';
import { StandingRow } from '../types/league';
import { isSameTeamName } from '../utils/calculations';

interface StandingsTableProps {
  standings: StandingRow[];
  divisionName?: string;
  title?: string;
  hideTitleBar?: boolean;
  starredTeam: string | null;
  onToggleStarTeam: (teamName: string) => void;
}

type SortField = 'rank' | 'points' | 'goalDiff' | 'goalsFor' | 'name';

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  divisionName,
  title,
  hideTitleBar = false,
  starredTeam,
  onToggleStarTeam,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const sortedRows = useMemo(() => {
    return [...standings].sort((a, b) => {
      let comp = 0;
      if (sortField === 'rank') comp = a.rank - b.rank;
      else if (sortField === 'points') comp = a.points - b.points;
      else if (sortField === 'goalDiff') comp = a.goalDiff - b.goalDiff;
      else if (sortField === 'goalsFor') comp = a.goalsFor - b.goalsFor;
      else if (sortField === 'name') comp = a.teamName.localeCompare(b.teamName);

      if (comp !== 0) {
        return sortAsc ? comp : -comp;
      }
      return a.rank - b.rank;
    });
  }, [standings, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // Rank & club name default ascending; numeric stats default descending
      setSortAsc(field === 'rank' || field === 'name');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-hairline)] overflow-hidden">
      {/* Dark Utilitarian Table Bar */}
      {!hideTitleBar && (
        <div className="bg-[var(--color-pitch-ink)] text-white border-b border-[var(--color-border-dark)]">
          <div className="h-[2px] w-full accent-rule-gradient" />
          <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h3 className="font-mono text-[11px] font-semibold tracking-[0.08em] text-white uppercase">
                {title || (divisionName ? `${divisionName} Standings` : 'League Standings')}
              </h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {standings.length} Clubs
            </span>
          </div>
        </div>
      )}

      {/* Dense Timetable Grid */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border-hairline)] text-[var(--color-ink-subtle)] font-mono uppercase text-[11px] tracking-[0.06em]">
              <th
                onClick={() => handleSort('rank')}
                className="py-2.5 px-3 sm:px-4 text-center cursor-pointer hover:text-[var(--color-ink)] w-12 font-semibold select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer hover:text-[var(--color-ink)] min-w-[170px] font-semibold select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Club</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-12 font-semibold">GP</th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-semibold text-[var(--color-ink)]">
                W
              </th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-semibold">D</th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-semibold">L</th>
              <th
                onClick={() => handleSort('goalsFor')}
                className="py-2.5 px-2 sm:px-3 text-center cursor-pointer hover:text-[var(--color-ink)] w-12 hidden md:table-cell font-semibold select-none"
              >
                GF
              </th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-12 hidden md:table-cell font-semibold">
                GA
              </th>
              <th
                onClick={() => handleSort('goalDiff')}
                className="py-2.5 px-2 sm:px-3 text-center cursor-pointer hover:text-[var(--color-ink)] w-12 font-semibold select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>GD</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('points')}
                className="py-2.5 px-3 sm:px-4 text-center cursor-pointer hover:text-[var(--color-brand-green)] text-[var(--color-ink)] font-bold w-16 select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>PTS</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 sm:px-4 text-center w-28 hidden lg:table-cell font-semibold">
                Form
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-xs text-[var(--color-ink-subtle)]">
                  No clubs match the current filter.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => {
                const isLeader = row.rank === 1;
                const isPlayoffSpot = row.rank <= 8;
                const isStarred = isSameTeamName(starredTeam, row.teamName);
                const isWithdrawn = row.status === 'withdrawn';
                const isEighthCut =
                  sortField === 'rank' &&
                  sortAsc &&
                  sortedRows.length > 8 &&
                  row.isPlayoffQualified &&
                  !sortedRows[idx + 1]?.isPlayoffQualified;

                return (
                  <tr
                    key={row.teamId}
                    className={`transition-colors ${
                      isStarred
                        ? 'bg-emerald-50/60 border-l-2 border-l-emerald-600'
                        : isWithdrawn
                        ? 'text-slate-400 bg-slate-50/50'
                        : 'hover:bg-slate-50'
                    } ${isEighthCut ? 'border-b-2 border-emerald-600' : ''}`}
                  >
                    {/* Rank with Reserved Leader Gradient or Playoff Marker */}
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono text-xs tabular-nums">
                        <span
                          className={`w-1 h-3.5 rounded-xs ${
                            isLeader
                              ? 'accent-rule-gradient'
                              : isPlayoffSpot
                              ? 'bg-[var(--color-brand-green)]'
                              : 'bg-transparent'
                          }`}
                          title={
                            isLeader
                              ? 'Division Leader · Playoff qualifier'
                              : isPlayoffSpot
                              ? row.isTied
                                ? 'Tied · Playoff qualifier'
                                : 'Playoff qualifier'
                              : undefined
                          }
                        />
                        <span
                          className={
                            isPlayoffSpot
                              ? 'text-[var(--color-ink)] font-bold'
                              : 'text-[var(--color-ink-subtle)]'
                          }
                          title={row.isTied ? `Tied for position ${row.rank}` : undefined}
                        >
                          {row.rank}
                        </span>
                      </div>
                    </td>

                    {/* Club */}
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onToggleStarTeam(row.teamName)}
                          className="text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                          title={isStarred ? 'Unpin team' : 'Pin team'}
                          aria-label={isStarred ? `Unpin ${row.teamName}` : `Pin ${row.teamName}`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isStarred ? 'fill-emerald-600 text-emerald-600' : ''
                            }`}
                          />
                        </button>

                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: row.color }}
                        />

                        <div className="min-w-0 flex items-center gap-2">
                          <span className="text-[var(--color-ink)] font-semibold text-xs sm:text-sm truncate block">
                            {row.teamName}
                          </span>
                          {isLeader && (
                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-bold text-white accent-rule-gradient shrink-0">
                              #1
                            </span>
                          )}
                          {isWithdrawn && (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-rose-600 shrink-0">
                              Withdrawn
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tabular Telemetry Columns */}
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink-subtle)]">
                      {row.played}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink)] font-semibold">
                      {row.won}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink-subtle)]">
                      {row.drawn}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink-subtle)]">
                      {row.lost}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink-subtle)] hidden md:table-cell">
                      {row.goalsFor}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink-subtle)] hidden md:table-cell">
                      {row.goalsAgainst}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[var(--color-ink)] font-medium">
                      {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                    </td>

                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center font-mono tabular-nums font-bold text-[var(--color-ink)] text-sm bg-slate-50/70">
                      {row.points}
                    </td>

                    {/* Last 3 Form Squares */}
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                        {row.form.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          row.form.slice(-3).map((res, i, arr) => {
                            const isLatest = i === arr.length - 1;
                            return (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${
                                  res === 'W'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : res === 'D'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                } ${isLatest ? 'ring-1 ring-[var(--color-ink)]/25' : ''}`}
                                title={isLatest ? 'Latest Result' : undefined}
                              >
                                {res}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Key */}
      <div className="bg-[var(--color-surface-muted)] px-4 sm:px-5 py-2 border-t border-[var(--color-border-hairline)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-ink-subtle)] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-xs accent-rule-gradient" />
            <span>League Leader</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-xs bg-[var(--color-brand-green)]" />
            <span>Top 8 Playoff Zone</span>
          </span>
        </div>
        <span>PTS · GD · GF · H2H</span>
      </div>
    </div>
  );
};
