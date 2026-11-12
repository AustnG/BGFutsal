import { MainNavTab } from '../components/Navbar';

export const TAB_TO_HASH: Record<MainNavTab, string> = {
  home: '#/home',
  seasonHub: '#/seasons',
  newsGallery: '#/news-gallery',
  about: '#/about',
  rules: '#/rules',
};

export const HASH_TO_TAB: Record<string, MainNavTab> = {
  '#/home': 'home',
  '#/': 'home',
  '#': 'home',
  '': 'home',
  '#/seasons': 'seasonHub',
  '#/season': 'seasonHub',
  '#/news-gallery': 'newsGallery',
  '#/news': 'newsGallery',
  '#/gallery': 'newsGallery',
  '#/photos': 'newsGallery',
  '#/media': 'newsGallery',
  '#/about': 'about',
  '#/rules': 'rules',
  '#/rules-faqs': 'rules',
  '#/faq': 'rules',
  '#/faqs': 'rules',
};

/**
 * Extracts and sanitizes the MainNavTab from the current window.location.hash.
 */
export function getTabFromHash(rawHash?: string): MainNavTab {
  const hashString = (
    rawHash !== undefined
      ? rawHash
      : typeof window !== 'undefined'
      ? window.location.hash
      : ''
  )
    .trim()
    .toLowerCase();

  const cleanPath = hashString.split('?')[0].replace(/\/+$/, '');

  if (HASH_TO_TAB[cleanPath]) {
    return HASH_TO_TAB[cleanPath];
  }

  // Graceful loose substring matching for edge cases
  if (
    cleanPath.includes('news') ||
    cleanPath.includes('gallery') ||
    cleanPath.includes('photo') ||
    cleanPath.includes('media')
  ) {
    return 'newsGallery';
  }
  if (cleanPath.includes('season')) return 'seasonHub';
  if (cleanPath.includes('about')) return 'about';
  if (cleanPath.includes('rule') || cleanPath.includes('faq')) return 'rules';
  if (cleanPath.includes('home')) return 'home';

  return 'home';
}

/**
 * Safely updates window.location.hash to match a given tab without reloading the page.
 */
export function setHashForTab(tab: MainNavTab) {
  if (typeof window === 'undefined') return;

  const targetHash = TAB_TO_HASH[tab] || '#/home';
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}
