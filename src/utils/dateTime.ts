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
 * Standardizes match kickoff time strings with Central Time (CT) indicator.
 */
export function formatMatchTimeCT(time?: string): string {
  if (!time || !time.trim()) return 'TBD';
  const trimmed = time.trim();
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
