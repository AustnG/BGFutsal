import React, { useEffect, useState } from 'react';
import { X, Calendar, User } from 'lucide-react';
import { NewsStory } from '../types/league';
import { LEAGUE_LOGOS } from '../data/mediaAssets';

interface StoryModalProps {
  story: NewsStory | null;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => {
  const cleanImageUrl = story?.imageUrl?.trim();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [cleanImageUrl]);

  if (!story) return null;

  const showCoverImage = Boolean(cleanImageUrl) && !imgError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cover Photo if present */}
        {showCoverImage ? (
          <div className="h-48 sm:h-56 w-full relative bg-slate-900 shrink-0">
            <img
              src={cleanImageUrl}
              alt={story.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Close story"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Modal Header with White Crest if no cover image */
          <div className="bg-[var(--color-pitch-ink)] border-b border-[var(--color-border-dark)] shrink-0">
            <div className="h-[2px] w-full accent-rule-gradient" />
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={LEAGUE_LOGOS.whiteSquare}
                  alt="BG Futsal"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-emerald-400 font-semibold">
                  {story.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                aria-label="Close story"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Story Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{story.date}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{story.author}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight text-balance">
            {story.title}
          </h2>

          <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal pt-1 whitespace-pre-line">
            {(story.content || story.summary).split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Close story
          </button>
        </div>
      </div>
    </div>
  );
};
