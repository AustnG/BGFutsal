import { Match, PlayoffMatch, StandingRow, Team } from '../types/league';

/**
 * Canonical team name key used across standings, schedules, and starred-team comparisons.
 */
export function normalizeTeamKey(name?: string | null): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isSameTeamName(a?: string | null, b?: string | null): boolean {
  const keyA = normalizeTeamKey(a);
  const keyB = normalizeTeamKey(b);
  return Boolean(keyA && keyB && keyA === keyB);
}

export interface ResolvedMatchOutcome {
  isFinal: boolean;
  isForfeit: boolean;
  homeGoals: number | null;
  awayGoals: number | null;
  hasPk: boolean;
  winnerSide: 'home' | 'away' | 'draw' | null;
}

/**
 * Single source of truth for resolving scores, 2-0 forfeits, PK shootouts, and winners.
 */
export function resolveMatchOutcome(m: Match): ResolvedMatchOutcome {
  const isFinal = m.status === 'final';
  const isForfeit = Boolean(m.forfeit && m.forfeit !== 'none');

  if (!isFinal) {
    return {
      isFinal: false,
      isForfeit: false,
      homeGoals: null,
      awayGoals: null,
      hasPk: false,
      winnerSide: null,
    };
  }

  if (m.forfeit === 'home') {
    return {
      isFinal: true,
      isForfeit: true,
      homeGoals: 0,
      awayGoals: 2,
      hasPk: false,
      winnerSide: 'away',
    };
  }

  if (m.forfeit === 'away') {
    return {
      isFinal: true,
      isForfeit: true,
      homeGoals: 2,
      awayGoals: 0,
      hasPk: false,
      winnerSide: 'home',
    };
  }

  if (
    m.homeScore !== null &&
    m.homeScore !== undefined &&
    m.awayScore !== null &&
    m.awayScore !== undefined
  ) {
    const homeGoals = Number(m.homeScore);
    const awayGoals = Number(m.awayScore);

    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) {
      return {
        isFinal: false,
        isForfeit: false,
        homeGoals: null,
        awayGoals: null,
        hasPk: false,
        winnerSide: null,
      };
    }

    const hasPk =
      homeGoals === awayGoals &&
      m.homePk !== null &&
      m.homePk !== undefined &&
      m.awayPk !== null &&
      m.awayPk !== undefined;

    let winnerSide: 'home' | 'away' | 'draw' = 'draw';
    if (homeGoals > awayGoals) {
      winnerSide = 'home';
    } else if (awayGoals > homeGoals) {
      winnerSide = 'away';
    } else if (hasPk) {
      if (Number(m.homePk) > Number(m.awayPk)) winnerSide = 'home';
      else if (Number(m.awayPk) > Number(m.homePk)) winnerSide = 'away';
    }

    return {
      isFinal: true,
      isForfeit: false,
      homeGoals,
      awayGoals,
      hasPk,
      winnerSide,
    };
  }

  return {
    isFinal: false,
    isForfeit: false,
    homeGoals: null,
    awayGoals: null,
    hasPk: false,
    winnerSide: null,
  };
}

/**
 * Computes official league standings for a division according to 3-1-0 points,
 * 2-0 forfeit wins, tiebreaker determinism (PTS > GD > GF > H2H > Name), and Top 8 playoff qualification.
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
  divisionTeams.forEach((t) => teamMap.set(normalizeTeamKey(t.name), t));

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
    const safeAdjustment =
      typeof team.pointsAdjustment === 'number' && Number.isFinite(team.pointsAdjustment)
        ? team.pointsAdjustment
        : 0;

    statsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: safeAdjustment,
      matchHistory: [],
    });
  });

  // Postseason knockout games are excluded so they do not distort regular season records
  const divisionMatches = matches.filter(
    (m) =>
      m.divisionId === divisionId &&
      (!seasonId || m.seasonId === seasonId) &&
      m.status === 'final' &&
      !m.isPostseason
  );

  // Strict exact-normalized lookup (avoids substring collisions like "Bosna" vs "Bosna Jr")
  const findTeamId = (name: string): string | undefined => {
    const key = normalizeTeamKey(name);
    if (!key) return undefined;
    const direct = teamMap.get(key);
    if (direct) return direct.id;

    // Safe punctuation-insensitive fallback (no substring matching)
    const stripped = key.replace(/[^a-z0-9 ]/g, '');
    for (const [k, v] of teamMap.entries()) {
      if (k.replace(/[^a-z0-9 ]/g, '') === stripped) {
        return v.id;
      }
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

    const outcome = resolveMatchOutcome(m);
    if (!outcome.isFinal || outcome.homeGoals === null || outcome.awayGoals === null) {
      return;
    }

    const hGoals = outcome.homeGoals;
    const aGoals = outcome.awayGoals;
    const hResult: 'W' | 'D' | 'L' =
      hGoals > aGoals ? 'W' : hGoals < aGoals ? 'L' : 'D';
    const aResult: 'W' | 'D' | 'L' =
      aGoals > hGoals ? 'W' : aGoals < hGoals ? 'L' : 'D';

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
    homeStats.matchHistory.push({
      dateOrder: (m.gameweek || 1) * 100 + matchIndex,
      result: hResult,
    });

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
    awayStats.matchHistory.push({
      dateOrder: (m.gameweek || 1) * 100 + matchIndex,
      result: aResult,
    });
  });

  const getHeadToHead = (teamAId: string, teamBId: string) => {
    let aPoints = 0;
    let bPoints = 0;
    let aGD = 0;

    divisionMatches.forEach((m) => {
      const hId = findTeamId(m.homeTeam);
      const aId = findTeamId(m.awayTeam);
      if ((hId === teamAId && aId === teamBId) || (hId === teamBId && aId === teamAId)) {
        const outcome = resolveMatchOutcome(m);
        if (!outcome.isFinal || outcome.homeGoals === null || outcome.awayGoals === null) {
          return;
        }
        const isAHome = hId === teamAId;
        const aGoals = isAHome ? outcome.homeGoals : outcome.awayGoals;
        const bGoals = isAHome ? outcome.awayGoals : outcome.homeGoals;

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

  const rows: StandingRow[] = Array.from(statsMap.values()).map((s) => {
    const sortedHistory = [...s.matchHistory].sort((a, b) => b.dateOrder - a.dateOrder);
    const form = sortedHistory.slice(0, 3).map((h) => h.result).reverse();
    const safeAdjustment =
      typeof s.team.pointsAdjustment === 'number' && Number.isFinite(s.team.pointsAdjustment)
        ? s.team.pointsAdjustment
        : 0;

    return {
      rank: 1,
      teamId: s.team.id,
      teamName: s.team.name,
      color: s.team.color || '#059669',
      divisionId: s.team.divisionId,
      status: s.team.status,
      statusNote: s.team.statusNote,
      pointsAdjustment: safeAdjustment,
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
      isTied: false,
    };
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const h2h = getHeadToHead(a.teamId, b.teamId);
    if (h2h.aPoints !== h2h.bPoints) return h2h.bPoints - h2h.aPoints;
    if (h2h.aGD !== 0) return -h2h.aGD;
    return a.teamName.localeCompare(b.teamName);
  });

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    if (idx === 0) {
      row.rank = 1;
      row.isTied = false;
    } else {
      const prev = rows[idx - 1];
      const h2h = getHeadToHead(prev.teamId, row.teamId);
      const isLevel =
        row.points === prev.points &&
        row.goalDiff === prev.goalDiff &&
        row.goalsFor === prev.goalsFor &&
        h2h.aPoints === h2h.bPoints &&
        h2h.aGD === 0;

      if (isLevel) {
        row.rank = prev.rank;
        row.isTied = true;
        prev.isTied = true;
      } else {
        row.rank = idx + 1;
        row.isTied = false;
      }
    }
    row.isPlayoffQualified = row.rank <= 8;
  }

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

  const weeklyStandings: Map<number, Map<string, number>> = new Map();
  gameweeks.forEach((gw) => {
    const matchesUpToGw = divisionMatches.filter((m) => (m.gameweek || 1) <= gw);
    const standings = computeStandings(teams, matchesUpToGw, divisionId, seasonId);
    const rankMap = new Map<string, number>();
    standings.forEach((s) => rankMap.set(s.teamId, s.rank));
    weeklyStandings.set(gw, rankMap);
  });

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
 */
export function computePlayoffs(
  standings: StandingRow[],
  divisionId: string,
  actualPostseasonMatches: Match[] = []
): PlayoffMatch[] {
  const top8 = standings.slice(0, 8);

  const getSeed = (seedNum: number): StandingRow | undefined => top8[seedNum - 1];

  const findStandingByTeam = (teamName?: string): StandingRow | undefined => {
    const key = normalizeTeamKey(teamName);
    if (!key) return undefined;
    return standings.find((s) => normalizeTeamKey(s.teamName) === key);
  };

  const getSeedNumber = (teamName?: string, defaultSeed: number = 1): number => {
    if (!teamName) return defaultSeed;
    const standing = findStandingByTeam(teamName);
    return standing ? standing.rank : defaultSeed;
  };

  const buildPlayoffEntry = (
    m: Match | undefined,
    round: PlayoffMatch['round'],
    matchNumber: number,
    defaultSeedA: number,
    defaultSeedB: number,
    fallbackTeamAName: string,
    fallbackTeamBName: string,
    fallbackDate: string,
    fallbackTime: string,
    fallbackTeamAStanding?: StandingRow,
    fallbackTeamBStanding?: StandingRow
  ): PlayoffMatch => {
    const homeStanding = m ? findStandingByTeam(m.homeTeam) : fallbackTeamAStanding;
    const awayStanding = m ? findStandingByTeam(m.awayTeam) : fallbackTeamBStanding;

    let winner: StandingRow | undefined;
    let winnerName: string | undefined;

    if (m) {
      const outcome = resolveMatchOutcome(m);
      if (outcome.winnerSide === 'home') {
        winner = homeStanding;
        winnerName = m.homeTeam;
      } else if (outcome.winnerSide === 'away') {
        winner = awayStanding;
        winnerName = m.awayTeam;
      }
    }

    return {
      id: m?.id || `${divisionId}-${round.toLowerCase()}-${matchNumber}`,
      round,
      matchNumber,
      seedA: m ? getSeedNumber(m.homeTeam, defaultSeedA) : defaultSeedA,
      seedB: m ? getSeedNumber(m.awayTeam, defaultSeedB) : defaultSeedB,
      teamA: homeStanding,
      teamB: awayStanding,
      teamAName: m?.homeTeam || fallbackTeamAName,
      teamBName: m?.awayTeam || fallbackTeamBName,
      scoreA: m?.homeScore,
      scoreB: m?.awayScore,
      pkA: m?.homePk,
      pkB: m?.awayPk,
      status: m?.status || 'upcoming',
      winner,
      winnerName,
      date: m?.date || fallbackDate,
      time: m?.time || fallbackTime,
    };
  };

  if (actualPostseasonMatches.length > 0) {
    let qfList = actualPostseasonMatches.filter((m) => m.roundName === 'Quarterfinal');
    let sfList = actualPostseasonMatches.filter((m) => m.roundName === 'Semifinal');
    let finalList = actualPostseasonMatches.filter(
      (m) => m.roundName?.includes('Final') || m.roundName?.includes('Championship')
    );

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

    for (let i = 0; i < 4; i++) {
      const defaults = defaultSeedPairs[i];
      const seedAStanding = getSeed(defaults.seedA);
      const seedBStanding = getSeed(defaults.seedB);
      playoffMatches.push(
        buildPlayoffEntry(
          qfList[i],
          'Quarterfinal',
          i + 1,
          defaults.seedA,
          defaults.seedB,
          seedAStanding?.teamName || `Seed ${defaults.seedA}`,
          seedBStanding?.teamName || `Seed ${defaults.seedB}`,
          'Sun, May 10',
          `${18 + i}:00`,
          seedAStanding,
          seedBStanding
        )
      );
    }

    const sfDefaults = [
      { seedA: 1, seedB: 4 },
      { seedA: 2, seedB: 3 },
    ];
    for (let i = 0; i < 2; i++) {
      const defaults = sfDefaults[i];
      playoffMatches.push(
        buildPlayoffEntry(
          sfList[i],
          'Semifinal',
          5 + i,
          defaults.seedA,
          defaults.seedB,
          i === 0 ? 'Winner QF 1' : 'Winner QF 3',
          i === 0 ? 'Winner QF 2' : 'Winner QF 4',
          'Sun, May 17',
          `${18 + i}:00`
        )
      );
    }

    playoffMatches.push(
      buildPlayoffEntry(
        finalList[0],
        'Championship',
        7,
        1,
        2,
        'Finalist 1',
        'Finalist 2',
        'Sun, May 17',
        '20:30'
      )
    );

    return playoffMatches;
  }

  return [
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
}
