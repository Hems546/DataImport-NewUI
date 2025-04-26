
import React from 'react';

const DataQuality = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 10v3a4 4 0 0 1-4 4h-2" />
      <path d="M2 10v3a4 4 0 0 0 4 4h2" />
      <circle cx="12" cy="15" r="2" />
      <path d="M6 4.5a6 6 0 0 1 12 0" />
      <path d="m9 7 3-3 3 3" />
      <path d="M9 16h6" />
    </svg>
  );
};

export default DataQuality;
