import React from 'react';
import { ArrowUp } from 'lucide-react';
import { MainNavTab } from './Navbar';
import { TAB_TO_HASH } from '../utils/routing';

interface FooterProps {
  activeTab: MainNavTab;
  onNavigateTab: (tab: MainNavTab) => void;
  onNavigateToSection?: (sectionId: 'standings' | 'schedule' | 'rankChart' | 'playoffs') => void;
  openSyncModal?: () => void;
  lastSynced?: string | null;
  dataSource?: 'built-in' | 'google-sheets';
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tab: MainNavTab) => {
    onNavigateTab(tab);
    scrollToTop();
  };

  return (
    <footer className="border-t border-slate-800 bg-[#071222] text-slate-400 mt-14 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          {/* Brand Wordmark & Location */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <a
              href={TAB_TO_HASH.home}
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className="group cursor-pointer flex items-baseline gap-2"
              aria-label="BGFutsal Home"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                BGFutsal
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                League
              </span>
            </a>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-xs text-slate-400">
              Bowling Green, Kentucky
            </span>
          </div>

          {/* Simple Clean Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
            <a
              href={TAB_TO_HASH.home}
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className={`hover:text-white transition-colors ${
                activeTab === 'home' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              Home
            </a>
            <a
              href={TAB_TO_HASH.seasonHub}
              onClick={(e) => {
                e.preventDefault();
                handleNav('seasonHub');
              }}
              className={`hover:text-white transition-colors ${
                activeTab === 'seasonHub' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              Seasons
            </a>
            <a
              href={TAB_TO_HASH.about}
              onClick={(e) => {
                e.preventDefault();
                handleNav('about');
              }}
              className={`hover:text-white transition-colors ${
                activeTab === 'about' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              About
            </a>
            <a
              href={TAB_TO_HASH.rules}
              onClick={(e) => {
                e.preventDefault();
                handleNav('rules');
              }}
              className={`hover:text-white transition-colors ${
                activeTab === 'rules' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              Rules & FAQs
            </a>
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BGFutsal League. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
            title="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
