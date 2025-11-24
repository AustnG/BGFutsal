import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  SHORT_LEAGUE_NAME, 
  TEAMS_SHEET_URL, 
  SETTINGS_SHEET_URL, 
  GAMES_SHEET_URL, 
  NEWS_SHEET_URL, 
  MAX_NEWS_ITEMS_HOMEPAGE, 
} from '../constants';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchSheetData } from '../services/sheetService';
import { parseCsvData } from '../utils/csvParser';
import { 
  TeamStatsData, 
  SheetTeamWithStats, 
  Division, 
  SheetSettings, 
  ProcessedGame, 
  SheetGame, 
  StandingRow,
  SheetNewsItem, 
  ProcessedNewsItem 
} from '../types';
import { ArrowUpIcon } from '../components/icons/ArrowUpIcon';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon';
import { MinusIcon } from '../components/icons/MinusIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { MinusCircleIcon } from '../components/icons/MinusCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { CheckCircleCurrentWeekIcon } from '../components/icons/CheckCircleCurrentWeekIcon';
import { MinusCircleCurrentWeekIcon } from '../components/icons/MinusCircleCurrentWeekIcon';
import { XCircleCurrentWeekIcon } from '../components/icons/XCircleCurrentWeekIcon';
import { calculateStandings } from '../utils/standingsCalculator';

const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 24 * 60; // Sort games with no time to the end of the day
  const timePart = timeStr.toUpperCase().match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!timePart) return 24 * 60;

  let hours = parseInt(timePart[1], 10);
  const minutes = parseInt(timePart[2], 10);
  const modifier = timePart[3];

  if (isNaN(hours) || isNaN(minutes)) return 24 * 60;

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) { // Midnight case for 12 AM
    hours = 0;
  }
  return hours * 60 + minutes;
};

const formatTo12HourTime = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined;

  const parts = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return timeStr; // Return original if not in HH:mm or H:mm format

  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr; // Return original if parsing fails

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' or '12' should be '12'
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
  
  return `${hours}:${minutesStr} ${ampm}`;
};

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
  const [defaultYear, setDefaultYear] = useState<string>('');
  const [defaultSeasonName, setDefaultSeasonName] = useState<string>('');
  const [loadingStandings, setLoadingStandings] = useState<boolean>(true); // Represents general data loading
  const [standingsError, setStandingsError] = useState<string | null>(null); // Represents general data error

  // News state
  const [newsItems, setNewsItems] = useState<ProcessedNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  const divisionsForFilter = Object.values(Division).filter(
    value => value !== Division.Unknown
  ) as Division[];

  const teamSeasonParseRegex = /^(\d{4})\s+(.+?)\s+([AB])$/i; 

  const processRawNewsData = (rawNews: SheetNewsItem[]): ProcessedNewsItem[] => {
    return rawNews
      .map(item => {
        const date = new Date(item.Date?.trim());
        if (!item.Id?.trim() || !item.Title?.trim() || !item.Content?.trim() || isNaN(date.getTime())) {
          console.warn('Skipping news item due to missing critical data or invalid date:', item);
          return null;
        }
        return {
          id: item.Id.trim(),
          date: date,
          title: item.Title.trim(),
          category: item.Category?.trim() || undefined,
          content: item.Content.trim(),
          link: item.Link?.trim() || undefined,
          imageUrl: item.ImageUrl?.trim() || undefined,
        };
      })
      .filter(Boolean as unknown as (value: ProcessedNewsItem | null) => value is ProcessedNewsItem)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
  };

  const processRawGamesData = (rawGames: SheetGame[]): ProcessedGame[] => {
    return rawGames.map((g, index) => {
      const gameDateStr = g.GameDate?.trim();
      if (!gameDateStr) return null;
      const gameDate = new Date(gameDateStr);
      if (isNaN(gameDate.getTime())) return null;
      
      const divisionFromSheetColumn = g.Division?.trim().toUpperCase();
      let determinedDivision = Division.Unknown;
      if (divisionFromSheetColumn === 'A') determinedDivision = Division.A;
      else if (divisionFromSheetColumn === 'B') determinedDivision = Division.B;

      const seasonNameFromSheet = g.Season?.trim() || ""; 
      let finalSeasonKey = seasonNameFromSheet; 

      if (/\s+[AB]$/i.test(seasonNameFromSheet)) { 
          finalSeasonKey = seasonNameFromSheet;
          if (determinedDivision === Division.Unknown) { 
              const match = seasonNameFromSheet.match(/\s+([AB])$/i);
              if (match) determinedDivision = match[1] === 'A' ? Division.A : Division.B;
          }
      } else if (determinedDivision !== Division.Unknown) { 
          finalSeasonKey = `${seasonNameFromSheet} ${determinedDivision}`;
      }
      
      const homePKs = g.HomePKs?.trim();
      const awayPKs = g.AwayPKs?.trim();

      return {
        id: `game-${index}-${g.GameDate}-${g.HomeTeam}`,
        date: gameDate,
        time: g.GameTime?.trim(),
        division: determinedDivision,
        homeTeam: g.HomeTeam?.trim() || "Unknown Home",
        homeScore: parseInt(g.HomeScore, 10),
        awayTeam: g.AwayTeam?.trim() || "Unknown Away",
        awayScore: parseInt(g.AwayScore, 10),
        seasonName: finalSeasonKey, 
        location: g.Location?.trim(),
        gameType: g.GameType?.trim() || 'Regular',
        gameWeek: g.GameWeek ? (isNaN(parseInt(g.GameWeek.trim(), 10)) ? g.GameWeek.trim() : parseInt(g.GameWeek.trim(), 10)) : undefined,
        homePKs: homePKs !== undefined && homePKs !== '' ? parseInt(homePKs, 10) : undefined,
        awayPKs: awayPKs !== undefined && awayPKs !== '' ? parseInt(awayPKs, 10) : undefined,
      };
    }).filter(Boolean as unknown as (value: ProcessedGame | null) => value is ProcessedGame);
  };


  const fetchData = useCallback(async () => {
    setLoadingStandings(true);
    setStandingsError(null);
    setLoadingNews(true);
    setNewsError(null);

    try {
      const [settingsCsv, teamsCsv, gamesCsv, newsCsv] = await Promise.all([
        fetchSheetData(SETTINGS_SHEET_URL),
        fetchSheetData(TEAMS_SHEET_URL),
        fetchSheetData(GAMES_SHEET_URL),
        fetchSheetData(NEWS_SHEET_URL), 
      ]);

      // Process News
      const rawNews = parseCsvData<SheetNewsItem>(newsCsv);
      setNewsItems(processRawNewsData(rawNews));

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

      // Process Games
      const rawGames = parseCsvData<SheetGame>(gamesCsv);
      setAllGames(processRawGamesData(rawGames));


      // Process Standings Data from Teams Sheet
      const rawTeamsWithStats = parseCsvData<SheetTeamWithStats>(teamsCsv);
      const parseStat = (val: any): number => {
        const strVal = (typeof val === 'string') ? val.trim() : String(val);
        const num = parseInt(strVal, 10);
        return isNaN(num) ? 0 : num;
      };
      const getString = (val: any): string | undefined => {
        return (val && typeof val === 'string') ? val.trim() : undefined;
      };

      const processedStandingsFromSheet = rawTeamsWithStats.map(rawTeam => {
        const teamName = getString(rawTeam.Team) || "";
        const combinedSeasonStr = getString(rawTeam.Season) || "";
        let year = "";
        let seasonName = "";
        let division = Division.Unknown;
        const match = combinedSeasonStr.match(teamSeasonParseRegex);

        if (match) {
          year = match[1];
          seasonName = match[2].trim();
          const divisionLetter = match[3].toUpperCase();
          division = divisionLetter === 'A' ? Division.A : divisionLetter === 'B' ? Division.B : Division.Unknown;
        } else {
            const rawDivisionCol = getString(rawTeam.Division)?.toUpperCase();
            if (rawDivisionCol === 'A') division = Division.A;
            else if (rawDivisionCol === 'B') division = Division.B;
            const yearSeasonMatch = combinedSeasonStr.match(/^(\d{4})\s+(.+)$/);
            if(yearSeasonMatch) {
                year = yearSeasonMatch[1];
                seasonName = yearSeasonMatch[2].trim();
            } else {
                seasonName = combinedSeasonStr; 
            }
        }
        
        return {
          teamName: teamName,
          division: division,
          year: year,
          seasonName: seasonName,
          played: parseStat(rawTeam.GP), wins: parseStat(rawTeam.W), draws: parseStat(rawTeam.D), losses: parseStat(rawTeam.L),
          goalsFor: parseStat(rawTeam.GF), goalsAgainst: parseStat(rawTeam.GA), goalDifference: parseStat(rawTeam.GD),
          points: parseStat(rawTeam.PTS),
          rankChange: getString(rawTeam.RankChange),
          twoWeekResult: getString(rawTeam['2WeekResult']),
          lastWeekResult: getString(rawTeam['LastWeekResult']),
          currentWeekResult: getString(rawTeam['CurrentWeekResult']),
        };
      }).filter(team => team.division !== Division.Unknown && team.teamName && team.year && team.seasonName);
      setAllStandingsDataFromSheet(processedStandingsFromSheet);

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

  useEffect(() => {
    if (!defaultYear || !defaultSeasonName || !selectedDivision || (allGames.length === 0 && allStandingsDataFromSheet.length === 0 && !loadingStandings)) {
      setCurrentStandings([]);
      return;
    }

    const targetSeasonKey = `${defaultYear} ${defaultSeasonName} ${selectedDivision}`;
    const relevantRegularGames = allGames.filter(game =>
      game.seasonName.toLowerCase() === targetSeasonKey.toLowerCase() &&
      game.gameType === 'Regular' &&
      !isNaN(game.homeScore) && !isNaN(game.awayScore)
    );

    const uniqueTeamNames = new Set<string>();
    const knownTeamPlaceholders = ["unknown home", "unknown away", "tbd"];

    relevantRegularGames.forEach(game => {
      if (game.homeTeam && !knownTeamPlaceholders.includes(game.homeTeam.toLowerCase())) {
        uniqueTeamNames.add(game.homeTeam);
      }
      if (game.awayTeam && !knownTeamPlaceholders.includes(game.awayTeam.toLowerCase())) {
        uniqueTeamNames.add(game.awayTeam);
      }
    });
     allStandingsDataFromSheet.forEach(sheetRow => {
        if( sheetRow.year === defaultYear &&
            sheetRow.seasonName.toLowerCase() === defaultSeasonName.toLowerCase() &&
            sheetRow.division === selectedDivision &&
            sheetRow.teamName && !knownTeamPlaceholders.includes(sheetRow.teamName.toLowerCase())
          ) {
            uniqueTeamNames.add(sheetRow.teamName);
        }
     });


    const initialTeamRows: StandingRow[] = Array.from(uniqueTeamNames).map(name => ({
      teamName: name,
      division: selectedDivision,
      played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }));

    const calculatedStandingsCore = calculateStandings(relevantRegularGames, initialTeamRows);

    const mergedStandings = calculatedStandingsCore.map(coreRow => {
      const sheetDataForTeam = allStandingsDataFromSheet.find(sheetRow =>
        sheetRow.teamName === coreRow.teamName &&
        sheetRow.year === defaultYear &&
        sheetRow.seasonName.toLowerCase() === defaultSeasonName.toLowerCase() &&
        sheetRow.division === selectedDivision
      );
      return {
        ...coreRow,
        year: defaultYear,
        seasonName: defaultSeasonName,
        rankChange: sheetDataForTeam?.rankChange,
        twoWeekResult: sheetDataForTeam?.twoWeekResult,
        lastWeekResult: sheetDataForTeam?.lastWeekResult,
        currentWeekResult: sheetDataForTeam?.currentWeekResult,
      };
    });

    const sortedData = mergedStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });

    setCurrentStandings(sortedData);

  }, [allGames, allStandingsDataFromSheet, defaultYear, defaultSeasonName, selectedDivision, loadingStandings]);
  
  const upcomingGamesList = useMemo(() => {
    if (loadingStandings && allGames.length === 0) { 
      return [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    return allGames
      .filter(game => {
        const gameDay = new Date(game.date);
        gameDay.setHours(0,0,0,0); 
        const isUndecidedRegular = isNaN(game.homeScore) || isNaN(game.awayScore);
        const isUndecidedPK = game.homeScore === game.awayScore && (game.homePKs === undefined || game.awayPKs === undefined || isNaN(game.homePKs) || isNaN(game.awayPKs));
        
        return (isUndecidedRegular || (game.gameType !== 'Regular' && isUndecidedPK)) && gameDay >= today;
      })
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });
  }, [allGames, loadingStandings]);

  const groupedUpcomingGames = useMemo(() => {
    if (loadingStandings && upcomingGamesList.length === 0) {
      return new Map<string, ProcessedGame[]>();
    }
    const groups = new Map<string, ProcessedGame[]>();
    upcomingGamesList.forEach(game => {
      const dayKey = game.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(game);
    });
    return groups;
  }, [upcomingGamesList, loadingStandings]);


  const getRankChangeIcon = (rankChange?: string) => {
      if (rankChange === 'Up') return <ArrowUpIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Rank up" />;
      if (rankChange === 'Down') return <ArrowDownIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Rank down" />;
      if (rankChange === 'Same') return <MinusIcon className="w-5 h-5 text-secondary-text mx-auto" aria-label="Rank same" />;
      return <MinusIcon className="w-5 h-5 text-gray-600 mx-auto" aria-label="No change in rank" />;
  };
  const getResultIcon = (result?: string) => {
      if (result === 'W') return <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Win" />;
      if (result === 'D') return <MinusCircleIcon className="w-5 h-5 text-gray-500 mx-auto" aria-label="Draw" />;
      if (result === 'L') return <XCircleIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Loss" />;
      return <span className="text-gray-600 mx-auto">-</span>;
  };
  const getCurrentWeekResultIcon = (result?: string) => {
      if (result === 'W') return <CheckCircleCurrentWeekIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Win (Current Week)" />;
      if (result === 'D') return <MinusCircleCurrentWeekIcon className="w-5 h-5 text-gray-500 mx-auto" aria-label="Draw (Current Week)" />;
      if (result === 'L') return <XCircleCurrentWeekIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Loss (Current Week)" />;
      return null;
  };


  return (
    <div className="space-y-16">
      <section 
        aria-labelledby="hero-title" 
        className="relative rounded-lg shadow-xl overflow-hidden min-h-[35vh] md:min-h-[50vh] flex flex-col justify-center items-center text-center text-light-text -mt-10 md:-mt-12 -mx-4 sm:-mx-6 lg:-mx-8"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://blogger.googleusercontent.com/img/a/AVvXsEhbx0ILBCX3eBUQInZnhAinZZ1_tXsnJwYZb6zfrsEOEwJQiQL5a_jHWJ8yniUq2KanklUCuYSePriWVLCInIgcNn9px0hPGeFH0uTN15Y6U5LJGCSug-Mrq5WBbC5IEt3lUf1bLar_XPgPwjRr5ZdR3uQ9Cftfa3EOuUkeMCEhsQ-RaxGgJhmnz_ikSf0)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/85 via-dark-bg/40 to-transparent"></div>
        <div className="relative z-10 p-4 md:p-8 lg:p-12">
          <h1 id="hero-title" className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 uppercase tracking-wider [text-shadow:2px_2px_12px_rgba(0,0,0,0.9)]">
            {SHORT_LEAGUE_NAME}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-secondary-text [text-shadow:1px_1px_8px_rgba(0,0,0,0.9)]">
            Your hub for everything futsal in Bowling Green.
          </p>
        </div>
      </section>

      <section className={cardBaseStyle} aria-labelledby="latest-news-title">
        <SectionHeader title="Latest News & Announcements" icon={NewspaperIcon} />
        {loadingNews && <LoadingSpinner />}
        {newsError && <p className="text-red-500 text-center">{newsError}</p>}
        {!loadingNews && !newsError && newsItems.length === 0 && (
          <p className="text-center text-secondary-text py-4">No news items available at the moment.</p>
        )}
        {!loadingNews && !newsError && newsItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {newsItems.slice(0, MAX_NEWS_ITEMS_HOMEPAGE).map(item => (
              <div 
                key={item.id} 
                className="bg-dark-bg/50 p-4 rounded-lg hover:shadow-md transition-shadow group flex flex-col border border-dark-border/50 hover:border-highlight-gold/50"
              >
                {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-48 object-cover rounded-md shadow-sm group-hover:opacity-90 transition-opacity mb-4" 
                    />
                )}
                <div className="flex-grow flex flex-col">
                  <div className="flex flex-wrap items-center justify-between mb-2 text-xs">
                    <p className="text-secondary-text">
                      {item.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {item.category && (
                      <span className="font-semibold bg-main-green text-light-text px-2 py-0.5 rounded-full shadow-sm">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-light-text hover:text-highlight-gold mb-2 hover:underline flex-grow">
                      {item.title}
                    </a>
                  ) : (
                    <h3 className="text-lg font-bold text-light-text mb-2 flex-grow">{item.title}</h3>
                  )}
                  <p className="text-secondary-text text-sm leading-relaxed mb-4">{item.content}</p>
                  {item.link && (
                     <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-main-green hover:text-highlight-gold font-medium mt-auto self-start">
                       Read More &rarr;
                     </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={cardBaseStyle} aria-labelledby="upcoming-games-title">
        <SectionHeader title="Upcoming Games" icon={CalendarIcon} />
        {loadingStandings && groupedUpcomingGames.size === 0 && <LoadingSpinner />}
        {!loadingStandings && standingsError && <p className="text-red-500 text-center">{standingsError}</p>}
        {!loadingStandings && !standingsError && groupedUpcomingGames.size === 0 && (
          <p className="text-center text-secondary-text py-4">No upcoming games scheduled at the moment.</p>
        )}
        {!loadingStandings && !standingsError && groupedUpcomingGames.size > 0 && (
          <div className="space-y-6">
            {Array.from(groupedUpcomingGames.entries()).map(([day, gamesForDay]) => (
              <div key={day} className="mb-6 last:mb-0">
                <h4 className="font-display text-xl font-bold text-light-text bg-main-green/20 p-3 rounded-t-md shadow-sm border-b border-main-green/50">
                  {day}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-dark-bg/30 rounded-b-md shadow-sm">
                  {gamesForDay.map((game) => (
                    <div 
                      key={game.id} 
                      className="bg-dark-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-dark-border hover:border-highlight-gold/50"
                    >
                      <div className="flex flex-col items-center text-center mb-2">
                        <div className="flex items-baseline justify-center w-full">
                          <span className="text-xl font-bold text-light-text truncate max-w-[40%] sm:max-w-[45%]">
                            {game.homeTeam}
                          </span>
                          <span className="text-lg font-normal text-secondary-text mx-2">vs</span>
                          <span className="text-xl font-bold text-light-text truncate max-w-[40%] sm:max-w-[45%]">
                            {game.awayTeam}
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-highlight-gold mt-1">
                          {formatTo12HourTime(game.time) || "Time TBD"}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-text text-center flex flex-wrap justify-center items-center gap-x-2 gap-y-1 mt-2 border-t border-dark-border pt-2">
                        {game.division !== Division.Unknown && <span>Div {game.division}</span>}
                        {(game.division !== Division.Unknown && (game.gameWeek || game.gameWeek === 0)) && <span className="text-gray-600">&bull;</span>}
                        {(game.gameWeek || game.gameWeek === 0) && (
                          <span>
                            {typeof game.gameWeek === 'number' ? 'Week ' : ''}{game.gameWeek}
                          </span>
                        )}
                        {game.location && (
                          <>
                            {((game.division !== Division.Unknown) || (game.gameWeek || game.gameWeek === 0)) && <span className="text-gray-600">&bull;</span>}
                            <span className="truncate">{game.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/results" className="mt-8 inline-block text-main-green hover:text-highlight-gold font-medium">View full schedule & results...</Link>
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
                    disabled={loadingStandings}
                >
                    {divisionsForFilter.map(div => (
                        <option key={div} value={div}>Division {div}</option>
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
                  <th scope="col" className="pl-5 pr-3 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider" aria-label="Rank Change">Change</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GP</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">W</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">D</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">L</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GF</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GA</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">+/-</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Pts</th>
                  <th scope="col" colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Last 3</th>
                </tr>
              </thead>
              <tbody className="bg-dark-card divide-y divide-dark-border">
                {currentStandings.map((row, index) => {
                  const isPlayoffSpot = index < 8; 
                  const rowClass = `hover:bg-main-green/10 transition-colors duration-150`;
                   const currentWeekIcon = getCurrentWeekResultIcon(row.currentWeekResult);
                  return (
                    <tr key={`${row.teamName}-${row.year}-${row.seasonName}-${row.division}-${index}`} className={rowClass}>
                      <td className="relative pl-5 pr-3 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        {isPlayoffSpot && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-main-green" aria-hidden="true"></div>
                        )}
                        {index + 1}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-center">{getRankChangeIcon(row.rankChange)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-light-text">{row.teamName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.played}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.wins}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.draws}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.losses}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalsFor}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalsAgainst}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalDifference}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-highlight-gold text-center">{row.points}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Two Weeks Ago Result">{getResultIcon(row.twoWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Last Week Result">{getResultIcon(row.lastWeekResult)}</td>
                       <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Current Week Result">
                        {currentWeekIcon ? currentWeekIcon : (row.currentWeekResult || '-')}
                      </td>
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
         <Link to="/results" className="mt-6 inline-block text-main-green hover:text-highlight-gold font-medium">View all results & historical standings...</Link>
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
            to="/results"
            className="inline-block w-full sm:w-auto bg-main-green text-white font-semibold py-3 px-8 rounded-lg hover:bg-main-green-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Standings & Results
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