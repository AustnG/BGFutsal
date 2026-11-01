export type TeamStatus = 'active' | 'withdrawn' | 'joined_midseason';
export type MatchStatus = 'final' | 'upcoming' | 'postponed' | 'cancelled';
export type ForfeitType = 'none' | 'home' | 'away';
export type AwardType = 'division_winner' | 'golden_boot' | 'golden_glove';
export type StoryCategory = 'Announcement' | 'Matchday Recap' | 'Registration' | 'Feature Story';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'active' | 'completed' | 'upcoming';
  description?: string;
}

export interface Division {
  id: string;
  seasonId: string;
  name: string;
  tier: number;
}

export interface Team {
  id: string;
  divisionId: string;
  seasonId: string;
  name: string;
  color: string; // Hex code for team jersey color
  status: TeamStatus;
  statusNote?: string;
  pointsAdjustment?: number;
  adjustmentReason?: string;
}

export interface Match {
  id: string;
  seasonId: string;
  divisionId: string;
  gameweek: number;
  stage?: 'regular' | 'playoff';
  isPostseason?: boolean;
  roundName?: string; // e.g. "Quarterfinal", "Semifinal", "Championship Final", "Playoff", or "GW 1"
  date: string; // e.g. "2026-02-15" or "Sun, Feb 15"
  time: string; // e.g. "18:30" or "6:30 PM"
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: MatchStatus;
  forfeit?: ForfeitType; // if 'home', away wins 2-0; if 'away', home wins 2-0
  notes?: string;
}

export interface Honor {
  id: string;
  seasonId: string;
  divisionId: string;
  awardType: AwardType;
  recipient: string;
  teamName: string;
  statDetail: string;
}

export interface NewsStory {
  id: string;
  title: string;
  date: string;
  category: StoryCategory;
  summary: string;
  content: string;
  pinned: boolean;
  author: string;
  imageUrl?: string;
}

export interface StandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  color: string;
  divisionId: string;
  status: TeamStatus;
  statusNote?: string;
  pointsAdjustment: number;
  adjustmentReason?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  isPlayoffQualified: boolean; // Top 8 in division
}

export interface PlayoffMatch {
  id: string;
  round: 'Quarterfinal' | 'Semifinal' | 'Championship';
  matchNumber: number;
  seedA: number;
  seedB: number;
  teamA?: StandingRow;
  teamB?: StandingRow;
  teamAName?: string;
  teamBName?: string;
  scoreA?: number | null;
  scoreB?: number | null;
  status?: MatchStatus;
  winner?: StandingRow;
  winnerName?: string;
  time?: string;
  date?: string;
}

export interface LeagueDatabase {
  seasons: Season[];
  divisions: Division[];
  teams: Team[];
  matches: Match[];
  honors: Honor[];
  news: NewsStory[];
}

export interface SyncStatus {
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
  sheetUrl: string;
  dataSource: 'built-in' | 'google-sheets';
  validationIssues: string[];
}
