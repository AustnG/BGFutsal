
import { ProcessedGame, StandingRow, Division } from '../types';

export function calculateStandings(games: ProcessedGame[], teams: StandingRow[]): StandingRow[] {
  const standingsMap: Map<string, StandingRow> = new Map();

  // Initialize standings for all teams
  teams.forEach(team => {
    standingsMap.set(team.teamName, { // Use teamName as key and property
      teamName: team.teamName,
      division: team.division,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  games.forEach(game => {
    if (isNaN(game.homeScore) || isNaN(game.awayScore)) {
      // Skip games with no scores or invalid scores
      return;
    }

    const homeTeamStanding = standingsMap.get(game.homeTeam);
    const awayTeamStanding = standingsMap.get(game.awayTeam);

    if (homeTeamStanding) {
      homeTeamStanding.played += 1;
      homeTeamStanding.goalsFor += game.homeScore;
      homeTeamStanding.goalsAgainst += game.awayScore;
    }
    if (awayTeamStanding) {
      awayTeamStanding.played += 1;
      awayTeamStanding.goalsFor += game.awayScore;
      awayTeamStanding.goalsAgainst += game.homeScore;
    }

    if (homeTeamStanding && awayTeamStanding) {
      if (game.homeScore > game.awayScore) {
        homeTeamStanding.wins += 1;
        homeTeamStanding.points += 3;
        awayTeamStanding.losses += 1;
      } else if (game.awayScore > game.homeScore) {
        awayTeamStanding.wins += 1;
        awayTeamStanding.points += 3;
        homeTeamStanding.losses += 1;
      } else { // Draw
        homeTeamStanding.draws += 1;
        homeTeamStanding.points += 1;
        awayTeamStanding.draws += 1;
        awayTeamStanding.points += 1;
      }
    }
  });

  const result: StandingRow[] = [];
  standingsMap.forEach(standing => {
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    result.push(standing);
  });
  
  // Sort by points, then GD, then GF
  return result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}