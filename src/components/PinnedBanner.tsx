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
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white py-2.5 px-4 sm:px-6 shadow-md border-b border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Subtle top sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs relative z-10">
        <div className="flex items-center gap-2.5 truncate min-w-0">
          <span className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-xs border border-white/25 text-white font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-md shrink-0 shadow-xs">
            <Bell className="w-3 h-3 text-white" />
            <span>Notice</span>
          </span>
          <span className="text-white/60 font-bold">·</span>
          <span className="text-white font-medium truncate drop-shadow-xs text-xs sm:text-sm">
            {pinnedStory.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onReadStory(pinnedStory)}
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-semibold text-xs px-3 py-1 rounded-lg backdrop-blur-xs transition-all cursor-pointer shadow-xs border border-white/20"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
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
