import React, { useState } from 'react';
import { Newspaper, Calendar, User, ArrowRight, X, Pin, Sparkles } from 'lucide-react';
import { NewsStory, StoryCategory } from '../types/league';

interface NewsStoriesViewProps {
  stories: NewsStory[];
  onOpenStoryModal: (story: NewsStory) => void;
}

export const NewsStoriesView: React.FC<NewsStoriesViewProps> = ({
  stories,
  onOpenStoryModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'All'>('All');

  const categories: (StoryCategory | 'All')[] = [
    'All',
    'Announcement',
    'Matchday Recap',
    'Feature Story',
    'Registration',
  ];

  const filteredStories = stories.filter((s) =>
    selectedCategory === 'All' ? true : s.category === selectedCategory
  );

  const heroStory = filteredStories.find((s) => s.pinned) || filteredStories[0];
  const remainingStories = filteredStories.filter((s) => s.id !== heroStory?.id);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-600" />
            <span>League News & Stories</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official announcements, tournament updates, and match recaps from the BGFutsal organizers.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Featured Story Card */}
      {heroStory && (
        <div
          onClick={() => onOpenStoryModal(heroStory)}
          className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          {/* Hero Image Side */}
          <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[260px] bg-slate-900 overflow-hidden">
            {heroStory.imageUrl ? (
              <img
                src={heroStory.imageUrl}
                alt={heroStory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center p-8 text-emerald-200">
                <Newspaper className="w-16 h-16 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Hero Content Side */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                {heroStory.pinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300/60">
                    <Pin className="w-3 h-3" />
                    <span>Pinned Announcement</span>
                  </span>
                )}
                <span className="text-slate-500 font-semibold">{heroStory.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{heroStory.date}</span>
              </div>

              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {heroStory.title}
              </h3>

              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {heroStory.summary}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{heroStory.author}</span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Story Cards Grid */}
      {remainingStories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remainingStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onOpenStoryModal(story)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
            >
              {/* Card Image */}
              <div className="h-48 relative bg-slate-900 overflow-hidden">
                {story.imageUrl ? (
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-500">
                    <Newspaper className="w-10 h-10 opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-sm shadow-xs">
                    {story.category}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{story.date}</span>
                    <span>·</span>
                    <span>{story.author}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {story.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
