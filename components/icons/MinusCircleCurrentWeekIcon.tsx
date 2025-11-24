
import React from 'react';

export const MinusCircleCurrentWeekIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Main colored circle */}
    <circle cx="12" cy="12" r="9.75" />
    {/* Inner white ring */}
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="1.5" />
    {/* Minus symbol, filled white */}
    <path
      d="M8.25 10.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
      fill="white"
    />
  </svg>
);
