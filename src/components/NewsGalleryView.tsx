import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Camera,
  Search,
  Filter,
  Sparkles,
  Calendar,
  User,
  ArrowRight,
  MapPin,
  Trophy,
  Zap,
  Shield,
  Heart,
  Eye,
  X,
} from 'lucide-react';
import { NewsStory } from '../types/league';
import { LEAGUE_PHOTOS, MediaPhoto } from '../data/mediaAssets';
import { StoryModal } from './StoryModal';
import { ImageLightbox } from './ImageLightbox';

interface NewsGalleryViewProps {
  stories: NewsStory[];
  onOpenStoryModal?: (story: NewsStory) => void;
}

type UnifiedMediaItem =
  | {
      id: string;
      kind: 'article';
      title: string;
      date: string;
      timestamp: number;
      category: string;
      categoryLabel: string;
      summary: string;
      author: string;
      imageUrl?: string;
      article: NewsStory;
    }
  | {
      id: string;
      kind: 'photo';
      title: string;
      date?: string;
      timestamp: number;
      category: string;
      categoryLabel: string;
      location: string;
      caption: string;
      src: string;
      photo: MediaPhoto;
    };

export const NewsGalleryView: React.FC<NewsGalleryViewProps> = ({
  stories,
  onOpenStoryModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<MediaPhoto | null>(null);
  const [localSelectedStory, setLocalSelectedStory] = useState<NewsStory | null>(null);

  // Combine news stories and photo assets into a unified media stream
  const unifiedStream = useMemo<UnifiedMediaItem[]>(() => {
    const articleItems: UnifiedMediaItem[] = stories.map((s, index) => {
      const parsedTime = new Date(s.date).getTime();
      return {
        id: `story-${s.id}`,
        kind: 'article',
        title: s.title,
        date: s.date,
        timestamp: isNaN(parsedTime) ? Date.now() - index * 86400000 : parsedTime,
        category: s.category.toLowerCase().replace(/\s+/g, '_'),
        categoryLabel: s.category,
        summary: s.summary,
        author: s.author,
        imageUrl: s.imageUrl,
        article: s,
      };
    });

    const photoItems: UnifiedMediaItem[] = LEAGUE_PHOTOS.map((p, index) => {
      return {
        id: `photo-${p.id}`,
        kind: 'photo',
        title: p.title,
        date: p.date,
        // Give photos realistic chronological distribution around fixtures
        timestamp: Date.now() - (index + 1) * 3 * 86400000,
        category: p.category,
        categoryLabel: p.categoryLabel,
        location: p.location,
        caption: p.caption,
        src: p.src,
        photo: p,
      };
    });

    // Merge and sort in reverse chronological order (newest first)
    return [...articleItems, ...photoItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [stories]);

  // Filter options
  const filterTabs = [
    { id: 'all', label: 'All Media', count: unifiedStream.length, icon: Sparkles },
    {
      id: 'articles',
      label: 'News Articles',
      count: stories.length,
      icon: Newspaper,
    },
    {
      id: 'photos',
      label: 'Match Photos',
      count: LEAGUE_PHOTOS.length,
      icon: Camera,
    },
    {
      id: 'championship',
      label: 'Championships',
      count: unifiedStream.filter(
        (item) =>
          item.category.includes('champ') ||
          item.title.toLowerCase().includes('championship') ||
          item.title.toLowerCase().includes('trophy')
      ).length,
      icon: Trophy,
    },
    {
      id: 'action',
      label: 'On-Court Action',
      count: unifiedStream.filter(
        (item) => item.category === 'action' || item.category === 'matchday_recap'
      ).length,
      icon: Zap,
    },
  ];

  // Filter and search computation
  const filteredItems = useMemo(() => {
    return unifiedStream.filter((item) => {
      // 1. Tab Filtering
      if (activeFilter === 'articles' && item.kind !== 'article') return false;
      if (activeFilter === 'photos' && item.kind !== 'photo') return false;
      if (
        activeFilter === 'championship' &&
        !item.category.includes('champ') &&
        !item.title.toLowerCase().includes('championship') &&
        !item.title.toLowerCase().includes('trophy')
      ) {
        return false;
      }
      if (
        activeFilter === 'action' &&
        item.category !== 'action' &&
        item.category !== 'matchday_recap'
      ) {
        return false;
      }

      // 2. Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const categoryMatch = item.categoryLabel.toLowerCase().includes(q);
        const textMatch =
          item.kind === 'article'
            ? item.summary.toLowerCase().includes(q) ||
              (item.article.content && item.article.content.toLowerCase().includes(q))
            : item.caption.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);

        return titleMatch || categoryMatch || textMatch;
      }

      return true;
    });
  }, [unifiedStream, activeFilter, searchQuery]);

  const handleOpenStory = (story: NewsStory) => {
    if (onOpenStoryModal) {
      onOpenStoryModal(story);
    } else {
      setLocalSelectedStory(story);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071324] via-[#0b1f3a] to-[#06111f] text-white rounded-2xl p-6 sm:p-8 border border-[#162d4e] shadow-lg">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              BGFutsal Media Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            News & Gallery
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            The complete chronicle of the Bowling Green Futsal League. Explore historical news announcements, tactical recaps, trophy ceremonies, and match action from F.O. Moxley Community Center.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-[#09182d] border border-[#1a3357] px-3 py-1 rounded-lg">
              <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-medium">{stories.length} Articles</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#09182d] border border-[#1a3357] px-3 py-1 rounded-lg">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-medium">{LEAGUE_PHOTOS.length} Action Photos</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#09182d] border border-[#1a3357] px-3 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-medium">F.O. Moxley Community Center</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs border border-slate-700 font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Real-time Keyword Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news or photos..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Count indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> items in unified stream
          </span>
          {searchQuery && (
            <span className="text-emerald-700 font-medium">
              Filtered by "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* 3. UNIFIED MEDIA STREAM GRID */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => {
            if (item.kind === 'article') {
              // EDITORIAL NEWS ARTICLE CARD
              return (
                <article
                  key={item.id}
                  onClick={() => handleOpenStory(item.article)}
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Feature Image Banner */}
                    <div className="relative aspect-[16/9] bg-[#071324] overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#071324] to-[#0d223f]">
                          <Newspaper className="w-8 h-8 text-emerald-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071222]/90 backdrop-blur-md border border-[#1b2d4b] text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold shadow-xs">
                        <Newspaper className="w-3 h-3 text-emerald-400" />
                        <span>News Article</span>
                      </div>

                      {/* Publish Date on Image */}
                      <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-300 font-medium">
                        {item.date}
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-semibold">
                        {item.categoryLabel}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[60%]">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.author}</span>
                    </span>

                    <span className="font-semibold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1 text-xs">
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              );
            } else {
              // VISUAL PHOTO HIGHLIGHT CARD
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhoto(item.photo)}
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Photo Viewport */}
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

                      {/* Photo Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071222]/85 backdrop-blur-md border border-[#1b2d4b] text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold shadow-xs">
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>{item.categoryLabel}</span>
                      </div>

                      {/* Inspect Icon on Hover */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-md">
                          <Eye className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>

                      {/* Location Badge */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                        <span className="flex items-center gap-1 truncate max-w-[80%]">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        {item.date && (
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        )}
                      </div>
                    </div>

                    {/* Photo Meta */}
                    <div className="p-4 sm:p-5 space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {item.caption}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium">
                    <span>Full photo lightbox</span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No media items found matching your filters.</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Story Modal */}
      {localSelectedStory && (
        <StoryModal
          story={localSelectedStory}
          onClose={() => setLocalSelectedStory(null)}
        />
      )}

      {/* Photo Lightbox */}
      <ImageLightbox
        photo={selectedPhoto}
        photos={LEAGUE_PHOTOS}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(photo) => setSelectedPhoto(photo)}
      />
    </div>
  );
};
