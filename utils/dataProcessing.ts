
import { SheetGame, ProcessedGame, Division, SheetTeamWithStats, TeamStatsData, SheetNewsItem, ProcessedNewsItem, SheetSeason, ProcessedSeason } from '../types';

export const TEAM_SEASON_REGEX = /^(\d{4})\s+(.+?)\s+([A-Z0-9]{1,2})$/i;

export const formatTo12HourTime = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined;
  // If already contains AM/PM, assume it's pre-formatted
  if (timeStr.match(/am|pm/i)) return timeStr;

  const parts = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return timeStr;
  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
  return `${hours}:${minutesStr} ${ampm}`;
};

export const determineDivision = (divisionCol?: string, seasonName?: string): Division => {
    let division = Division.Unknown;
    const colDiv = divisionCol?.trim().toUpperCase();
    if (colDiv) return colDiv;
    
    if (seasonName) {
        const match = seasonName.match(/\s+([A-Z0-9]{1,2})$/i);
        if (match) return match[1].toUpperCase();
    }
    return division;
};

export const normalizeSeasonName = (seasonNameRaw?: string, division?: Division): string => {
    const raw = seasonNameRaw?.trim() || "";
    if (division && division !== Division.Unknown) {
        // Check if raw ends with division (case insensitive)
        const regex = new RegExp(`\\s+${division}$`, 'i');
        if (regex.test(raw)) return raw;
        return `${raw} ${division}`;
    }
    return raw;
};

export const processGames = (rawGames: SheetGame[]): ProcessedGame[] => {
    return rawGames.map((g, index) => {
        const gameDateStr = g.GameDate?.trim();
        if (!gameDateStr) return null;
        const gameDate = new Date(gameDateStr);
        if (isNaN(gameDate.getTime())) return null;

        const division = determineDivision(g.Division, g.Season);
        const seasonName = normalizeSeasonName(g.Season, division);

        const homePKs = g.HomePKs?.trim();
        const awayPKs = g.AwayPKs?.trim();
        const homeForfeit = g.HomeForfeit?.trim().toUpperCase() === 'TRUE';
        const awayForfeit = g.AwayForfeit?.trim().toUpperCase() === 'TRUE';
        
        const rawTime = g.GameTime?.trim();
        const formattedTime = formatTo12HourTime(rawTime);

        // Add time to gameDate for sorting purposes
        if (rawTime) {
             let hours = -1;
             let minutes = -1;

             // Try 24h format HH:MM
             const parts24 = rawTime.match(/^(\d{1,2}):(\d{2})$/);
             if (parts24) {
                 hours = parseInt(parts24[1], 10);
                 minutes = parseInt(parts24[2], 10);
             } else {
                 // Try 12h format HH:MM AM/PM
                 const parts12 = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                 if (parts12) {
                     hours = parseInt(parts12[1], 10);
                     minutes = parseInt(parts12[2], 10);
                     const meridian = parts12[3].toUpperCase();
                     if (hours === 12 && meridian === 'AM') hours = 0;
                     if (hours !== 12 && meridian === 'PM') hours += 12;
                 }
             }

             if (hours >= 0 && minutes >= 0) {
                 gameDate.setHours(hours);
                 gameDate.setMinutes(minutes);
             }
        }

        return {
            id: `game-${index}-${g.GameDate}-${g.HomeTeam}`,
            date: gameDate,
            time: formattedTime, 
            division,
            homeTeam: g.HomeTeam?.trim() || "Unknown Home",
            homeScore: parseInt(g.HomeScore, 10),
            awayTeam: g.AwayTeam?.trim() || "Unknown Away",
            awayScore: parseInt(g.AwayScore, 10),
            seasonName,
            location: g.Location?.trim(),
            gameType: g.GameType?.trim() || 'Regular',
            gameWeek: g.GameWeek ? (isNaN(parseInt(g.GameWeek.trim(), 10)) ? g.GameWeek.trim() : parseInt(g.GameWeek.trim(), 10)) : undefined,
            homePKs: homePKs !== undefined && homePKs !== '' ? parseInt(homePKs, 10) : undefined,
            awayPKs: awayPKs !== undefined && awayPKs !== '' ? parseInt(awayPKs, 10) : undefined,
            homeForfeit,
            awayForfeit,
        };
    }).filter(Boolean as unknown as (value: ProcessedGame | null) => value is ProcessedGame);
};

export const processTeams = (rawTeams: SheetTeamWithStats[]): TeamStatsData[] => {
    const parseStat = (val: any): number => {
        const strVal = (typeof val === 'string') ? val.trim() : String(val);
        const num = parseInt(strVal, 10);
        return isNaN(num) ? 0 : num;
    };
    const getString = (val: any): string | undefined => (val && typeof val === 'string') ? val.trim() : undefined;

    return rawTeams.map(rawTeam => {
        const teamName = getString(rawTeam.Team) || "";
        const combinedSeasonStr = getString(rawTeam.Season) || "";
        let year = "";
        let seasonNamePart = "";
        let divisionPart: Division = Division.Unknown;

        const match = combinedSeasonStr.match(TEAM_SEASON_REGEX);
        if (match) {
            year = match[1];
            seasonNamePart = match[2].trim();
            divisionPart = match[3].toUpperCase();
        } else {
             const rawDivisionCol = getString(rawTeam.Division)?.toUpperCase();
             if (rawDivisionCol) divisionPart = rawDivisionCol;
             
             const yearSeasonMatch = combinedSeasonStr.match(/^(\d{4})\s+(.+)$/);
             if (yearSeasonMatch) {
                 year = yearSeasonMatch[1];
                 seasonNamePart = yearSeasonMatch[2].trim();
             } else {
                 seasonNamePart = combinedSeasonStr;
             }
        }

        return {
            teamName,
            division: divisionPart,
            year,
            seasonName: seasonNamePart,
            played: parseStat(rawTeam.GP),
            wins: parseStat(rawTeam.W),
            draws: parseStat(rawTeam.D),
            losses: parseStat(rawTeam.L),
            goalsFor: parseStat(rawTeam.GF),
            goalsAgainst: parseStat(rawTeam.GA),
            goalDifference: parseStat(rawTeam.GD),
            points: parseStat(rawTeam.PTS),
            rankChange: getString(rawTeam.RankChange),
            twoWeekResult: getString(rawTeam['2WeekResult']),
            lastWeekResult: getString(rawTeam['LastWeekResult']),
            currentWeekResult: getString(rawTeam['CurrentWeekResult']),
            teamColor: getString(rawTeam.TeamColor),
            dropped: rawTeam.Dropped?.trim().toUpperCase() === 'TRUE',
        };
    }).filter(team => team.division !== Division.Unknown && team.year && team.seasonName && team.teamName);
};

export const processSeasons = (rawSeasons: SheetSeason[]): ProcessedSeason[] => {
    return rawSeasons.map(s => {
        const seasonId = s.SeasonId?.trim();
        if (!seasonId) return null;

        let division: Division = Division.Unknown;
        let year = "";
        let seasonName = "";
        
        // Try to get division from explicit column first
        if (s.Division) {
             division = s.Division.trim().toUpperCase();
        }

        // Parse SeasonId for Year and Season Name (and Division if not found yet)
        // Expected format: "YYYY SeasonName [Division]"
        // e.g. "2024 Spring A" or "2024 Spring"
        
        const match = seasonId.match(/^(\d{4})\s+(.+)$/);
        if (match) {
            year = match[1];
            let rest = match[2].trim();
            
            // Check if rest ends with division
            const divMatch = rest.match(/\s+([A-Z0-9]{1,2})$/i);
            if (divMatch) {
                if (division === Division.Unknown) {
                    division = divMatch[1].toUpperCase();
                }
                // Remove division from rest to get pure season name
                rest = rest.replace(/\s+[A-Z0-9]{1,2}$/i, "").trim();
            }
            seasonName = rest;
        } else {
            // Fallback if regex doesn't match (e.g. just "Spring 2024" or something else)
            // But we really expect "YYYY ..."
            seasonName = seasonId;
        }

        return {
            id: seasonId,
            name: normalizeSeasonName(seasonId, division),
            year,
            seasonName,
            division,
            startDate: s.StartDate?.trim() ? new Date(s.StartDate.trim()) : undefined,
            endDate: s.EndDate?.trim() ? new Date(s.EndDate.trim()) : undefined,
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
        };
    }).filter(Boolean as unknown as (value: ProcessedSeason | null) => value is ProcessedSeason);
};

export const processNews = (rawNews: SheetNewsItem[]): ProcessedNewsItem[] => {
     return rawNews
      .map(item => {
        const date = new Date(item.Date?.trim());
        if (!item.Id?.trim() || !item.Title?.trim() || !item.Content?.trim() || isNaN(date.getTime())) {
          return null;
        }
        return {
          id: item.Id.trim(),
          date: date,
          title: item.Title.trim(),
          category: item.Category?.trim() || undefined,
          content: item.Content.trim(),
          link: item.Link?.trim() || undefined,
          imageUrl: item.ImageUrl?.trim() || undefined,
        };
      })
      .filter(Boolean as unknown as (value: ProcessedNewsItem | null) => value is ProcessedNewsItem)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
}
