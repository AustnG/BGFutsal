import React, { useState } from 'react';
import { MapPin, Trophy, Shield, Clock, Users, Award, Sparkles, Navigation, ExternalLink, Heart } from 'lucide-react';
import { LEAGUE_PHOTOS } from '../data/mediaAssets';
import { ImageLightbox } from './ImageLightbox';

export const AboutView: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof LEAGUE_PHOTOS)[0] | null>(null);

  // Photos specifically highlighting the venue, champions, and atmosphere
  const facilityPhotos = [
    {
      photo: LEAGUE_PHOTOS.find((p) => p.id === 'photo-action-02') || LEAGUE_PHOTOS[2],
      tag: 'Official BGPR Court',
      label: 'Regulation Hardwood Surface',
      sub: 'Action inside the F.O. Moxley gym with official Bowling Green Parks & Rec court padding.',
    },
    {
      photo: LEAGUE_PHOTOS.find((p) => p.id === 'photo-champ-01') || LEAGUE_PHOTOS[0],
      tag: 'Champions & Tradition',
      label: 'Postseason Trophy Celebration',
      sub: 'Championship squads celebrate in front of the regulation futsal goal with families and fans.',
    },
    {
      photo: LEAGUE_PHOTOS.find((p) => p.id === 'photo-community-01') || LEAGUE_PHOTOS[5],
      tag: 'Community & Fans',
      label: 'Spectators & Atmosphere',
      sub: 'Vibrant local futsal community packing the bleachers for evening fixtures.',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto">
      {/* 1. HERO SPOTLIGHT: Deep Slate Feature Card */}
      <section className="bg-gradient-to-br from-[#071324] via-[#0b1f3a] to-[#06111f] text-white rounded-2xl p-6 sm:p-8 border border-[#162d4e] shadow-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              Official League Profile
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium">
              Hosted by Bowling Green Parks & Rec
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Bowling Green Futsal League
          </h1>

          <p className="text-base sm:text-lg font-medium text-emerald-400">
            "Bowling Green's Premier Indoor Soccer League"
          </p>

          <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-3xl">
            Established to deliver authentic, high-tempo 6v6 futsal to South-Central Kentucky. Contested on the regulation hardwood court of F.O. Moxley Community Center under Bowling Green Futsal League rules with low-bounce match balls, non-marking indoor shoes, unlimited substitutions, and touchline kick-ins.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div className="p-3 bg-[#050e1a] border border-[#172d4c] rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Format</span>
              <span className="text-sm font-semibold text-emerald-400">6v6 (5 + GK)</span>
            </div>
            <div className="p-3 bg-[#050e1a] border border-[#172d4c] rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Timing</span>
              <span className="text-sm font-semibold text-white">2 × 20 Mins (CT)</span>
            </div>
            <div className="p-3 bg-[#050e1a] border border-[#172d4c] rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Location</span>
              <span className="text-sm font-semibold text-white truncate block">F.O. Moxley</span>
            </div>
            <div className="p-3 bg-[#050e1a] border border-[#172d4c] rounded-xl space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Tournament</span>
              <span className="text-sm font-semibold text-emerald-400">Best-of-5 PKs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VENUE & FACILITY SHOWCASE: Real Photos & Location Details */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Home Court & Facility Showcase
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            F.O. Moxley Community Center
          </span>
        </div>

        {/* 3 Visual Photo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {facilityPhotos.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(item.photo)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={item.photo.src}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold border border-white/10">
                  {item.tag}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal mt-1">
                    {item.sub}
                  </p>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold pt-1">
                  Click to inspect photo →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Venue Location Details Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-700 font-semibold font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>Primary Game Facility</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                F.O. Moxley Community Center
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                225 E 3rd Ave, Bowling Green, KY 42101 · Hosted by Bowling Green Parks & Rec
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=F.O.+Moxley+Community+Center+225+E+3rd+Ave+Bowling+Green+KY+42101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Facility Highlights Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Court</span>
              <span className="text-slate-800 font-medium">Indoor Hardwood</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Goals</span>
              <span className="text-slate-800 font-medium">Regulation 3m × 2m</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Spectators</span>
              <span className="text-slate-800 font-medium">Bleachers & Mezzanine</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Clock</span>
              <span className="text-slate-800 font-medium">Electronic Scoreboard</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE FOUR PILLARS: Competition Standards */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              League Pillars & Competition Standards
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home Pitch */}
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
              F.O. Moxley Main Gym Court
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Contested exclusively on the regulation hardwood gym at F.O. Moxley. Features climate control, digital scoreboards, spectator bleachers, and safety wall padding maintained by Bowling Green Parks & Rec.
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
              Division A & Division B
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Structured into competitive tiers to guarantee balanced matchups. Each division features regular season play followed by a single-elimination postseason tournament settled directly by best-of-5 penalties when tied.
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
              High-Tempo 40-Minute Fixtures
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Two 20-minute halves with a 5-minute halftime intermission (Central Time). Teams field 6 players (5 outfielders plus 1 goalkeeper) with unlimited substitutions and a 5-second restart clock on kick-ins and set plays.
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
              Official futsal match officials manage every fixture. Accumulated foul thresholds award a penalty kick from the spot at 5 fouls and every 3 additional fouls thereafter, while non-marking footwear and slide tackle restrictions protect athletes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. OPERATIONS & CONTACT */}
      <section className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-base font-bold tracking-tight text-white">
          League Operations & Inquiries
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          BGFutsal operates in partnership with Bowling Green Parks & Rec. Squad registration opens prior to each season. For roster inquiries, exhibition matches, or referee certification, contact the league operations desk.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Facility Location</span>
            <span className="text-white font-medium">225 E 3rd Ave, Bowling Green, KY</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Hosted By</span>
            <span className="text-emerald-400 font-medium">Bowling Green Parks & Rec</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-0.5">
            <span className="text-slate-400 block text-xs">Timezone</span>
            <span className="text-white font-medium">Central Time (CT)</span>
          </div>
        </div>
      </section>

      {/* Lightbox for clicked facility photo */}
      <ImageLightbox
        photo={selectedPhoto}
        photos={facilityPhotos.map((f) => f.photo)}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(photo) => setSelectedPhoto(photo)}
      />
    </div>
  );
};
