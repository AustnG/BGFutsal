

import React from 'react';

export enum Division {
  A = "A",
  B = "B",
  Unknown = "Unknown"
}

export interface SheetSeason {
  'SeasonId': string;
  'StartDate': string;
  'EndDate': string;
  'SeasonWinner'?: string; // Champion for this specific season-division
  'GoldenBoot'?: string; // Player name
  'GoldenBootGoalsFor'?: string; // Number of goals
  'GoldenBootTeam'?: string; // Player's team
  'GoldenGlove'?: string; // Player name
  'GoldenGloveGoalsAgainst'?: string; // Goals against or relevant stat
  'GoldenGloveTeam'?: string; // Player's team
  'SeasonWinnerImg'?: string; // URL for season winner team photo
  'GoldenBootImg'?: string; // URL for Golden Boot winner photo
  'GoldenGloveImg'?: string; // URL for Golden Glove winner photo
}

export interface ProcessedSeason {
  id: string; // Typically 'Season Name'
  name: string;
  startDate?: Date;
  endDate?: Date;
  seasonWinner?: string;
  goldenBootPlayer?: string;
  goldenBootGoals?: number;
  goldenBootTeam?: string;
  goldenGlovePlayer?: string;
  goldenGloveGoalsAgainst?: number;
  goldenGloveTeam?: string;
  seasonWinnerImg?: string;
  goldenBootImg?: string;
  goldenGloveImg?: string;
}

// Updated type for 'Teams' sheet when it contains pre-calculated stats
// Now uses a single 'Season' field (e.g., "2024 Spring A")
export interface SheetTeamWithStats {
  'Team': string;
  'Season': string; // Combined field like "2024 Spring A"
  'GP': string; // Games Played
  'W': string;  // Wins
  'D': string;  // Draws
  'L': string;  // Losses
  'GF': string; // Goals For
  'GA': string; // Goals Against
  'GD': string; // Goal Difference
  'PTS': string; // Points - Updated to all caps
  'RankChange'?: string; // New field for rank change
  '2WeekResult'?: string; // Updated field
  'LastWeekResult'?: string; // Updated field
  'CurrentWeekResult'?: string; // Updated field
  'Division'?: string; // Optional: If sheet *also* has a separate division column.
  'TeamColor'?: string; // Hex value for team color
  'Dropped'?: string; // Indicates if a team has dropped from the league
  'Notes'?: string; // Additional notes
}

// This interface defines the structure of a row in the standings table.
// It will be populated directly from the processed SheetTeamWithStats.
export interface StandingRow {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  division: Division; // Division of the team for this specific standing entry
  rankChange?: string;
  twoWeekResult?: string;
  lastWeekResult?: string;
  currentWeekResult?: string;
  teamColor?: string;
  dropped?: boolean; // New field for dropped status
}

// This is the processed data structure holding all stats for a team in a specific season/year/division.
// It aligns with StandingRow and includes year/seasonName for filtering.
export interface TeamStatsData extends StandingRow {
  year: string;         // Year for these stats
  seasonName: string;   // General season name (e.g., "Spring") for these stats
}


export interface SheetGame {
  'GameDate': string; // Updated from 'Date'
  'GameTime'?: string; // Updated from 'Time', Optional
  'Division': string; // This might be redundant if Season Name contains A/B
  'HomeTeam': string; // Updated from 'Home Team'
  'HomeScore': string; // Updated from 'Home Score'
  'AwayTeam': string; // Updated from 'Away Team'
  'AwayScore': string; // Updated from 'Away Score'
  'Season': string; // Name of the season, e.g., "Winter 2024" or "2025 Spring A"
  'Location'?: string; // Optional
  'GameType': string; // New field (e.g., Regular, Quarter Finals, Semi Finals, Finals)
  'GameWeek': string; // New field
  'HomePKs'?: string; // New field for Home Penalty Kicks score
  'AwayPKs'?: string; // New field for Away Penalty Kicks score
  'HomeForfeit'?: string; // New field
  'AwayForfeit'?: string; // New field
}

export interface ProcessedGame {
  id: string; // auto-generated or combination
  date: Date;
  time?: string;
  division: Division; // Derived from seasonName or explicit 'Division' column
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  seasonName: string; // Key for filtering, e.g., "2025 Spring A"
  location?: string;
  gameType: string; 
  // FIX: Made gameWeek optional to match data processing logic which can result in `undefined`.
  gameWeek?: number | string; // Can be number for regular season, or string like 'Finals'
  homePKs?: number; // Parsed Home Penalty Kicks score
  awayPKs?: number; // Parsed Away Penalty Kicks score
  homeForfeit: boolean;
  awayForfeit: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  tier?: 'Gold' | 'Silver' | 'Bronze';
}

export interface NavItem {
  name: string;
  path: string;
  icon?: React.ElementType;
}

export interface NavDropdownItem {
  name: string;
  items: NavItem[];
  icon?: React.ElementType;
}

export interface SheetSettings {
  'Year': string;
  'Season': string; // General season name like "Winter", "Spring"
  'Division': string; // A, B (Note: Division dropdown population is hardcoded A/B, this column in settings isn't directly used for that but good for reference)
}

export interface SheetNewsItem {
  'Id': string;
  'Date': string;
  'Title': string;
  'Category'?: string;
  'Content': string;
  'Link'?: string;
  'ImageUrl'?: string;
}

export interface ProcessedNewsItem {
  id: string;
  date: Date;
  title: string;
  category?: string;
  content: string;
  link?: string;
  imageUrl?: string;
}