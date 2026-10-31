import React from 'react';
import { ArrowRight, X, Bell } from 'lucide-react';
import { NewsStory } from '../types/league';

interface PinnedBannerProps {
  pinnedStory?: NewsStory;
  onReadStory: (story: NewsStory) => void;
  onDismiss: () => void;
}

export const PinnedBanner: React.FC<PinnedBannerProps> = ({
  pinnedStory,
  onReadStory,
  onDismiss,
}) => {
  if (!pinnedStory) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 border-b border-emerald-400/40 text-white py-3 px-4 sm:px-6 shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
      {/* Ambient specular highlight glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-300/60 via-cyan-300/80 to-blue-300/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-medium relative z-10">
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-white font-mono uppercase tracking-widest text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs shrink-0 border border-white/25">
            <Bell className="w-3 h-3 text-white" />
            <span>Notice</span>
          </div>
          <span className="text-white/60">·</span>
          <span className="text-white font-medium truncate drop-shadow-xs">
            {pinnedStory.title}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => onReadStory(pinnedStory)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors cursor-pointer text-xs shadow-xs border border-white/25 backdrop-blur-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/20 cursor-pointer transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
