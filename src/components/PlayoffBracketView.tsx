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

  const formatBracketTime = (time?: string) => {
    if (!time) return '';
    return time.toUpperCase().includes('CT') ? time : `${time} CT`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
        <h3 className="font-semibold text-slate-900 uppercase tracking-wider">
          {divisionName} Championship Bracket
        </h3>
      </div>

      {/* Bracket Grid */}
      <div className="overflow-x-auto custom-scrollbar pt-1">
        <div className="min-w-[680px] grid grid-cols-3 gap-4 sm:gap-5">
          {/* Quarterfinals */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-700 block pb-1 border-b border-slate-200">
              Quarterfinals
            </span>

            <div className="space-y-2.5">
              {qfMatches.map((m, idx) => {
                const teamNameA = m.teamAName || m.teamA?.teamName || `Seed ${m.seedA}`;
                const teamNameB = m.teamBName || m.teamB?.teamName || `Seed ${m.seedB}`;
                const hasStarred = starredTeam && (teamNameA === starredTeam || teamNameB === starredTeam);
                const hasScores = m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined;
                const hasPk = hasScores && m.scoreA === m.scoreB && m.pkA !== null && m.pkA !== undefined && m.pkB !== null && m.pkB !== undefined;
                const aWon = hasScores && (
                  m.scoreA! > m.scoreB! ||
                  (hasPk && m.pkA! > m.pkB!) ||
                  m.winnerName === teamNameA
                );
                const bWon = hasScores && (
                  m.scoreB! > m.scoreA! ||
                  (hasPk && m.pkB! > m.pkA!) ||
                  m.winnerName === teamNameB
                );

                return (
                  <div
                    key={`${m.id}-${idx}`}
                    className={`rounded-lg p-2.5 sm:p-3 border text-xs space-y-1 transition-colors shadow-xs ${
                      hasStarred
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-semibold font-mono tabular-nums">M{m.matchNumber}</span>
                        {hasPk && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">
                            PK
                          </span>
                        )}
                      </div>
                      <span className="font-mono tabular-nums">{m.date ? `${m.date} · ${formatBracketTime(m.time)}` : formatBracketTime(m.time)}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span className={`truncate ${aWon ? 'font-semibold text-slate-900' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{m.seedA}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={aWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreA}
                            {hasPk && (
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                ({m.pkA})
                              </span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span className={`truncate ${bWon ? 'font-semibold text-slate-900' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{m.seedB}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={bWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreB}
                            {hasPk && (
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                ({m.pkB})
                              </span>
                            )}
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
            <span className="text-xs font-semibold text-slate-700 block pb-1 border-b border-slate-200">
              Semifinals
            </span>

            <div className="space-y-14 pt-6">
              {sfMatches.map((m, idx) => {
                const teamNameA = m.teamAName || m.teamA?.teamName || 'Winner QF';
                const teamNameB = m.teamBName || m.teamB?.teamName || 'Winner QF';
                const hasScores = m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined;
                const hasPk = hasScores && m.scoreA === m.scoreB && m.pkA !== null && m.pkA !== undefined && m.pkB !== null && m.pkB !== undefined;
                const aWon = hasScores && (
                  m.scoreA! > m.scoreB! ||
                  (hasPk && m.pkA! > m.pkB!) ||
                  m.winnerName === teamNameA
                );
                const bWon = hasScores && (
                  m.scoreB! > m.scoreA! ||
                  (hasPk && m.pkB! > m.pkA!) ||
                  m.winnerName === teamNameB
                );

                return (
                  <div
                    key={`${m.id}-${idx}`}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-semibold font-mono tabular-nums">Semi {m.matchNumber === 5 ? '1' : '2'}</span>
                        {hasPk && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">
                            PK
                          </span>
                        )}
                      </div>
                      <span className="font-mono tabular-nums">{m.date ? `${m.date} · ${formatBracketTime(m.time)}` : formatBracketTime(m.time)}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span className={`truncate ${aWon ? 'font-semibold text-slate-900' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{m.seedA}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={aWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreA}
                            {hasPk && (
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                ({m.pkA})
                              </span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span className={`truncate ${bWon ? 'font-semibold text-slate-900' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{m.seedB}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 min-w-[20px] text-right">
                        {hasScores ? (
                          <span className={bWon ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                            {m.scoreB}
                            {hasPk && (
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                ({m.pkB})
                              </span>
                            )}
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
            <span className="text-xs font-semibold text-emerald-800 block pb-1 border-b border-slate-200">
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
                const finalHasPk =
                  hasFinalScores &&
                  finalMatch.scoreA === finalMatch.scoreB &&
                  finalMatch.pkA !== null &&
                  finalMatch.pkA !== undefined &&
                  finalMatch.pkB !== null &&
                  finalMatch.pkB !== undefined;
                const aWon = hasFinalScores && (
                  finalMatch!.scoreA! > finalMatch!.scoreB! ||
                  (finalHasPk && finalMatch.pkA! > finalMatch.pkB!) ||
                  finalMatch!.winnerName === teamNameA
                );
                const bWon = hasFinalScores && (
                  finalMatch!.scoreB! > finalMatch!.scoreA! ||
                  (finalHasPk && finalMatch.pkB! > finalMatch.pkA!) ||
                  finalMatch!.winnerName === teamNameB
                );

                return (
                  <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 text-xs space-y-2.5 shadow-sm">
                    <div className="text-[11px] text-emerald-400 flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span>Championship Trophy Match</span>
                        {finalHasPk && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1 py-0.5 rounded font-mono">
                            PK
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-normal font-mono tabular-nums">
                        {finalMatch?.date ? `${finalMatch.date} · ${formatBracketTime(finalMatch.time)}` : 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold text-white">
                      <span className={`truncate ${aWon ? 'text-emerald-300 font-bold' : bWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{finalMatch?.seedA || 1}</span>
                        {teamNameA}
                      </span>
                      <span className="font-mono tabular-nums text-white text-sm min-w-[20px] text-right font-bold">
                        {hasFinalScores ? (
                          <span>
                            {finalMatch!.scoreA}
                            {finalHasPk && (
                              <span className="text-xs text-slate-400 font-normal ml-0.5">
                                ({finalMatch.pkA})
                              </span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold text-white">
                      <span className={`truncate ${bWon ? 'text-emerald-300 font-bold' : aWon ? 'text-slate-400 font-normal' : ''}`}>
                        <span className="text-slate-400 font-mono mr-1.5 text-xs">#{finalMatch?.seedB || 2}</span>
                        {teamNameB}
                      </span>
                      <span className="font-mono tabular-nums text-white text-sm min-w-[20px] text-right font-bold">
                        {hasFinalScores ? (
                          <span>
                            {finalMatch!.scoreB}
                            {finalHasPk && (
                              <span className="text-xs text-slate-400 font-normal ml-0.5">
                                ({finalMatch.pkB})
                              </span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    {finalMatch?.winnerName && (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Champion</span>
                        </span>
                        <span className="font-bold text-white">{finalMatch.winnerName}</span>
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
