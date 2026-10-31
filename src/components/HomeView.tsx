import React from 'react';
import { ArrowRight, User, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { Division, Match, NewsStory, Season, StandingRow } from '../types/league';
import { StandingsTable } from './StandingsTable';
import { SeasonDivisionControls } from './SeasonDivisionControls';

interface HomeViewProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSelectSeason: (id: string) => void;
  divisions: Division[];
  selectedDivisionId: string;
  onSelectDivision: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyMyTeam: boolean;
  onToggleOnlyMyTeam: () => void;
  standings: StandingRow[];
  stories: NewsStory[];
  onOpenStoryModal: (story: NewsStory) => void;
  starredTeam: string | null;
  onToggleStarTeam: (teamName: string) => void;
  matches: Match[];
  onNavigateToCompetition: (subView?: 'standings' | 'schedule' | 'rankChart' | 'playoffs') => void;
  onNavigateToInfo?: (sub?: 'about' | 'rules') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  seasons,
  selectedSeasonId,
  onSelectSeason,
  divisions,
  selectedDivisionId,
  onSelectDivision,
  searchQuery,
  onSearchChange,
  onlyMyTeam,
  onToggleOnlyMyTeam,
  standings,
  stories,
  onOpenStoryModal,
  starredTeam,
  onToggleStarTeam,
  matches,
  onNavigateToCompetition,
}) => {
  const seasonDivisions = divisions.filter((d) => d.seasonId === selectedSeasonId);
  const activeDivision =
    seasonDivisions.find((d) => d.id === selectedDivisionId) || seasonDivisions[0];

  const heroStory = stories.find((s) => s.pinned) || stories[0];
  const secondaryStories = stories.filter((s) => s.id !== heroStory?.id).slice(0, 3);

  // Next upcoming fixtures on Arena Main Court
  const upcomingMatches = matches
    .filter((m) => m.seasonId === selectedSeasonId && m.status === 'upcoming')
    .slice(0, 3);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. HERO SPOTLIGHT: High-End Compact Editorial Feature with Deep Navy Gradient Paneling */}
      {heroStory && (
        <section
          onClick={() => onOpenStoryModal(heroStory)}
          className="group relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0a1c36] to-[#06111f] rounded-2xl border border-[#172d4c] p-4 sm:p-6 transition-all hover:border-emerald-500/50 cursor-pointer shadow-lg hover:shadow-xl"
        >
          {/* Subtle Ambient Emerald Accent Lighting */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center relative z-10">
            {/* Image Frame */}
            <div className="lg:col-span-7 h-52 sm:h-64 lg:h-72 w-full rounded-xl overflow-hidden bg-[#050e1a] relative border border-[#1b3459]/60 shadow-md">
              {heroStory.imageUrl ? (
                <img
                  src={heroStory.imageUrl}
                  alt={heroStory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[#071324]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050e1a]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071222]/85 backdrop-blur-md border border-[#1b2d4b] text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Featured Dispatch</span>
              </div>
            </div>

            {/* Headline & Abstract */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-[11px] font-mono flex items-center gap-2 uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-emerald-400 font-semibold">
                  {heroStory.category}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal">{heroStory.date}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                {heroStory.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                {heroStory.summary}
              </p>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#172d4c]">
                <span className="flex items-center gap-1.5 font-normal">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{heroStory.author}</span>
                </span>

                <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all inline-flex items-center gap-1.5 text-xs">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. MATCHDAY PULSE STRIP: High-Density Arena Schedule Bar with Vibrant Emerald Glow */}
      {upcomingMatches.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#071324] via-[#0b1f3a] to-[#071324] text-white rounded-2xl p-4 sm:p-5 border border-[#162d4e] shadow-md">
          {/* Subtle Ambient Emerald Light Blur */}
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
                  Next on Arena Main Court
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Official matchday schedule
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-gradient-to-b from-[#0e213b] to-[#081628] rounded-xl p-2.5 sm:p-3 border border-[#1a3154] hover:border-emerald-500/50 transition-colors space-y-1 shadow-xs"
                >
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">GW {m.gameweek || 1}</span>
                    <span className="text-slate-300">{m.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {m.homeTeam}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 truncate">
                    <span className="text-slate-500 font-mono text-[10px] mr-1">vs</span>
                    {m.awayTeam}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToCompetition('schedule')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer self-start lg:self-auto"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      )}

      {/* 3. STANDINGS SNAPSHOT WITH CO-LOCATED CONTROLS */}
      <section id="sec-standings" className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
              Current Standings & Form
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              · {activeDivision?.name || 'League Table'}
            </span>
          </div>

          <button
            onClick={() => onNavigateToCompetition('standings')}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Seasons Hub</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Filter Toolbar Placed directly adjacent to Standings (Divisions Only on Homepage) */}
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
          showSeasonSelector={false}
        />

        <StandingsTable
          standings={standings}
          divisionName={activeDivision?.name || 'League Table'}
          starredTeam={starredTeam}
          onToggleStarTeam={onToggleStarTeam}
        />
      </section>

      {/* 4. LEAGUE STORIES GRID: Subtle Card Elevation & Emerald Accents */}
      {secondaryStories.length > 0 && (
        <section className="space-y-4 pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
              <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
                Latest Stories & Updates
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-normal">
              BGFutsal Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {secondaryStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onOpenStoryModal(story)}
                className="group cursor-pointer bg-white rounded-xl border border-slate-200/70 p-3.5 space-y-2.5 transition-all hover:border-emerald-500/50 shadow-xs hover:shadow-md"
              >
                <div className="h-36 sm:h-40 rounded-lg bg-[#071222] overflow-hidden relative">
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0a1526]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-semibold">
                    {story.category} <span className="text-slate-300 font-normal">·</span> <span className="text-slate-400 font-normal">{story.date}</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-[#0a1526] group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {story.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
