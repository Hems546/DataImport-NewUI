
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import ProgressStep from '@/components/ProgressStep';
import StepConnector from '@/components/StepConnector';

const ImportUpload = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
  };
  
  const handleBack = () => {
    navigate('/import-wizard');
  };
  
  const handleContinue = () => {
    // Navigate to the next step
    // navigate('/import-wizard/map');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />
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
      
      <div className="bg-white p-4 shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>Upload Progress</div>
            <div className="text-right">16% Complete</div>
          </div>
          <Progress value={16} className="h-2 mt-2" />
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Upload Data</h2>
          
          <div className="flex justify-center mb-12">
            <div className="flex items-center w-full max-w-4xl">
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                }
                label="Upload File"
                isActive={true}
              />
              
              <StepConnector />
              
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                label="Verify File"
              />
              
              <StepConnector />
              
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
                label="Map Columns"
              />
              
              <StepConnector />
              
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                }
                label="Data Quality"
              />
              
              <StepConnector />
              
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2v20h-8.315c-.55-.6-1.152-1.2-1.76-1.8a7.369 7.369 0 0 1-1.507 3.144 9.843 9.843 0 0 1-2.276-3.272A13.92 13.92 0 0 0 2 22V2h20Z" />
                    <path d="M6 16.898A20.99 20.99 0 0 1 12.779 14c.452.295.882.611 1.285.945" />
                    <path d="M2 8h20" />
                    <path d="M2 14h8" />
                  </svg>
                }
                label="Transform Data"
              />
              
              <StepConnector />
              
              <ProgressStep 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5Z" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                }
                label="Preview & Import"
              />
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">Upload Your Data File</h3>
            <p className="text-muted-foreground mb-6">
              Upload a CSV or Excel file to begin the import process. Your file should include header rows.
            </p>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragging ? "border-brand-purple bg-brand-purple/5" : "border-gray-200 hover:border-brand-purple/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <p className="text-lg mb-2">
                Drag & drop your file here, or <span className="text-brand-purple">browse</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Supports CSV, XLS, XLSX (max 10MB)
              </p>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button>Select File</Button>
            </div>
          </div>
          
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
        </Card>
      </main>
    </div>
  );
};

export default ImportUpload;
