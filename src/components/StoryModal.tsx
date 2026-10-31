import React from 'react';
import { X, Calendar, User, Newspaper, Pin } from 'lucide-react';
import { NewsStory } from '../types/league';

interface StoryModalProps {
  story: NewsStory | null;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => {
  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cover Photo if present */}
        {story.imageUrl && (
          <div className="h-48 sm:h-56 w-full relative bg-slate-900 shrink-0">
            <img
              src={story.imageUrl}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Header if no image */}
        {!story.imageUrl && (
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-semibold">
              {story.category}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
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

          <h2 className="text-lg sm:text-xl font-semibold text-[#0a1526] leading-snug tracking-tight">
            {story.title}
          </h2>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5 font-normal pt-1">
            <p>{story.content || story.summary}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0a1526] bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close Story
          </button>
        </div>
      </div>
    </div>
  );
};
