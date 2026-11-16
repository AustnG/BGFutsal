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
    <div className="bg-[var(--color-pitch-surface)] text-white border-b border-[var(--color-border-dark)]">
      <div className="h-[2px] w-full accent-rule-gradient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 bg-[var(--color-pitch-ink)] border border-[var(--color-border-dark)] text-emerald-400 font-mono font-semibold uppercase tracking-[0.08em] text-[10px] px-2 py-0.5 rounded shrink-0">
            <Bell className="w-3 h-3" />
            <span>Notice</span>
          </span>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-slate-100 font-medium truncate text-xs sm:text-sm">
            {pinnedStory.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onReadStory(pinnedStory)}
            className="inline-flex items-center gap-1.5 bg-[var(--color-pitch-ink)] hover:border-emerald-500/70 text-emerald-400 hover:text-emerald-300 font-semibold text-xs px-2.5 py-1 rounded-md border border-[var(--color-border-dark)] transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[var(--color-pitch-ink)] cursor-pointer transition-colors"
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
