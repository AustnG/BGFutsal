

export const LEAGUE_NAME = "Bowling Green Futsal";
export const SHORT_LEAGUE_NAME = "BG Futsal";

// Google Sheets CSV Export URLs
export const GOOGLE_SHEET_ID = "1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E";

// Base URL for direct CSV export from the specific published sheet
const BASE_SHEET_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTsCEKgTCuWzARJo4Qep3Cxxpzhz_hhnK6VNTmM7IkR2eukXjlufkkF_Np7lPofOl_Q6oIZCVXmY2if/pub?single=true&output=csv`;

export const GAMES_SHEET_URL = `${BASE_SHEET_URL}&gid=0`; // Assuming 'Games' is the first sheet (gid=0)
export const TEAMS_SHEET_URL = `${BASE_SHEET_URL}&gid=898919565`; 
export const SEASONS_SHEET_URL = `${BASE_SHEET_URL}&gid=1017102117`;
export const SETTINGS_SHEET_URL = `${BASE_SHEET_URL}&gid=1375669596`;
export const NEWS_SHEET_URL = `${BASE_SHEET_URL}&gid=298781161`; // New Sheet for News/Announcements


export const MOCK_STAFF_DATA = [
  { id: '1', name: 'Jane Doe', role: 'League Manager', imageUrl: 'https://picsum.photos/seed/staff1/100/100', bio: 'Oversees all league operations and development.' },
  { id: '2', name: 'John Smith', role: 'Head Referee', imageUrl: 'https://picsum.photos/seed/staff2/100/100', bio: 'Manages referee scheduling and training.' },
  { id: '3', name: 'Alice Brown', role: 'Communications Lead', imageUrl: 'https://picsum.photos/seed/staff3/100/100', bio: 'Handles social media and announcements.' },
];

export const MOCK_SPONSOR_DATA = [
  { id: '1', name: 'Local Sports Shop', logoUrl: 'https://picsum.photos/seed/sponsor1/200/100', websiteUrl: '#', tier: 'Gold' as const },
  { id: '2', name: 'Greenfield Cafe', logoUrl: 'https://picsum.photos/seed/sponsor2/200/100', websiteUrl: '#', tier: 'Silver' as const },
  { id: '3', name: 'BG Print Services', logoUrl: 'https://picsum.photos/seed/sponsor3/200/100', websiteUrl: '#', tier: 'Bronze' as const },
];

// DEFAULT_NEWS_ANNOUNCEMENTS is removed as news will be fetched dynamically.

export const UPCOMING_GAMES_PLACEHOLDER_COUNT = 3;
export const MAX_NEWS_ITEMS_HOMEPAGE = 4; // Max news items to show on homepage
