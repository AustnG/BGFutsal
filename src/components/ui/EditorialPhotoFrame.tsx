import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LEAGUE_LOGOS } from '../../data/mediaAssets';

interface EditorialPhotoFrameProps {
  src?: string;
  alt: string;
  aspect?: '4/3' | '16/9';
  kicker: string;
  metaRight?: string;
  title: string;
  caption?: string;
  footerLeft?: React.ReactNode;
  footerLabel?: string;
  onClick?: () => void;
}

export const EditorialPhotoFrame: React.FC<EditorialPhotoFrameProps> = ({
  src,
  alt,
  aspect = '4/3',
  kicker,
  metaRight,
  title,
  caption,
  footerLeft,
  footerLabel,
  onClick,
}) => {
  const aspectClass = aspect === '16/9' ? 'aspect-video' : 'aspect-[4/3]';
  const cleanSrc = src?.trim();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [cleanSrc]);

  const showImage = Boolean(cleanSrc) && !imgError;

  return (
    <article
      onClick={onClick}
      className={`group bg-[var(--color-surface)] rounded-lg border border-[var(--color-border-hairline)] overflow-hidden flex flex-col justify-between transition-colors ${
        onClick
          ? 'cursor-pointer hover:border-emerald-600/60'
          : ''
      }`}
    >
      <div>
        <div
          className={`relative ${aspectClass} overflow-hidden border-b border-[var(--color-border-hairline)] ${
            showImage ? 'bg-[var(--color-pitch-ink)]' : 'bg-[var(--color-surface-muted)]'
          }`}
        >
          {showImage ? (
            <img
              src={cleanSrc}
              alt={alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img
                src={LEAGUE_LOGOS.blackWide}
                alt="BG Futsal"
                loading="lazy"
                className="max-h-full max-w-[72%] object-contain opacity-85 group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          )}
        </div>

        <div className="p-3.5 sm:p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.08em]">
            <span className="text-[var(--color-brand-green)] font-semibold truncate">
              {kicker}
            </span>
            {metaRight && (
              <span className="text-[var(--color-ink-subtle)] tabular-nums shrink-0 truncate max-w-[55%]">
                {metaRight}
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-brand-green)] transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {caption && (
            <p className="text-xs text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
              {caption}
            </p>
          )}
        </div>
      </div>

      {(footerLeft || footerLabel) && (
        <div className="px-3.5 sm:px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[var(--color-ink-subtle)] truncate">
            {footerLeft}
          </span>
          {footerLabel && (
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand-green)] shrink-0">
              <span>{footerLabel}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      )}
    </article>
  );
};
