

import React from 'react';

export const CheckCircleCurrentWeekIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Main colored circle (color from props.className) */}
    <circle cx="12" cy="12" r="9.75" />
    {/* Inner white ring */}
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="1.5" />
    {/* Checkmark symbol, filled white */}
    {/* FIX: Replaced invalid SVG path data with a valid path for a checkmark. */}
    <path
      d="M9.7 15.3l-3.5-3.5c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l2.8 2.8 6.3-6.3c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0z"
      fill="white"
    />
  </svg>
);