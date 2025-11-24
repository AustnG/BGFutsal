
import React from 'react';

export const XCircleCurrentWeekIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Main colored circle */}
    <circle cx="12" cy="12" r="9.75" />
    {/* Inner white ring */}
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="1.5" />
    {/* X symbol, filled white */}
    <path
      d="M10.5 10.5a.75.75 0 011.06 0L12 11.44l.44-.44a.75.75 0 011.06 1.06L13.06 12l.44.44a.75.75 0 11-1.06 1.06L12 13.06l-.44.44a.75.75 0 01-1.06-1.06L11.44 12l-.44-.44a.75.75 0 010-1.06z"
      fill="white"
    />
  </svg>
);
