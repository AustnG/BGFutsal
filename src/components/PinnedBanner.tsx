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
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white border-b border-black/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 bg-black/20 border border-white/25 text-white font-mono font-semibold uppercase tracking-[0.08em] text-[10px] px-2 py-0.5 rounded shrink-0">
            <Bell className="w-3 h-3" />
            <span>Notice</span>
          </span>
          <span className="text-white/50 font-mono">·</span>
          <span className="text-white font-medium truncate text-xs sm:text-sm">
            {pinnedStory.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onReadStory(pinnedStory)}
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-2.5 py-1 rounded-md border border-white/25 transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-black/15 cursor-pointer transition-colors"
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
