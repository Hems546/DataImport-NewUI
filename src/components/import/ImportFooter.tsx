
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImportFooter = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/import-wizard');
  };

  const handleContinue = () => {
    // Navigate to the next step
    // navigate('/import-wizard/map');
  };

  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Button>
      
      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
          <path d="m10 10 4 4" />
          <path d="m14 10-4 4" />
        </svg>
        Start Over
      </Button>
      
      <Button className="bg-brand-purple hover:bg-brand-purple/90" onClick={handleContinue}>
        Continue
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </div>
  );
};

export default ImportFooter;
