import React from 'react';
import { ArrowUp, MapPin, Trophy, Shield, BookOpen, RefreshCw, Mail, ExternalLink } from 'lucide-react';
import { MainNavTab } from './Navbar';

interface FooterProps {
  activeTab: MainNavTab;
  onNavigateTab: (tab: MainNavTab) => void;
  onNavigateToSection?: (sectionId: 'standings' | 'schedule' | 'rankChart' | 'playoffs') => void;
  openSyncModal?: () => void;
  lastSynced?: string | null;
  dataSource?: 'built-in' | 'google-sheets';
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onNavigateToSection,
  openSyncModal,
  lastSynced,
  dataSource = 'built-in',
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tab: MainNavTab, sectionId?: 'standings' | 'schedule' | 'rankChart' | 'playoffs') => {
    onNavigateTab(tab);
    if (sectionId && onNavigateToSection) {
      setTimeout(() => onNavigateToSection(sectionId), 60);
    } else {
      scrollToTop();
    }
  };

  return (
    <footer className="border-t border-[#14233c] bg-gradient-to-b from-[#071222] via-[#060e1a] to-[#040a12] text-slate-400 mt-14 sm:mt-20 relative overflow-hidden">
      {/* Top Accent Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

      {/* Subtle Ambient Emerald Aura */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[#14233c]">
          {/* Column 1: Brand & Home Pitch (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <button
                onClick={() => handleNav('home')}
                className="text-left group focus:outline-none cursor-pointer flex items-baseline gap-2"
              >
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  BGFutsal
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400/90 font-medium">
                  League
                </span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              The premier sanctioned 5v5 indoor futsal league in South-Central Kentucky. Contested on regulation hardwood under official FIFA futsal laws.
            </p>

            {/* Venue Card */}
            <div className="bg-[#0b1728] border border-[#172944] rounded-xl p-3.5 space-y-1.5 max-w-sm shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Home Pitch</span>
              </div>
              <p className="text-xs text-white font-medium">
                Bowling Green Futsal Arena — Main Court
              </p>
              <p className="text-[11px] text-slate-400">
                Bowling Green, KY 42101 · Hardwood · Climate Controlled
              </p>
            </div>
          </div>

          {/* Column 2: Competitions (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Competitions</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('seasonHub', 'standings')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Current Standings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('seasonHub', 'schedule')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Matchday Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('seasonHub', 'rankChart')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Rank Trajectory Chart
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('seasonHub', 'playoffs')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Championship Playoffs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('seasonHub')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left text-slate-500"
                >
                  Historical Archives
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Rules & Handbook (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Handbook</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('rules')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Official Regulations
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('rules')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  4-Second Restart Rule
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('rules')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Accumulated Team Fouls
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('rules')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Mandatory Footwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('rules')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  Forfeit Policies (2-0)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: League Operations (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operations</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  About the League
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@bgfutsal.com"
                  className="hover:text-emerald-300 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-slate-400"
                >
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>contact@bgfutsal.com</span>
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block">
                  FIFA / US Futsal Sanctioned Format
                </span>
              </li>
            </ul>

            {/* Administrator Google Sheet Sync Action */}
            {openSyncModal && (
              <div className="pt-2">
                <button
                  onClick={openSyncModal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e2038] hover:bg-[#132c4e] border border-[#1b3558] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                  <span>Organizer Sheet Sync</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} BGFutsal League. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="text-slate-400">Bowling Green, Kentucky</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Data Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-[#091526] border border-[#142640] px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              <span>{dataSource === 'google-sheets' ? 'Sheets Live' : 'Official Records'}</span>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer text-xs p-1"
              title="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
