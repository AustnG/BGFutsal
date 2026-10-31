import React from 'react';
import { Search, ChevronDown, X, Star } from 'lucide-react';
import { Division, Season } from '../types/league';

interface SeasonDivisionControlsProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSelectSeason: (id: string) => void;
  divisions: Division[];
  selectedDivisionId: string;
  onSelectDivision: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  starredTeam: string | null;
  onlyMyTeam: boolean;
  onToggleOnlyMyTeam: () => void;
  teamCount: number;
  variant?: 'bar' | 'card';
  showSeasonSelector?: boolean;
}

export const SeasonDivisionControls: React.FC<SeasonDivisionControlsProps> = ({
  seasons,
  selectedSeasonId,
  onSelectSeason,
  divisions,
  selectedDivisionId,
  onSelectDivision,
  searchQuery,
  onSearchChange,
  starredTeam,
  onlyMyTeam,
  onToggleOnlyMyTeam,
  variant = 'bar',
  showSeasonSelector = true,
}) => {
  const seasonDivisions = divisions.filter((d) => d.seasonId === selectedSeasonId);

  const innerControls = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
      {/* Season & Division Selector */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Season Dropdown (only rendered if showSeasonSelector is true) */}
        {showSeasonSelector && (
          <>
            <div className="relative">
              <select
                value={selectedSeasonId}
                onChange={(e) => onSelectSeason(e.target.value)}
                className="appearance-none bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 text-[#0a1526] font-semibold text-xs rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <span className="text-slate-300 hidden sm:inline">/</span>
          </>
        )}

        {/* Division Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/60">
          {seasonDivisions.length > 1 && (
            <button
              onClick={() => onSelectDivision('all')}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                selectedDivisionId === 'all'
                  ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              All
            </button>
          )}
          {seasonDivisions.map((div) => (
            <button
              key={div.id}
              onClick={() => onSelectDivision(div.id)}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                selectedDivisionId === div.id
                  ? 'bg-gradient-to-r from-[#0a1526] to-[#0e213b] text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & "My Team" Bookmark */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search club..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50/90 border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {starredTeam && (
          <button
            onClick={onToggleOnlyMyTeam}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyMyTeam
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
            title="Filter to My Team"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyMyTeam ? 'fill-white text-white' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">My Team</span>
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-2 sm:px-3 sm:py-2 shadow-xs">
        {innerControls}
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {innerControls}
      </div>
    </div>
  );
};
