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
              <span className="text-xs text-slate-400 font-normal">
                · {currentSeason.name} {activeDivision ? `· ${activeDivision.name}` : ''}
              </span>
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
                      {/* Division Winner */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-500/12 via-amber-500/[0.03] to-white space-y-2.5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                            Division Champion
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-amber-100/90 border border-amber-200/90 flex items-center justify-center text-amber-700 shadow-xs">
                            <Trophy className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
                          {divisionWinner?.recipient || divisionWinner?.teamName || 'Record Pending'}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-mono">
                          {divisionWinner?.statDetail || 'Historical champion recorded.'}
                        </p>
                      </div>

                      {/* Golden Boot */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl border border-emerald-300/80 bg-gradient-to-br from-emerald-500/12 via-emerald-500/[0.03] to-white space-y-2.5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
                            The Golden Boot
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-100/90 border border-emerald-200/90 flex items-center justify-center text-emerald-700 shadow-xs">
                            <Award className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
                          {goldenBoot?.recipient || 'Record Pending'}
                        </h3>
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-[#0a1526]">{goldenBoot?.teamName}</span>
                          <p className="font-mono mt-0.5 text-[11px] text-emerald-700 font-medium">{goldenBoot?.statDetail}</p>
                        </div>
                      </div>

                      {/* Golden Glove */}
                      <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl border border-sky-300/80 bg-gradient-to-br from-sky-500/12 via-sky-500/[0.03] to-white space-y-2.5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-sky-800 font-semibold">
                            The Golden Glove
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-sky-100/90 border border-sky-200/90 flex items-center justify-center text-sky-700 shadow-xs">
                            <Shield className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
                          {goldenGlove?.recipient || 'Record Pending'}
                        </h3>
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-[#0a1526]">{goldenGlove?.teamName}</span>
                          <p className="font-mono mt-0.5 text-[11px] text-sky-700 font-medium">{goldenGlove?.statDetail}</p>
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
      <section id="sec-standings" className="space-y-3">
        {/* Section Header with Segmented View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
              {currentSeason.isCurrent ? 'Division Standings & Progression' : 'Historical Final Standings'}
            </h2>

          </div>

          {/* Segmented View Switcher: Table | Trajectory */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/60 self-start sm:self-auto">
            <button
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDisplayMode === 'table'
                  ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
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
                  ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
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
