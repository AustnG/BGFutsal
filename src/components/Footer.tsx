import React from 'react';
import { ArrowUp, MapPin } from 'lucide-react';
import { MainNavTab } from './Navbar';
import { TAB_TO_HASH } from '../utils/routing';

interface FooterProps {
  activeTab: MainNavTab;
  onNavigateTab: (tab: MainNavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, onNavigateTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tab: MainNavTab) => {
    onNavigateTab(tab);
    scrollToTop();
  };

  const navLinks: { tab: MainNavTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'seasonHub', label: 'Seasons Hub' },
    { tab: 'newsGallery', label: 'News & Gallery' },
    { tab: 'about', label: 'About the League' },
    { tab: 'rules', label: 'Rules & FAQs' },
  ];

  return (
    <footer className="border-t border-[var(--color-border-dark)] bg-[var(--color-pitch-ink)] text-slate-400 mt-14 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-10 border-b border-[var(--color-border-dark)]">
          {/* Column 1: Brand & League Identity */}
          <div className="md:col-span-5 space-y-2.5 text-center md:text-left">
            <a
              href={TAB_TO_HASH.home}
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className="inline-flex items-baseline gap-2 group cursor-pointer"
              aria-label="BGFutsal Home"
            >
              <span className="text-xl font-extrabold tracking-[-0.025em] text-white group-hover:text-emerald-400 transition-colors">
                BGFutsal
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-emerald-400 font-semibold">
                League
              </span>
            </a>

            <p className="text-sm font-semibold text-slate-200">
              Bowling Green&apos;s Premier Indoor Soccer League
            </p>

            <p className="text-xs text-slate-400">
              Hosted by <span className="text-slate-200 font-medium">Bowling Green Parks &amp; Rec</span>
            </p>
          </div>

          {/* Column 2: Game Location / Venue */}
          <div className="md:col-span-4 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-emerald-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Game Location</span>
            </div>
            <p className="text-sm font-semibold text-white">F.O. Moxley Community Center</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              225 E 3rd Ave, Bowling Green, KY 42101
            </p>
            <p className="font-mono text-[11px] text-slate-400 pt-0.5">
              All game times in Central Time (CT)
            </p>
          </div>

          {/* Column 3: Site Navigation Links */}
          <div className="md:col-span-3 space-y-2.5 text-center md:text-left">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-300 font-semibold">
              Navigation
            </div>
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap md:flex-col justify-center md:justify-start gap-3 sm:gap-2 text-xs font-medium text-slate-400"
            >
              {navLinks.map((item) => (
                <a
                  key={item.tab}
                  href={TAB_TO_HASH[item.tab]}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.tab);
                  }}
                  className={`hover:text-emerald-400 transition-colors ${
                    activeTab === item.tab ? 'text-emerald-400 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BGFutsal League. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-mono text-[11px] uppercase tracking-wider"
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
