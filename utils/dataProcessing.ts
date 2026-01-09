
import { SheetGame, ProcessedGame, Division, SheetTeamWithStats, TeamStatsData, SheetNewsItem, ProcessedNewsItem } from '../types';

export const TEAM_SEASON_REGEX = /^(\d{4})\s+(.+?)\s+([AB])$/i;

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
    if (colDiv === 'A') return Division.A;
    if (colDiv === 'B') return Division.B;
    
    if (seasonName && /\s+[AB]$/i.test(seasonName)) {
        const match = seasonName.match(/\s+([AB])$/i);
        if (match) division = match[1] === 'A' ? Division.A : Division.B;
    }
    return division;
};

export const normalizeSeasonName = (seasonNameRaw?: string, division?: Division): string => {
    const raw = seasonNameRaw?.trim() || "";
    if (/\s+[AB]$/i.test(raw)) return raw; // Already has division
    if (division !== Division.Unknown) return `${raw} ${division}`;
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
        let divisionPart = Division.Unknown;

        const match = combinedSeasonStr.match(TEAM_SEASON_REGEX);
        if (match) {
            year = match[1];
            seasonNamePart = match[2].trim();
            const divisionLetter = match[3].toUpperCase();
            divisionPart = divisionLetter === 'A' ? Division.A : divisionLetter === 'B' ? Division.B : Division.Unknown;
        } else {
             const rawDivisionCol = getString(rawTeam.Division)?.toUpperCase();
             if (rawDivisionCol === 'A') divisionPart = Division.A;
             else if (rawDivisionCol === 'B') divisionPart = Division.B;
             
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
