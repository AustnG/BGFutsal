

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchSheetData } from '../services/sheetService';
import { GAMES_SHEET_URL, SETTINGS_SHEET_URL, SEASONS_SHEET_URL, TEAMS_SHEET_URL } from '../constants';
import { ProcessedGame, Division, SheetGame, SheetSettings, ProcessedSeason, SheetSeason, TeamStatsData, SheetTeamWithStats, StandingRow } from '../types';
import { parseCsvData } from '../utils/csvParser';
import DivisionalSeasonBlock from '../components/results/DivisionalSeasonBlock'; 
import { calculateStandings } from '../utils/standingsCalculator';
import { processGames, processTeams, processSeasons } from '../utils/dataProcessing';

const MatchesPage: React.FC = () => {
  const [allGames, setAllGames] = useState<ProcessedGame[]>([]);
  const [allProcessedSeasons, setAllProcessedSeasons] = useState<ProcessedSeason[]>([]);
  const [allStandingsDataFromSheet, setAllStandingsDataFromSheet] = useState<TeamStatsData[]>([]); 
  const [currentStandings, setCurrentStandings] = useState<TeamStatsData[]>([]); 
  
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  
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

      // Set initial selectedSeasonId to the most recent one
      if (processedSeasons.length > 0) {
          setSelectedSeasonId(processedSeasons[0].id);
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

  const selectedSeason = useMemo(() => {
      return allProcessedSeasons.find(s => s.id === selectedSeasonId);
  }, [allProcessedSeasons, selectedSeasonId]);

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
      <div className="mb-10 p-6 bg-dark-card shadow-xl rounded-xl border border-dark-border">
          <div>
            <label htmlFor="season-select" className="block text-sm font-semibold text-highlight-gold mb-1">Select Season</label>
            <select
              id="season-select"
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              disabled={allProcessedSeasons.length === 0 && !loading}
              className="w-full mt-1 block pl-3 pr-10 py-2.5 text-base bg-dark-bg text-light-text border border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight-gold focus:border-highlight-gold sm:text-sm rounded-lg shadow-md"
              aria-label="Select Season"
            >
              {allProcessedSeasons.length === 0 && !loading && <option value="">No Seasons Found</option>}
              {allProcessedSeasons.map(season => (
                <option key={season.id} value={season.id}>{season.id}</option>
              ))}
            </select>
          </div>
          {loading && <div className="mt-4 flex justify-end"><LoadingSpinner size="sm" color="text-highlight-gold" /></div>}
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
          />
      )}
    </div>
  );
};

export default MatchesPage;
