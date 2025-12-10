

import React from 'react';

export const XCircleCurrentWeekIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Main colored circle */}
    <circle cx="12" cy="12" r="9.75" />
    {/* Inner white ring */}
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="1.5" />
    {/* X symbol, filled white */}
    {/* FIX: Replaced invalid SVG path data with a valid path for an 'X' symbol. */}
    <path
      d="M15.5 9.5l-6 6m0-6l6 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);