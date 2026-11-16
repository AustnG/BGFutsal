import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Division, Match, NewsStory, Season, StandingRow } from '../types/league';
import { StandingsTable } from './StandingsTable';
import { SeasonDivisionControls } from './SeasonDivisionControls';
import { LEAGUE_PHOTOS, MediaPhoto } from '../data/mediaAssets';
import { ImageLightbox } from './ImageLightbox';
import { PageHeader } from './ui/PageHeader';
import { SectionHeader } from './ui/SectionHeader';
import { MatchTickerCard } from './ui/MatchTickerCard';
import { EditorialPhotoFrame } from './ui/EditorialPhotoFrame';
import { formatMatchTimeCT, parseFlexibleDateMs } from '../utils/dateTime';
import { isSameTeamName } from '../utils/calculations';

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
  onNavigateToCompetition: (
    subView?: 'standings' | 'schedule' | 'rankChart' | 'playoffs'
  ) => void;
  onNavigateToInfo?: (sub?: 'about' | 'rules' | 'newsGallery') => void;
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
  onNavigateToInfo,
}) => {
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<MediaPhoto | null>(null);

  const seasonDivisions = divisions.filter((d) => d.seasonId === selectedSeasonId);
  const activeDivision =
    seasonDivisions.find((d) => d.id === selectedDivisionId) || seasonDivisions[0];

  // Deterministic descending sort preserving original sheet order on ties
  const sortedStories = useMemo(() => {
    return [...stories]
      .map((story, idx) => ({ story, idx, ms: parseFlexibleDateMs(story.date) }))
      .sort((a, b) => {
        if (a.ms !== b.ms) return b.ms - a.ms;
        return a.idx - b.idx;
      })
      .map((entry) => entry.story);
  }, [stories]);

  // Latest article is strictly the hero dispatch; next 3 appear in Latest Stories & Updates
  const heroStory = sortedStories[0];
  const secondaryStories = sortedStories.slice(1, 4);

  const upcomingMatches = useMemo(() => {
    return matches
      .filter((m) => m.seasonId === selectedSeasonId && m.status === 'upcoming')
      .slice(0, 3);
  }, [matches, selectedSeasonId]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. HERO DISPATCH */}
      {heroStory && (
        <PageHeader
          variant="feature"
          badgeLabel="Latest Dispatch"
          kicker={heroStory.category}
          kickerMeta={heroStory.date}
          title={heroStory.title}
          description={heroStory.summary}
          imageUrl={heroStory.imageUrl}
          imageAlt={heroStory.title}
          author={heroStory.author}
          ctaLabel="Read Full Story"
          onClick={() => onOpenStoryModal(heroStory)}
        />
      )}

      {/* 2. MATCHDAY PULSE: Next on Arena Main Court */}
      {upcomingMatches.length > 0 && (
        <section className="space-y-3.5">
          <SectionHeader
            title="Next on Arena Main Court"
            kicker="Central Time (CT) · F.O. Moxley"
            accent="green"
            rightSlot={
              <button
                type="button"
                onClick={() => onNavigateToCompetition('schedule')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {upcomingMatches.map((m) => {
              const homeStarred = isSameTeamName(starredTeam, m.homeTeam);
              const awayStarred = isSameTeamName(starredTeam, m.awayTeam);
              return (
                <MatchTickerCard
                  key={m.id}
                  metaLeft={m.isPostseason ? m.roundName || 'Playoff' : `GW ${m.gameweek || 1}`}
                  metaRight={formatMatchTimeCT(m.time)}
                  statusLabel="Upcoming"
                  statusTone="upcoming"
                  isStarredMatch={homeStarred || awayStarred}
                  home={{ name: m.homeTeam, isStarred: homeStarred }}
                  away={{ name: m.awayTeam, isStarred: awayStarred }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 3. CURRENT STANDINGS & FORM */}
      <section id="sec-standings" className="space-y-3.5">
        <SectionHeader
          title="Current Standings & Form"
          countLabel={activeDivision?.name}
          accent="leader"
          rightSlot={
            <a
              href="#/seasons"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToCompetition('standings');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <span>Open Seasons Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

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
          variant="card"
          showSeasonSelector={false}
        />

        <StandingsTable
          standings={standings}
          divisionName={activeDivision?.name || 'League Table'}
          title={activeDivision?.name ? `${activeDivision.name} Standings` : 'League Standings'}
          starredTeam={starredTeam}
          onToggleStarTeam={onToggleStarTeam}
        />
      </section>

      {/* 4. LATEST STORIES & UPDATES */}
      {secondaryStories.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Latest Stories & Updates"
            accent="blue"
            rightSlot={
              <button
                type="button"
                onClick={() => onNavigateToInfo?.('newsGallery')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>All News &amp; Media ({stories.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {secondaryStories.map((story) => (
              <EditorialPhotoFrame
                key={story.id}
                src={story.imageUrl}
                alt={story.title}
                aspect="16/9"
                kicker={story.category}
                metaRight={story.date}
                title={story.title}
                caption={story.summary}
                footerLeft={story.author}
                footerLabel="Read Story"
                onClick={() => onOpenStoryModal(story)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. MATCHDAY MOMENTS & HIGHLIGHTS */}
      <section className="space-y-4">
        <SectionHeader
          title="Matchday Moments & Highlights"
          accent="green"
          rightSlot={
            <button
              type="button"
              onClick={() => onNavigateToInfo?.('newsGallery')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <span>Explore News &amp; Gallery ({LEAGUE_PHOTOS.length} Photos)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {LEAGUE_PHOTOS.slice(0, 4).map((photo) => (
            <EditorialPhotoFrame
              key={photo.id}
              src={photo.src}
              alt={photo.title}
              aspect="4/3"
              kicker={photo.categoryLabel}
              metaRight={photo.date}
              title={photo.title}
              footerLeft={photo.location}
              onClick={() => setActiveGalleryPhoto(photo)}
            />
          ))}
        </div>
      </section>

      <ImageLightbox
        photo={activeGalleryPhoto}
        photos={LEAGUE_PHOTOS}
        onClose={() => setActiveGalleryPhoto(null)}
        onSelectPhoto={(photo) => setActiveGalleryPhoto(photo)}
      />
    </div>
  );
};
