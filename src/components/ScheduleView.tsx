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

// Helper to parse match date and time into a millisecond timestamp for chronological sorting
export const getMatchSortTimestamp = (m: Match): number => {
  if (!m.date) {
    const base = m.isPostseason ? 9999999999000 : 0;
    return base + (m.gameweek || 0) * 86400000;
  }

  let cleanDate = m.date.trim();
  // Strip day of week prefix if present (e.g. "Sun, ", "Mon, ")
  cleanDate = cleanDate.replace(/^[A-Za-z]+,\s*/, '');

  // If no 4-digit year in string, deduce year from seasonId or current year
  if (!/\b\d{4}\b/.test(cleanDate)) {
    const yearMatch = m.seasonId ? m.seasonId.match(/\d{4}/) : null;
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
    cleanDate = `${cleanDate}, ${year}`;
  }

  let timestamp = Date.parse(cleanDate);
  if (isNaN(timestamp)) {
    // Handle slash format e.g. "2026/02/07"
    const slashCleaned = cleanDate.replace(/\//g, '-');
    timestamp = Date.parse(slashCleaned);
  }

  if (isNaN(timestamp)) {
    const base = m.isPostseason ? 9999999999000 : 0;
    return base + (m.gameweek || 0) * 86400000;
  }

  // Parse kickoff time
  if (m.time) {
    const timeMatch = m.time.trim().match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      timestamp += (hours * 3600 + minutes * 60) * 1000;
    }
  }

  if (m.isPostseason) {
    timestamp += 1000;
  }

  return timestamp;
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  divisionId,
  starredTeam,
  searchQuery,
}) => {
  const [selectedGameweek, setSelectedGameweek] = useState<number | 'all' | 'playoffs'>('all');

  const divisionMatches = matches.filter((m) =>
    divisionId === 'all' ? true : m.divisionId === divisionId
  );

  // Sort gameweek buttons newest-first (descending)
  const regularGameweeks = Array.from(
    new Set(
      divisionMatches
        .filter((m) => !m.isPostseason && m.gameweek > 0)
        .map((m) => m.gameweek)
    )
  ).sort((a, b) => b - a);

  const hasPlayoffMatches = divisionMatches.some((m) => m.isPostseason);

  const teamColorMap = new Map<string, string>();
  teams.forEach((t) => teamColorMap.set(t.name.trim().toLowerCase(), t.color));

  const getTeamColor = (name: string) => {
    return teamColorMap.get(name.trim().toLowerCase()) || '#059669';
  };

  const filteredMatches = divisionMatches.filter((m) => {
    if (selectedGameweek === 'playoffs') {
      if (!m.isPostseason) return false;
    } else if (selectedGameweek !== 'all') {
      if (m.isPostseason || m.gameweek !== selectedGameweek) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort Game Results: Newest at top to oldest at bottom
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const timeA = getMatchSortTimestamp(a);
    const timeB = getMatchSortTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA; // Descending: newest at top, oldest at bottom
    }
    const gwA = a.gameweek || 0;
    const gwB = b.gameweek || 0;
    if (gwA !== gwB) {
      return gwB - gwA;
    }
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Gameweek Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setSelectedGameweek('all')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedGameweek === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            All Weeks
          </button>
          {hasPlayoffMatches && (
            <button
              onClick={() => setSelectedGameweek('playoffs')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedGameweek === 'playoffs'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-medium'
              }`}
            >
              Playoffs
            </button>
          )}
          {regularGameweeks.map((gw) => (
            <button
              key={gw}
              onClick={() => setSelectedGameweek(gw)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedGameweek === gw
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              GW {gw}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium self-end sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>All times Central (CT)</span>
        </div>
      </div>

      {/* Matchday Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedMatches.map((m, idx) => {
          const isFinal = m.status === 'final';
          const isForfeit = m.forfeit && m.forfeit !== 'none';
          const homeColor = getTeamColor(m.homeTeam);
          const awayColor = getTeamColor(m.awayTeam);
          const hasStarred = starredTeam && (m.homeTeam === starredTeam || m.awayTeam === starredTeam);

          const finalHomeScore = isFinal ? (m.forfeit === 'home' ? 0 : m.forfeit === 'away' ? 2 : (m.homeScore ?? 0)) : null;
          const finalAwayScore = isFinal ? (m.forfeit === 'away' ? 0 : m.forfeit === 'home' ? 2 : (m.awayScore ?? 0)) : null;

          const hasPk = isFinal && finalHomeScore !== null && finalAwayScore !== null && finalHomeScore === finalAwayScore && m.homePk !== null && m.homePk !== undefined && m.awayPk !== null && m.awayPk !== undefined;

          const homeWon = isFinal && finalHomeScore !== null && finalAwayScore !== null && (
            finalHomeScore > finalAwayScore ||
            (hasPk && m.homePk! > m.awayPk!)
          );
          const awayWon = isFinal && finalHomeScore !== null && finalAwayScore !== null && (
            finalAwayScore > finalHomeScore ||
            (hasPk && m.awayPk! > m.homePk!)
          );

          const formattedTime = m.time
            ? m.time.toUpperCase().includes('CT')
              ? m.time
              : `${m.time} CT`
            : 'TBD';

          return (
            <div
              key={`${m.id}-${idx}`}
              className={`p-3.5 sm:p-4 rounded-xl border transition-colors shadow-xs ${
                hasStarred
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header: Gameweek, Date, Time & Status Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${m.isPostseason ? 'text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider' : 'text-[#0a1526]'}`}>
                    {m.isPostseason ? (m.roundName || 'Playoff') : `GW ${m.gameweek || 1}`}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-normal">{m.date}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-medium">{formattedTime}</span>
                </div>

                {isForfeit ? (
                  <span className="text-rose-600 font-sans font-semibold text-[10px]">
                    {m.forfeit === 'home' ? 'Home Forfeit' : 'Away Forfeit'} (2-0)
                  </span>
                ) : isFinal ? (
                  <span className="text-slate-500 text-[10px] font-sans font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {hasPk ? 'Final (PK)' : 'Final'}
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
                    {isFinal ? (
                      <span>
                        {finalHomeScore}
                        {hasPk && (
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            ({m.homePk})
                          </span>
                        )}
                      </span>
                    ) : (
                      '—'
                    )}
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
                    {isFinal ? (
                      <span>
                        {finalAwayScore}
                        {hasPk && (
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            ({m.awayPk})
                          </span>
                        )}
                      </span>
                    ) : (
                      '—'
                    )}
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
