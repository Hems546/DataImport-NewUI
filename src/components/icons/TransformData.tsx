
import React from 'react';

const TransformData = (props: React.SVGProps<SVGSVGElement>) => {
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
      <path d="M20 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
      <path d="M8 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
      <path d="M16 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
      <path d="m20 5-3 3-3-3" />
      <path d="m6 19 3-3 3 3" />
      <path d="M12 8v6" />
      <path d="M4 5h12" />
      <path d="M8 19h8" />
    </svg>
  );
};

export default TransformData;
