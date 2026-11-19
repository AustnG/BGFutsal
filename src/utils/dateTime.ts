import { Match } from '../types/league';

/**
 * Parses spreadsheet/editorial dates such as "2026/11/11", "2026-02-15",
 * "Sun, Feb 15", or "Feb 15, 2026" safely across browsers into epoch milliseconds.
 */
export function parseFlexibleDateMs(dateStr?: string, fallbackYear?: number | string): number {
  if (!dateStr) return 0;

  let clean = dateStr.trim();
  if (!clean) return 0;

  // Strip weekday prefix e.g. "Sun, "
  clean = clean.replace(/^[A-Za-z]{3,9},\s*/, '');

  // Handle ISO-like slash formats YYYY/MM/DD or MM/DD/YYYY safely
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(clean)) {
    const [y, m, d] = clean.split('/').map((n) => parseInt(n, 10));
    const ts = new Date(y, m - 1, d).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  }

  // Append fallback year if no 4-digit year is present
  if (!/\b\d{4}\b/.test(clean) && fallbackYear) {
    clean = `${clean}, ${fallbackYear}`;
  }

  let ts = Date.parse(clean);
  if (Number.isNaN(ts)) {
    ts = Date.parse(clean.replace(/\//g, '-'));
  }

  return Number.isNaN(ts) ? 0 : ts;
}

/**
 * Standardizes match kickoff time strings into 12-hour AM/PM Central Time (CT) format.
 */
export function formatMatchTimeCT(time?: string): string {
  if (!time || !time.trim()) return 'TBD';
  const trimmed = time.trim();
  if (/^tbd$/i.test(trimmed)) return 'TBD';

  // Strip any existing CT/CST/CDT indicator before normalizing
  const withoutTz = trimmed.replace(/\s*(?:CST|CDT|CT)\s*$/i, '').trim();
  const match = withoutTz.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)?$/i);

  if (match) {
    const rawHours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const rawMeridiem = match[3] ? match[3].replace(/\./g, '').toUpperCase() : null;

    if (!Number.isNaN(rawHours) && !Number.isNaN(minutes) && minutes >= 0 && minutes <= 59) {
      let hour12: number;
      let meridiem: 'AM' | 'PM';

      if (rawMeridiem === 'AM' || rawMeridiem === 'PM') {
        if (rawHours >= 1 && rawHours <= 12) {
          hour12 = rawHours;
          meridiem = rawMeridiem;
        } else if (rawHours === 0) {
          hour12 = 12;
          meridiem = 'AM';
        } else {
          hour12 = rawHours % 12 || 12;
          meridiem = rawHours >= 12 ? 'PM' : 'AM';
        }
      } else if (rawHours >= 0 && rawHours <= 23) {
        meridiem = rawHours >= 12 ? 'PM' : 'AM';
        hour12 = rawHours % 12 || 12;
      } else {
        return trimmed.toUpperCase().includes('CT') ? trimmed : `${trimmed} CT`;
      }

      const mm = String(minutes).padStart(2, '0');
      return `${hour12}:${mm} ${meridiem} CT`;
    }
  }

  return trimmed.toUpperCase().includes('CT') ? trimmed : `${trimmed} CT`;
}

/**
 * Parses match date and kickoff time into a sortable millisecond timestamp.
 */
export function getMatchSortTimestamp(m: Match): number {
  if (!m.date) {
    const base = m.isPostseason ? 9999999999000 : 0;
    return base + (m.gameweek || 0) * 86400000;
  }

  const yearMatch = m.seasonId ? m.seasonId.match(/\d{4}/) : null;
  const fallbackYear = yearMatch ? yearMatch[0] : new Date().getFullYear();

  let timestamp = parseFlexibleDateMs(m.date, fallbackYear);
  if (timestamp === 0) {
    const base = m.isPostseason ? 9999999999000 : 0;
    return base + (m.gameweek || 0) * 86400000;
  }

  if (m.time) {
    const timeMatch = m.time.trim().match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      timestamp += (hours * 3600 + minutes * 60) * 1000;
    }
  }

  if (m.isPostseason) {
    timestamp += 1000;
  }

  return timestamp;
}
