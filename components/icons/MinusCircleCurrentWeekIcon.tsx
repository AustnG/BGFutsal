

import React from 'react';

export const MinusCircleCurrentWeekIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Main colored circle */}
    <circle cx="12" cy="12" r="9.75" />
    {/* Inner white ring */}
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="1.5" />
    {/* Minus symbol, filled white */}
    {/* FIX: Replaced invalid SVG path data with a valid path for a minus sign. */}
    <path
      d="M17 11H7c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1-.4 1-1s-.4-1-1-1z"
      fill="white"
    />
  </svg>
);