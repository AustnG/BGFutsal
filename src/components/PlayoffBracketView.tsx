import React from 'react';
import { Trophy } from 'lucide-react';
import { Match, StandingRow } from '../types/league';
import { computePlayoffs } from '../utils/calculations';

interface PlayoffBracketViewProps {
  standings: StandingRow[];
  divisionId: string;
  divisionName: string;
  starredTeam: string | null;
  postseasonMatches?: Match[];
}

export const PlayoffBracketView: React.FC<PlayoffBracketViewProps> = ({
  standings,
  divisionId,
  divisionName,
  starredTeam,
  postseasonMatches = [],
}) => {
  const playoffMatches = computePlayoffs(standings, divisionId, postseasonMatches);

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
                const teamNameA = m.teamAName || m.teamA?.teamName || `Seed ${m.seedA}`;
                const teamNameB = m.teamBName || m.teamB?.teamName || `Seed ${m.seedB}`;
                const hasStarred = starredTeam && (teamNameA === starredTeam || teamNameB === starredTeam);
                const hasScores = m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined;
                const aWon = hasScores && (m.scoreA! > m.scoreB! || m.winnerName === teamNameA);
                const bWon = hasScores && (m.scoreB! > m.scoreA! || m.winnerName === teamNameB);

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
                      <span>{m.date ? `${m.date} · ${m.time}` : m.time}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className={`truncate ${aWon ? 'font-semibold text-emerald-950' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-emerald-600 font-mono mr-1.5 font-medium">#{m.seedA}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono text-slate-500 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={aWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreA}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className={`truncate ${bWon ? 'font-semibold text-emerald-950' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5">#{m.seedB}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono text-slate-500 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={bWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreB}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
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
              {sfMatches.map((m) => {
                const teamNameA = m.teamAName || m.teamA?.teamName || 'Winner QF';
                const teamNameB = m.teamBName || m.teamB?.teamName || 'Winner QF';
                const hasScores = m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined;
                const aWon = hasScores && (m.scoreA! > m.scoreB! || m.winnerName === teamNameA);
                const bWon = hasScores && (m.scoreB! > m.scoreA! || m.winnerName === teamNameB);

                return (
                  <div
                    key={m.id}
                    className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span className="text-[#0a1526] font-medium">Semi {m.matchNumber === 5 ? '1' : '2'}</span>
                      <span>{m.date ? `${m.date} · ${m.time}` : m.time}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className={`truncate ${aWon ? 'font-semibold text-emerald-950' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-emerald-600 font-mono mr-1.5 font-medium">#{m.seedA}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono text-slate-500 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={aWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreA}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-[#0a1526]">
                      <span className={`truncate ${bWon ? 'font-semibold text-emerald-950' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5">#{m.seedB}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono text-slate-500 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={bWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreB}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-emerald-700 font-semibold block pb-1 border-b border-slate-200/60">
              Championship Final
            </span>

            <div className="pt-20">
              {(() => {
                const teamNameA = finalMatch?.teamAName || finalMatch?.teamA?.teamName || 'Finalist 1';
                const teamNameB = finalMatch?.teamBName || finalMatch?.teamB?.teamName || 'Finalist 2';
                const hasFinalScores =
                  finalMatch?.scoreA !== null &&
                  finalMatch?.scoreA !== undefined &&
                  finalMatch?.scoreB !== null &&
                  finalMatch?.scoreB !== undefined;
                const aWon = hasFinalScores && (finalMatch!.scoreA! > finalMatch!.scoreB! || finalMatch!.winnerName === teamNameA);
                const bWon = hasFinalScores && (finalMatch!.scoreB! > finalMatch!.scoreA! || finalMatch!.winnerName === teamNameB);

                return (
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0c1f38] to-[#06101e] text-white rounded-xl p-4 border border-[#1b3459] text-xs space-y-2.5 shadow-lg">
                    {/* Ambient Light Accent */}
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

                    <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between font-semibold relative z-10">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                        Championship Trophy Match
                      </span>
                      <span className="text-slate-300 font-normal">
                        {finalMatch?.date ? `${finalMatch.date} · ${finalMatch.time}` : 'May 17 · 20:30'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold text-white">
                      <span className={`truncate ${aWon ? 'text-amber-300 font-bold' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-amber-400 font-mono mr-1.5 font-bold">#{finalMatch?.seedA || 1}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono text-amber-300 text-sm min-w-[20px] text-right">
                        {hasFinalScores ? finalMatch!.scoreA : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold text-white">
                      <span className={`truncate ${bWon ? 'text-emerald-300 font-bold' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-emerald-400 font-mono mr-1.5 font-bold">#{finalMatch?.seedB || 2}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono text-emerald-300 text-sm min-w-[20px] text-right">
                        {hasFinalScores ? finalMatch!.scoreB : '—'}
                      </span>
                    </div>

                    {finalMatch?.winnerName && (
                      <div className="mt-2 pt-2 border-t border-amber-500/25 flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 font-mono flex items-center gap-1.5 font-semibold">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          Tournament Champion
                        </span>
                        <span className="font-bold text-white text-xs">{finalMatch.winnerName}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
