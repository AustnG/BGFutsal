import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, ShieldAlert, BookOpen, Clock, Activity, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

export const RulesFaqView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs: FaqItem[] = [
    {
      q: 'How does postseason tournament qualification work?',
      a: 'At the end of each regular season (9 to 10 matchweeks), the Top 8 teams in each division qualify for their respective single-elimination Postseason Tournament. Seeds are determined strictly by Points, Goal Differential, Goals For, and Head-to-Head records.',
      category: 'Tournament',
    },
    {
      q: 'How are game forfeits scored?',
      a: 'If a squad is unable to field at least 3 players by 10 minutes past kickoff or forfeits prior to the match, the opposing team is officially awarded an automatic 2-0 victory, 3 points, and a +2 goal differential. The forfeiting team receives 0 points and a -2 goal differential.',
      category: 'Matchday',
    },
    {
      q: 'What footwear and equipment are required?',
      a: 'All players must wear flat, non-marking indoor court shoes or futsal flats (no turf shoes or outdoor cleats are permitted on the hardwood). Shin guards completely covered by socks are mandatory for player safety. Low-bounce size 4 futsal balls are provided by the league.',
      category: 'Equipment',
    },
    {
      q: 'What is the 4-second restart rule?',
      a: 'Restarts (kick-ins, corner kicks, goal clearances, and direct/indirect free kicks) must be executed within 4 seconds of the ball being spotted and signaled by the referee. Exceeding 4 seconds results in an immediate turnover of possession.',
      category: 'Rules',
    },
    {
      q: 'What is the goalkeeper back-pass restriction?',
      a: 'A goalkeeper may only play the ball once in their defensive half per possession until the ball touches an opponent or crosses the midfield line. If a teammate passes back to the goalkeeper in their defensive half before an opponent has touched it, an indirect free kick is awarded at the spot.',
      category: 'Rules',
    },
    {
      q: 'How do accumulated fouls work?',
      a: 'Each team is allowed 5 accumulated fouls per half. Beginning with a team’s 6th accumulated foul in a half, the opposing squad is awarded a direct penalty kick from the 10-meter second penalty spot without a defensive wall. Foul counts reset at halftime.',
      category: 'Rules',
    },
    {
      q: 'What are the rules regarding slide tackles?',
      a: 'Slide tackling an opponent in an attempt to play the ball is strictly prohibited for outfield players to prevent injuries on hardwood courts. Slide tackles will be penalized with a direct free kick and possible caution. Goalkeepers may slide to block shots within their penalty arc provided they do not lead with feet.',
      category: 'Rules',
    },
    {
      q: 'How are ties handled in the postseason playoffs?',
      a: 'If a postseason knockout match is tied at the end of regulation time (44 minutes), there is no extra time during quarterfinals or semifinals; teams proceed directly to a 3-kick penalty shootout. In the Championship Trophy Final, one 5-minute golden-goal extra time period is played prior to shootouts.',
      category: 'Tournament',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      {/* 1. HERO SPOTLIGHT: Pitch-Navy Gradient Paneling */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0a1c36] to-[#06111f] text-white rounded-2xl p-6 sm:p-8 border border-[#172d4c] shadow-lg">
        {/* Subtle Ambient Emerald Accent Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Official League Handbook
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Rules & FAQs
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
            Official competition regulations, FIFA futsal rules of the game, and matchday standards for team managers, players, and referees.
          </p>
        </div>
      </section>

      {/* 2. THREE KEY RULES: Color-Paneled Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 4-Second Clock - Emerald Paneling */}
        <div className="relative overflow-hidden p-4 rounded-xl border border-emerald-300/80 bg-gradient-to-br from-emerald-500/12 via-emerald-500/[0.03] to-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
              Restarts
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#0a1526]">4-Second Clock</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            All kick-ins, corners, and goal clearances must be released within 4 seconds of referee signal.
          </p>
        </div>

        {/* Accumulated Fouls - Amber Paneling */}
        <div className="relative overflow-hidden p-4 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-500/12 via-amber-500/[0.03] to-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
              Team Fouls
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#0a1526]">Accumulated Limit</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            5 fouls per half limit. 6th foul awards a direct 10-meter penalty kick without a defensive wall.
          </p>
        </div>

        {/* Footwear & Safety - Sky Paneling */}
        <div className="relative overflow-hidden p-4 rounded-xl border border-sky-300/80 bg-gradient-to-br from-sky-500/12 via-sky-500/[0.03] to-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-800 font-semibold">
              Equipment
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#0a1526]">Court Flats Only</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Flat, non-marking indoor court flats only (no turf shoes or cleats on hardwood). Shin guards mandatory.
          </p>
        </div>
      </section>

      {/* 3. CORE REGULATIONS SUMMARY */}
      <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-[#0a1526]">
            Official Match Format & Regulations
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed font-normal">
          <p>
            Official FIFA Futsal Laws of the Game apply with localized league safety standards. Matches consist of two 22-minute running halves with a 3-minute halftime. Teams are composed of 5 players (4 outfielders plus 1 goalkeeper) with unlimited flying substitutions made at the designated team bench zone.
          </p>
          <p>
            Kick-ins replace traditional throw-ins when the ball exits the sideline boundary. Outfield players may not initiate sliding tackles on opponents; infractions result in direct free kicks and potential cautions.
          </p>
        </div>
      </section>

      {/* 4. EXPANDABLE FAQ ACCORDION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h2 className="text-base sm:text-lg font-semibold text-[#0a1526] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {faqs.length} Regulations
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`transition-colors ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-4.5 flex items-center justify-between text-left gap-4 font-semibold text-[#0a1526] text-xs sm:text-sm hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {faq.category && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium hidden sm:inline-block border border-slate-200/60">
                        {faq.category}
                      </span>
                    )}
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-4.5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal animate-in fade-in duration-150 border-l-2 border-emerald-500 ml-4 mb-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MATCHDAY DESK NOTICE */}
      <section className="flex items-start gap-3.5 p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.04] to-white border border-emerald-200/80 rounded-xl text-xs text-emerald-950 leading-relaxed shadow-xs">
        <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-emerald-900">Have a rule question on game night?</strong> Referees and league directors are on-site at the Bowling Green Futsal Arena scorekeeper desk 30 minutes before every scheduled kickoff to answer captain inquiries.
        </p>
      </section>
    </div>
  );
};
