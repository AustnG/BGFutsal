

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchSheetData } from '../services/sheetService';
import { GAMES_SHEET_URL, SETTINGS_SHEET_URL, SEASONS_SHEET_URL, TEAMS_SHEET_URL } from '../constants';
import { ProcessedGame, Division, SheetGame, SheetSettings, ProcessedSeason, SheetSeason, TeamStatsData, SheetTeamWithStats, StandingRow } from '../types';
import { parseCsvData } from '../utils/csvParser';
import DivisionalSeasonBlock from '../components/results/DivisionalSeasonBlock'; 
import { calculateStandings } from '../utils/standingsCalculator';
import { processGames, processTeams } from '../utils/dataProcessing';

const MatchesPage: React.FC = () => {
  const [allGames, setAllGames] = useState<ProcessedGame[]>([]);
  const [allProcessedSeasons, setAllProcessedSeasons] = useState<ProcessedSeason[]>([]);
  const [allStandingsDataFromSheet, setAllStandingsDataFromSheet] = useState<TeamStatsData[]>([]); // For RankChange, Last3
  const [currentStandings, setCurrentStandings] = useState<TeamStatsData[]>([]); // Final merged standings for table
  
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableSeasonNames, setAvailableSeasonNames] = useState<string[]>([]); 

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSeasonName, setSelectedSeasonName] = useState<string>(''); 
  const [selectedDivision, setSelectedDivision] = useState<Division>(Division.A); 
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const divisionsForFilter = Object.values(Division).filter(
    value => value !== Division.Unknown
  ) as Division[];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsCsv, gamesCsv, seasonsCsv, teamsCsv] = await Promise.all([
        fetchSheetData(SETTINGS_SHEET_URL),
        fetchSheetData(GAMES_SHEET_URL),
        fetchSheetData(SEASONS_SHEET_URL),
        fetchSheetData(TEAMS_SHEET_URL),
      ]);

      // --- Settings Processing (Years & Season Names for Filters) ---
      const rawSettings = parseCsvData<SheetSettings>(settingsCsv);
      const uniqueYears = [...new Set(rawSettings.map(s => s.Year?.trim()).filter(Boolean as unknown as (value: string | undefined) => value is string))].sort((a, b) => b.localeCompare(a));
      setAvailableYears(uniqueYears);
      // Set initial selectedYear
      if (uniqueYears.length > 0 && (!selectedYear || !uniqueYears.includes(selectedYear))) {
        setSelectedYear(uniqueYears[0]);
      } else if (uniqueYears.length === 0) {
         setSelectedYear('');
      }
      
      const allSeasonNamesFromSheet = rawSettings.map(s => s.Season?.trim()).filter(Boolean as unknown as (value: string | undefined) => value is string);
      const uniqueSortedSeasonNames = [...new Set(allSeasonNamesFromSheet)].sort();
      setAvailableSeasonNames(uniqueSortedSeasonNames);
      // Set initial selectedSeasonName
      if (uniqueSortedSeasonNames.length > 0 && (!selectedSeasonName || !uniqueSortedSeasonNames.includes(selectedSeasonName))) {
          const firstSeasonFromSettings = rawSettings.find(s => s.Season?.trim())?.Season?.trim();
          if (firstSeasonFromSettings && uniqueSortedSeasonNames.includes(firstSeasonFromSettings)) {
            setSelectedSeasonName(firstSeasonFromSettings);
          } else {
            setSelectedSeasonName(uniqueSortedSeasonNames[0]);
          }
      } else if (uniqueSortedSeasonNames.length === 0) {
          setSelectedSeasonName('');
      }
      
      // --- Games Processing ---
      const rawGames = parseCsvData<SheetGame>(gamesCsv);
      const processedGamesData = processGames(rawGames).sort((a, b) => b.date.getTime() - a.date.getTime());
      setAllGames(processedGamesData);

      // --- Detailed Seasons Processing (for awards etc.) ---
      const rawSeasons = parseCsvData<SheetSeason>(seasonsCsv);
      const filteredRawSeasons = rawSeasons.filter(s => s && typeof s['SeasonId'] === 'string' && s['SeasonId'].trim() !== '');
      const processedSeasons = filteredRawSeasons.map(s => ({
        id: s['SeasonId'].trim(), // "YYYY SeasonName D"
        name: s['SeasonId'].trim(), 
        startDate: s['StartDate']?.trim() ? new Date(s['StartDate'].trim()) : undefined,
        endDate: s['EndDate']?.trim() ? new Date(s['EndDate'].trim()) : undefined,
        seasonWinner: s.SeasonWinner?.trim(),
        goldenBootPlayer: s.GoldenBoot?.trim(),
        goldenBootGoals: s.GoldenBootGoalsFor?.trim() ? parseInt(s.GoldenBootGoalsFor.trim(), 10) : undefined,
        goldenBootTeam: s.GoldenBootTeam?.trim(),
        goldenGlovePlayer: s.GoldenGlove?.trim(),
        goldenGloveGoalsAgainst: s.GoldenGloveGoalsAgainst?.trim() ? parseFloat(s.GoldenGloveGoalsAgainst.trim()) : undefined,
        goldenGloveTeam: s.GoldenGloveTeam?.trim(),
        seasonWinnerImg: s.SeasonWinnerImg?.trim() || undefined,
        goldenBootImg: s.GoldenBootImg?.trim() || undefined,
        goldenGloveImg: s.GoldenGloveImg?.trim() || undefined,
      }));
      setAllProcessedSeasons(processedSeasons);

      // --- Standings Data Processing from Teams Sheet (for RankChange, Last3 etc.) ---
      const rawTeamsWithStats = parseCsvData<SheetTeamWithStats>(teamsCsv);
      const processedStandingsFromSheet = processTeams(rawTeamsWithStats);
      setAllStandingsDataFromSheet(processedStandingsFromSheet);

    } catch (err) {
      console.error("Failed to fetch matches page data:", err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // selectedYear, selectedSeasonName removed from deps to avoid re-fetch on dropdown change before data is fully loaded and processed. Logic is handled in specific useEffect.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort standings data when selections change
  useEffect(() => {
    if (!selectedYear || !selectedSeasonName || !selectedDivision || (allGames.length === 0 && allStandingsDataFromSheet.length === 0 && !loading)) {
      setCurrentStandings([]);
      return;
    }

    // 1. Filter relevant regular games for calculation
    const targetSeasonKey = `${selectedYear} ${selectedSeasonName} ${selectedDivision}`;
    const relevantRegularGames = allGames.filter(game =>
      game.seasonName.toLowerCase() === targetSeasonKey.toLowerCase() && // game.seasonName is "YYYY SeasonName D"
      game.gameType === 'Regular' &&
      !isNaN(game.homeScore) && !isNaN(game.awayScore)
    );

    // 2. Get unique teams from games AND from the Teams sheet (so we show rank history even if no games played)
    const uniqueTeamNames = new Set<string>();
    const knownTeamPlaceholders = ["unknown home", "unknown away", "tbd"]; // Lowercase for case-insensitive comparison

    // Add teams from games
    relevantRegularGames.forEach(game => {
      if (game.homeTeam && !knownTeamPlaceholders.includes(game.homeTeam.toLowerCase())) {
        uniqueTeamNames.add(game.homeTeam);
      }
      if (game.awayTeam && !knownTeamPlaceholders.includes(game.awayTeam.toLowerCase())) {
        uniqueTeamNames.add(game.awayTeam);
      }
    });

    // Add teams from Teams sheet that match the selection
    const sheetTeamsForSeason = allStandingsDataFromSheet.filter(t => 
        t.year.trim() === selectedYear.trim() && 
        t.seasonName.trim().toLowerCase() === selectedSeasonName.trim().toLowerCase() && 
        t.division === selectedDivision
    );
    
    sheetTeamsForSeason.forEach(t => {
        if (t.teamName && !knownTeamPlaceholders.includes(t.teamName.toLowerCase())) {
            uniqueTeamNames.add(t.teamName);
        }
    });

    const initialTeamRows: StandingRow[] = Array.from(uniqueTeamNames).map(name => ({
      teamName: name,
      division: selectedDivision,
      played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }));

    // 3. Calculate W/D/L/GF/GA/Pts from regular games
    const calculatedStandingsCore = calculateStandings(relevantRegularGames, initialTeamRows);
    
    // 4. Merge with auxiliary data from the sheet
    // Robust matching logic: case-insensitive, trimmed
    const mergedStandings: TeamStatsData[] = calculatedStandingsCore.map(coreRow => {
      const sheetDataForTeam = allStandingsDataFromSheet.find(sheetRow =>
        sheetRow.teamName.trim().toLowerCase() === coreRow.teamName.trim().toLowerCase() &&
        sheetRow.year.trim() === selectedYear.trim() &&
        sheetRow.seasonName.trim().toLowerCase() === selectedSeasonName.trim().toLowerCase() && 
        sheetRow.division === selectedDivision
      );
      return {
        ...coreRow, // This has correct W,D,L,GF,GA,GD,Pts, played
        year: selectedYear,
        seasonName: selectedSeasonName, // General season name
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

  }, [allGames, allStandingsDataFromSheet, selectedYear, selectedSeasonName, selectedDivision, loading]);


  const relevantDivisionalSeasons = useMemo(() => {
    if (!selectedYear || !selectedSeasonName || !selectedDivision || allProcessedSeasons.length === 0) return [];
    
    // allProcessedSeasons[x].name is "YYYY SeasonName D"
    const targetSeasonKey = `${selectedYear} ${selectedSeasonName} ${selectedDivision}`;
    
    let filteredSeasons = allProcessedSeasons
      .filter(s => s.name.toLowerCase() === targetSeasonKey.toLowerCase());
      
    return filteredSeasons.sort((a,b) => a.name.localeCompare(b.name)); 
  }, [selectedYear, selectedSeasonName, selectedDivision, allProcessedSeasons]);

  const getGamesForDivisionalSeason = useCallback((divisionalSeasonKey: string) => {
    // divisionalSeasonKey is "YYYY SeasonName D"
    // game.seasonName is also "YYYY SeasonName D"
    return allGames.filter(game => game.seasonName.toLowerCase() === divisionalSeasonKey.toLowerCase());
  }, [allGames]);


  if (loading && !allGames.length && !allStandingsDataFromSheet.length && !currentStandings.length && !error) return <div className="py-10"><LoadingSpinner /></div>; 
  if (error) return <p className="text-red-500 text-center p-6 bg-red-100/10 border-2 border-red-500/50 rounded-lg shadow-md my-8">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="mb-10 p-6 bg-dark-card shadow-xl rounded-xl border border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="year-select-matches" className="block text-sm font-semibold text-highlight-gold mb-1">Year</label>
            <select
              id="year-select-matches"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={availableYears.length === 0 && !loading}
              className="w-full mt-1 block pl-3 pr-10 py-2.5 text-base bg-dark-bg text-light-text border border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight-gold focus:border-highlight-gold sm:text-sm rounded-lg shadow-md"
              aria-label="Select Year"
            >
              {availableYears.length === 0 && !loading && <option value="">No Years</option>}
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="season-select-matches" className="block text-sm font-semibold text-highlight-gold mb-1">Season</label>
            <select
              id="season-select-matches"
              value={selectedSeasonName}
              onChange={(e) => setSelectedSeasonName(e.target.value)}
              disabled={availableSeasonNames.length === 0 && !loading}
              className="w-full mt-1 block pl-3 pr-10 py-2.5 text-base bg-dark-bg text-light-text border border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight-gold focus:border-highlight-gold sm:text-sm rounded-lg shadow-md"
              aria-label="Select Season Name"
            >
              {availableSeasonNames.length === 0 && !loading && <option value="">No Seasons</option>}
              {availableSeasonNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="division-select-matches" className="block text-sm font-semibold text-highlight-gold mb-1">Division</label>
            <select
              id="division-select-matches"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value as Division)}
              className="w-full mt-1 block pl-3 pr-10 py-2.5 text-base bg-dark-bg text-light-text border border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight-gold focus:border-highlight-gold sm:text-sm rounded-lg shadow-md"
              aria-label="Select Division"
            >
              {divisionsForFilter.map(div => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          </div>
        </div>
        {loading && <div className="mt-4 flex justify-end"><LoadingSpinner size="sm" color="text-highlight-gold" /></div>}
      </div>


       {(currentStandings.length === 0 && relevantDivisionalSeasons.length === 0 && !loading && !error) && (
         <div className="text-center text-secondary-text mt-8 p-6 bg-dark-card shadow-md rounded-lg border border-dark-border">
          No regular season standings or detailed season information found for {selectedSeasonName} {selectedYear}, Division {selectedDivision}.
         </div>
       )}


      {/* Detailed Season Blocks (Awards, Playoffs, Game Lists, and now Standings Table) */}
      {relevantDivisionalSeasons.map((divSeason) => {
        const gamesForThisDivSeason = getGamesForDivisionalSeason(divSeason.name);
        return (
          <DivisionalSeasonBlock 
            key={divSeason.id}
            divisionalSeasonData={divSeason}
            allGamesForSeason={gamesForThisDivSeason}
            standingsData={currentStandings}
          />
        );
      })}
       {/* Fallback if no relevantDivisionalSeasons but currentStandings exist (e.g. only standings, no awards/playoffs) */}
       {relevantDivisionalSeasons.length === 0 && currentStandings.length > 0 && !loading && (
         <div className="mb-12 p-4 md:p-6 bg-dark-card shadow-lg rounded-xl border border-dark-border">
            <h2 className="font-display text-3xl font-bold text-light-text mb-6 border-b-2 border-dark-border pb-3">
                {selectedYear} {selectedSeasonName} Division {selectedDivision}
            </h2>
            <DivisionalSeasonBlock 
                key={`${selectedYear}-${selectedSeasonName}-${selectedDivision}-standingsonly`}
                divisionalSeasonData={{ 
                  id: `${selectedYear}-${selectedSeasonName}-${selectedDivision}`, 
                  name: `${selectedYear} ${selectedSeasonName} ${selectedDivision}` 
                }}
                allGamesForSeason={getGamesForDivisionalSeason(`${selectedYear} ${selectedSeasonName} ${selectedDivision}`)}
                standingsData={currentStandings}
            />
         </div>
       )}
    </div>
  );
};

export default MatchesPage;
