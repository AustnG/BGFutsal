import { INITIAL_LEAGUE_DATA } from '../data/initialLeagueData';
import {
  Division,
  Honor,
  LeagueDatabase,
  Match,
  NewsStory,
  Season,
  StoryCategory,
  STORY_CATEGORIES,
  SyncStatus,
  Team,
} from '../types/league';
import { normalizeTeamKey } from '../utils/calculations';
import { parseFlexibleDateMs } from '../utils/dateTime';

const STORAGE_KEY_DATA = 'bgfutsal_league_data_v1';
const STORAGE_KEY_SHEET_URL = 'bgfutsal_sheet_url_v1';
const STORAGE_KEY_LAST_SYNC = 'bgfutsal_last_sync_v1';
const STORAGE_KEY_DATA_SOURCE = 'bgfutsal_data_source_v1';

const AUTO_TEAM_PALETTE = [
  '#059669',
  '#2563EB',
  '#DC2626',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#BE123C',
  '#4F46E5',
];

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

export function isPublishedGoogleSheet(urlOrId: string): boolean {
  if (!urlOrId) return false;
  return urlOrId.includes('/spreadsheets/d/e/2PACX-') || urlOrId.startsWith('2PACX-');
}

export function extractSpreadsheetId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  if (isPublishedGoogleSheet(trimmed)) {
    const pubMatch = trimmed.match(
      /(https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/[a-zA-Z0-9-_]+(\/pub)?)/i
    );
    if (pubMatch && pubMatch[1]) {
      return pubMatch[1].replace(/\/$/, '').replace(/\/pub$/, '') + '/pub';
    }
    return DEFAULT_PUBLISHED_SHEET_BASE;
  }

  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

function normalizeStoryCategory(raw?: string): StoryCategory {
  if (!raw) return 'Announcement';
  const clean = raw.trim().toLowerCase();
  const exact = STORY_CATEGORIES.find((cat) => cat.toLowerCase() === clean);
  if (exact) return exact;
  if (clean.includes('recap') || clean.includes('match')) return 'Matchday Recap';
  if (clean.includes('reg')) return 'Registration';
  if (clean.includes('feature') || clean.includes('story') || clean.includes('final')) {
    return 'Feature Story';
  }
  return 'Announcement';
}

function parseFiniteNumber(raw: unknown, fallback: number): number {
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

function isValidLeagueDatabase(candidate: unknown): candidate is LeagueDatabase {
  if (!candidate || typeof candidate !== 'object') return false;
  const db = candidate as Partial<LeagueDatabase>;
  return (
    Array.isArray(db.seasons) &&
    Array.isArray(db.divisions) &&
    Array.isArray(db.teams) &&
    Array.isArray(db.matches) &&
    Array.isArray(db.honors) &&
    Array.isArray(db.news) &&
    db.seasons.length > 0 &&
    db.matches.length > 0
  );
}

/**
 * Robust RFC 4180-compliant CSV parser handling multiline quotes, commas, and newlines.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  if (!csvText || !csvText.trim()) return [];

  const rowsOfCells: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c.length > 0)) {
        rowsOfCells.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rowsOfCells.push(currentRow);
    }
  }

  if (rowsOfCells.length < 2) return [];

  const rawHeaders = rowsOfCells[0];
  const headers = rawHeaders.map((h) =>
    h
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  );

  const result: Record<string, string>[] = [];
  for (let i = 1; i < rowsOfCells.length; i++) {
    const values = rowsOfCells[i];
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    result.push(rowObj);
  }

  return result;
}

async function fetchSheetTabCSV(
  sheetTarget: string,
  tabName: string,
  signal?: AbortSignal
): Promise<string> {
  let targetUrl = '';

  if (isPublishedGoogleSheet(sheetTarget)) {
    const isDefaultSheet = sheetTarget.startsWith(DEFAULT_PUBLISHED_SHEET_BASE);
    if (!isDefaultSheet) {
      throw new Error(
        `Published web links (/d/e/2PACX-...) only map to default tab GIDs. Use the standard Google Sheet sharing URL (/spreadsheets/d/<ID>/edit) for custom sheets.`
      );
    }
    const gid = DEFAULT_PUBLISHED_GIDS[tabName] ?? '0';
    const baseUrl = sheetTarget.includes('/pub')
      ? sheetTarget.split('?')[0]
      : DEFAULT_PUBLISHED_SHEET_BASE;
    targetUrl = `${baseUrl}?gid=${gid}&single=true&output=csv`;
  } else {
    targetUrl = `https://docs.google.com/spreadsheets/d/${sheetTarget}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      tabName
    )}`;
  }

  const response = await fetch(targetUrl, { cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch tab "${tabName}" (HTTP ${response.status})`);
  }
  return await response.text();
}

export function loadInitialData(): { data: LeagueDatabase; syncStatus: SyncStatus } {
  try {
    const savedMode = localStorage.getItem(STORAGE_KEY_DATA_SOURCE);
    const savedUrl = localStorage.getItem(STORAGE_KEY_SHEET_URL);
    const lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
    const cachedData = localStorage.getItem(STORAGE_KEY_DATA);

    if (savedMode === 'built-in') {
      return {
        data: INITIAL_LEAGUE_DATA,
        syncStatus: {
          lastSynced: null,
          isSyncing: false,
          error: null,
          sheetUrl: '',
          dataSource: 'built-in',
          validationIssues: [],
        },
      };
    }

    if (cachedData) {
      const parsed: unknown = JSON.parse(cachedData);
      if (isValidLeagueDatabase(parsed)) {
        return {
          data: parsed,
          syncStatus: {
            lastSynced: lastSync,
            isSyncing: false,
            error: null,
            sheetUrl: savedUrl || DEFAULT_PUBLISHED_SHEET_BASE,
            dataSource: savedUrl ? 'google-sheets' : 'built-in',
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
      dataSource: 'built-in',
      validationIssues: [],
    },
  };
}

export function saveLeagueDataToStorage(
  data: LeagueDatabase,
  sheetUrl: string,
  dataSource: 'built-in' | 'google-sheets' = sheetUrl ? 'google-sheets' : 'built-in'
) {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetUrl);
      localStorage.setItem(STORAGE_KEY_DATA_SOURCE, dataSource);
      if (dataSource === 'google-sheets') {
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toLocaleString());
      } else {
        localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
      }
    }
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

export async function syncWithGoogleSheet(
  sheetUrlOrId: string,
  signal?: AbortSignal
): Promise<{
  data: LeagueDatabase;
  validationIssues: string[];
}> {
  const target = extractSpreadsheetId(sheetUrlOrId) || sheetUrlOrId.trim();
  if (!target) {
    throw new Error('Please provide a valid Google Sheet URL or published link.');
  }

  const issues: string[] = [];
  const tabNames = ['Seasons', 'Divisions', 'Teams', 'Matches', 'Honors', 'News'];
  const results = await Promise.allSettled(
    tabNames.map((name) => fetchSheetTabCSV(target, name, signal))
  );

  if (signal?.aborted) {
    throw new DOMException('Sync aborted', 'AbortError');
  }

  const tabCSVs: Record<string, string | null> = {};
  tabNames.forEach((name, idx) => {
    const res = results[idx];
    if (res.status === 'fulfilled') {
      tabCSVs[name] = res.value;
    } else {
      tabCSVs[name] = null;
      issues.push(`Could not fetch tab "${name}".`);
    }
  });

  const anyTabSucceeded = Object.values(tabCSVs).some((v) => v !== null);
  if (!anyTabSucceeded) {
    throw new Error('Unable to reach any Google Sheets tab. Check permissions or network connection.');
  }

  // 1. Parse Seasons
  const rawSeasonRows = tabCSVs['Seasons'] ? parseCSV(tabCSVs['Seasons']) : [];
  let seasons: Season[] =
    tabCSVs['Seasons'] !== null && rawSeasonRows.length > 0
      ? []
      : [...INITIAL_LEAGUE_DATA.seasons];

  if (rawSeasonRows.length > 0) {
    seasons = rawSeasonRows.map((r, i) => {
      const id = r.season_id || r.id || `s-${i + 1}`;
      let name = r.name || r.season_name || '';
      if (!name) {
        name = id.includes(' ') ? id : `Season ${i + 1}`;
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

    if (!seasons.some((s) => s.isCurrent) && seasons.length > 0) {
      const currentCandidate =
        seasons.find((s) => s.id === 's2026-winter' || s.id.includes('2026')) ||
        seasons[seasons.length - 1];
      if (currentCandidate) {
        currentCandidate.isCurrent = true;
      }
    }

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
  const rawDivRows = tabCSVs['Divisions'] ? parseCSV(tabCSVs['Divisions']) : [];
  let divisions: Division[] =
    tabCSVs['Divisions'] !== null ? [] : [...INITIAL_LEAGUE_DATA.divisions];

  if (rawDivRows.length > 0) {
    divisions = rawDivRows.map((r, i) => ({
      id: r.division_id || r.id || `div-${i + 1}`,
      seasonId: r.season_id || seasons[0]?.id || 's2026-winter',
      name: r.name || r.division_name || `Division ${i + 1}`,
      tier: parseFiniteNumber(r.tier || r.tier_level, i + 1),
    }));
  }

  // Synthesize missing division entries for seasons without explicit Division rows
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
  const rawTeamRows = tabCSVs['Teams'] ? parseCSV(tabCSVs['Teams']) : [];
  let teams: Team[] =
    tabCSVs['Teams'] !== null ? [] : [...INITIAL_LEAGUE_DATA.teams];

  if (rawTeamRows.length > 0) {
    teams = [];
    rawTeamRows.forEach((r) => {
      const teamName = (r.name || r.team_id || '').trim();
      if (!teamName) return;

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
        pointsAdjustment: parseFiniteNumber(r.points_adjustment, 0),
        adjustmentReason: r.adjustment_reason || r.points_reason || '',
      });
    });
  }

  const knownTeamSeasonMap = new Set(
    teams.map((t) => `${t.seasonId}:::${normalizeTeamKey(t.name)}`)
  );

  // 4. Parse Matches
  let matches: Match[] = [];
  const rawMatchRows = tabCSVs['Matches'] ? parseCSV(tabCSVs['Matches']) : [];
  if (rawMatchRows.length > 0) {
    const seenMatchIds = new Set<string>();
    let lastKnownSeason = seasons[0]?.id || 's2026-winter';
    let previousWasPostseason = false;
    let previousSeasonId = '';
    let autoColorIndex = 0;

    const findExistingTeamName = (season: string, rawName: string): string | null => {
      const clean = normalizeTeamKey(rawName);
      if (knownTeamSeasonMap.has(`${season}:::${clean}`)) return rawName;
      const simplified = clean
        .split(/[\s_-]+/)
        .map((w) => w.replace(/s$/, ''))
        .join(' ');
      for (const t of teams) {
        if (t.seasonId === season) {
          const tSimp = normalizeTeamKey(t.name)
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
      if (!homeName && !awayName) return;

      let rawSeason = (r.season_id || r.season || '').trim();
      if (rawSeason) {
        lastKnownSeason = rawSeason;
      } else {
        rawSeason = lastKnownSeason;
      }
      const seasonId = resolveSeasonId(rawSeason);
      const divId = resolveDivisionId(seasonId, r.division_id || r.division, rawSeason);

      let resolvedHomeName = findExistingTeamName(seasonId, homeName);
      if (!resolvedHomeName && homeName) {
        resolvedHomeName = homeName;
        const color = AUTO_TEAM_PALETTE[autoColorIndex++ % AUTO_TEAM_PALETTE.length];
        teams.push({
          id: `${seasonId}-${homeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          divisionId: divId,
          seasonId,
          name: homeName,
          color,
          status: 'active',
        });
        knownTeamSeasonMap.add(`${seasonId}:::${normalizeTeamKey(homeName)}`);
      }

      let resolvedAwayName = findExistingTeamName(seasonId, awayName);
      if (!resolvedAwayName && awayName) {
        resolvedAwayName = awayName;
        const color = AUTO_TEAM_PALETTE[autoColorIndex++ % AUTO_TEAM_PALETTE.length];
        teams.push({
          id: `${seasonId}-${awayName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          divisionId: divId,
          seasonId,
          name: awayName,
          color,
          status: 'active',
        });
        knownTeamSeasonMap.add(`${seasonId}:::${normalizeTeamKey(awayName)}`);
      }

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

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      if (r.home_score !== '' && r.home_score !== '-' && !isNaN(Number(r.home_score))) {
        homeScore = Number(r.home_score);
      }
      if (r.away_score !== '' && r.away_score !== '-' && !isNaN(Number(r.away_score))) {
        awayScore = Number(r.away_score);
      }

      let homePk: number | null = null;
      let awayPk: number | null = null;
      const rawHomePk =
        r.home_pk ??
        r.homepk ??
        r.home_pks ??
        r.homepks ??
        r.home_penalty ??
        r.home_penalties ??
        r.pk_home;
      const rawAwayPk =
        r.away_pk ??
        r.awaypk ??
        r.away_pks ??
        r.awaypks ??
        r.away_penalty ??
        r.away_penalties ??
        r.pk_away;

      if (
        rawHomePk !== undefined &&
        rawHomePk !== null &&
        String(rawHomePk).trim() !== '' &&
        !isNaN(Number(rawHomePk))
      ) {
        homePk = Number(rawHomePk);
      }
      if (
        rawAwayPk !== undefined &&
        rawAwayPk !== null &&
        String(rawAwayPk).trim() !== '' &&
        !isNaN(Number(rawAwayPk))
      ) {
        awayPk = Number(rawAwayPk);
      }

      if (homePk === null || awayPk === null) {
        const textToSearch = `${r.notes || ''} ${r.round || ''} ${r.status || ''}`;
        const matchPk1 = textToSearch.match(
          /(?:pk|pks|penalty|penalties|shootout)[:\s]*\(?(\d+)[\s\-–—:]+(\d+)\)?/i
        );
        const matchPk2 = textToSearch.match(/\(?(\d+)[\s\-–—:]+(\d+)\)?\s*(?:pk|pks|penalties|penalty)/i);
        const matchPk = matchPk1 || matchPk2;
        if (matchPk) {
          homePk = parseInt(matchPk[1], 10);
          awayPk = parseInt(matchPk[2], 10);
        }
      }

      let status: 'final' | 'upcoming' | 'postponed' | 'cancelled' = 'upcoming';
      if (forfeit !== 'none' || (homeScore !== null && awayScore !== null)) {
        status = 'final';
      }
      if (statusVal.includes('postpone')) status = 'postponed';
      if (statusVal.includes('cancel')) status = 'cancelled';

      const rawGwStr = (r.gameweek || r.gw || '').toString().trim();
      const rawGwLower = rawGwStr.toLowerCase();
      const rawRoundStr = (r.round || r.round_name || r.stage || r.match_type || '')
        .toString()
        .trim()
        .toLowerCase();
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

      if (!rawGwStr && previousWasPostseason && previousSeasonId === seasonId) {
        isPostseason = true;
      }

      let parsedGw = 1;
      const parsedNum = parseInt(rawGwStr, 10);
      if (!isNaN(parsedNum)) {
        parsedGw = parsedNum;
        if (parsedGw > 10 && !rawRoundStr.includes('regular')) {
          isPostseason = true;
        }
      } else if (isPostseason) {
        parsedGw = 0;
      }

      let roundName = '';
      const combinedMeta = `${rawGwLower} ${rawRoundStr} ${rawNotesStr} ${rawTeamsStr}`;
      if (combinedMeta.includes('quarter') || combinedMeta.includes('qf')) {
        roundName = 'Quarterfinal';
      } else if (combinedMeta.includes('semi') || combinedMeta.includes('sf')) {
        roundName = 'Semifinal';
      } else if (
        combinedMeta.includes('final') ||
        combinedMeta.includes('championship') ||
        combinedMeta.includes('champ')
      ) {
        roundName = 'Championship Final';
      } else if (isPostseason) {
        roundName = 'Playoff';
      }

      previousWasPostseason = isPostseason;
      previousSeasonId = seasonId;

      let matchId = (r.match_id || r.id || '').trim();
      if (!matchId) {
        matchId = `m-${i + 1}`;
      }
      if (seenMatchIds.has(matchId)) {
        matchId = `${matchId}_${i + 1}`;
      }
      seenMatchIds.add(matchId);

      matches.push({
        id: matchId,
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
        homePk,
        awayPk,
        status,
        forfeit,
        notes: r.notes || '',
      });
    });

    const seasonDivMap = new Map<string, Match[]>();
    matches.forEach((m) => {
      const key = `${m.seasonId}:::${m.divisionId}`;
      if (!seasonDivMap.has(key)) seasonDivMap.set(key, []);
      seasonDivMap.get(key)!.push(m);
    });

    seasonDivMap.forEach((divMatchList) => {
      const playoffs = divMatchList.filter((m) => m.isPostseason);
      if (playoffs.length > 0) {
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
  } else if (tabCSVs['Matches'] === null) {
    matches = [...INITIAL_LEAGUE_DATA.matches];
  }

  // 5. Parse Honors (avoid leaking demo honors when live Honors tab is fetched/empty)
  const rawHonorRows = tabCSVs['Honors'] ? parseCSV(tabCSVs['Honors']) : [];
  let honors: Honor[] =
    tabCSVs['Honors'] !== null || rawSeasonRows.length > 0 ? [] : [...INITIAL_LEAGUE_DATA.honors];

  if (rawHonorRows.length > 0) {
    honors = rawHonorRows.map((r, i) => {
      let awardType: 'division_winner' | 'golden_boot' | 'golden_glove' = 'division_winner';
      const rawAward = (r.award_type || r.award || '').toLowerCase();
      if (rawAward.includes('boot') || rawAward.includes('scorer') || rawAward.includes('goal')) {
        awardType = 'golden_boot';
      } else if (
        rawAward.includes('glove') ||
        rawAward.includes('keeper') ||
        rawAward.includes('gk')
      ) {
        awardType = 'golden_glove';
      }

      const seasonId = resolveSeasonId(r.season_id || r.season);
      const divisionId = resolveDivisionId(seasonId, r.division_id || r.division, r.season_id);

      return {
        id: r.honor_id || r.id || `h-${i + 1}`,
        seasonId,
        divisionId,
        awardType,
        recipient: r.recipient || r.winner_name || r.name || '',
        teamName: r.team_name || r.team || '',
        statDetail: r.stat_detail || r.stats || '',
      };
    });
  }

  rawSeasonRows.forEach((r) => {
    const rawSeasonId = r.season_id;
    if (!rawSeasonId) return;
    const seasonId = resolveSeasonId(rawSeasonId);
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

  // 6. Parse News
  const rawNewsRows = tabCSVs['News'] ? parseCSV(tabCSVs['News']) : [];
  let news: NewsStory[] =
    tabCSVs['News'] !== null && rawNewsRows.length > 0 ? [] : [...INITIAL_LEAGUE_DATA.news];

  if (rawNewsRows.length > 0) {
    const parsedStories = rawNewsRows.map((r, i) => {
      let imageUrl = (r.image_url || r.image || '').trim();
      if (/^(none|n\/a|na|null|-|—)$/i.test(imageUrl)) {
        imageUrl = '';
      }
      if (!imageUrl && r.summary && /^https?:\/\//i.test(r.summary.trim())) {
        imageUrl = r.summary.trim();
      }
      if (!imageUrl && r.content && /^https?:\/\//i.test(r.content.trim())) {
        imageUrl = r.content.trim();
      }

      let rawContent = (r.content || '').trim();
      let rawSummary = (r.summary || '').trim();

      if (/^https?:\/\//i.test(rawContent)) rawContent = '';
      if (/^https?:\/\//i.test(rawSummary)) rawSummary = '';

      let content = rawContent;
      let summary = rawSummary;

      if (!summary && content) {
        const firstLine = content.split('\n').map((l) => l.trim()).filter(Boolean)[0] || '';
        summary = firstLine.length > 160 ? firstLine.slice(0, 157) + '...' : firstLine;
      } else if (summary && !content) {
        content = summary;
      } else if (!summary && !content) {
        summary = 'Click to read full league announcement.';
        content = 'No additional details provided.';
      }

      const isPinned = Boolean(r.pinned && /^(true|yes|1)$/i.test(r.pinned.trim()));

      return {
        id: r.news_id || r.id || `n-${i + 1}`,
        title: r.title || `Announcement ${i + 1}`,
        date: r.date || '',
        category: normalizeStoryCategory(r.category),
        summary,
        content,
        pinned: isPinned,
        author: r.author && !r.author.startsWith('#') ? r.author : 'BGFutsal League Office',
        imageUrl: imageUrl || undefined,
        sheetRowIndex: i,
      };
    });

    news = parsedStories
      .sort((a, b) => {
        const timeA = parseFlexibleDateMs(a.date);
        const timeB = parseFlexibleDateMs(b.date);
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return b.sheetRowIndex - a.sheetRowIndex;
      })
      .map(({ sheetRowIndex: _rowIdx, ...story }) => story);
  }

  const finalMatches: Match[] = [];
  const seenFinalMatchIds = new Set<string>();
  matches.forEach((m, idx) => {
    let safeId = m.id || `m-${idx + 1}`;
    if (seenFinalMatchIds.has(safeId)) {
      safeId = `${safeId}_${idx + 1}`;
    }
    seenFinalMatchIds.add(safeId);
    finalMatches.push({
      ...m,
      id: safeId,
    });
  });

  const updatedDatabase: LeagueDatabase = {
    seasons,
    divisions,
    teams,
    matches: finalMatches,
    honors,
    news,
  };

  saveLeagueDataToStorage(updatedDatabase, target, 'google-sheets');

  return {
    data: updatedDatabase,
    validationIssues: issues,
  };
}

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
      return 'news_id,date,title,category,pinned,author,summary,content,image_url\n001,2025/04/04,2025 Spring Season Champions!,Feature Story,TRUE,League Office,Champions crowned,Full recap...,https://example.com/champs.jpg\n';
    default:
      return '';
  }
}
