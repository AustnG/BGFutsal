import React, { useState } from 'react';
import { Star, Home, Trophy, Info, BookOpen, Menu, X, RefreshCw, MapPin, Camera, Newspaper } from 'lucide-react';
import { SyncStatus } from '../types/league';
import { TAB_TO_HASH } from '../utils/routing';

export type MainNavTab = 'home' | 'seasonHub' | 'newsGallery' | 'about' | 'rules';

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
      <header className="sticky top-0 z-30 bg-[#071222] border-b border-slate-800/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            {/* Zone 1: Clean Wordmark without decorative dots */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={TAB_TO_HASH.home}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('home');
                }}
                className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer flex items-baseline gap-2 py-1"
                aria-label="BGFutsal Home"
              >
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  BGFutsal
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  League
                </span>
              </a>
            </div>

            {/* Zone 2: Desktop Navigation Links (Centrally Aligned) */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
              <a
                href={TAB_TO_HASH.home}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('home');
                }}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'home'
                    ? 'text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span>Home</span>
                {activeTab === 'home' && (
                  <span className="absolute -bottom-[21px] inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </a>

              <a
                href={TAB_TO_HASH.seasonHub}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('seasonHub');
                }}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'seasonHub'
                    ? 'text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span>Seasons</span>
                {activeTab === 'seasonHub' && (
                  <span className="absolute -bottom-[21px] inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </a>

              <a
                href={TAB_TO_HASH.newsGallery}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('newsGallery');
                }}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'newsGallery'
                    ? 'text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span>News & Gallery</span>
                {activeTab === 'newsGallery' && (
                  <span className="absolute -bottom-[21px] inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </a>

              <a
                href={TAB_TO_HASH.about}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('about');
                }}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'about'
                    ? 'text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span>About</span>
                {activeTab === 'about' && (
                  <span className="absolute -bottom-[21px] inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </a>

              <a
                href={TAB_TO_HASH.rules}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('rules');
                }}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  activeTab === 'rules'
                    ? 'text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span>Rules & FAQs</span>
                {activeTab === 'rules' && (
                  <span className="absolute -bottom-[21px] inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </a>
            </nav>

            {/* Zone 3: Right Controls (Starred Team, Organizer Sync, Mobile Hamburger) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Starred Team Badge */}
              {starredTeam && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1">
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
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
              <a
                href={TAB_TO_HASH.home}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('home');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'home'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Home</span>
              </a>

              <a
                href={TAB_TO_HASH.seasonHub}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('seasonHub');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'seasonHub'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seasons</span>
              </a>

              <a
                href={TAB_TO_HASH.newsGallery}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('newsGallery');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'newsGallery'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Newspaper className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>News & Gallery</span>
              </a>

              <a
                href={TAB_TO_HASH.about}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('about');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'about'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>About</span>
              </a>

              <a
                href={TAB_TO_HASH.rules}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('rules');
                }}
                className={`col-span-2 flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'rules'
                    ? 'bg-[#0f2440] border-emerald-500/50 text-white font-semibold'
                    : 'bg-[#0a172a] border-[#162744] text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rules & FAQs</span>
              </a>
            </div>

            {/* Mobile Location & Live Status Bar */}
            <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Bowling Green, KY</span>
              </div>

              <div className="text-[11px] text-slate-400">
                Official League Portal
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
