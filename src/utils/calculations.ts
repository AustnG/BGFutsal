import { Match, StandingRow, Team, PlayoffMatch } from '../types/league';

/**
 * Computes official league standings for a division according to 3-1-0 points,
 * 2-0 forfeit wins, tiebreaker determinism (PTS > GD > GF > H2H), and Top 8 playoff qualification.
 */
export function computeStandings(
  teams: Team[],
  matches: Match[],
  divisionId: string,
  seasonId?: string
): StandingRow[] {
  const divisionTeams = teams.filter(
    (t) => t.divisionId === divisionId && (!seasonId || t.seasonId === seasonId)
  );
  const teamMap = new Map<string, Team>();
  divisionTeams.forEach((t) => teamMap.set(t.name.trim().toLowerCase(), t));

  // Initialize stats accumulator for each team in division
  const statsMap = new Map<
    string,
    {
      team: Team;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
      matchHistory: { dateOrder: number; result: 'W' | 'D' | 'L' }[];
    }
  >();

  divisionTeams.forEach((team) => {
    statsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: team.pointsAdjustment || 0,
      matchHistory: [],
    });
  });

  // Filter completed matches for this division and season
  // Postseason knockout games are excluded so they do not distort regular season points/records
  const divisionMatches = matches.filter(
    (m) =>
      m.divisionId === divisionId &&
      (!seasonId || m.seasonId === seasonId) &&
      m.status === 'final' &&
      !m.isPostseason
  );

  // Helper to find team id by name fuzzy/trimmed
  const findTeamId = (name: string): string | undefined => {
    const key = name.trim().toLowerCase();
    const found = teamMap.get(key);
    if (found) return found.id;
    // Partial substring fallback
    for (const [k, v] of teamMap.entries()) {
      if (k.includes(key) || key.includes(k)) return v.id;
    }
    return undefined;
  };

  divisionMatches.forEach((m, matchIndex) => {
    const homeId = findTeamId(m.homeTeam);
    const awayId = findTeamId(m.awayTeam);

    if (!homeId || !awayId) return;

    const homeStats = statsMap.get(homeId);
    const awayStats = statsMap.get(awayId);

    if (!homeStats || !awayStats) return;

    let hGoals = 0;
    let aGoals = 0;
    let hResult: 'W' | 'D' | 'L' = 'D';
    let aResult: 'W' | 'D' | 'L' = 'D';

    // Check for forfeit first
    if (m.forfeit === 'home') {
      // Home forfeited, away gets 2-0 win
      hGoals = 0;
      aGoals = 2;
      hResult = 'L';
      aResult = 'W';
    } else if (m.forfeit === 'away') {
      // Away forfeited, home gets 2-0 win
      hGoals = 2;
      aGoals = 0;
      hResult = 'W';
      aResult = 'L';
    } else if (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined) {
      hGoals = Number(m.homeScore);
      aGoals = Number(m.awayScore);
      if (hGoals > aGoals) {
        hResult = 'W';
        aResult = 'L';
      } else if (hGoals < aGoals) {
        hResult = 'L';
        aResult = 'W';
      } else {
        hResult = 'D';
        aResult = 'D';
      }
    } else {
      return; // Skip unplayed
    }

    // Update Home
    homeStats.played += 1;
    homeStats.goalsFor += hGoals;
    homeStats.goalsAgainst += aGoals;
    if (hResult === 'W') {
      homeStats.won += 1;
      homeStats.points += 3;
    } else if (hResult === 'D') {
      homeStats.drawn += 1;
      homeStats.points += 1;
    } else {
      homeStats.lost += 1;
    }
    homeStats.matchHistory.push({ dateOrder: (m.gameweek || 1) * 100 + matchIndex, result: hResult });

    // Update Away
    awayStats.played += 1;
    awayStats.goalsFor += aGoals;
    awayStats.goalsAgainst += hGoals;
    if (aResult === 'W') {
      awayStats.won += 1;
      awayStats.points += 3;
    } else if (aResult === 'D') {
      awayStats.drawn += 1;
      awayStats.points += 1;
    } else {
      awayStats.lost += 1;
    }
    awayStats.matchHistory.push({ dateOrder: (m.gameweek || 1) * 100 + matchIndex, result: aResult });
  });

  // Calculate Head-to-Head between any two teams
  const getHeadToHead = (teamAId: string, teamBId: string) => {
    let aPoints = 0;
    let bPoints = 0;
    let aGD = 0;

    divisionMatches.forEach((m) => {
      const hId = findTeamId(m.homeTeam);
      const aId = findTeamId(m.awayTeam);
      if ((hId === teamAId && aId === teamBId) || (hId === teamBId && aId === teamAId)) {
        let hG = m.homeScore ?? 0;
        let aG = m.awayScore ?? 0;
        if (m.forfeit === 'home') {
          hG = 0;
          aG = 2;
        } else if (m.forfeit === 'away') {
          hG = 2;
          aG = 0;
        }

        const isAHome = hId === teamAId;
        const aGoals = isAHome ? hG : aG;
        const bGoals = isAHome ? aG : hG;

        if (aGoals > bGoals) aPoints += 3;
        else if (aGoals < bGoals) bPoints += 3;
        else {
          aPoints += 1;
          bPoints += 1;
        }
        aGD += aGoals - bGoals;
      }
    });

    return { aPoints, bPoints, aGD };
  };

  // Convert to StandingRow array
  const rows = Array.from(statsMap.values()).map((s) => {
    // Last 5 games
    const sortedHistory = [...s.matchHistory].sort((a, b) => b.dateOrder - a.dateOrder);
    const form = sortedHistory.slice(0, 3).map((h) => h.result).reverse();

    return {
      rank: 1,
      teamId: s.team.id,
      teamName: s.team.name,
      color: s.team.color || '#059669',
      divisionId: s.team.divisionId,
      status: s.team.status,
      statusNote: s.team.statusNote,
      pointsAdjustment: s.team.pointsAdjustment || 0,
      adjustmentReason: s.team.adjustmentReason,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDiff: s.goalsFor - s.goalsAgainst,
      points: s.points,
      form,
      isPlayoffQualified: false,
    };
  });

  // Sort rows deterministically: PTS -> GD -> GF -> H2H -> Name
  rows.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Goal Differential
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    // 3. Goals For
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // 4. Head-to-Head
    const h2h = getHeadToHead(a.teamId, b.teamId);
    if (h2h.aPoints !== h2h.bPoints) return h2h.bPoints - h2h.aPoints;
    if (h2h.aGD !== 0) return -h2h.aGD;
    // 5. Team name
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign ranks & playoff cutoff
  rows.forEach((row, idx) => {
    row.rank = idx + 1;
    row.isPlayoffQualified = row.rank <= 8;
  });

  return rows;
}

/**
 * Computes weekly rank progression for every team across completed gameweeks.
 */
export function computeRankTimeline(
  teams: Team[],
  matches: Match[],
  divisionId: string,
  seasonId?: string
) {
  const divisionMatches = matches.filter(
    (m) =>
      m.divisionId === divisionId &&
      (!seasonId || m.seasonId === seasonId) &&
      m.status === 'final' &&
      !m.isPostseason
  );

  const divisionTeams = teams.filter(
    (t) => t.divisionId === divisionId && (!seasonId || t.seasonId === seasonId)
  );
  if (divisionMatches.length === 0 || divisionTeams.length === 0) {
    return { gameweeks: [], teamPaths: [] };
  }

  const maxGw = Math.max(...divisionMatches.map((m) => m.gameweek || 1));
  const gameweeks: number[] = [];
  for (let w = 1; w <= maxGw; w++) {
    gameweeks.push(w);
  }

  // Calculate cumulative standings at each gameweek
  const weeklyStandings: Map<number, Map<string, number>> = new Map();

  gameweeks.forEach((gw) => {
    const matchesUpToGw = divisionMatches.filter((m) => (m.gameweek || 1) <= gw);
    const standings = computeStandings(teams, matchesUpToGw, divisionId, seasonId);
    const rankMap = new Map<string, number>();
    standings.forEach((s) => rankMap.set(s.teamId, s.rank));
    weeklyStandings.set(gw, rankMap);
  });

  // Construct team paths
  const teamPaths = divisionTeams.map((team) => {
    const ranks = gameweeks.map((gw) => {
      const r = weeklyStandings.get(gw)?.get(team.id);
      return r !== undefined ? r : null;
    });

    return {
      teamId: team.id,
      teamName: team.name,
      color: team.color || '#059669',
      status: team.status,
      ranks,
    };
  });

  return { gameweeks, teamPaths };
}

/**
 * Generates an 8-team single-elimination playoff bracket for a division.
 * Uses real playoff matches from Google Sheets if available; otherwise seeds 1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6.
 */
export function computePlayoffs(
  standings: StandingRow[],
  divisionId: string,
  actualPostseasonMatches: Match[] = []
): PlayoffMatch[] {
  const top8 = standings.slice(0, 8);

  const getSeed = (seedNum: number): StandingRow | undefined => {
    return top8[seedNum - 1];
  };

  const findStandingByTeam = (teamName?: string): StandingRow | undefined => {
    if (!teamName) return undefined;
    const clean = teamName.trim().toLowerCase();
    return standings.find((s) => s.teamName.trim().toLowerCase() === clean);
  };

  const getSeedNumber = (teamName?: string, defaultSeed: number = 1): number => {
    if (!teamName) return defaultSeed;
    const standing = findStandingByTeam(teamName);
    return standing ? standing.rank : defaultSeed;
  };

  // If actual postseason matches were recorded in the database, map them into the bracket
  if (actualPostseasonMatches.length > 0) {
    let qfList = actualPostseasonMatches.filter((m) => m.roundName === 'Quarterfinal');
    let sfList = actualPostseasonMatches.filter((m) => m.roundName === 'Semifinal');
    let finalList = actualPostseasonMatches.filter(
      (m) => m.roundName?.includes('Final') || m.roundName?.includes('Championship')
    );

    // Fallback if 7 matches in sequence without specific round tags
    if (qfList.length === 0 && actualPostseasonMatches.length >= 4) {
      qfList = actualPostseasonMatches.slice(0, 4);
      sfList = actualPostseasonMatches.slice(4, 6);
      finalList = actualPostseasonMatches.slice(6, 7);
    }

    const defaultSeedPairs = [
      { seedA: 1, seedB: 8 },
      { seedA: 4, seedB: 5 },
      { seedA: 2, seedB: 7 },
      { seedA: 3, seedB: 6 },
    ];

    const playoffMatches: PlayoffMatch[] = [];

    // 4 Quarterfinals
    for (let i = 0; i < 4; i++) {
      const m = qfList[i];
      const defaults = defaultSeedPairs[i];
      const homeStanding = m ? findStandingByTeam(m.homeTeam) : getSeed(defaults.seedA);
      const awayStanding = m ? findStandingByTeam(m.awayTeam) : getSeed(defaults.seedB);

      let winner: StandingRow | undefined = undefined;
      let winnerName: string | undefined = undefined;
      if (m && m.status === 'final') {
        if (m.forfeit === 'home') {
          winner = awayStanding;
          winnerName = m.awayTeam;
        } else if (m.forfeit === 'away') {
          winner = homeStanding;
          winnerName = m.homeTeam;
        } else if (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined) {
          if (m.homeScore > m.awayScore) {
            winner = homeStanding;
            winnerName = m.homeTeam;
          } else if (m.awayScore > m.homeScore) {
            winner = awayStanding;
            winnerName = m.awayTeam;
          }
        }
      }

      playoffMatches.push({
        id: m?.id || `${divisionId}-qf-${i + 1}`,
        round: 'Quarterfinal',
        matchNumber: i + 1,
        seedA: m ? getSeedNumber(m.homeTeam, defaults.seedA) : defaults.seedA,
        seedB: m ? getSeedNumber(m.awayTeam, defaults.seedB) : defaults.seedB,
        teamA: homeStanding,
        teamB: awayStanding,
        teamAName: m?.homeTeam || homeStanding?.teamName || `Seed ${defaults.seedA}`,
        teamBName: m?.awayTeam || awayStanding?.teamName || `Seed ${defaults.seedB}`,
        scoreA: m?.homeScore,
        scoreB: m?.awayScore,
        status: m?.status || 'upcoming',
        winner,
        winnerName,
        date: m?.date || 'Sun, May 10',
        time: m?.time || `${18 + i}:00`,
      });
    }

    // 2 Semifinals
    const sfDefaults = [
      { seedA: 1, seedB: 4 },
      { seedA: 2, seedB: 3 },
    ];

    for (let i = 0; i < 2; i++) {
      const m = sfList[i];
      const defaults = sfDefaults[i];
      const homeStanding = m ? findStandingByTeam(m.homeTeam) : undefined;
      const awayStanding = m ? findStandingByTeam(m.awayTeam) : undefined;

      let winner: StandingRow | undefined = undefined;
      let winnerName: string | undefined = undefined;
      if (m && m.status === 'final') {
        if (m.forfeit === 'home') {
          winner = awayStanding;
          winnerName = m.awayTeam;
        } else if (m.forfeit === 'away') {
          winner = homeStanding;
          winnerName = m.homeTeam;
        } else if (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined) {
          if (m.homeScore > m.awayScore) {
            winner = homeStanding;
            winnerName = m.homeTeam;
          } else if (m.awayScore > m.homeScore) {
            winner = awayStanding;
            winnerName = m.awayTeam;
          }
        }
      }

      playoffMatches.push({
        id: m?.id || `${divisionId}-sf-${i + 1}`,
        round: 'Semifinal',
        matchNumber: 5 + i,
        seedA: m ? getSeedNumber(m.homeTeam, defaults.seedA) : defaults.seedA,
        seedB: m ? getSeedNumber(m.awayTeam, defaults.seedB) : defaults.seedB,
        teamA: homeStanding,
        teamB: awayStanding,
        teamAName: m?.homeTeam || (i === 0 ? 'Winner QF 1' : 'Winner QF 3'),
        teamBName: m?.awayTeam || (i === 0 ? 'Winner QF 2' : 'Winner QF 4'),
        scoreA: m?.homeScore,
        scoreB: m?.awayScore,
        status: m?.status || 'upcoming',
        winner,
        winnerName,
        date: m?.date || 'Sun, May 17',
        time: m?.time || `${18 + i}:00`,
      });
    }

    // 1 Championship Final
    const finalM = finalList[0];
    const finalHomeStanding = finalM ? findStandingByTeam(finalM.homeTeam) : undefined;
    const finalAwayStanding = finalM ? findStandingByTeam(finalM.awayTeam) : undefined;

    let finalWinner: StandingRow | undefined = undefined;
    let finalWinnerName: string | undefined = undefined;
    if (finalM && finalM.status === 'final') {
      if (finalM.forfeit === 'home') {
        finalWinner = finalAwayStanding;
        finalWinnerName = finalM.awayTeam;
      } else if (finalM.forfeit === 'away') {
        finalWinner = finalHomeStanding;
        finalWinnerName = finalM.homeTeam;
      } else if (finalM.homeScore !== null && finalM.homeScore !== undefined && finalM.awayScore !== null && finalM.awayScore !== undefined) {
        if (finalM.homeScore > finalM.awayScore) {
          finalWinner = finalHomeStanding;
          finalWinnerName = finalM.homeTeam;
        } else if (finalM.awayScore > finalM.homeScore) {
          finalWinner = finalAwayStanding;
          finalWinnerName = finalM.awayTeam;
        }
      }
    }

    playoffMatches.push({
      id: finalM?.id || `${divisionId}-final`,
      round: 'Championship',
      matchNumber: 7,
      seedA: finalM ? getSeedNumber(finalM.homeTeam, 1) : 1,
      seedB: finalM ? getSeedNumber(finalM.awayTeam, 2) : 2,
      teamA: finalHomeStanding,
      teamB: finalAwayStanding,
      teamAName: finalM?.homeTeam || 'Finalist 1',
      teamBName: finalM?.awayTeam || 'Finalist 2',
      scoreA: finalM?.homeScore,
      scoreB: finalM?.awayScore,
      status: finalM?.status || 'upcoming',
      winner: finalWinner,
      winnerName: finalWinnerName,
      date: finalM?.date || 'Sun, May 17',
      time: finalM?.time || '20:30',
    });

    return playoffMatches;
  }

  // Projected bracket based on top 8 standings
  const matches: PlayoffMatch[] = [
    // Quarterfinals
    {
      id: `${divisionId}-qf-1`,
      round: 'Quarterfinal',
      matchNumber: 1,
      seedA: 1,
      seedB: 8,
      teamA: getSeed(1),
      teamB: getSeed(8),
      teamAName: getSeed(1)?.teamName || 'Seed 1',
      teamBName: getSeed(8)?.teamName || 'Seed 8',
      date: 'Sun, May 10',
      time: '18:00',
    },
    {
      id: `${divisionId}-qf-2`,
      round: 'Quarterfinal',
      matchNumber: 2,
      seedA: 4,
      seedB: 5,
      teamA: getSeed(4),
      teamB: getSeed(5),
      teamAName: getSeed(4)?.teamName || 'Seed 4',
      teamBName: getSeed(5)?.teamName || 'Seed 5',
      date: 'Sun, May 10',
      time: '19:00',
    },
    {
      id: `${divisionId}-qf-3`,
      round: 'Quarterfinal',
      matchNumber: 3,
      seedA: 2,
      seedB: 7,
      teamA: getSeed(2),
      teamB: getSeed(7),
      teamAName: getSeed(2)?.teamName || 'Seed 2',
      teamBName: getSeed(7)?.teamName || 'Seed 7',
      date: 'Sun, May 10',
      time: '20:00',
    },
    {
      id: `${divisionId}-qf-4`,
      round: 'Quarterfinal',
      matchNumber: 4,
      seedA: 3,
      seedB: 6,
      teamA: getSeed(3),
      teamB: getSeed(6),
      teamAName: getSeed(3)?.teamName || 'Seed 3',
      teamBName: getSeed(6)?.teamName || 'Seed 6',
      date: 'Sun, May 10',
      time: '21:00',
    },

    // Semifinals
    {
      id: `${divisionId}-sf-1`,
      round: 'Semifinal',
      matchNumber: 5,
      seedA: 1,
      seedB: 4,
      teamA: getSeed(1),
      teamB: getSeed(4),
      teamAName: 'Winner QF 1',
      teamBName: 'Winner QF 2',
      date: 'Sun, May 17',
      time: '18:00',
    },
    {
      id: `${divisionId}-sf-2`,
      round: 'Semifinal',
      matchNumber: 6,
      seedA: 2,
      seedB: 3,
      teamA: getSeed(2),
      teamB: getSeed(3),
      teamAName: 'Winner QF 3',
      teamBName: 'Winner QF 4',
      date: 'Sun, May 17',
      time: '19:00',
    },

    // Championship Final
    {
      id: `${divisionId}-final`,
      round: 'Championship',
      matchNumber: 7,
      seedA: 1,
      seedB: 2,
      teamA: getSeed(1),
      teamB: getSeed(2),
      teamAName: 'Finalist 1',
      teamBName: 'Finalist 2',
      date: 'Sun, May 17',
      time: '20:30',
    },
  ];

  return matches;
}
