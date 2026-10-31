import React, { useState } from 'react';
import { Star, Home, Trophy, Info, BookOpen, Menu, X, RefreshCw, MapPin } from 'lucide-react';
import { SyncStatus } from '../types/league';

export type MainNavTab = 'home' | 'seasonHub' | 'about' | 'rules';

interface NavbarProps {
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  syncStatus?: SyncStatus;
  openSyncModal?: () => void;
  starredTeam: string | null;
  onClearStarredTeam: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSyncModal,
  syncStatus,
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
    <>
      {/* 1. TOP NAVBAR: Sticky Desktop & Mobile Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#071222]/95 via-[#081728]/95 to-[#071222]/95 backdrop-blur-md border-b border-[#14233c] text-white relative">
        {/* Subtle bottom gradient accent line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16 relative">
            {/* Zone 1: Minimal High-End Wordmark with Emerald Accent */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleSelectTab('home')}
                className="text-left group focus:outline-none cursor-pointer flex items-baseline gap-2.5 py-1"
                aria-label="BGFutsal Home"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-emerald-200 transition-all">
                    BGFutsal
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400/90 font-medium">
                  League
                </span>
              </button>
            </div>

            {/* Zone 2: Desktop Navigation Links (Centrally Aligned) */}
            <nav className="hidden md:flex items-center gap-8 text-xs tracking-wider uppercase font-medium text-slate-400 absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() => handleSelectTab('home')}
                className={`hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'home'
                    ? 'text-white font-semibold'
                    : ''
                }`}
              >
                <span>Home</span>
                {activeTab === 'home' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>

              <button
                onClick={() => handleSelectTab('seasonHub')}
                className={`hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'seasonHub'
                    ? 'text-white font-semibold'
                    : ''
                }`}
              >
                <span>Seasons</span>
                {activeTab === 'seasonHub' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>

              <button
                onClick={() => handleSelectTab('about')}
                className={`hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'about'
                    ? 'text-white font-semibold'
                    : ''
                }`}
              >
                <span>About</span>
                {activeTab === 'about' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>

              <button
                onClick={() => handleSelectTab('rules')}
                className={`hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'rules'
                    ? 'text-white font-semibold'
                    : ''
                }`}
              >
                <span>Rules & FAQs</span>
                {activeTab === 'rules' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>
            </nav>

            {/* Zone 3: Right Controls (Starred Team, Organizer Sync, Mobile Hamburger) */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Starred Team Badge */}
              {starredTeam && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-[#0f213b] border border-emerald-800/60 rounded-lg px-2.5 py-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-[130px]">{starredTeam}</span>
                  <button
                    onClick={onClearStarredTeam}
                    className="ml-1 text-slate-400 hover:text-white cursor-pointer px-0.5"
                    title="Clear pinned team"
                    aria-label="Clear pinned team"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

        {/* 2. MOBILE EXPANDABLE MENU (Slides down when hamburger is tapped) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#14233c] bg-[#071222] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => handleSelectTab('home')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'home'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleSelectTab('seasonHub')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'seasonHub'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seasons</span>
              </button>

              <button
                onClick={() => handleSelectTab('about')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'about'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>About</span>
              </button>

              <button
                onClick={() => handleSelectTab('rules')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'rules'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rules & FAQs</span>
              </button>
            </div>

            {/* Mobile Location & Live Status Bar */}
            <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Bowling Green, KY</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 py-0.5 px-2 rounded-md bg-[#0a182c]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                <span>Auto-Sync Active</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MOBILE FIXED BOTTOM APP BAR (Ergonomic 1-Thumb Touch Targets) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#071222]/95 backdrop-blur-xl border-t border-[#14233c] px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      >
        {/* Home Button */}
        <button
          onClick={() => handleSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors cursor-pointer rounded-lg ${
            activeTab === 'home'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Navigate to Home"
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Seasons Button */}
        <button
          onClick={() => handleSelectTab('seasonHub')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors cursor-pointer rounded-lg ${
            activeTab === 'seasonHub'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Navigate to Seasons"
        >
          <Trophy className={`w-5 h-5 mb-0.5 ${activeTab === 'seasonHub' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Seasons</span>
        </button>

        {/* About Button */}
        <button
          onClick={() => handleSelectTab('about')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors cursor-pointer rounded-lg ${
            activeTab === 'about'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Navigate to About"
        >
          <Info className={`w-5 h-5 mb-0.5 ${activeTab === 'about' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">About</span>
        </button>

        {/* Rules & FAQs Button */}
        <button
          onClick={() => handleSelectTab('rules')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors cursor-pointer rounded-lg ${
            activeTab === 'rules'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Navigate to Rules and FAQs"
        >
          <BookOpen className={`w-5 h-5 mb-0.5 ${activeTab === 'rules' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Rules</span>
        </button>
      </nav>
    </>
  );
};
