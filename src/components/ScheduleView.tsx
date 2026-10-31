import React, { useState } from 'react';
import { Star, CheckCircle2, Clock } from 'lucide-react';
import { Match, Team } from '../types/league';

interface ScheduleViewProps {
  matches: Match[];
  teams: Team[];
  divisionId: string;
  divisionName: string;
  starredTeam: string | null;
  onToggleStarTeam: (teamName: string) => void;
  searchQuery: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  divisionId,
  starredTeam,
  searchQuery,
}) => {
  const [selectedGameweek, setSelectedGameweek] = useState<number | 'all'>('all');

  const divisionMatches = matches.filter((m) =>
    divisionId === 'all' ? true : m.divisionId === divisionId
  );

  const gameweeks = Array.from(new Set(divisionMatches.map((m) => m.gameweek || 1))).sort(
    (a, b) => a - b
  );

  const teamColorMap = new Map<string, string>();
  teams.forEach((t) => teamColorMap.set(t.name.trim().toLowerCase(), t.color));

  const getTeamColor = (name: string) => {
    return teamColorMap.get(name.trim().toLowerCase()) || '#059669';
  };

  const filteredMatches = divisionMatches.filter((m) => {
    if (selectedGameweek !== 'all' && m.gameweek !== selectedGameweek) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Gameweek Filter Row with Dark Blue & Green Styling */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 sm:pb-2.5">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/60 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setSelectedGameweek('all')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedGameweek === 'all'
                ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            All Weeks
          </button>
          {gameweeks.map((gw) => (
            <button
              key={gw}
              onClick={() => setSelectedGameweek(gw)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedGameweek === gw
                  ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              GW {gw}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Bowling Green Futsal Arena</span>
        </div>
      </div>

      {/* Matchday Cards with Subtle Elevation and Fine 1px Strokes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMatches.map((m) => {
          const isFinal = m.status === 'final';
          const isForfeit = m.forfeit && m.forfeit !== 'none';
          const homeColor = getTeamColor(m.homeTeam);
          const awayColor = getTeamColor(m.awayTeam);
          const hasStarred = starredTeam && (m.homeTeam === starredTeam || m.awayTeam === starredTeam);

          const finalHomeScore = isFinal ? (m.forfeit === 'home' ? 0 : m.forfeit === 'away' ? 2 : (m.homeScore ?? 0)) : null;
          const finalAwayScore = isFinal ? (m.forfeit === 'away' ? 0 : m.forfeit === 'home' ? 2 : (m.awayScore ?? 0)) : null;

          const homeWon = isFinal && finalHomeScore !== null && finalAwayScore !== null && finalHomeScore > finalAwayScore;
          const awayWon = isFinal && finalHomeScore !== null && finalAwayScore !== null && finalAwayScore > finalHomeScore;

          return (
            <div
              key={m.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all shadow-xs ${
                hasStarred
                  ? 'border-emerald-500/70 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Header: Gameweek, Date, Time & Status Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[#0a1526] font-semibold">GW {m.gameweek || 1}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-normal">{m.date}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-medium">{m.time}</span>
                </div>

                {isForfeit ? (
                  <span className="text-rose-600 font-sans font-semibold text-[10px]">
                    {m.forfeit === 'home' ? 'Home Forfeit' : 'Away Forfeit'} (2-0)
                  </span>
                ) : isFinal ? (
                  <span className="text-slate-500 text-[10px] font-sans font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Final
                  </span>
                ) : (
                  <span className="text-emerald-700 text-[10px] font-sans font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    Upcoming
                  </span>
                )}
              </div>

              {/* Clubs & Scores */}
              <div className="space-y-2">
                {/* Home Team Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/5"
                      style={{ backgroundColor: homeColor }}
                    />
                    <span
                      className={`truncate ${
                        homeWon ? 'font-semibold text-[#0a1526]' : awayWon ? 'text-slate-500 font-normal' : 'font-medium text-[#0a1526]'
                      }`}
                    >
                      {m.homeTeam}
                    </span>
                    {starredTeam === m.homeTeam && (
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm px-2 py-0.5 rounded text-center min-w-[28px] tabular-nums ${
                      isFinal
                        ? homeWon
                          ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 font-medium'
                        : 'text-slate-400 font-mono'
                    }`}
                  >
                    {isFinal ? finalHomeScore : '—'}
                  </span>
                </div>

                {/* Away Team Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/5"
                      style={{ backgroundColor: awayColor }}
                    />
                    <span
                      className={`truncate ${
                        awayWon ? 'font-semibold text-[#0a1526]' : homeWon ? 'text-slate-500 font-normal' : 'font-medium text-[#0a1526]'
                      }`}
                    >
                      {m.awayTeam}
                    </span>
                    {starredTeam === m.awayTeam && (
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm px-2 py-0.5 rounded text-center min-w-[28px] tabular-nums ${
                      isFinal
                        ? awayWon
                          ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 font-medium'
                        : 'text-slate-400 font-mono'
                    }`}
                  >
                    {isFinal ? finalAwayScore : '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
