import React from 'react';
import { StandingRow } from '../types/league';
import { computePlayoffs } from '../utils/calculations';

interface PlayoffBracketViewProps {
  standings: StandingRow[];
  divisionId: string;
  divisionName: string;
  starredTeam: string | null;
}

export const PlayoffBracketView: React.FC<PlayoffBracketViewProps> = ({
  standings,
  divisionId,
  divisionName,
  starredTeam,
}) => {
  const playoffMatches = computePlayoffs(standings, divisionId);

  const qfMatches = playoffMatches.filter((m) => m.round === 'Quarterfinal');
  const sfMatches = playoffMatches.filter((m) => m.round === 'Semifinal');
  const finalMatch = playoffMatches.find((m) => m.round === 'Championship');

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-slate-200/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <span className="font-semibold text-[#0a1526] uppercase tracking-wider">
            {divisionName} Championship Bracket
          </span>
        </div>
        <span className="font-mono text-emerald-700 text-[11px] font-medium">
          8-Club Single Elimination
        </span>
      </div>

      {/* Bracket Grid */}
      <div className="overflow-x-auto custom-scrollbar pt-1">
        <div className="min-w-[680px] grid grid-cols-3 gap-4 sm:gap-5">
          {/* Quarterfinals */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-slate-500 block pb-1 border-b border-slate-200/60 font-medium">
              Quarterfinals
            </span>

            <div className="space-y-2.5">
              {qfMatches.map((m) => {
                const hasStarred = starredTeam && (m.teamA?.teamName === starredTeam || m.teamB?.teamName === starredTeam);
                return (
                  <div
                    key={m.id}
                    className={`rounded-lg p-2.5 sm:p-3 border text-xs space-y-1 transition-colors shadow-xs ${
                      hasStarred
                        ? 'border-emerald-500/60 bg-emerald-50/40'
                        : 'bg-slate-50/80 border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span className="text-[#0a1526] font-medium">M{m.matchNumber}</span>
                      <span>{m.time}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className="truncate">
                        <span className="text-emerald-600 font-mono mr-1.5 font-medium">#{m.seedA}</span>
                        {m.teamA?.teamName || `Seed ${m.seedA}`}
                      </span>
                      <span className="font-mono text-slate-400">—</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className="truncate">
                        <span className="text-slate-400 font-mono mr-1.5">#{m.seedB}</span>
                        {m.teamB?.teamName || `Seed ${m.seedB}`}
                      </span>
                      <span className="font-mono text-slate-400">—</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semifinals */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-slate-500 block pb-1 border-b border-slate-200/60 font-medium">
              Semifinals
            </span>

            <div className="space-y-14 pt-6">
              {sfMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span className="text-[#0a1526] font-medium">Semi {m.matchNumber === 5 ? '1' : '2'}</span>
                    <span>{m.time}</span>
                  </div>

                  <div className="flex items-center justify-between font-medium text-[#0a1526]">
                    <span className="truncate">
                      <span className="text-emerald-600 font-mono mr-1.5 font-medium">#{m.seedA}</span>
                      {m.teamA?.teamName || 'Winner QF'}
                    </span>
                    <span className="font-mono text-slate-400">—</span>
                  </div>

                  <div className="flex items-center justify-between font-medium text-[#0a1526]">
                    <span className="truncate">
                      <span className="text-slate-400 font-mono mr-1.5">#{m.seedB}</span>
                      {m.teamB?.teamName || 'Winner QF'}
                    </span>
                    <span className="font-mono text-slate-400">—</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-emerald-700 font-semibold block pb-1 border-b border-slate-200/60">
              Championship Final
            </span>

            <div className="pt-20">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0c1f38] to-[#06101e] text-white rounded-xl p-4 border border-[#1b3459] text-xs space-y-2.5 shadow-lg">
                {/* Subtle Ambient Emerald & Gold Accent Light Blur */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

                <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between font-semibold relative z-10">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    Championship Trophy Match
                  </span>
                  <span className="text-slate-300 font-normal">May 17 · 20:30</span>
                </div>

                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="truncate">
                    <span className="text-amber-400 font-mono mr-1.5 font-bold">#1</span>
                    {finalMatch?.teamA?.teamName || 'Finalist 1'}
                  </span>
                  <span className="font-mono text-slate-400">—</span>
                </div>

                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="truncate">
                    <span className="text-emerald-400 font-mono mr-1.5 font-bold">#2</span>
                    {finalMatch?.teamB?.teamName || 'Finalist 2'}
                  </span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
