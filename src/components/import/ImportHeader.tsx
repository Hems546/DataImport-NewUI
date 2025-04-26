
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImportHeader = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/import-wizard');
  };
  
  return (
    <div className="bg-brand-purple/90 text-white p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white p-2" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </Button>
          <h2 className="text-xl font-medium">Data Import</h2>
          <Button variant="ghost" className="text-yellow-300 bg-white/10 text-sm hover:bg-white/20 p-1.5 h-auto border border-yellow-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Test Data Quality
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M10.967 9.225a3.65 3.65 0 1 0 5.302-5.024 3.65 3.65 0 0 0-5.302 5.024" />
              <path d="M7.83 12.342a3.65 3.65 0 1 0-5.303 5.024 3.65 3.65 0 0 0 5.302-5.024Z" />
              <path d="M16.195 16.195a3.65 3.65 0 1 0 5.303-5.024 3.65 3.65 0 0 0-5.303 5.024Z" />
              <path d="m6.634 16.772 11.04-9.263" />
              <path d="m6.593 7.232 11.04 9.263" />
            </svg>
            Validation Glossary
          </Button>
          
          <Button variant="ghost" className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M13 2v7h7" />
              <path d="M5 12h8" />
              <path d="M5 16h8" />
              <path d="M5 8h2" />
            </svg>
            Audit History
            <span className="ml-1 bg-white text-brand-purple text-xs px-1 rounded-full">10</span>
          </Button>
          
          <Button variant="ghost" className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            File History
            <span className="ml-1 bg-white text-brand-purple text-xs px-1 rounded-full">10</span>
          </Button>
          
          <Button variant="ghost" className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportHeader;
