import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8 md:mb-12 text-center">
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-light-text uppercase tracking-wider mb-2">{title}</h1>
      {subtitle && <p className="text-lg text-secondary-text max-w-3xl mx-auto">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;