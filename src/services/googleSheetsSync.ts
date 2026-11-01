import { INITIAL_LEAGUE_DATA } from '../data/initialLeagueData';
import {
  Division,
  Honor,
  LeagueDatabase,
  Match,
  NewsStory,
  Season,
  Team,
  SyncStatus,
} from '../types/league';

const STORAGE_KEY_DATA = 'bgfutsal_league_data_v1';
const STORAGE_KEY_SHEET_URL = 'bgfutsal_sheet_url_v1';
const STORAGE_KEY_LAST_SYNC = 'bgfutsal_last_sync_v1';

/**
 * Official Published Google Sheets database endpoints.
 */
export const DEFAULT_PUBLISHED_SHEET_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTsCEKgTCuWzARJo4Qep3Cxxpzhz_hhnK6VNTmM7IkR2eukXjlufkkF_Np7lPofOl_Q6oIZCVXmY2if/pub';

export const DEFAULT_PUBLISHED_GIDS: Record<string, string> = {
  Seasons: '1017102117',
  Divisions: '798176882',
  Teams: '898919565',
  Matches: '0',
  Honors: '78628730',
  News: '298781161',
};

/**
 * Checks if a URL is a published web Google Sheet (/spreadsheets/d/e/2PACX-...).
 */
export function isPublishedGoogleSheet(urlOrId: string): boolean {
  if (!urlOrId) return false;
  return urlOrId.includes('/spreadsheets/d/e/2PACX-') || urlOrId.startsWith('2PACX-');
}

/**
 * Extracts Google Spreadsheet ID or returns the clean published base URL.
 */
export function extractSpreadsheetId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Published web link /spreadsheets/d/e/<PUB_ID>/...
  if (isPublishedGoogleSheet(trimmed)) {
    const pubMatch = trimmed.match(/(https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/[a-zA-Z0-9-_]+(\/pub)?)/i);
    if (pubMatch && pubMatch[1]) {
      return pubMatch[1].replace(/\/$/, '').replace(/\/pub$/, '') + '/pub';
    }
    return DEFAULT_PUBLISHED_SHEET_BASE;
  }

  // Direct Standard ID check (20-60 alphanumeric characters)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard docs.google.com/spreadsheets/d/<ID>/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Robust CSV parser handling multiline quotes, commas, and formatting.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header and rows respecting quoted commas and escaped quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Fetches a single tab from a Google Sheet via GViz or direct published GID endpoint.
 */
async function fetchSheetTabCSV(sheetTarget: string, tabName: string): Promise<string> {
  let targetUrl = '';

  if (isPublishedGoogleSheet(sheetTarget)) {
    const gid = DEFAULT_PUBLISHED_GIDS[tabName] ?? '0';
    const baseUrl = sheetTarget.includes('/pub')
      ? sheetTarget.split('?')[0]
      : DEFAULT_PUBLISHED_SHEET_BASE;
    targetUrl = `${baseUrl}?gid=${gid}&single=true&output=csv`;
  } else {
    // Standard Google Sheet sharing endpoint
    targetUrl = `https://docs.google.com/spreadsheets/d/${sheetTarget}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      tabName
    )}`;
  }

  const response = await fetch(targetUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch tab "${tabName}" (HTTP ${response.status})`);
  }
  return await response.text();
}

/**
 * Loads cached league data or falls back to INITIAL_LEAGUE_DATA with default published URL.
 */
export function loadInitialData(): { data: LeagueDatabase; syncStatus: SyncStatus } {
  try {
    const savedUrl =
      localStorage.getItem(STORAGE_KEY_SHEET_URL) || DEFAULT_PUBLISHED_SHEET_BASE;
    const lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
    const cachedData = localStorage.getItem(STORAGE_KEY_DATA);

    if (cachedData) {
      const parsed = JSON.parse(cachedData) as LeagueDatabase;
      if (parsed.seasons && parsed.teams && parsed.matches && parsed.matches.length > 0) {
        return {
          data: parsed,
          syncStatus: {
            lastSynced: lastSync,
            isSyncing: false,
            error: null,
            sheetUrl: savedUrl,
            dataSource: 'google-sheets',
            validationIssues: [],
          },
        };
      }
    }
  } catch (err) {
    console.warn('Error reading cached league data:', err);
  }

  return {
    data: INITIAL_LEAGUE_DATA,
    syncStatus: {
      lastSynced: null,
      isSyncing: false,
      error: null,
      sheetUrl: DEFAULT_PUBLISHED_SHEET_BASE,
      dataSource: 'google-sheets',
      validationIssues: [],
    },
  };
}

/**
 * Saves current league data to localStorage.
 */
export function saveLeagueDataToStorage(data: LeagueDatabase, sheetUrl: string) {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetUrl);
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toLocaleString());
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

/**
 * Synchronizes with a user's Google Sheet and returns the updated database and health report.
 */
export async function syncWithGoogleSheet(sheetUrlOrId: string): Promise<{
  data: LeagueDatabase;
  validationIssues: string[];
}> {
  const target = extractSpreadsheetId(sheetUrlOrId) || sheetUrlOrId.trim();
  if (!target) {
    throw new Error('Please provide a valid Google Sheet URL or published link.');
  }

  const issues: string[] = [];

  // Fetch all 6 tabs in parallel
  const tabNames = ['Seasons', 'Divisions', 'Teams', 'Matches', 'Honors', 'News'];
  const results = await Promise.allSettled(
    tabNames.map((name) => fetchSheetTabCSV(target, name))
  );

  const tabCSVs: Record<string, string | null> = {};
  tabNames.forEach((name, idx) => {
    const res = results[idx];
    if (res.status === 'fulfilled') {
      tabCSVs[name] = res.value;
    } else {
      tabCSVs[name] = null;
      issues.push(`Note: Could not fetch tab "${name}".`);
    }
  });

  // 1. Parse Seasons (Sorted: Current active first, then newest to oldest)
  let seasons: Season[] = INITIAL_LEAGUE_DATA.seasons;
  const rawSeasonRows = tabCSVs['Seasons'] ? parseCSV(tabCSVs['Seasons']) : [];
  if (rawSeasonRows.length > 0) {
    seasons = rawSeasonRows.map((r, i) => {
      const id = r.season_id || r.id || `s-${i + 1}`;
      let name = r.name || r.season_name || '';
      if (!name) {
        if (id.includes(' ')) {
          name = id;
        } else {
          name = `Season ${i + 1}`;
        }
      }
      const isCurrent = (r.is_current || r.current || '').toLowerCase().trim() === 'true';

      return {
        id,
        name,
        startDate: r.start_date || r.startdate || '',
        endDate: r.end_date || r.enddate || '',
        isCurrent,
        status: isCurrent ? 'active' : 'completed',
        description: r.description || '',
      };
    });

    // Ensure at least one season is marked current if none has is_current = TRUE
    if (!seasons.some((s) => s.isCurrent) && seasons.length > 0) {
      const currentCandidate =
        seasons.find((s) => s.id === 's2026-winter' || s.id.includes('2026')) ||
        seasons[seasons.length - 1];
      if (currentCandidate) {
        currentCandidate.isCurrent = true;
      }
    }

    // Sort seasons: current active season first, then most recent to oldest
    const getSeasonWeight = (s: Season): number => {
      const yearMatch = (s.id + ' ' + s.name + ' ' + s.startDate).match(/(20\d\d)/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2020;
      const lower = (s.id + ' ' + s.name).toLowerCase();
      let termWeight = 1;
      if (lower.includes('winter')) termWeight = 4;
      else if (lower.includes('fall')) termWeight = 3;
      else if (lower.includes('summer')) termWeight = 2;
      else if (lower.includes('spring')) termWeight = 1;
      return year * 10 + termWeight;
    };

    seasons.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return getSeasonWeight(b) - getSeasonWeight(a);
    });
  }

  // 2. Parse Divisions
  let divisions: Division[] = INITIAL_LEAGUE_DATA.divisions;
  const rawDivRows = tabCSVs['Divisions'] ? parseCSV(tabCSVs['Divisions']) : [];
  if (rawDivRows.length > 0) {
    divisions = rawDivRows.map((r, i) => ({
      id: r.division_id || r.id || `div-${i + 1}`,
      seasonId: r.season_id || seasons[0]?.id || 's2026-winter',
      name: r.name || r.division_name || `Division ${i + 1}`,
      tier: Number(r.tier || r.tier_level || i + 1),
    }));
  }

  // Synthesize division definitions for seasons that do not have explicit Division tab entries
  const existingDivSeasonIds = new Set(divisions.map((d) => d.seasonId));
  seasons.forEach((s) => {
    if (!existingDivSeasonIds.has(s.id)) {
      const isDivB = s.id.endsWith(' B') || s.name.endsWith(' B');
      divisions.push({
        id: `${s.id}-main`,
        seasonId: s.id,
        name: isDivB ? 'Division B' : 'Division A',
        tier: isDivB ? 2 : 1,
      });
    }
  });

  // Helpers to resolve season and division IDs from raw text
  const resolveSeasonId = (rawSeason?: string): string => {
    if (!rawSeason) {
      const curr = seasons.find((s) => s.isCurrent);
      return curr ? curr.id : seasons[0]?.id || 's2026-winter';
    }
    const clean = rawSeason.trim().toLowerCase();
    for (const s of seasons) {
      if (s.id.toLowerCase() === clean) return s.id;
      const sNameClean = s.name.toLowerCase();
      if (clean.includes(sNameClean) || sNameClean.includes(clean)) return s.id;
    }
    const yearMatch = clean.match(/(20\d\d)/);
    if (yearMatch) {
      const y = yearMatch[1];
      const isWinter = clean.includes('winter');
      const isSpring = clean.includes('spring');
      const isFall = clean.includes('fall');
      const matched = seasons.find((s) => {
        const sL = (s.id + ' ' + s.name).toLowerCase();
        return (
          sL.includes(y) &&
          ((isWinter && sL.includes('winter')) ||
            (isSpring && sL.includes('spring')) ||
            (isFall && sL.includes('fall')))
        );
      });
      if (matched) return matched.id;
    }
    return seasons[0]?.id || 's2026-winter';
  };

  const resolveDivisionId = (seasonId: string, rawDiv?: string, rawSeason?: string): string => {
    const seasonDivs = divisions.filter((d) => d.seasonId === seasonId);
    if (seasonDivs.length === 0) return '';
    if (seasonDivs.length === 1) return seasonDivs[0].id;

    const divStr = ((rawDiv || '') + ' ' + (rawSeason || '')).toUpperCase();
    if (
      divStr.includes('DIVISION B') ||
      divStr.includes(' B') ||
      divStr.endsWith('B') ||
      divStr.includes('TIER 2') ||
      divStr.includes('DIV-B')
    ) {
      const b = seasonDivs.find(
        (d) =>
          d.name.toUpperCase().includes('B') ||
          d.id.toLowerCase().includes('div-b') ||
          d.tier === 2
      );
      if (b) return b.id;
    }
    const a = seasonDivs.find(
      (d) =>
        d.name.toUpperCase().includes('A') ||
        d.id.toLowerCase().includes('div-a') ||
        d.tier === 1
    );
    return a ? a.id : seasonDivs[0].id;
  };

  // 3. Parse Teams
  let teams: Team[] = INITIAL_LEAGUE_DATA.teams;
  const rawTeamRows = tabCSVs['Teams'] ? parseCSV(tabCSVs['Teams']) : [];
  if (rawTeamRows.length > 0) {
    teams = [];
    rawTeamRows.forEach((r, i) => {
      const teamName = (r.name || r.team_id || '').trim();
      if (!teamName) return; // Skip empty row

      const rawSeason = (r.season || r.season_id || '').trim();
      const season = resolveSeasonId(rawSeason);
      const divId = resolveDivisionId(season, r.division_id || r.division, rawSeason);

      const statusVal = (r.status || '').toLowerCase().trim();
      const droppedVal = (r.dropped || '').toLowerCase().trim();
      let status: 'active' | 'withdrawn' | 'joined_midseason' = 'active';
      if (droppedVal === 'true' || statusVal.includes('withdrawn') || statusVal.includes('drop')) {
        status = 'withdrawn';
      } else if (statusVal.includes('mid') || statusVal.includes('join')) {
        status = 'joined_midseason';
      }

      teams.push({
        id: `${season}-${teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        divisionId: divId,
        seasonId: season,
        name: teamName,
        color: r.teamcolor || r.color || r.jersey_color || r.hex || '#059669',
        status,
        statusNote: r.notes || r.status_note || '',
        pointsAdjustment: r.points_adjustment ? Number(r.points_adjustment) : 0,
        adjustmentReason: r.adjustment_reason || r.points_reason || '',
      });
    });
  }

  // Team lookup set for match validation and auto-registration
  const knownTeamSeasonMap = new Set(teams.map((t) => `${t.seasonId}:::${t.name.trim().toLowerCase()}`));

  // 4. Parse Matches (Handling user's updated column ordering)
  let matches: Match[] = INITIAL_LEAGUE_DATA.matches;
  const rawMatchRows = tabCSVs['Matches'] ? parseCSV(tabCSVs['Matches']) : [];
  if (rawMatchRows.length > 0) {
    let lastKnownSeason = seasons[0]?.id || 's2026-winter';
    let previousWasPostseason = false;
    let previousSeasonId = '';

    const findExistingTeamName = (season: string, rawName: string): string | null => {
      const clean = rawName.trim().toLowerCase();
      if (knownTeamSeasonMap.has(`${season}:::${clean}`)) return rawName;
      const simplified = clean
        .split(/[\s_-]+/)
        .map((w) => w.replace(/s$/, ''))
        .join(' ');
      for (const t of teams) {
        if (t.seasonId === season) {
          const tSimp = t.name
            .trim()
            .toLowerCase()
            .split(/[\s_-]+/)
            .map((w) => w.replace(/s$/, ''))
            .join(' ');
          if (tSimp === simplified) {
            return t.name;
          }
        }
      }
      return null;
    };

    rawMatchRows.forEach((r, i) => {
      const homeName = (r.home_team || r.hometeam || r.home || '').trim();
      const awayName = (r.away_team || r.awayteam || r.away || '').trim();

      // Skip row if both teams are blank
      if (!homeName && !awayName) return;

      let rawSeason = (r.season_id || r.season || '').trim();
      if (rawSeason) {
        lastKnownSeason = rawSeason;
      } else {
        rawSeason = lastKnownSeason;
      }
      const seasonId = resolveSeasonId(rawSeason);
      const divId = resolveDivisionId(seasonId, r.division_id || r.division, rawSeason);

      // Auto-register any teams from matches not yet explicitly defined in Teams tab
      let resolvedHomeName = findExistingTeamName(seasonId, homeName);
      if (!resolvedHomeName && homeName) {
        resolvedHomeName = homeName;
        teams.push({
          id: `${seasonId}-${homeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          divisionId: divId,
          seasonId,
          name: homeName,
          color: '#059669',
          status: 'active',
        });
        knownTeamSeasonMap.add(`${seasonId}:::${homeName.toLowerCase()}`);
      }

      let resolvedAwayName = findExistingTeamName(seasonId, awayName);
      if (!resolvedAwayName && awayName) {
        resolvedAwayName = awayName;
        teams.push({
          id: `${seasonId}-${awayName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          divisionId: divId,
          seasonId,
          name: awayName,
          color: '#2563EB',
          status: 'active',
        });
        knownTeamSeasonMap.add(`${seasonId}:::${awayName.toLowerCase()}`);
      }

      // Forfeit detection
      let forfeit: 'none' | 'home' | 'away' = 'none';
      const homeForfeit = (r.homeforfeit || r.home_forfeit || '').toLowerCase().trim() === 'true';
      const awayForfeit = (r.awayforfeit || r.away_forfeit || '').toLowerCase().trim() === 'true';
      const forfeitVal = (r.forfeit || r.forfeit_team || '').toLowerCase().trim();
      const statusVal = (r.status || '').toLowerCase().trim();

      if (homeForfeit || forfeitVal.includes('home') || statusVal.includes('forfeit_home')) {
        forfeit = 'home';
      } else if (awayForfeit || forfeitVal.includes('away') || statusVal.includes('forfeit_away')) {
        forfeit = 'away';
      }

      // Scores
      let homeScore: number | null = null;
      let awayScore: number | null = null;
      if (r.home_score !== '' && r.home_score !== '-' && !isNaN(Number(r.home_score))) {
        homeScore = Number(r.home_score);
      }
      if (r.away_score !== '' && r.away_score !== '-' && !isNaN(Number(r.away_score))) {
        awayScore = Number(r.away_score);
      }

      let status: 'final' | 'upcoming' | 'postponed' | 'cancelled' = 'upcoming';
      if (forfeit !== 'none' || (homeScore !== null && awayScore !== null)) {
        status = 'final';
      }
      if (statusVal.includes('postpone')) status = 'postponed';
      if (statusVal.includes('cancel')) status = 'cancelled';

      // Detect Postseason / Playoff matches
      const rawGwStr = (r.gameweek || r.gw || '').toString().trim();
      const rawGwLower = rawGwStr.toLowerCase();
      const rawRoundStr = (r.round || r.round_name || r.stage || r.match_type || '').toString().trim().toLowerCase();
      const rawNotesStr = (r.notes || '').toString().trim().toLowerCase();
      const rawTeamsStr = `${homeName} ${awayName}`.toLowerCase();

      const isPlayoffKeyword = (str: string) =>
        str.includes('playoff') ||
        str.includes('postseason') ||
        str.includes('quarter') ||
        str.includes('qf') ||
        str.includes('semi') ||
        str.includes('sf') ||
        str.includes('championship') ||
        str.includes('final') ||
        /\[\d+\]/.test(str);

      let isPostseason =
        isPlayoffKeyword(rawGwLower) ||
        isPlayoffKeyword(rawRoundStr) ||
        isPlayoffKeyword(rawNotesStr) ||
        isPlayoffKeyword(rawTeamsStr);

      // If gameweek is empty/blank but follows a playoff match in the same season, it belongs to the postseason block
      if (!rawGwStr && previousWasPostseason && previousSeasonId === seasonId) {
        isPostseason = true;
      }

      // Safe numerical gameweek parsing
      let parsedGw = 1;
      const parsedNum = parseInt(rawGwStr, 10);
      if (!isNaN(parsedNum)) {
        parsedGw = parsedNum;
        if (parsedGw > 10) {
          isPostseason = true;
        }
      } else if (isPostseason) {
        parsedGw = 0;
      }

      // Determine round name
      let roundName = '';
      const combinedMeta = `${rawGwLower} ${rawRoundStr} ${rawNotesStr} ${rawTeamsStr}`;
      if (combinedMeta.includes('quarter') || combinedMeta.includes('qf')) {
        roundName = 'Quarterfinal';
      } else if (combinedMeta.includes('semi') || combinedMeta.includes('sf')) {
        roundName = 'Semifinal';
      } else if (combinedMeta.includes('final') || combinedMeta.includes('championship') || combinedMeta.includes('champ')) {
        roundName = 'Championship Final';
      } else if (isPostseason) {
        roundName = 'Playoff';
      }

      previousWasPostseason = isPostseason;
      previousSeasonId = seasonId;

      matches.push({
        id: r.match_id || r.id || `m-${i + 1}`,
        seasonId,
        divisionId: divId,
        gameweek: parsedGw,
        stage: isPostseason ? 'playoff' : 'regular',
        isPostseason,
        roundName: roundName || (parsedGw > 0 ? `GW ${parsedGw}` : 'Playoff'),
        date: r.date || '',
        time: r.time || '',
        homeTeam: resolvedHomeName || homeName,
        awayTeam: resolvedAwayName || awayName,
        homeScore,
        awayScore,
        status,
        forfeit,
        notes: r.notes || '',
      });
    });

    // Second pass: assign QF / SF / Final to postseason matches in 8-team tournament structure
    const seasonDivMap = new Map<string, Match[]>();
    matches.forEach((m) => {
      const key = `${m.seasonId}:::${m.divisionId}`;
      if (!seasonDivMap.has(key)) seasonDivMap.set(key, []);
      seasonDivMap.get(key)!.push(m);
    });

    seasonDivMap.forEach((divMatchList) => {
      const playoffs = divMatchList.filter((m) => m.isPostseason);
      if (playoffs.length > 0) {
        // Standard single elimination bracket: 4 QFs, 2 SFs, 1 Championship Final
        const chunks = Math.ceil(playoffs.length / 7);
        for (let c = 0; c < chunks; c++) {
          const slice = playoffs.slice(c * 7, (c + 1) * 7);
          slice.forEach((m, idx) => {
            if (!m.roundName || m.roundName === 'Playoff') {
              if (idx < 4) m.roundName = 'Quarterfinal';
              else if (idx < 6) m.roundName = 'Semifinal';
              else m.roundName = 'Championship Final';
            }
          });
        }
      }
    });
  }

  // 5. Parse Honors (Combining Honors tab with Seasons tab awards)
  let honors: Honor[] = INITIAL_LEAGUE_DATA.honors;
  const rawHonorRows = tabCSVs['Honors'] ? parseCSV(tabCSVs['Honors']) : [];
  if (rawHonorRows.length > 0) {
    honors = rawHonorRows.map((r, i) => {
      let awardType: 'division_winner' | 'golden_boot' | 'golden_glove' = 'division_winner';
      const rawAward = (r.award_type || r.award || '').toLowerCase();
      if (rawAward.includes('boot') || rawAward.includes('scorer') || rawAward.includes('goal')) {
        awardType = 'golden_boot';
      } else if (rawAward.includes('glove') || rawAward.includes('keeper') || rawAward.includes('gk')) {
        awardType = 'golden_glove';
      }

      return {
        id: r.honor_id || r.id || `h-${i + 1}`,
        seasonId: r.season_id || seasons[0]?.id || 's2026-spring',
        divisionId: r.division_id || divisions[0]?.id || 'div-prem-2026',
        awardType,
        recipient: r.recipient || r.winner_name || r.name || '',
        teamName: r.team_name || r.team || '',
        statDetail: r.stat_detail || r.stats || '',
      };
    });
  }

  // Harvest all awards from the Seasons tab
  rawSeasonRows.forEach((r) => {
    const seasonId = r.season_id;
    if (!seasonId) return;
    const divId = divisions.find((d) => d.seasonId === seasonId)?.id || `${seasonId}-main`;

    if (r.seasonwinner) {
      honors.push({
        id: `hw-${seasonId}`,
        seasonId,
        divisionId: divId,
        awardType: 'division_winner',
        recipient: r.seasonwinner,
        teamName: r.seasonwinner,
        statDetail: 'Season Champion',
      });
    }
    if (r.goldenboot) {
      honors.push({
        id: `hb-${seasonId}`,
        seasonId,
        divisionId: divId,
        awardType: 'golden_boot',
        recipient: r.goldenboot,
        teamName: r.goldenbootteam || '',
        statDetail: r.goldenbootgoalsfor ? `${r.goldenbootgoalsfor} Goals` : 'Top Scorer',
      });
    }
    if (r.goldenglove) {
      honors.push({
        id: `hg-${seasonId}`,
        seasonId,
        divisionId: divId,
        awardType: 'golden_glove',
        recipient: r.goldenglove,
        teamName: r.goldengloveteam || '',
        statDetail: r.goldenglovegoalsagainst
          ? `${r.goldenglovegoalsagainst} Goals Conceded`
          : 'Golden Glove Award',
      });
    }
  });

  // 6. Parse News (Handling rearranged News columns and Blogger cover images)
  let news: NewsStory[] = INITIAL_LEAGUE_DATA.news;
  const rawNewsRows = tabCSVs['News'] ? parseCSV(tabCSVs['News']) : [];
  if (rawNewsRows.length > 0) {
    news = rawNewsRows.map((r, i) => {
      // Find image URL from image_url, summary, or content
      let imageUrl = r.image_url || r.image || '';
      if (!imageUrl && r.summary && /^https?:\/\//i.test(r.summary.trim())) {
        imageUrl = r.summary.trim();
      }
      if (!imageUrl && r.content && /^https?:\/\//i.test(r.content.trim())) {
        imageUrl = r.content.trim();
      }

      // Determine story content and summary
      let textBody = '';
      if (r.content && !/^https?:\/\//i.test(r.content.trim())) {
        textBody = r.content;
      } else if (
        r.pinned &&
        r.pinned.length > 5 &&
        !/^(true|false|yes|no)$/i.test(r.pinned.trim())
      ) {
        textBody = r.pinned;
      } else if (r.summary && !/^https?:\/\//i.test(r.summary.trim())) {
        textBody = r.summary;
      }

      // Determine pinned status
      let isPinned = false;
      if (r.pinned && /^(true|yes)$/i.test(r.pinned.trim())) {
        isPinned = true;
      } else if (r.title && r.title.toLowerCase().includes('1 spot left')) {
        isPinned = true;
      }

      return {
        id: r.news_id || r.id || `n-${i + 1}`,
        title: r.title || `Announcement ${i + 1}`,
        date: r.date || new Date().toLocaleDateString(),
        category: (r.category as any) || 'Announcement',
        summary: textBody.slice(0, 160) + (textBody.length > 160 ? '...' : ''),
        content: textBody,
        pinned: isPinned,
        author: r.author && !r.author.startsWith('#') ? r.author : 'BGFutsal League Office',
        imageUrl: imageUrl || undefined,
      };
    });
  }

  const updatedDatabase: LeagueDatabase = {
    seasons,
    divisions,
    teams,
    matches,
    honors,
    news,
  };

  saveLeagueDataToStorage(updatedDatabase, target);

  return {
    data: updatedDatabase,
    validationIssues: issues,
  };
}

/**
 * Generates sample CSV template text for any Google Sheet tab.
 */
export function generateStarterTemplateCSV(tabName: string): string {
  switch (tabName) {
    case 'Seasons':
      return 'season_id,name,start_date,end_date,is_current,description\ns2026-spring,Spring 2026,Feb 15 2026,May 17 2026,TRUE,Current active 10-week championship\ns2025-fall,Fall 2025,Sep 07 2025,Dec 14 2025,FALSE,Completed fall campaign\n';
    case 'Divisions':
      return 'division_id,season_id,name,tier\ndiv-prem-2026,s2026-spring,Premier Division,1\ndiv-one-2026,s2026-spring,Division 1,2\n';
    case 'Teams':
      return 'team_id,division_id,season_id,name,color,status,status_note,points_adjustment,adjustment_reason\nt-volt,div-prem-2026,s2026-spring,Volt FC,#059669,active,,0,\nt-apex,div-prem-2026,s2026-spring,Apex Ballers,#2563EB,active,,0,\nt-bgcity,div-prem-2026,s2026-spring,BG City Futsal,#DC2626,active,,0,\n';
    case 'Matches':
      return 'match_id,season_id,division_id,gameweek,date,time,home_team,home_score,away_score,away_team,forfeit,notes\nm-101,s2026-spring,div-prem-2026,1,Sun Feb 15,18:00,Volt FC,6,4,Apex Ballers,none,Opening match\n';
    case 'Honors':
      return 'honor_id,season_id,division_id,award_type,recipient,team_name,stat_detail\nh-01,s2025-fall,div-prem-2025,division_winner,BG City Futsal,BG City Futsal,10-1-1 Championship Winner\n';
    case 'News':
      return 'news_id,date,title,category,pinned,author,summary,content,image_url\n001,2025/04/04,2025 Spring Season Champions!,Finals,TRUE,League Office,Champions crowned,Full recap...,https://example.com/champs.jpg\n';
    default:
      return '';
  }
}
