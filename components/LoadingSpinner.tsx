import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class like 'text-highlight-gold'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-highlight-gold' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex justify-center items-center my-8">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }} // Required for some Tailwind versions with JIT
      ></div>
    </div>
  );
};

export default LoadingSpinner;