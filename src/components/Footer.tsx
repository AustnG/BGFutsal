import React from 'react';
import { ArrowUp, MapPin } from 'lucide-react';
import { MainNavTab } from './Navbar';
import { TAB_TO_HASH } from '../utils/routing';

interface FooterProps {
  activeTab: MainNavTab;
  onNavigateTab: (tab: MainNavTab) => void;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Main 3-Column Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-10 border-b border-slate-800/80">
          
          {/* Column 1: Brand & League Identity (5 cols) */}
          <div className="md:col-span-5 space-y-3 text-center md:text-left">
            <a
              href={TAB_TO_HASH.home}
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className="inline-flex items-baseline gap-2 group cursor-pointer"
              aria-label="BGFutsal Home"
            >
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                BGFutsal
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                League
              </span>
            </a>

            <p className="text-sm font-semibold text-slate-200">
              Bowling Green's Premier Indoor Soccer League
            </p>

            <p className="text-xs text-slate-400">
              Hosted by <span className="text-slate-200 font-medium">Bowling Green Parks & Rec</span>
            </p>
          </div>

          {/* Column 2: Game Location / Venue (4 cols) */}
          <div className="md:col-span-4 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Game Location</span>
            </div>
            <p className="text-sm font-semibold text-white">
              F.O. Moxley Community Center
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              225 E 3rd Ave, Bowling Green, KY 42101
            </p>
            <p className="text-[11px] text-slate-400/90 pt-0.5 font-medium">
              All game times in Central Time zone (CT)
            </p>
          </div>

          {/* Column 3: Site Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-2.5 text-center md:text-left">
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono">
              Navigation
            </div>
            <nav aria-label="Footer Navigation" className="flex flex-wrap md:flex-col justify-center md:justify-start gap-3 sm:gap-2 text-xs font-medium text-slate-400">
              <a
                href={TAB_TO_HASH.home}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home');
                }}
                className={`hover:text-emerald-400 transition-colors ${
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
                className={`hover:text-emerald-400 transition-colors ${
                  activeTab === 'seasonHub' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Seasons Hub
              </a>
              <a
                href={TAB_TO_HASH.about}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('about');
                }}
                className={`hover:text-emerald-400 transition-colors ${
                  activeTab === 'about' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                About the League
              </a>
              <a
                href={TAB_TO_HASH.rules}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('rules');
                }}
                className={`hover:text-emerald-400 transition-colors ${
                  activeTab === 'rules' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Rules & FAQs
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BGFutsal League. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
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
