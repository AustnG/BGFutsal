import React, { useState, useEffect } from 'react';
import {
  DEFAULT_PUBLISHED_SHEET_BASE,
  loadInitialData,
  saveLeagueDataToStorage,
  syncWithGoogleSheet,
} from './services/googleSheetsSync';
import { LeagueDatabase, NewsStory, SyncStatus } from './types/league';
import { computeStandings } from './utils/calculations';
import { Navbar, MainNavTab } from './components/Navbar';
import { PinnedBanner } from './components/PinnedBanner';
import { HomeView } from './components/HomeView';
import { SeasonHubView, TableDisplayMode } from './components/SeasonHubView';
import { AboutView } from './components/AboutView';
import { RulesFaqView } from './components/RulesFaqView';
import { Footer } from './components/Footer';
import { SyncModal } from './components/SyncModal';
import { StoryModal } from './components/StoryModal';
import { INITIAL_LEAGUE_DATA } from './data/initialLeagueData';

const STARRED_TEAM_KEY = 'bgfutsal_starred_team_v1';

export default function App() {
  const [initial] = useState(() => loadInitialData());
  const [data, setData] = useState<LeagueDatabase>(initial.data);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(initial.syncStatus);

  // Active navigation tab (Home is default)
  const [activeTab, setActiveTab] = useState<MainNavTab>('home');

  // Season & Division Selection
  const currentSeason = data.seasons.find((s) => s.isCurrent) || data.seasons[0];
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    currentSeason?.id || 's2026-spring'
  );

  const seasonDivisions = data.divisions.filter((d) => d.seasonId === selectedSeasonId);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    seasonDivisions[0]?.id || ''
  );

  // Quick Team Search & "My Team" Bookmark
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [starredTeam, setStarredTeam] = useState<string | null>(() => {
    return localStorage.getItem(STARRED_TEAM_KEY) || null;
  });
  const [onlyMyTeam, setOnlyMyTeam] = useState<boolean>(false);

  // Modals & Pinned Story Banner
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Sync active division if season changes or divisions load
  useEffect(() => {
    const divs = data.divisions.filter((d) => d.seasonId === selectedSeasonId);
    if (divs.length > 0) {
      const exists = divs.some((d) => d.id === selectedDivisionId);
      if (!exists) {
        setSelectedDivisionId(divs[0].id);
      }
    }
  }, [selectedSeasonId, data.divisions, selectedDivisionId]);

  // Star / Unstar Team
  const handleToggleStarTeam = (teamName: string) => {
    if (starredTeam === teamName) {
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

  // Google Sheets Live Sync Handler
  const handleSyncGoogleSheet = async (sheetUrl: string) => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const result = await syncWithGoogleSheet(sheetUrl);
      setData(result.data);
      setSyncStatus({
        lastSynced: new Date().toLocaleString(),
        isSyncing: false,
        error: null,
        sheetUrl,
        dataSource: 'google-sheets',
        validationIssues: result.validationIssues,
      });
    } catch (err: any) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Failed to sync with Google Sheet. Please check permissions.',
      }));
    }
  };

  // Automatic Background Sync: Automatically polls and syncs from connected Google Sheet
  useEffect(() => {
    const configuredSheetUrl =
      (import.meta as any).env?.VITE_GOOGLE_SHEET_URL ||
      syncStatus.sheetUrl ||
      localStorage.getItem('bgfutsal_sheet_url_v1') ||
      DEFAULT_PUBLISHED_SHEET_BASE;

    if (configuredSheetUrl) {
      handleSyncGoogleSheet(configuredSheetUrl);

      // Poll periodically every 60 seconds so spreadsheet edits automatically update the app
      const pollInterval = setInterval(() => {
        handleSyncGoogleSheet(configuredSheetUrl);
      }, 60000);

      return () => clearInterval(pollInterval);
    }
  }, [syncStatus.sheetUrl]);

  const handleResetToBuiltIn = () => {
    setData(INITIAL_LEAGUE_DATA);
    saveLeagueDataToStorage(INITIAL_LEAGUE_DATA, '');
    setSyncStatus({
      lastSynced: null,
      isSyncing: false,
      error: null,
      sheetUrl: '',
      dataSource: 'built-in',
      validationIssues: [],
    });
  };

  // Filtered Divisions & Standings
  const currentDivisions = data.divisions.filter((d) => d.seasonId === selectedSeasonId);
  const effectiveDivisionId = selectedDivisionId || currentDivisions[0]?.id || '';

  const activeDivisionStandings = computeStandings(
    data.teams,
    data.matches,
    effectiveDivisionId
  );

  // Apply Search & My Team filters to standings
  const filteredStandings = activeDivisionStandings.filter((row) => {
    if (onlyMyTeam && starredTeam) {
      return row.teamName === starredTeam;
    }
    if (searchQuery) {
      return row.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Pinned announcement story
  const pinnedStory = data.news.find((n) => n.pinned);

  // Standings / Trajectory display mode for Season Hub
  const [seasonHubDisplayMode, setSeasonHubDisplayMode] = useState<TableDisplayMode>('table');

  // Navigation handlers from Home shortcuts
  const handleNavigateToCompetition = (sectionId?: 'standings' | 'schedule' | 'rankChart' | 'playoffs') => {
    if (sectionId === 'rankChart') {
      setSeasonHubDisplayMode('trajectory');
    } else if (sectionId === 'standings') {
      setSeasonHubDisplayMode('table');
    }
    setActiveTab('seasonHub');
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

  const handleNavigateToPage = (page?: 'about' | 'rules') => {
    setActiveTab(page || 'about');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Top Bar Navigation (Home, Seasons, About, Rules & FAQs + Mobile Bottom Bar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        starredTeam={starredTeam}
        onClearStarredTeam={handleClearStarredTeam}
        openSyncModal={() => setIsSyncModalOpen(true)}
        syncStatus={syncStatus}
      />

      {/* 2. Pinned Organizer Notice Banner */}
      {!bannerDismissed && pinnedStory && (
        <PinnedBanner
          pinnedStory={pinnedStory}
          onReadStory={(story) => setSelectedStory(story)}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* 3. Main Body Content Viewport with Responsive Mobile Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-8">
        {/* 1. HOME: News & Stories + Matchday Pulse + Live Standings with Co-located Controls */}
        {activeTab === 'home' && (
          <HomeView
            seasons={data.seasons}
            selectedSeasonId={selectedSeasonId}
            onSelectSeason={setSelectedSeasonId}
            divisions={data.divisions}
            selectedDivisionId={selectedDivisionId}
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
            matches={data.matches}
            onNavigateToCompetition={handleNavigateToCompetition}
            onNavigateToInfo={handleNavigateToPage}
          />
        )}

        {/* 2. SEASONS HUB: Consolidated Standings, Schedule, Trajectory Chart, Honors & Postseason Playoffs with Co-located Controls */}
        {activeTab === 'seasonHub' && (
          <SeasonHubView
            seasons={data.seasons}
            selectedSeasonId={selectedSeasonId}
            onSelectSeason={setSelectedSeasonId}
            divisions={data.divisions}
            selectedDivisionId={selectedDivisionId}
            onSelectDivision={setSelectedDivisionId}
            standings={filteredStandings}
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

        {/* 3. ABOUT: League Overview, Home Court Arena, Tiered Divisions, Leadership */}
        {activeTab === 'about' && <AboutView />}

        {/* 4. RULES & FAQS: Regulations Handbook, 4-Second Clock, Accumulated Fouls, FAQ Accordion */}
        {activeTab === 'rules' && <RulesFaqView />}
      </main>

      {/* 5. Modals */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        onSync={handleSyncGoogleSheet}
        onResetToBuiltIn={handleResetToBuiltIn}
      />

      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />

      {/* 6. Authority Multi-Column Footer with Emerald Accents */}
      <Footer
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onNavigateToSection={handleNavigateToCompetition}
        openSyncModal={() => setIsSyncModalOpen(true)}
        lastSynced={syncStatus.lastSynced}
        dataSource={syncStatus.dataSource}
      />
    </div>
  );
}
