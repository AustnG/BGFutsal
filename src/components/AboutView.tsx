import React from 'react';
import { MapPin, Trophy, Shield, Clock, Users, Award, Sparkles, Building2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      {/* 1. HERO SPOTLIGHT: Pitch-Navy Gradient Feature Paneling */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0a1c36] to-[#06111f] text-white rounded-2xl p-6 sm:p-8 border border-[#172d4c] shadow-lg">
        {/* Subtle Ambient Emerald Accent Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Official League Profile
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Bowling Green Futsal League
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
            Established to deliver authentic, high-tempo 5v5 futsal to South-Central Kentucky. Contested on regulation indoor hardwood under official FIFA futsal laws with low-bounce match balls, non-marking flats, and touchline kick-ins.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#172d4c]">
            <div className="p-3 bg-[#0c1f3b]/70 border border-[#1b3459] rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-medium">Format</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">5v5 Hardwood</span>
            </div>
            <div className="p-3 bg-[#0c1f3b]/70 border border-[#1b3459] rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-medium">Halves</span>
              <span className="text-sm font-semibold text-white font-mono">2 × 22 Mins</span>
            </div>
            <div className="p-3 bg-[#0c1f3b]/70 border border-[#1b3459] rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-medium">Divisions</span>
              <span className="text-sm font-semibold text-white font-mono">Premier & Div 1</span>
            </div>
            <div className="p-3 bg-[#0c1f3b]/70 border border-[#1b3459] rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-medium">Tournament</span>
              <span className="text-sm font-semibold text-amber-400 font-mono">Top 8 Playoff</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FOUR PILLARS: Color-Paneled Identity Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
          <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
          <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
            League Pillars & Competition Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Arena Court - Emerald Paneling */}
          <div className="relative overflow-hidden p-5 rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-white shadow-xs hover:border-emerald-500/60 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
                Home Pitch
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#0a1526]">
              Bowling Green Futsal Arena
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Contested exclusively on the Main Court hardwood. Features climate control, digital scoreboards, elevated mezzanine spectator seating, and regulation perimeter run-offs.
            </p>
          </div>

          {/* Tiered Divisions - Amber Paneling */}
          <div className="relative overflow-hidden p-5 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-white shadow-xs hover:border-amber-400/60 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                Competition Tiers
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#0a1526]">
              Premier Division & Division 1
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Structured to guarantee balanced fixtures. Premier Division hosts elite collegiate and club-tier talent, while Division 1 hosts competitive local adult and regional clubs.
            </p>
          </div>

          {/* Match Structure - Sky Paneling */}
          <div className="relative overflow-hidden p-5 rounded-xl border border-sky-200/90 bg-gradient-to-br from-sky-500/10 via-sky-500/[0.02] to-white shadow-xs hover:border-sky-400/60 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-800 font-semibold">
                Match Structure
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#0a1526]">
              High-Tempo 44-Minute Fixtures
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Two 22-minute running halves with 3-minute halftime intermission. Unlimited flying bench substitutions keep the speed of play rapid and tactically fluid from opening whistle to final horn.
            </p>
          </div>

          {/* Officiating & Safety - Indigo Paneling */}
          <div className="relative overflow-hidden p-5 rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-500/10 via-indigo-500/[0.02] to-white shadow-xs hover:border-indigo-400/60 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-800 font-semibold">
                Fair Play & Safety
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#0a1526]">
              Certified Futsal Referees
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Official FIFA futsal certified match officials manage every fixture. Accumulated foul thresholds (10m penalty kicks after 5 fouls) and strict slide tackle restrictions safeguard athletes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONS & CONTACT: Premium Pitch-Navy Banner */}
      <section className="bg-gradient-to-br from-[#081528] via-[#0b1e38] to-[#071322] text-white p-6 sm:p-7 rounded-2xl border border-[#162d4e] space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
            League Operations & Inquiries
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          BGFutsal operates two primary calendar campaigns per year (Spring and Fall). Squad registration opens 6 weeks prior to opening matchday. For roster inquiries, exhibition scheduling, or referee certification programs, contact the league operations desk.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-[#0e213b] border border-[#1a3356] p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-[11px] font-mono">Location</span>
            <span className="text-white font-medium">Bowling Green, KY 42101</span>
          </div>
          <div className="bg-[#0e213b] border border-[#1a3356] p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-[11px] font-mono">Primary Email</span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">contact@bgfutsal.com</span>
          </div>
          <div className="bg-[#0e213b] border border-[#1a3356] p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-[11px] font-mono">Affiliation</span>
            <span className="text-white font-medium">FIFA / US Futsal Standard</span>
          </div>
        </div>
      </section>
    </div>
  );
};
