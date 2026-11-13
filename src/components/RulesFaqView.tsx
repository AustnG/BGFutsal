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
      a: 'At the end of each regular season, qualifying teams in each division advance to the single-elimination Postseason Tournament. Seeds are determined strictly by Points, Goal Differential, Goals For, and Head-to-Head records.',
      category: 'Tournament',
    },
    {
      q: 'How are ties handled in the postseason playoffs?',
      a: 'If a postseason tournament match is tied at the end of regulation time (40 minutes), there is no overtime—teams proceed straight to a best-of-5 penalty shootout to determine the winner.',
      category: 'Tournament',
    },
    {
      q: 'How many players are on the court and how do substitutions work?',
      a: 'Teams are composed of six players on the court: five outfield players plus one goalkeeper. Unlimited substitutions are permitted throughout the match at the designated team bench zone.',
      category: 'Matchday',
    },
    {
      q: 'What is the 5-second restart rule?',
      a: 'Kick-ins occur whenever the ball goes out of bounds over the sidelines. All restarts (kick-ins, corners, goal clearances, and free kicks) are subject to a 5-second clock to put the ball back into play once the ball is set. Exceeding 5 seconds results in a turnover of possession.',
      category: 'Rules',
    },
    {
      q: 'How does the foul accumulation rule work?',
      a: 'Once a team accrues five (5) accumulated fouls in a half, the opposing team is awarded a penalty kick from the penalty spot. After reaching five fouls, every three (3) additional fouls committed by that team results in another penalty kick from the penalty spot. Foul counts reset at halftime.',
      category: 'Rules',
    },
    {
      q: 'What footwear and equipment are required?',
      a: 'Players may wear futsal flats or standard non-marking athletic/tennis shoes. Cleats, turf shoes, steel-toe boots, and any footwear that leaves black marks on the hardwood court are strictly prohibited. Shin guards completely covered by socks are mandatory.',
      category: 'Equipment',
    },
    {
      q: 'How are game forfeits scored?',
      a: 'If a squad is unable to field the minimum required players past kickoff or forfeits prior to the match, the opposing team is officially awarded an automatic 2-0 victory, 3 points, and a +2 goal differential. The forfeiting team receives 0 points and a -2 goal differential.',
      category: 'Matchday',
    },
    {
      q: 'What are the rules regarding slide tackles?',
      a: 'Slide tackling an opponent in an attempt to play the ball is strictly prohibited for outfield players to prevent injuries on hardwood courts. Infractions result in a direct free kick and potential caution. Goalkeepers may slide to block shots within their penalty arc provided they play the ball safely.',
      category: 'Rules',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      {/* 1. HERO SPOTLIGHT: Deep Slate Card */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Official League Handbook
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Rules & FAQs
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
            Official competition regulations, match format guidelines, and game-night standards for team managers, players, and referees at F.O. Moxley Community Center.
          </p>
        </div>
      </section>

      {/* 2. THREE KEY RULES: Clean Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 5-Second Clock */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Restarts
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">5-Second Clock</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Kick-ins happen on sideline outs. Players have 5 seconds to put the ball back into play once the ball is set.
          </p>
        </div>

        {/* Accumulated Fouls */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Team Fouls
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Accumulated Fouls</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            At 5 team fouls, a penalty kick is awarded from the spot—followed by another penalty every 3 additional fouls.
          </p>
        </div>

        {/* Footwear & Safety */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Equipment
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Non-Marking Shoes</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Futsal flats or non-marking tennis shoes allowed. No boots or black-mark soles on the court. Shin guards mandatory.
          </p>
        </div>
      </section>

      {/* 3. CORE REGULATIONS SUMMARY */}
      <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Official Match Format & Regulations
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed font-normal">
          <p>
            Matches consist of two 20-minute halves with a 5-minute halftime intermission. Teams are composed of six players on the court—five outfield players plus one goalkeeper—with unlimited substitutions available throughout play.
          </p>
          <p>
            Kick-ins happen when the ball goes out over the sidelines, with a 5-second clock to put the ball back into play once the ball is set. Once a team accrues five accumulated fouls, the opposing team is awarded a penalty kick from the penalty spot, and every three additional fouls thereafter results in another penalty. In the postseason tournament, tied matches have no overtime and go straight to a best-of-5 penalty shootout.
          </p>
        </div>
      </section>

      {/* 4. EXPANDABLE FAQ ACCORDION */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between pb-1 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <span className="text-xs text-slate-500">
            {faqs.length} Regulations
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`transition-colors ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between text-left gap-4 font-semibold text-slate-900 text-xs sm:text-sm hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {faq.category && (
                      <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium hidden sm:inline-block border border-slate-200">
                        {faq.category}
                      </span>
                    )}
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MATCHDAY DESK NOTICE */}
      <section className="flex items-start gap-3.5 p-4 sm:p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed shadow-2xs">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-emerald-900">Have a rule question on game night?</strong> Referees and league directors are on-site at the F.O. Moxley Community Center scorekeeper desk prior to scheduled kickoffs to answer captain inquiries.
        </p>
      </section>
    </div>
  );
};
