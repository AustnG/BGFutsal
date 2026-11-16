import React, { useState } from 'react';
import { Star, Home, Trophy, Info, BookOpen, Menu, X, MapPin, Newspaper } from 'lucide-react';
import { TAB_TO_HASH } from '../utils/routing';
import { LEAGUE_LOGOS } from '../data/mediaAssets';

export type MainNavTab = 'home' | 'seasonHub' | 'newsGallery' | 'about' | 'rules';

interface NavbarProps {
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  starredTeam: string | null;
  onClearStarredTeam: () => void;
}

const NAV_ITEMS: { id: MainNavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'seasonHub', label: 'Seasons', icon: Trophy },
  { id: 'newsGallery', label: 'News & Gallery', icon: Newspaper },
  { id: 'about', label: 'About', icon: Info },
  { id: 'rules', label: 'Rules & FAQs', icon: BookOpen },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  starredTeam,
  onClearStarredTeam,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: MainNavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-pitch-ink)] border-b border-[var(--color-border-dark)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center shrink-0">
            <a
              href={TAB_TO_HASH.home}
              onClick={(e) => {
                e.preventDefault();
                handleSelectTab('home');
              }}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer flex items-center gap-2.5 py-1"
              aria-label="BG Futsal Home"
            >
              <img
                src={LEAGUE_LOGOS.whiteSquare}
                alt="BG Futsal crest"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="text-lg sm:text-xl font-extrabold tracking-[-0.025em] text-white group-hover:text-emerald-400 transition-colors">
                BG Futsal
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={TAB_TO_HASH[item.id]}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab(item.id);
                  }}
                  className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                    isActive ? 'text-white font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[21px] inset-x-0 h-[2px] accent-rule-gradient" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Controls: Starred Club & Mobile Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {starredTeam && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-[var(--color-pitch-surface)] border border-[var(--color-border-dark)] rounded-md px-2.5 py-1">
                <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[140px]">{starredTeam}</span>
                <button
                  onClick={onClearStarredTeam}
                  className="ml-0.5 text-slate-400 hover:text-white cursor-pointer px-0.5"
                  title="Clear pinned team"
                  aria-label="Clear pinned team"
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-slate-300 hover:text-white hover:bg-[var(--color-pitch-surface)] border border-transparent hover:border-[var(--color-border-dark)] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border-dark)] bg-[var(--color-pitch-ink)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isFullSpan = idx === NAV_ITEMS.length - 1;
              return (
                <a
                  key={item.id}
                  href={TAB_TO_HASH[item.id]}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab(item.id);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors cursor-pointer min-h-[44px] ${
                    isFullSpan ? 'col-span-2' : ''
                  } ${
                    isActive
                      ? 'bg-[var(--color-pitch-surface)] border-emerald-500/60 text-white font-semibold'
                      : 'bg-[#040B16] border-[var(--color-border-dark)] text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-[var(--color-border-dark)] flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Bowling Green, KY</span>
            </span>
            <span>Central Time (CT)</span>
          </div>
        </div>
      )}
    </header>
  );
};
