

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { fetchSheetData } from '../services/sheetService.ts';
import { GAMES_SHEET_URL, SETTINGS_SHEET_URL, SEASONS_SHEET_URL, TEAMS_SHEET_URL } from '../constants.ts';
import { ProcessedGame, Division, SheetGame, SheetSettings, ProcessedSeason, SheetSeason, TeamStatsData, SheetTeamWithStats, StandingRow } from '../types.ts';
import { parseCsvData } from '../utils/csvParser.ts';
import DivisionalSeasonBlock from '../components/results/DivisionalSeasonBlock.tsx'; 
import { calculateStandings } from '../utils/standingsCalculator.ts';
import { processGames, processTeams, processSeasons } from '../utils/dataProcessing.ts';

const MatchesPage: React.FC = () => {
  const [allGames, setAllGames] = useState<ProcessedGame[]>([]);
  const [allProcessedSeasons, setAllProcessedSeasons] = useState<ProcessedSeason[]>([]);
  const [allStandingsDataFromSheet, setAllStandingsDataFromSheet] = useState<TeamStatsData[]>([]); 
  const [currentStandings, setCurrentStandings] = useState<TeamStatsData[]>([]); 
  
  const [selectedSeasonKey, setSelectedSeasonKey] = useState<string>(''); // Format: "YYYY|SeasonName"
  const [selectedDivision, setSelectedDivision] = useState<Division>(Division.Unknown);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

      // --- Detailed Seasons Processing ---
      const rawSeasons = parseCsvData<SheetSeason>(seasonsCsv);
      const processedSeasons = processSeasons(rawSeasons).sort((a, b) => {
           // Sort by startDate desc, then year desc, then name
           if (a.startDate && b.startDate) return b.startDate.getTime() - a.startDate.getTime();
           if (a.year !== b.year) return b.year.localeCompare(a.year);
           return a.name.localeCompare(b.name);
      });
      setAllProcessedSeasons(processedSeasons);

      // Set initial selection to the most recent one
      if (processedSeasons.length > 0) {
          const mostRecent = processedSeasons[0];
          setSelectedSeasonKey(`${mostRecent.year}|${mostRecent.seasonName}`);
          setSelectedDivision(mostRecent.division);
      }

      // --- Games Processing ---
      const rawGames = parseCsvData<SheetGame>(gamesCsv);
      const processedGamesData = processGames(rawGames).sort((a, b) => b.date.getTime() - a.date.getTime());
      setAllGames(processedGamesData);

      // --- Standings Data Processing ---
      const rawTeamsWithStats = parseCsvData<SheetTeamWithStats>(teamsCsv);
      const processedStandingsFromSheet = processTeams(rawTeamsWithStats);
      setAllStandingsDataFromSheet(processedStandingsFromSheet);

    } catch (err) {
      console.error("Failed to fetch matches page data:", err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived unique seasons for dropdown
  const uniqueSeasonOptions = useMemo(() => {
      const options = new Map<string, { key: string, label: string }>();
      allProcessedSeasons.forEach(s => {
          const key = `${s.year}|${s.seasonName}`;
          if (!options.has(key)) {
              options.set(key, { key, label: `${s.year} ${s.seasonName}` });
          }
      });
      return Array.from(options.values());
  }, [allProcessedSeasons]);

  // Derived available divisions for selected season key
  const availableDivisions = useMemo(() => {
      if (!selectedSeasonKey) return [];
      const [year, name] = selectedSeasonKey.split('|');
      return allProcessedSeasons
          .filter(s => s.year === year && s.seasonName === name)
          .map(s => s.division)
          .sort(); 
  }, [selectedSeasonKey, allProcessedSeasons]);

  // Ensure valid division selection when season changes
  useEffect(() => {
      if (availableDivisions.length > 0 && !availableDivisions.includes(selectedDivision)) {
          // Default to 'A' if available, otherwise first available
          if (availableDivisions.includes(Division.A)) {
             setSelectedDivision(Division.A);
          } else {
             setSelectedDivision(availableDivisions[0]);
          }
      }
  }, [availableDivisions, selectedDivision]);

  const selectedSeason = useMemo(() => {
      if (!selectedSeasonKey) return undefined;
      const [year, name] = selectedSeasonKey.split('|');
      return allProcessedSeasons.find(s => 
          s.year === year && 
          s.seasonName === name && 
          s.division === selectedDivision
      );
  }, [allProcessedSeasons, selectedSeasonKey, selectedDivision]);

  // Filter and sort standings data when selection changes
  useEffect(() => {
    if (!selectedSeason || (allGames.length === 0 && allStandingsDataFromSheet.length === 0 && !loading)) {
      setCurrentStandings([]);
      return;
    }

    // 1. Filter relevant regular games
    // Use selectedSeason.name which matches game.seasonName (e.g. "2024 Spring A")
    const targetSeasonKey = selectedSeason.name;

    const relevantRegularGames = allGames.filter(game =>
      game.seasonName.toLowerCase() === targetSeasonKey.toLowerCase() && 
      game.gameType === 'Regular' &&
      !isNaN(game.homeScore) && !isNaN(game.awayScore)
    );

    // 2. Get unique teams
    const uniqueTeamNames = new Set<string>();
    const knownTeamPlaceholders = ["unknown home", "unknown away", "tbd"]; 

    relevantRegularGames.forEach(game => {
      if (game.homeTeam && !knownTeamPlaceholders.includes(game.homeTeam.toLowerCase())) uniqueTeamNames.add(game.homeTeam);
      if (game.awayTeam && !knownTeamPlaceholders.includes(game.awayTeam.toLowerCase())) uniqueTeamNames.add(game.awayTeam);
    });

    const sheetTeamsForSeason = allStandingsDataFromSheet.filter(t => 
        t.year.trim() === selectedSeason.year.trim() && 
        t.seasonName.trim().toLowerCase() === selectedSeason.seasonName.trim().toLowerCase() && 
        t.division === selectedSeason.division
    );
    
    sheetTeamsForSeason.forEach(t => {
        if (t.teamName && !knownTeamPlaceholders.includes(t.teamName.toLowerCase())) uniqueTeamNames.add(t.teamName);
    });

    const initialTeamRows: StandingRow[] = Array.from(uniqueTeamNames).map(name => ({
      teamName: name,
      division: selectedSeason.division,
      played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }));

    // 3. Calculate Standings
    const calculatedStandingsCore = calculateStandings(relevantRegularGames, initialTeamRows);
    
    // 4. Merge with sheet data
    const mergedStandings: TeamStatsData[] = calculatedStandingsCore.map(coreRow => {
      const sheetDataForTeam = allStandingsDataFromSheet.find(sheetRow =>
        sheetRow.teamName.trim().toLowerCase() === coreRow.teamName.trim().toLowerCase() &&
        sheetRow.year.trim() === selectedSeason.year.trim() &&
        sheetRow.seasonName.trim().toLowerCase() === selectedSeason.seasonName.trim().toLowerCase() && 
        sheetRow.division === selectedSeason.division
      );
      return {
        ...coreRow, 
        year: selectedSeason.year,
        seasonName: selectedSeason.seasonName, 
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

  }, [allGames, allStandingsDataFromSheet, selectedSeason, loading]);

  const getGamesForDivisionalSeason = useCallback((divisionalSeasonKey: string) => {
    return allGames.filter(game => game.seasonName.toLowerCase() === divisionalSeasonKey.toLowerCase());
  }, [allGames]);


  if (loading && !allGames.length && !allStandingsDataFromSheet.length && !currentStandings.length && !error) return <div className="py-10"><LoadingSpinner /></div>; 
  if (error) return <p className="text-red-500 text-center p-6 bg-red-100/10 border-2 border-red-500/50 rounded-lg shadow-md my-8">{error}</p>;

  return (
    <div className="space-y-8">
      {/* Combined Header and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-light-text uppercase tracking-wider">
            Matches & Results
          </h1>
          <p className="text-lg text-secondary-text mt-2">
            View season standings, game results, and individual honors.
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3">
           {loading && <LoadingSpinner size="sm" color="text-highlight-gold" />}
           
           {/* Season Selector */}
           <div className="relative w-full md:w-auto">
            <label htmlFor="season-select" className="sr-only">Select Season</label>
            <select
              id="season-select"
              value={selectedSeasonKey}
              onChange={(e) => setSelectedSeasonKey(e.target.value)}
              disabled={uniqueSeasonOptions.length === 0 && !loading}
              className="appearance-none w-full md:w-72 bg-dark-card text-light-text font-bold text-lg py-3 pl-4 pr-10 rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight-gold shadow-lg cursor-pointer transition-colors hover:border-highlight-gold/50"
            >
              {uniqueSeasonOptions.length === 0 && !loading && <option value="">No Seasons Found</option>}
              {uniqueSeasonOptions.map(option => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-highlight-gold">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Division Selector (Only if multiple divisions exist for the season) */}
          {availableDivisions.length > 0 && (
              <div className="flex w-full md:w-auto bg-dark-card rounded-lg p-1 border border-dark-border shadow-sm">
                  {availableDivisions.map(div => (
                      <button
                          key={div}
                          onClick={() => setSelectedDivision(div)}
                          className={`flex-1 md:flex-none px-6 py-2 rounded-md text-lg font-bold transition-all ${
                              selectedDivision === div 
                                  ? 'bg-highlight-gold text-dark-bg shadow-sm' 
                                  : 'text-secondary-text hover:text-light-text hover:bg-white/5'
                          }`}
                      >
                          Division {div}
                      </button>
                  ))}
              </div>
          )}
        </div>
      </div>

       {(!selectedSeason && !loading && !error) && (
         <div className="text-center text-secondary-text mt-8 p-6 bg-dark-card shadow-md rounded-lg border border-dark-border">
          Please select a season.
         </div>
       )}

      {selectedSeason && (
          <DivisionalSeasonBlock 
            key={selectedSeason.id}
            divisionalSeasonData={selectedSeason}
            allGamesForSeason={getGamesForDivisionalSeason(selectedSeason.name)}
            standingsData={currentStandings}
            hideTitle={true}
          />
      )}
    </div>
  );
};

export default MatchesPage;
