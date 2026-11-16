import React, { useEffect, useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { LEAGUE_LOGOS } from '../../data/mediaAssets';

export interface PageHeaderStat {
  label: string;
  value: string;
  tone?: 'default' | 'green' | 'blue';
}

interface EditorialPageHeaderProps {
  variant?: 'editorial';
  kicker: string;
  kickerMeta?: string;
  title: string;
  subtitle?: string;
  description: string;
  stats?: PageHeaderStat[];
  badges?: React.ReactNode;
}

interface FeaturePageHeaderProps {
  variant: 'feature';
  badgeLabel?: string;
  kicker: string;
  kickerMeta?: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  ctaLabel?: string;
  onClick?: () => void;
}

export type PageHeaderProps = EditorialPageHeaderProps | FeaturePageHeaderProps;

export const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const featureImageUrl = props.variant === 'feature' ? props.imageUrl?.trim() : undefined;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [featureImageUrl]);

  if (props.variant === 'feature') {
    const {
      badgeLabel,
      kicker,
      kickerMeta,
      title,
      description,
      imageAlt,
      author,
      ctaLabel = 'Read Story',
      onClick,
    } = props;

    const showHeroImage = Boolean(featureImageUrl) && !imgError;

    return (
      <section
        onClick={onClick}
        className={`relative overflow-hidden bg-[var(--color-pitch-ink)] text-white rounded-xl border border-[var(--color-border-dark)] transition-colors ${
          onClick ? 'cursor-pointer hover:border-emerald-500/60 group' : ''
        }`}
      >
        <div className="h-[2px] w-full accent-rule-gradient" />

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
          <div className="lg:col-span-7 aspect-video lg:aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#040B16] border border-[var(--color-border-dark)]">
            {showHeroImage ? (
              <img
                src={featureImageUrl}
                alt={imageAlt || title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-[var(--color-pitch-surface)] flex flex-col items-center justify-center gap-2.5 p-6">
                <img
                  src={LEAGUE_LOGOS.whiteSquare}
                  alt="BG Futsal"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-95 group-hover:scale-[1.03] transition-transform duration-300"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  Official League Dispatch
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                {badgeLabel && (
                  <span className="px-2 py-0.5 rounded bg-[var(--color-pitch-surface)] border border-[var(--color-border-dark)] text-emerald-400 font-semibold">
                    {badgeLabel}
                  </span>
                )}
                <span className="text-emerald-400 font-semibold">{kicker}</span>
                {kickerMeta && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 tabular-nums">{kickerMeta}</span>
                  </>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white tracking-[-0.025em] leading-snug group-hover:text-emerald-300 transition-colors">
                {title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="pt-3.5 border-t border-[var(--color-border-dark)] flex items-center justify-between text-xs">
              {author ? (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{author}</span>
                </span>
              ) : (
                <span />
              )}

              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <span>{ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { kicker, kickerMeta, title, subtitle, description, stats, badges } = props;

  return (
    <section className="relative overflow-hidden bg-[var(--color-pitch-ink)] text-white rounded-xl border border-[var(--color-border-dark)]">
      <div className="h-[2px] w-full accent-rule-gradient" />

      <div className="p-6 sm:p-8 space-y-5">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">{kicker}</span>
            {kickerMeta && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">{kickerMeta}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.025em] text-white leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm sm:text-base font-semibold text-emerald-400">{subtitle}</p>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>

          {badges && <div className="flex flex-wrap items-center gap-2.5 pt-1">{badges}</div>}
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--color-border-dark)]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-3.5 py-2.5 bg-[var(--color-pitch-surface)] border border-[var(--color-border-dark)] rounded-lg space-y-0.5"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400 block">
                  {stat.label}
                </span>
                <span
                  className={`font-mono text-sm font-semibold tabular-nums block truncate ${
                    stat.tone === 'green'
                      ? 'text-emerald-400'
                      : stat.tone === 'blue'
                      ? 'text-blue-400'
                      : 'text-white'
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
