import React, { useState, useEffect, useMemo } from 'react';
import { useLeagueSync } from './hooks/useLeagueSync';
import { NewsStory } from './types/league';
import { computeStandings, isSameTeamName } from './utils/calculations';
import { Navbar, MainNavTab } from './components/Navbar';
import { PinnedBanner } from './components/PinnedBanner';
import { HomeView } from './components/HomeView';
import { SeasonHubView, TableDisplayMode } from './components/SeasonHubView';
import { AboutView } from './components/AboutView';
import { NewsGalleryView } from './components/NewsGalleryView';
import { RulesFaqView } from './components/RulesFaqView';
import { Footer } from './components/Footer';
import { SyncModal } from './components/SyncModal';
import { StoryModal } from './components/StoryModal';
import { getTabFromHash, setHashForTab } from './utils/routing';

const STARRED_TEAM_KEY = 'bgfutsal_starred_team_v1';

export default function App() {
  const { data, syncStatus, syncSheet, resetToBuiltIn } = useLeagueSync();

  const [activeTab, setActiveTab] = useState<MainNavTab>(() => getTabFromHash());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.location.hash.toLowerCase().startsWith('#/sync')
  );

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.toLowerCase().startsWith('#/sync')) {
        setIsSyncModalOpen(true);
        return;
      }
      setActiveTab(getTabFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTabChange = (tab: MainNavTab) => {
    setActiveTab(tab);
    setHashForTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Season & Division Selection
  const currentSeason = useMemo(
    () => data.seasons.find((s) => s.isCurrent) || data.seasons[0],
    [data.seasons]
  );

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    currentSeason?.id || 's2026-spring'
  );

  // Homepage always showcases the active season; Seasons Hub respects user selection
  const effectiveSeasonId =
    activeTab === 'home' ? currentSeason?.id || selectedSeasonId : selectedSeasonId;

  const currentDivisions = useMemo(
    () => data.divisions.filter((d) => d.seasonId === effectiveSeasonId),
    [data.divisions, effectiveSeasonId]
  );

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    currentDivisions[0]?.id || ''
  );

  // Quick Team Search & "My Team" Bookmark
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [starredTeam, setStarredTeam] = useState<string | null>(() => {
    return localStorage.getItem(STARRED_TEAM_KEY) || null;
  });
  const [onlyMyTeam, setOnlyMyTeam] = useState<boolean>(false);

  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [seasonHubDisplayMode, setSeasonHubDisplayMode] = useState<TableDisplayMode>('table');

  // Keep selectedSeasonId valid when data loads from Google Sheets
  useEffect(() => {
    const active = data.seasons.find((s) => s.isCurrent) || data.seasons[0];
    if (active && (!selectedSeasonId || !data.seasons.some((s) => s.id === selectedSeasonId))) {
      setSelectedSeasonId(active.id);
    }
  }, [data.seasons, selectedSeasonId]);

  // Sync active division if season changes or divisions load
  useEffect(() => {
    if (currentDivisions.length > 0) {
      const exists = currentDivisions.some((d) => d.id === selectedDivisionId);
      if (!exists) {
        setSelectedDivisionId(currentDivisions[0].id);
      }
    }
  }, [currentDivisions, selectedDivisionId]);

  const handleToggleStarTeam = (teamName: string) => {
    if (isSameTeamName(starredTeam, teamName)) {
      setStarredTeam(null);
      localStorage.removeItem(STARRED_TEAM_KEY);
      setOnlyMyTeam(false);
    } else {
      setStarredTeam(teamName);
      localStorage.setItem(STARRED_TEAM_KEY, teamName);
    }
  };

  const handleClearStarredTeam = () => {
    setStarredTeam(null);
    localStorage.removeItem(STARRED_TEAM_KEY);
    setOnlyMyTeam(false);
  };

  const effectiveDivisionId = useMemo(
    () =>
      currentDivisions.find((d) => d.id === selectedDivisionId)?.id ||
      currentDivisions[0]?.id ||
      '',
    [currentDivisions, selectedDivisionId]
  );

  const currentSeasonMatches = useMemo(
    () => data.matches.filter((m) => m.seasonId === effectiveSeasonId),
    [data.matches, effectiveSeasonId]
  );

  // Memoized division standings (unfiltered, used for playoff seedings + base table)
  const activeDivisionStandings = useMemo(
    () =>
      computeStandings(
        data.teams,
        data.matches,
        effectiveDivisionId,
        effectiveSeasonId
      ),
    [data.teams, data.matches, effectiveDivisionId, effectiveSeasonId]
  );

  const filteredStandings = useMemo(() => {
    return activeDivisionStandings.filter((row) => {
      if (onlyMyTeam && starredTeam) {
        return isSameTeamName(row.teamName, starredTeam);
      }
      if (searchQuery) {
        return row.teamName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [activeDivisionStandings, onlyMyTeam, starredTeam, searchQuery]);

  const pinnedStory = useMemo(() => data.news.find((n) => n.pinned), [data.news]);

  const handleNavigateToCompetition = (
    sectionId?: 'standings' | 'schedule' | 'rankChart' | 'playoffs'
  ) => {
    if (sectionId === 'rankChart') {
      setSeasonHubDisplayMode('trajectory');
    } else if (sectionId === 'standings') {
      setSeasonHubDisplayMode('table');
    }
    handleTabChange('seasonHub');
    if (sectionId) {
      setTimeout(() => {
        const targetMap: Record<string, string> = {
          standings: 'sec-standings',
          schedule: 'sec-schedule',
          rankChart: 'sec-standings',
          playoffs: 'sec-playoffs',
        };
        const el =
          document.getElementById(targetMap[sectionId] || 'sec-standings') ||
          document.getElementById('sec-standings');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleNavigateToPage = (page?: 'about' | 'rules' | 'newsGallery') => {
    handleTabChange(page || 'about');
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        starredTeam={starredTeam}
        onClearStarredTeam={handleClearStarredTeam}
      />

      {!bannerDismissed && pinnedStory && (
        <PinnedBanner
          pinnedStory={pinnedStory}
          onReadStory={(story) => setSelectedStory(story)}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-10 sm:pb-14">
        {activeTab === 'home' && (
          <HomeView
            seasons={data.seasons}
            selectedSeasonId={effectiveSeasonId}
            onSelectSeason={setSelectedSeasonId}
            divisions={data.divisions}
            selectedDivisionId={effectiveDivisionId}
            onSelectDivision={setSelectedDivisionId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onlyMyTeam={onlyMyTeam}
            onToggleOnlyMyTeam={() => setOnlyMyTeam(!onlyMyTeam)}
            standings={filteredStandings}
            stories={data.news}
            onOpenStoryModal={(story) => setSelectedStory(story)}
            starredTeam={starredTeam}
            onToggleStarTeam={handleToggleStarTeam}
            matches={currentSeasonMatches}
            onNavigateToCompetition={handleNavigateToCompetition}
            onNavigateToInfo={handleNavigateToPage}
          />
        )}

        {activeTab === 'seasonHub' && (
          <SeasonHubView
            seasons={data.seasons}
            selectedSeasonId={selectedSeasonId}
            onSelectSeason={setSelectedSeasonId}
            divisions={data.divisions}
            selectedDivisionId={effectiveDivisionId}
            onSelectDivision={setSelectedDivisionId}
            standings={filteredStandings}
            unfilteredStandings={activeDivisionStandings}
            matches={data.matches}
            teams={data.teams}
            honors={data.honors}
            starredTeam={starredTeam}
            onToggleStarTeam={handleToggleStarTeam}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onlyMyTeam={onlyMyTeam}
            onToggleOnlyMyTeam={() => setOnlyMyTeam(!onlyMyTeam)}
            displayMode={seasonHubDisplayMode}
            onDisplayModeChange={setSeasonHubDisplayMode}
          />
        )}

        {activeTab === 'newsGallery' && (
          <NewsGalleryView
            stories={data.news}
            onOpenStoryModal={(story) => setSelectedStory(story)}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'rules' && <RulesFaqView />}
      </main>

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          if (window.location.hash.toLowerCase().startsWith('#/sync')) {
            setHashForTab(activeTab);
          }
        }}
        syncStatus={syncStatus}
        onSync={syncSheet}
        onResetToBuiltIn={resetToBuiltIn}
      />

      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />

      <Footer activeTab={activeTab} onNavigateTab={handleTabChange} />
    </div>
  );
}
