import React from 'react';
import { MapPin, Trophy, Shield, Clock, Users, Award, Sparkles, Building2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      {/* 1. HERO SPOTLIGHT: Deep Slate Feature Card */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Official League Profile
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Bowling Green Futsal League
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
            Established to deliver authentic, high-tempo 5v5 futsal to South-Central Kentucky. Contested on regulation indoor hardwood under official FIFA futsal laws with low-bounce match balls, non-marking flats, and touchline kick-ins.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Format</span>
              <span className="text-sm font-semibold text-emerald-400">5v5 Hardwood</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Halves</span>
              <span className="text-sm font-semibold text-white">2 × 22 Mins</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Divisions</span>
              <span className="text-sm font-semibold text-white">Premier & Div 1</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Tournament</span>
              <span className="text-sm font-semibold text-emerald-400">Top 8 Playoff</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FOUR PILLARS: Unified Identity Cards */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between pb-1 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            League Pillars & Competition Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Arena Court */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Home Pitch
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Bowling Green Futsal Arena
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Contested exclusively on the Main Court hardwood. Features climate control, digital scoreboards, elevated mezzanine spectator seating, and regulation perimeter run-offs.
            </p>
          </div>

          {/* Tiered Divisions */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Competition Tiers
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Premier Division & Division 1
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Structured to guarantee balanced fixtures. Premier Division hosts elite collegiate and club-tier talent, while Division 1 hosts competitive local adult and regional clubs.
            </p>
          </div>

          {/* Match Structure */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Match Structure
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              High-Tempo 44-Minute Fixtures
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Two 22-minute running halves with 3-minute halftime intermission. Unlimited flying bench substitutions keep the speed of play rapid and tactically fluid from opening whistle to final horn.
            </p>
          </div>

          {/* Officiating & Safety */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Fair Play & Safety
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Certified Futsal Referees
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Official FIFA futsal certified match officials manage every fixture. Accumulated foul thresholds (10m penalty kicks after 5 fouls) and strict slide tackle restrictions safeguard athletes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONS & CONTACT */}
      <section className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-base font-bold tracking-tight text-white">
          League Operations & Inquiries
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          BGFutsal operates two primary calendar campaigns per year (Spring and Fall). Squad registration opens 6 weeks prior to opening matchday. For roster inquiries, exhibition scheduling, or referee certification programs, contact the league operations desk.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Location</span>
            <span className="text-white font-medium">Bowling Green, KY 42101</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Primary Email</span>
            <span className="text-emerald-400 font-medium">contact@bgfutsal.com</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Affiliation</span>
            <span className="text-white font-medium">FIFA / US Futsal Standard</span>
          </div>
        </div>
      </section>
    </div>
  );
};
