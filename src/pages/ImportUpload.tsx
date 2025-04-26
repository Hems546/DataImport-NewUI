
import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import ProgressStep from '@/components/ProgressStep';
import StepConnector from '@/components/StepConnector';
import ImportHeader from '@/components/import/ImportHeader';
import UploadProgress from '@/components/import/UploadProgress';
import FileUploadZone from '@/components/import/FileUploadZone';
import ImportFooter from '@/components/import/ImportFooter';

const ImportUpload = () => {
  const handleFileSelected = (file: File) => {
    console.log('File selected:', file);
    // Handle file selection logic here
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />
      <ImportHeader />
      <UploadProgress />
      
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
          
          <FileUploadZone onFileSelected={handleFileSelected} />
          <ImportFooter />
        </Card>
      </main>
    </div>
  );
};

export default ImportUpload;
