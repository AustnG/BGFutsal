import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react';
import { MediaPhoto } from '../data/mediaAssets';

interface ImageLightboxProps {
  photo: MediaPhoto | null;
  photos: MediaPhoto[];
  onClose: () => void;
  onSelectPhoto: (photo: MediaPhoto) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}) => {
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [photo, photos]);

  if (!photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const totalCount = photos.length;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
    } else {
      onSelectPhoto(photos[totalCount - 1]);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < totalCount - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
    } else {
      onSelectPhoto(photos[0]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <span className="font-mono text-emerald-400 font-semibold">
            {currentIndex + 1} / {totalCount}
          </span>
          <span className="text-slate-600">·</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-emerald-300 text-[11px] font-medium">
            {photo.categoryLabel}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close photo preview"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Viewport with Nav Arrows */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden">
        {/* Previous Button */}
        {totalCount > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Image */}
        <div
          className="relative max-h-full max-w-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.src}
            alt={photo.title}
            className="max-h-[72vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/10"
          />
        </div>

        {/* Next Button */}
        {totalCount > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption Bar */}
      <div
        className="w-full bg-gradient-to-t from-black/95 via-black/85 to-transparent px-4 sm:px-8 py-5 z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {photo.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{photo.location}</span>
              </span>
              {photo.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{photo.date}</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {photo.caption}
          </p>
        </div>
      </div>
    </div>
  );
};
