import React, { useState } from 'react';
import { Star, ArrowUpDown } from 'lucide-react';
import { StandingRow } from '../types/league';

interface StandingsTableProps {
  standings: StandingRow[];
  divisionName: string;
  starredTeam: string | null;
  onToggleStarTeam: (teamName: string) => void;
}

type SortField = 'rank' | 'points' | 'goalDiff' | 'goalsFor' | 'name';

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  divisionName,
  starredTeam,
  onToggleStarTeam,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedRows = [...standings].sort((a, b) => {
    let comp = 0;
    if (sortField === 'rank') comp = a.rank - b.rank;
    else if (sortField === 'points') comp = b.points - a.points;
    else if (sortField === 'goalDiff') comp = b.goalDiff - a.goalDiff;
    else if (sortField === 'goalsFor') comp = b.goalsFor - a.goalsFor;
    else if (sortField === 'name') comp = a.teamName.localeCompare(b.teamName);

    return sortAsc ? -comp : comp;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name' || field === 'rank');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden shadow-xs">
      {/* Table Title Bar with Subtle Gradient & Emerald Accent */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0a1526] via-[#0e213b] to-[#0a1526] text-white px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#14233c]">
        {/* Subtle Bottom Accent Gradient Line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 relative z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
            {divisionName} Standings
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/70 text-slate-500 font-mono uppercase text-[11px] tracking-wider">
              <th
                onClick={() => handleSort('rank')}
                className="py-2.5 px-3 sm:px-4 text-center cursor-pointer hover:text-[#0a1526] w-12 font-medium"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer hover:text-[#0a1526] min-w-[170px] font-medium"
              >
                <div className="flex items-center gap-1">
                  <span>Club</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-12 font-mono font-medium text-slate-500">GP</th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-mono font-medium text-slate-600">W</th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-mono font-medium text-slate-500">D</th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-10 font-mono font-medium text-slate-500">L</th>
              <th
                onClick={() => handleSort('goalsFor')}
                className="py-2.5 px-2 sm:px-3 text-center cursor-pointer hover:text-[#0a1526] w-12 hidden md:table-cell font-mono font-medium"
              >
                GF
              </th>
              <th className="py-2.5 px-2 sm:px-3 text-center w-12 hidden md:table-cell font-mono font-medium text-slate-500">GA</th>
              <th
                onClick={() => handleSort('goalDiff')}
                className="py-2.5 px-2 sm:px-3 text-center cursor-pointer hover:text-[#0a1526] w-12 font-mono font-medium"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>GD</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('points')}
                className="py-2.5 px-3 sm:px-4 text-center cursor-pointer hover:text-emerald-700 text-[#0a1526] font-semibold w-16 font-mono"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>PTS</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 sm:px-4 text-center w-28 hidden lg:table-cell font-mono font-medium text-slate-500">
                Form
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {sortedRows.map((row) => {
              const isPlayoffSpot = row.rank <= 8;
              const isStarred = starredTeam === row.teamName;
              const isWithdrawn = row.status === 'withdrawn';
              const isEighthCut = row.rank === 8 && sortedRows.length > 8;

              return (
                <tr
                  key={row.teamId}
                  className={`transition-colors ${
                    isStarred
                      ? 'bg-emerald-50/50 border-l-2 border-l-emerald-500 font-medium'
                      : isWithdrawn
                      ? 'text-slate-400 bg-slate-50/40'
                      : 'hover:bg-slate-50/70'
                  } ${isEighthCut ? 'border-b-2 border-emerald-500/60' : ''}`}
                >
                  {/* Rank with Subtle Emerald Indicator for Playoff Zone */}
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs tabular-nums">
                      <span
                        className={`w-1 h-3 rounded-full ${
                          isPlayoffSpot ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]' : 'bg-transparent'
                        }`}
                        title={isPlayoffSpot ? 'Playoff qualifier' : undefined}
                      />
                      <span className={isPlayoffSpot ? 'text-[#0a1526] font-semibold' : 'text-slate-500'}>
                        {row.rank}
                      </span>
                    </div>
                  </td>

                  {/* Club */}
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onToggleStarTeam(row.teamName)}
                        className="text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
                        title={isStarred ? 'Unpin' : 'Pin team'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isStarred ? 'fill-emerald-500 text-emerald-500' : ''
                          }`}
                        />
                      </button>

                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                        style={{ backgroundColor: row.color }}
                      />

                      <div className="min-w-0">
                        <span className="text-[#0a1526] font-medium text-xs sm:text-sm truncate block">
                          {row.teamName}
                        </span>
                        {isWithdrawn && (
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            Withdrawn
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-500">
                    {row.played}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[#0a1526] font-semibold">
                    {row.won}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-500">
                    {row.drawn}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-500">
                    {row.lost}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-500 hidden md:table-cell">
                    {row.goalsFor}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-500 hidden md:table-cell">
                    {row.goalsAgainst}
                  </td>
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-[#0a1526] font-medium">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>

                  {/* Points */}
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center font-mono tabular-nums font-bold text-[#0a1526] text-sm bg-slate-50/40">
                    {row.points}
                  </td>

                  {/* Form (Last 3 Results, Latest Underlined) */}
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[10px]">
                      {row.form.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        row.form.slice(-3).map((res, i, arr) => {
                          const isLatest = i === arr.length - 1;
                          return (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-semibold shadow-2xs relative ${
                                res === 'W'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                                  : res === 'D'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                              } ${
                                isLatest
                                  ? 'after:content-[""] after:absolute after:-bottom-1.5 after:inset-x-0.5 after:h-[2px] after:bg-emerald-600 after:rounded-full'
                                  : ''
                              }`}
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
            })}
          </tbody>
        </table>
      </div>

      {/* Subtle Table Footer Note */}
      <div className="bg-slate-50/80 px-4 sm:px-5 py-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Playoff qualifier</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-1">
            <span className="border-b-2 border-emerald-600 pb-0.5 font-semibold text-emerald-700">Underline</span>
            <span>= Latest match</span>
          </div>
        </div>
        <span>Tiebreaker: PTS &gt; GD &gt; GF &gt; H2H</span>
      </div>
    </div>
  );
};
