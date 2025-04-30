
import React from 'react';

const ClipboardCheck = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 4v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4"></path>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <path d="m9 14 2 2 4-4"></path>
    </svg>
  );
};

export default ClipboardCheck;
