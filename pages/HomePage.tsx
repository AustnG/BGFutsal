

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  SHORT_LEAGUE_NAME, 
  TEAMS_SHEET_URL, 
  SETTINGS_SHEET_URL, 
  GAMES_SHEET_URL, 
  NEWS_SHEET_URL, 
  SEASONS_SHEET_URL,
  MAX_NEWS_ITEMS_HOMEPAGE, 
} from '../constants.ts';
import { CalendarIcon } from '../components/icons/CalendarIcon.tsx';
import { NewspaperIcon } from '../components/icons/NewspaperIcon.tsx';
import { CameraIcon } from '../components/icons/CameraIcon.tsx';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon.tsx';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { fetchSheetData } from '../services/sheetService.ts';
import { parseCsvData } from '../utils/csvParser.ts';
import { 
  TeamStatsData, 
  SheetTeamWithStats, 
  Division, 
  SheetSettings, 
  ProcessedGame, 
  SheetGame, 
  StandingRow,
  SheetNewsItem, 
  ProcessedNewsItem,
  SheetSeason
} from '../types.ts';
import { MinusIcon } from '../components/icons/MinusIcon.tsx';
import { calculateStandings } from '../utils/standingsCalculator.ts';
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon.tsx';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon.tsx';
import { processGames, processNews, processTeams, processSeasons } from '../utils/dataProcessing.ts';

const galleryImages = [
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjlO46blYNR5-LYlr8C8m0lVaESDqu9sTMczhqCyfIZ2xwSJPTzpPZkYa6V5hgG1cmzZoo2Aa_h5_gTeI0lRwPqn1yGGj_DK0h20NLykGfiXOzuUeAJCTcU9Mg6NBVwXL6SjD4IcGgcRq9HUyMFbbVvrxWJ-zsgXUNiAptUTercms2xzIUZuhInYAjDMU/s320/001.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjuwBPpny5oCM7-l3YKRxqmmAWf-qHJBLPUS1njHoWk6g6SjDDa5hfW9LVSjmSYNTw4hweyeOq8ih7qmy82mWSRHwmQPmX2x-OjsZWACI2nEY9_C_HLEy6ba8UO9r-LMwT5k3tg2roLT6H1gb9FYBjg-5vbqbvt-90wX9uGy2ubcbgnh6bKZDLfP2PO0Nk/s320/002.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjHKNgO4_y5Cxl2Tkf14GRa5d2ZCXtIW3gsaVch-_42qriZC9Ruyzmx_8V4OA2wmk28JiPdc77gcUElMu4LoJFRdBRA3w2NgFb0GPCWcPku5b07iUR8nqQHkp3y1o9y8WmWgQTPND-ajCBO0J5T6-KF5VX8dXnCpdCqogiDrA0qYwtpjCLHEa_pcU53CyM/s320/003.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJ64NF6cRveW2IXBGCPo2ifM19xGVZeYzpV6lPra9y2N0k_fcfGZ5ufeY4DJtjX7cspc8MvSC5cmuNm19Hn9ATkxANvhTx5S_XbOtEiBmHerJbKn2cQ5C4p3I8JGBOYQNYqB-3cypmmPEXZuMd3DDH5Avyw3GtXDp0wcVTqiysuU9i2SyZo7onI7k6pFM/s320/004.jpg"
];

const SectionHeader: React.FC<{ title: string; icon: React.ElementType; }> = ({ title, icon: Icon }) => (
  <h2 className="font-display text-3xl font-bold text-light-text mb-6 flex items-center">
    <Icon className="w-8 h-8 mr-3 text-highlight-gold" />
    {title}
  </h2>
);

const HomePage: React.FC = () => {
  const cardBaseStyle = "bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border";

  // Standings state
  const [allGames, setAllGames] = useState<ProcessedGame[]>([]);
  const [allStandingsDataFromSheet, setAllStandingsDataFromSheet] = useState<TeamStatsData[]>([]);
  const [currentStandings, setCurrentStandings] = useState<TeamStatsData[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<Division>(Division.A);
  const [availableDivisions, setAvailableDivisions] = useState<Division[]>([]);
  const [defaultYear, setDefaultYear] = useState<string>('');
  const [defaultSeasonName, setDefaultSeasonName] = useState<string>('');
  const [loadingStandings, setLoadingStandings] = useState<boolean>(true); // Represents general data loading
  const [standingsError, setStandingsError] = useState<string | null>(null); // Represents general data error

  // News state
  const [newsItems, setNewsItems] = useState<ProcessedNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Matchweek state
  const [matchweeks, setMatchweeks] = useState<(string | number)[]>([]);
  const [selectedMatchweek, setSelectedMatchweek] = useState<string | number | null>(null);

  const fetchData = useCallback(async () => {
    setLoadingStandings(true);
    setStandingsError(null);
    setLoadingNews(true);
    setNewsError(null);

    try {
      const [settingsCsv, teamsCsv, gamesCsv, newsCsv, seasonsCsv] = await Promise.all([
        fetchSheetData(SETTINGS_SHEET_URL),
        fetchSheetData(TEAMS_SHEET_URL),
        fetchSheetData(GAMES_SHEET_URL),
        fetchSheetData(NEWS_SHEET_URL), 
        fetchSheetData(SEASONS_SHEET_URL),
      ]);

      // Process News
      const rawNews = parseCsvData<SheetNewsItem>(newsCsv);
      setNewsItems(processNews(rawNews));

      // Process Settings
      const rawSettings = parseCsvData<SheetSettings>(settingsCsv);
      let foundYear = '';
      for (const setting of rawSettings) {
        const year = setting.Year?.trim();
        if (year) {
          foundYear = year;
          break;
        }
      }
      setDefaultYear(foundYear);
      let foundSeasonName = '';
      for (const setting of rawSettings) {
        const season = setting.Season?.trim();
        if (season) {
          foundSeasonName = season;
          break;
        }
      }
      setDefaultSeasonName(foundSeasonName);
      
      // Process Seasons to determine available divisions
      const rawSeasons = parseCsvData<SheetSeason>(seasonsCsv);
      const processedSeasons = processSeasons(rawSeasons);
      
      const relevantSeasons = processedSeasons.filter(s => 
          s.year === foundYear && s.seasonName === foundSeasonName
      );
      const uniqueDivs = Array.from(new Set(relevantSeasons.map(s => s.division))).sort();
      setAvailableDivisions(uniqueDivs);

      let foundDivision: Division = Division.A;
      // Try to find default division from settings
      const activeSetting = rawSettings.find(s => s.Year && s.Season);
      if (activeSetting && activeSetting.Division) {
          foundDivision = activeSetting.Division.trim().toUpperCase();
      } else {
          // If no setting, or setting empty, default to first available division if any
          if (uniqueDivs.length > 0) {
              foundDivision = uniqueDivs[0];
          } else {
              foundDivision = Division.Unknown;
          }
      }
      
      // Ensure foundDivision is actually available, otherwise fallback
      if (uniqueDivs.length > 0 && !uniqueDivs.includes(foundDivision)) {
          foundDivision = uniqueDivs[0];
      }
      
      setSelectedDivision(foundDivision);

      // Process Games
      const rawGames = parseCsvData<SheetGame>(gamesCsv);
      setAllGames(processGames(rawGames));

      // Process Standings Data from Teams Sheet
      const rawTeamsWithStats = parseCsvData<SheetTeamWithStats>(teamsCsv);
      setAllStandingsDataFromSheet(processTeams(rawTeamsWithStats));

    } catch (err) {
      console.error("Failed to fetch home page data:", err);
      if (err instanceof Error) {
        if (err.message.includes(NEWS_SHEET_URL)) {
            setNewsError('Failed to load news. Please try again later.');
        } else {
            // General error for standings and upcoming games
            setStandingsError('Failed to load league data. Please try again later.');
        }
      } else {
        setStandingsError('An unknown error occurred while loading league data.');
      }
    } finally {
      setLoadingStandings(false);
      setLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combined effect for Standings and Matchweek calculation
  useEffect(() => {
    if (loadingStandings || !defaultYear || !defaultSeasonName) {
      setCurrentStandings([]);
      setMatchweeks([]);
      setSelectedMatchweek(null);
      return;
    }

    // --- Standings Calculation ---
    let targetSeasonKey = `${defaultYear} ${defaultSeasonName}`;
    if (selectedDivision !== Division.Unknown) {
        targetSeasonKey += ` ${selectedDivision}`;
    }
    const relevantRegularGamesForStandings = allGames.filter(game =>
      game.seasonName.toLowerCase() === targetSeasonKey.toLowerCase() &&
      game.gameType === 'Regular' &&
      !isNaN(game.homeScore) && !isNaN(game.awayScore)
    );

    const uniqueTeamNames = new Set<string>();
    const knownTeamPlaceholders = ["unknown home", "unknown away", "tbd"];
    relevantRegularGamesForStandings.forEach(game => {
      if (game.homeTeam && !knownTeamPlaceholders.includes(game.homeTeam.toLowerCase())) uniqueTeamNames.add(game.homeTeam);
      if (game.awayTeam && !knownTeamPlaceholders.includes(game.awayTeam.toLowerCase())) uniqueTeamNames.add(game.awayTeam);
    });
    allStandingsDataFromSheet.forEach(sheetRow => {
      if (sheetRow.year === defaultYear && sheetRow.seasonName.toLowerCase() === defaultSeasonName.toLowerCase() && sheetRow.division === selectedDivision && sheetRow.teamName && !knownTeamPlaceholders.includes(sheetRow.teamName.toLowerCase())) {
        uniqueTeamNames.add(sheetRow.teamName);
      }
    });

    const initialTeamRows: StandingRow[] = Array.from(uniqueTeamNames).map(name => ({
      teamName: name, division: selectedDivision, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }));
    const calculatedStandingsCore = calculateStandings(relevantRegularGamesForStandings, initialTeamRows);
    const mergedStandings = calculatedStandingsCore.map(coreRow => {
      const sheetDataForTeam = allStandingsDataFromSheet.find(sheetRow =>
        sheetRow.teamName === coreRow.teamName && sheetRow.year === defaultYear && sheetRow.seasonName.toLowerCase() === defaultSeasonName.toLowerCase() && sheetRow.division === selectedDivision
      );
      return { 
        ...coreRow, 
        year: defaultYear, 
        seasonName: defaultSeasonName, 
        rankChange: sheetDataForTeam?.rankChange, 
        twoWeekResult: sheetDataForTeam?.twoWeekResult, 
        lastWeekResult: sheetDataForTeam?.lastWeekResult, 
        currentWeekResult: sheetDataForTeam?.currentWeekResult, 
        teamColor: sheetDataForTeam?.teamColor,
        dropped: sheetDataForTeam?.dropped || false,
      };
    });
    const sortedData = mergedStandings.sort((a, b) => {
      if (a.dropped !== b.dropped) return a.dropped ? 1 : -1;
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });
    setCurrentStandings(sortedData);

    // --- Matchweek Calculation ---
    const seasonGames = allGames.filter(game =>
      game.seasonName.toLowerCase().startsWith(`${defaultYear} ${defaultSeasonName}`.toLowerCase())
    );
    
    const playoffTypes = ['Quarter Finals', 'Semi Finals', 'Finals'];
    const weekIdentifiers = new Set<string | number>();

    seasonGames.forEach(g => {
        if (g.gameWeek !== null && g.gameWeek !== undefined && String(g.gameWeek).trim() !== '') {
            weekIdentifiers.add(g.gameWeek);
        } else if (playoffTypes.includes(g.gameType)) {
            weekIdentifiers.add(g.gameType);
        }
    });

    const uniqueWeeks: (string | number)[] = Array.from(weekIdentifiers);

    const playoffOrder: { [key: string]: number } = {
        'Quarter Finals': 101,
        'Semi Finals': 102,
        'Finals': 103,
    };

    const sortedWeeks: (string | number)[] = uniqueWeeks.sort((a, b) => {
        const getSortValue = (week: string | number): number => {
            if (typeof week === 'string' && playoffOrder[week]) {
                return playoffOrder[week];
            }
            const num = parseInt(String(week), 10);
            return isNaN(num) ? Infinity : num;
        };
        return getSortValue(a) - getSortValue(b);
    });
    setMatchweeks(sortedWeeks);

    if (sortedWeeks.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let defaultWeek: string | number | null = null;
      for (const week of sortedWeeks) {
        const hasFutureGame = seasonGames.some(g => {
            const gameWeekIdentifier = (g.gameWeek !== null && g.gameWeek !== undefined && String(g.gameWeek).trim() !== '') ? g.gameWeek : (playoffTypes.includes(g.gameType) ? g.gameType : null);
            return gameWeekIdentifier === week && g.date >= today;
        });
        if (hasFutureGame) {
          defaultWeek = week;
          break;
        }
      }
      setSelectedMatchweek(defaultWeek || sortedWeeks[sortedWeeks.length - 1]);
    } else {
      setSelectedMatchweek(null);
    }
  }, [allGames, allStandingsDataFromSheet, defaultYear, defaultSeasonName, selectedDivision, loadingStandings]);
  
  const handlePrevMatchweek = () => {
    if (selectedMatchweek) {
      const currentIndex = matchweeks.indexOf(selectedMatchweek);
      if (currentIndex > 0) {
        setSelectedMatchweek(matchweeks[currentIndex - 1]);
      }
    }
  };

  const handleNextMatchweek = () => {
    if (selectedMatchweek) {
      const currentIndex = matchweeks.indexOf(selectedMatchweek);
      if (currentIndex < matchweeks.length - 1) {
        setSelectedMatchweek(matchweeks[currentIndex + 1]);
      }
    }
  };

  const matchweekTitle = useMemo(() => {
    if (!selectedMatchweek) return '-';
    // Check if it's a string that's not a number (e.g., 'Finals')
    if (typeof selectedMatchweek === 'string' && isNaN(parseInt(selectedMatchweek, 10))) {
      return selectedMatchweek;
    }
    return `Matchweek ${selectedMatchweek}`;
  }, [selectedMatchweek]);

  const gamesForSelectedMatchweek = useMemo(() => {
    if (!selectedMatchweek) return [];
    const playoffTypes = ['Quarter Finals', 'Semi Finals', 'Finals'];
    return allGames
      .filter(game => {
        const gameWeekIdentifier = (game.gameWeek !== null && game.gameWeek !== undefined && String(game.gameWeek).trim() !== '') 
          ? game.gameWeek 
          : (playoffTypes.includes(game.gameType) ? game.gameType : null);
        
        return game.seasonName.toLowerCase().startsWith(`${defaultYear} ${defaultSeasonName}`.toLowerCase()) && gameWeekIdentifier === selectedMatchweek;
      })
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        // Simple time string comparison as fallback (e.g., "19:30" vs "20:30")
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [allGames, defaultYear, defaultSeasonName, selectedMatchweek]);

  const groupedGamesByDate = useMemo(() => {
    return gamesForSelectedMatchweek.reduce((acc, game) => {
      const dateKey = game.date.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(game);
      return acc;
    }, {} as Record<string, ProcessedGame[]>);
  }, [gamesForSelectedMatchweek]);

  const matchweekDateRange = useMemo(() => {
    if (gamesForSelectedMatchweek.length === 0) return '';
    const dates = gamesForSelectedMatchweek.map(g => g.date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (minDate.toDateString() === maxDate.toDateString()) {
      return minDate.toLocaleDateString('en-US', { weekday: 'short', ...options });
    }
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  }, [gamesForSelectedMatchweek]);

  const getRankChangeIcon = (rankChange?: string) => {
      if (rankChange === 'Up') return <ChevronUpIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Rank up" />;
      if (rankChange === 'Down') return <ChevronDownIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Rank down" />;
      if (rankChange === 'Same') return <MinusIcon className="w-5 h-5 text-secondary-text mx-auto" aria-label="Rank same" />;
      return <MinusIcon className="w-5 h-5 text-gray-600 mx-auto" aria-label="No change in rank" />;
  };
  
  const getResultIndicator = (result?: string, isCurrentWeek = false) => {
    if (!result || !['W', 'D', 'L'].includes(result.toUpperCase())) {
        return <span className="text-secondary-text mx-auto">-</span>;
    }

    const upperResult = result.toUpperCase();
    let bgColor = '';
    let label = '';
    switch (upperResult) {
        case 'W':
            bgColor = 'bg-green-500';
            label = 'Win';
            break;
        case 'D':
            bgColor = 'bg-gray-500';
            label = 'Draw';
            break;
        case 'L':
            bgColor = 'bg-red-500';
            label = 'Loss';
            break;
    }

    return (
        <div className="relative flex justify-center">
            <div 
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-white ${bgColor}`} 
                aria-label={label + (isCurrentWeek ? ' (Current Week)' : '')}
            >
                {upperResult}
            </div>
            {isCurrentWeek && <div className={`absolute -bottom-1 w-4 h-0.5 ${bgColor} rounded-md`} aria-hidden="true"></div>}
        </div>
    );
  };

  const numDays = Object.keys(groupedGamesByDate).length;
  let gridColsClass = 'grid-cols-1';
  if (numDays === 2) {
    gridColsClass = 'md:grid-cols-2';
  } else if (numDays === 3) {
    gridColsClass = 'md:grid-cols-3';
  } else if (numDays >= 4) {
    gridColsClass = 'md:grid-cols-2 lg:grid-cols-4';
  }

  return (
    <div className="space-y-16">
      <section className={cardBaseStyle} aria-labelledby="latest-news-title">
        <SectionHeader title="Latest News & Announcements" icon={NewspaperIcon} />
        {loadingNews && <LoadingSpinner />}
        {newsError && <p className="text-red-500 text-center">{newsError}</p>}
        {!loadingNews && !newsError && newsItems.length === 0 && (
          <p className="text-center text-secondary-text py-4">No news items available at the moment.</p>
        )}
        {!loadingNews && !newsError && newsItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Featured Item (Index 0) */}
            {newsItems[0] && (
              <div className="flex flex-col group h-full">
                   {/* Link wrapper if link exists */}
                   <a href={newsItems[0].link || '#'} className="block h-full flex flex-col">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-5 border border-dark-border/50 group-hover:border-highlight-gold/50 transition-colors">
                         {newsItems[0].imageUrl ? (
                            <img src={newsItems[0].imageUrl} alt={newsItems[0].title} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                         ) : (
                            <div className="w-full h-full bg-dark-bg flex items-center justify-center text-secondary-text">No Image</div>
                         )}
                      </div>
                      <div className="space-y-3 flex-grow">
                         <h3 className="font-display text-3xl md:text-4xl font-bold text-light-text leading-tight group-hover:text-highlight-gold transition-colors">
                            {newsItems[0].title}
                         </h3>
                         <div className="flex items-center text-sm font-medium text-main-green uppercase tracking-wider mt-1">
                            {newsItems[0].category || 'News'}
                         </div>
                         <p className="text-secondary-text text-lg leading-relaxed">
                            {newsItems[0].content}
                         </p>
                      </div>
                   </a>
              </div>
            )}

            {/* Side List (Indices 1-3) */}
            {newsItems.length > 1 && (
              <div className="flex flex-col divide-y divide-dark-border/50">
                 {newsItems.slice(1, MAX_NEWS_ITEMS_HOMEPAGE).map((item) => (
                    <a key={item.id} href={item.link || '#'} className="flex items-start gap-4 py-6 first:pt-0 last:pb-0 group">
                       <div className="flex-grow space-y-2">
                           <h4 className="font-display text-xl font-bold text-light-text leading-snug group-hover:text-highlight-gold transition-colors line-clamp-2">
                              {item.title}
                           </h4>
                           <div className="text-xs text-main-green font-medium uppercase tracking-wider">
                              {item.category || 'News'}
                           </div>
                           <p className="text-secondary-text text-sm line-clamp-3 leading-relaxed">
                              {item.content}
                           </p>
                       </div>
                       {item.imageUrl && (
                          <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border border-dark-border/50 group-hover:border-highlight-gold/50 transition-colors shadow-sm">
                             <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
                          </div>
                       )}
                    </a>
                 ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className={cardBaseStyle} aria-labelledby="matchweek-title">
        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
          <SectionHeader title={`${defaultSeasonName} ${defaultYear}`} icon={CalendarIcon} />
           <div className="flex items-center space-x-2 md:space-x-4 bg-dark-bg/50 p-2 rounded-lg border border-dark-border/50">
            <button 
              onClick={handlePrevMatchweek} 
              disabled={!selectedMatchweek || matchweeks.indexOf(selectedMatchweek) === 0}
              className="p-1.5 rounded-md hover:bg-main-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              aria-label="Previous Matchweek"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
               <h3 id="matchweek-title" className="text-lg font-bold font-display tracking-wide uppercase">
                 {matchweekTitle}
               </h3>
               <p className="text-xs text-secondary-text">{matchweekDateRange}</p>
            </div>
            <button 
              onClick={handleNextMatchweek} 
              disabled={!selectedMatchweek || matchweeks.indexOf(selectedMatchweek) === matchweeks.length - 1}
              className="p-1.5 rounded-md hover:bg-main-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              aria-label="Next Matchweek"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loadingStandings && <LoadingSpinner />}
        {!loadingStandings && standingsError && <p className="text-red-500 text-center">{standingsError}</p>}
        
        {!loadingStandings && !standingsError && (
          <>
            {Object.keys(groupedGamesByDate).length > 0 ? (
              <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
                {Object.entries(groupedGamesByDate).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()).map(([dateStr, gamesOnDate]: [string, ProcessedGame[]]) => (
                  <div key={dateStr} className="flex flex-col bg-dark-bg/40 rounded-xl p-4 border border-dark-border/50 shadow-sm">
                    <h4 className="font-bold text-main-green mb-5 text-lg uppercase tracking-wider text-center pb-3 border-b border-dark-border">
                      {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h4>
                    <div className="space-y-4 flex-grow">
                      {gamesOnDate.map(game => {
                        const showScore = !isNaN(game.homeScore) && !isNaN(game.awayScore);
                        
                        const homeTeamData = allStandingsDataFromSheet.find(t => t.teamName === game.homeTeam && t.year === defaultYear && t.seasonName === defaultSeasonName);
                        const awayTeamData = allStandingsDataFromSheet.find(t => t.teamName === game.awayTeam && t.year === defaultYear && t.seasonName === defaultSeasonName);

                        return (
                           <div 
                              key={game.id} 
                              className="relative bg-dark-card p-4 rounded-lg shadow-md border border-dark-border/70 hover:border-main-green/50 transition-all"
                            >
                              {/* Division Tag */}
                              <span className="absolute top-2 right-3 text-xs font-semibold text-secondary-text/60 uppercase tracking-wider">
                                DIV {game.division}
                              </span>

                              {/* Content Wrapper */}
                              <div className="w-full flex flex-col items-center justify-center">
                                  {/* Grid Layout for teams and score */}
                                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 w-full">
                                      {/* Home Team */}
                                      <div className="flex-1 flex flex-row items-center justify-end pr-2 md:pr-3 overflow-hidden gap-2">
                                          {game.homeForfeit && <span className="text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-wider flex-shrink-0">Forfeit</span>}
                                          <div className="flex items-center justify-end gap-2 text-right min-w-0 truncate">
                                            <span className="text-base md:text-lg font-semibold text-light-text truncate" title={game.homeTeam}>{game.homeTeam}</span>
                                            {homeTeamData?.teamColor && (
                                                <span 
                                                    className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10" 
                                                    style={{ backgroundColor: homeTeamData.teamColor }}
                                                    aria-hidden="true"
                                                ></span>
                                            )}
                                          </div>
                                      </div>

                                      {/* Center Info (Score/Time) */}
                                      <div className="text-center px-1">
                                          <span className="text-xl md:text-2xl font-bold text-highlight-gold whitespace-nowrap">
                                              {showScore ? `${game.homeScore} - ${game.awayScore}` : (game.time || 'TBD')}
                                          </span>
                                      </div>

                                      {/* Away Team */}
                                      <div className="flex-1 flex flex-row items-center justify-start pl-2 md:pl-3 overflow-hidden gap-2">
                                          <div className="flex items-center justify-start gap-2 text-left min-w-0 truncate">
                                            {awayTeamData?.teamColor && (
                                                <span 
                                                    className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10" 
                                                    style={{ backgroundColor: awayTeamData.teamColor }}
                                                    aria-hidden="true"
                                                ></span>
                                            )}
                                            <span className="text-base md:text-lg font-semibold text-light-text truncate" title={game.awayTeam}>{game.awayTeam}</span>
                                          </div>
                                          {game.awayForfeit && <span className="text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-wider flex-shrink-0">Forfeit</span>}
                                      </div>
                                  </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-dark-bg/20 rounded-lg border border-dashed border-dark-border">
                <p className="text-secondary-text">No games scheduled for this matchweek.</p>
              </div>
            )}
             <div className="mt-8 flex justify-center md:justify-end">
                 <Link to="/matches" className="text-main-green hover:text-highlight-gold font-medium flex items-center transition-colors">
                    View Full Season Schedule & Matches
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                 </Link>
             </div>
          </>
        )}
      </section>

      <section className={cardBaseStyle} aria-labelledby="regular-season-standings-title">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 id="regular-season-standings-title" className="font-display text-3xl font-bold text-light-text flex items-center">
                Current Standings
            </h2>
            <div className="mt-3 sm:mt-0">
                <label htmlFor="division-select-home" className="sr-only">Select Division</label>
                <select
                    id="division-select-home"
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value as Division)}
                    className="w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base bg-dark-bg text-light-text border-dark-border focus:outline-none focus:ring-main-green focus:border-main-green sm:text-sm rounded-md shadow-sm"
                    aria-label="Select Division for Standings"
                    disabled={loadingStandings || availableDivisions.length <= 1}
                    style={{ opacity: availableDivisions.length <= 1 ? 0.5 : 1 }}
                >
                    {availableDivisions.map(div => (
                        <option key={div} value={div}>{div === Division.Unknown ? 'General' : `Division ${div}`}</option>
                    ))}
                </select>
            </div>
        </div>

        {loadingStandings && currentStandings.length === 0 && <LoadingSpinner />}
        {!loadingStandings && standingsError && <p className="text-red-500 text-center">{standingsError}</p>}
        {!loadingStandings && !standingsError && currentStandings.length === 0 && (
          <p className="text-center text-secondary-text py-4">No regular season standings available for {defaultSeasonName} {defaultYear}, Division {selectedDivision}.</p>
        )}
        {!loadingStandings && !standingsError && currentStandings.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-dark-border">
            <table className="min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-bg/50">
                <tr>
                  <th scope="col" className="pl-4 pr-2 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider" aria-label="Rank Change">Change</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Pts</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GP</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">W</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">D</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">L</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GD</th>
                  <th scope="col" colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Last 3</th>
                </tr>
              </thead>
              <tbody className="bg-dark-card divide-y divide-dark-border">
                {/* FIX: Explicitly typing the 'row' parameter to fix a TypeScript inference issue. */}
                {currentStandings.map((row: TeamStatsData, index) => {
                  const isDropped = row.dropped;
                  const isPlayoffSpot = !isDropped && index < 8; 
                  const rowClass = isDropped 
                    ? `bg-red-900/10 grayscale opacity-60` 
                    : `hover:bg-main-green/10 transition-colors duration-150`;
                  
                  return (
                    <tr key={`${row.teamName}-${row.year}-${row.seasonName}-${row.division}-${index}`} className={rowClass}>
                      <td className="relative pl-4 pr-2 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        {isPlayoffSpot && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-main-green" aria-hidden="true"></div>
                        )}
                        {isDropped ? '-' : index + 1}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-center">{isDropped ? '-' : getRankChangeIcon(row.rankChange)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        <div className="flex items-center">
                          {row.teamColor && (
                            <span 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0 shadow-sm border border-white/10" 
                              style={{ backgroundColor: row.teamColor }}
                              aria-hidden="true"
                            ></span>
                          )}
                          {row.teamName}
                          {isDropped && <span className="ml-2 text-xs text-red-400 font-normal italic">(Dropped)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-highlight-gold text-center">{row.points}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.played}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.wins}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.draws}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.losses}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalDifference}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Two Weeks Ago Result">{getResultIndicator(row.twoWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Last Week Result">{getResultIndicator(row.lastWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Current Week Result">{getResultIndicator(row.currentWeekResult, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
             <div className="flex items-center space-x-2 text-xs text-secondary-text mt-2 p-2 bg-dark-bg/30 border-t border-dark-border rounded-b-lg">
                <span className="w-1 h-3 bg-main-green block flex-shrink-0" aria-hidden="true"></span>
                <span>Playoff Qualifying Position</span>
             </div>
          </div>
        )}
         <Link to="/matches" className="mt-6 inline-block text-main-green hover:text-highlight-gold font-medium">View all matches & historical standings...</Link>
      </section>


      <section className={cardBaseStyle} aria-labelledby="gallery-title">
        <SectionHeader title="Gallery" icon={CameraIcon} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((imageUrl, index) => ( 
            <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-md group">
              <img 
                src={imageUrl} 
                alt={`Futsal action shot ${index + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="text-center py-10 bg-dark-card rounded-xl shadow-lg border border-dark-border" aria-labelledby="cta-section-title">
        <h2 id="cta-section-title" className="font-display text-3xl font-bold text-light-text mb-4">Ready to Play or Watch?</h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">Join the action, support your favorite teams, or become a part of our community!</p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
          <Link 
            to="/matches"
            className="inline-block w-full sm:w-auto bg-main-green text-white font-semibold py-3 px-8 rounded-lg hover:bg-main-green-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Standings & Matches
          </Link>
          <Link 
            to="/sponsors" 
            className="inline-block w-full sm:w-auto bg-highlight-gold text-dark-bg font-semibold py-3 px-8 rounded-lg hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Become a Sponsor
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
