import React, { useState } from 'react';
import { Table, TrendingUp, Trophy, Award, Shield } from 'lucide-react';
import { Division, Honor, Match, Season, StandingRow, Team } from '../types/league';
import { StandingsTable } from './StandingsTable';
import { ScheduleView } from './ScheduleView';
import { RankProgressionChart } from './RankProgressionChart';
import { PlayoffBracketView } from './PlayoffBracketView';
import { SeasonDivisionControls } from './SeasonDivisionControls';

export type TableDisplayMode = 'table' | 'trajectory';

interface SeasonHubViewProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSelectSeason: (id: string) => void;
  divisions: Division[];
  selectedDivisionId: string;
  onSelectDivision: (id: string) => void;
  standings: StandingRow[];
  matches: Match[];
  teams: Team[];
  honors: Honor[];
  starredTeam: string | null;
  onToggleStarTeam: (teamName: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyMyTeam: boolean;
  onToggleOnlyMyTeam: () => void;
  displayMode?: TableDisplayMode;
  onDisplayModeChange?: (mode: TableDisplayMode) => void;
}

export const SeasonHubView: React.FC<SeasonHubViewProps> = ({
  seasons,
  selectedSeasonId,
  onSelectSeason,
  divisions,
  selectedDivisionId,
  onSelectDivision,
  standings,
  matches,
  teams,
  honors,
  starredTeam,
  onToggleStarTeam,
  searchQuery,
  onSearchChange,
  onlyMyTeam,
  onToggleOnlyMyTeam,
  displayMode: propDisplayMode,
  onDisplayModeChange,
}) => {
  const currentSeason = seasons.find((s) => s.id === selectedSeasonId) || seasons[0];
  const seasonDivisions = divisions.filter((d) => d.seasonId === selectedSeasonId);
  const activeDivision =
    seasonDivisions.find((d) => d.id === selectedDivisionId) || seasonDivisions[0];

  const effectiveDivisions = activeDivision ? [activeDivision] : seasonDivisions;

  const seasonMatches = matches.filter((m) => m.seasonId === selectedSeasonId);
  const divisionMatches = seasonMatches.filter(
    (m) => activeDivision && m.divisionId === activeDivision.id
  );

  const [localDisplayMode, setLocalDisplayMode] = useState<TableDisplayMode>('table');
  const activeDisplayMode = propDisplayMode !== undefined ? propDisplayMode : localDisplayMode;

  const setDisplayMode = (mode: TableDisplayMode) => {
    setLocalDisplayMode(mode);
    onDisplayModeChange?.(mode);
  };

  // Filter honors for the current selected season
  const seasonHonors = honors.filter((h) => h.seasonId === selectedSeasonId);
  const hasSeasonHonors = seasonHonors.length > 0;

  // Postseason matches specifically recorded in database
  const divisionPostseasonMatches = divisionMatches.filter((m) => m.isPostseason);
  const seasonPostseasonMatches = seasonMatches.filter((m) => m.isPostseason);
  const hasPostseasonMatches = divisionPostseasonMatches.length > 0 || seasonPostseasonMatches.length > 0;

  // Regular season status
  const isSeasonActive = currentSeason.isCurrent || currentSeason.status === 'active';

  // CRITICAL: Playoff bracket should NEVER appear during regular season unless postseason matches
  // have actually been entered/scheduled in the database!
  const showPlayoffBracket =
    hasPostseasonMatches ||
    (!isSeasonActive && currentSeason.status === 'completed' && divisionMatches.length >= 6);

  const showChampionshipSection = hasSeasonHonors || showPlayoffBracket;

  // Divisions to render honors for (scoped to current selected division)
  const divisionsForHonors = seasonDivisions.filter(
    (div) => div.id === activeDivision?.id
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. FILTERING: Co-located Season, Division & Search Controls at the very top */}
      <section id="sec-filters">
        <SeasonDivisionControls
          seasons={seasons}
          selectedSeasonId={selectedSeasonId}
          onSelectSeason={onSelectSeason}
          divisions={divisions}
          selectedDivisionId={selectedDivisionId}
          onSelectDivision={onSelectDivision}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          starredTeam={starredTeam}
          onlyMyTeam={onlyMyTeam}
          onToggleOnlyMyTeam={onToggleOnlyMyTeam}
          teamCount={standings.length}
          variant="card"
        />
      </section>

      {/* 2. CHAMPIONSHIP SEASON BRACKET & POSTSEASON HONORS
          (Rendered when postseason matches exist or season awards are recorded) */}
      {showChampionshipSection && (
        <section id="sec-playoffs" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-amber-500" />
              <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
                {showPlayoffBracket ? 'Postseason Championship Tournament' : 'Championship Postseason & Honors'}
              </h2>
            </div>

          </div>

          {/* Honors Cards (if awards have been recorded) */}
          {hasSeasonHonors && (
            <div className="space-y-4">
              {divisionsForHonors.map((div) => {
                const divHonors = seasonHonors.filter((h) => h.divisionId === div.id);
                if (divHonors.length === 0) return null;

                const divisionWinner = divHonors.find((h) => h.awardType === 'division_winner');
                const goldenBoot = divHonors.find((h) => h.awardType === 'golden_boot');
                const goldenGlove = divHonors.find((h) => h.awardType === 'golden_glove');

                return (
                  <div key={div.id} className="space-y-2.5">
                    {divisionsForHonors.length > 1 && (
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono">
                        {div.name} Laurels
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                      {/* Division Champion - Bold Warm Amber / Gold Gradient */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white space-y-3 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none" />
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-[11px] uppercase tracking-wider text-amber-100 font-bold font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-3.5 rounded-full bg-white/80" />
                            Division Champion
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-xs">
                            {divisionWinner?.recipient || divisionWinner?.teamName || 'Record Pending'}
                          </h3>
                          {divisionWinner?.statDetail && (
                            <div className="pt-0.5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-xs border border-white/25 text-xs font-semibold text-amber-100">
                                {divisionWinner.statDetail}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Top Scorer (Golden Boot) - Bold Emerald / Teal Striker Gradient */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white space-y-3 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none" />
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-3.5 rounded-full bg-white/80" />
                            Top Scorer
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-xs">
                            {goldenBoot?.recipient || 'Record Pending'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                            {goldenBoot?.teamName && (
                              <span className="font-semibold text-emerald-100">
                                {goldenBoot.teamName}
                              </span>
                            )}
                            {goldenBoot?.statDetail && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-xs border border-white/25 text-xs font-bold text-white">
                                {goldenBoot.statDetail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Best Defense (Golden Glove) - Bold Sapphire / Indigo Gradient */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-blue-400/40 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white space-y-3 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none" />
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-[11px] uppercase tracking-wider text-blue-100 font-bold font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-3.5 rounded-full bg-white/80" />
                            Best Defense
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-xs">
                            {goldenGlove?.recipient || 'Record Pending'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                            {goldenGlove?.teamName && (
                              <span className="font-semibold text-blue-100">
                                {goldenGlove.teamName}
                              </span>
                            )}
                            {goldenGlove?.statDetail && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-xs border border-white/25 text-xs font-bold text-white">
                                {goldenGlove.statDetail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Championship Tournament Playoff Bracket (only displayed when postseason matches exist or season is concluded) */}
          {showPlayoffBracket && (
            <div className="pt-1">
              <PlayoffBracketView
                standings={standings}
                divisionId={activeDivision?.id || 'div-prem-2026'}
                divisionName={activeDivision?.name || 'Premier Division'}
                starredTeam={starredTeam}
                postseasonMatches={
                  divisionPostseasonMatches.length > 0
                    ? divisionPostseasonMatches
                    : seasonPostseasonMatches
                }
              />
            </div>
          )}
        </section>
      )}

      {/* 3. TABLE STANDINGS / TRAJECTORY TABLE */}
      <section id="sec-standings" className="space-y-4">
        {/* Section Header with Segmented View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-200">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentSeason.isCurrent ? 'Division Standings & Progression' : 'Historical Final Standings'}
            </h2>
          </div>

          {/* Segmented View Switcher: Table | Trajectory */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDisplayMode === 'table'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Show Division Standings Table"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setDisplayMode('trajectory')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDisplayMode === 'trajectory'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Show Weekly Rank Progression Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trajectory</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeDisplayMode === 'table' && (
          <div className="animate-in fade-in duration-150">
            <StandingsTable
              standings={standings}
              divisionName={activeDivision?.name || 'League Table'}
              title="League Standings"
              starredTeam={starredTeam}
              onToggleStarTeam={onToggleStarTeam}
            />
          </div>
        )}

        {activeDisplayMode === 'trajectory' && (
          <div className="animate-in fade-in duration-150 space-y-3">
            {effectiveDivisions.map((division) => (
              <RankProgressionChart
                key={division.id}
                teams={teams.filter((t) => t.seasonId === selectedSeasonId)}
                matches={matches.filter((m) => m.seasonId === selectedSeasonId)}
                divisionId={division.id}
                divisionName={division.name}
                starredTeam={starredTeam}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. REGULAR SEASON MATCHES RESULTS */}
      <section id="sec-schedule" className="space-y-3">
        <div className="flex items-center gap-2 pb-1">
          <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
          <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
            Match Schedule & Results
          </h2>
        </div>
        <ScheduleView
          matches={matches.filter((m) => m.seasonId === selectedSeasonId)}
          teams={teams.filter((t) => t.seasonId === selectedSeasonId)}
          divisionId={selectedDivisionId}
          divisionName={activeDivision?.name || 'Division'}
          starredTeam={starredTeam}
          onToggleStarTeam={onToggleStarTeam}
          searchQuery={searchQuery}
        />
      </section>
    </div>
  );
};
