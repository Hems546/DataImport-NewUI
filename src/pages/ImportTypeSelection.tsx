
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ImportCard from '@/components/ImportCard';

const ImportTypeSelection = () => {
  const navigate = useNavigate();
  
  const handleSelectImportType = () => {
    navigate('/import-wizard/upload');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />
      <main className="flex-1 flex flex-col items-center max-w-5xl mx-auto px-4 py-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-4">Select Import Type</h1>
          <p className="text-center text-muted-foreground mb-8">
            Choose the type of data you want to import. Each import type has specific field mappings and validation rules.
          </p>
          
          <div className="space-y-4">
            <ImportCard
              title="Single File Import"
              description="Import data from a single CSV or Excel file"
              icon={
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
            
            <ImportCard
              title="Multiple Files Import"
              description="Import and combine data from multiple files"
              icon={
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#805AD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                    <path d="M22 12V5a2 2 0 0 0-2-2H9" />
                    <path d="m21 17-5-5" />
                    <path d="M16 17h5v-5" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
            
            <ImportCard
              title="Append Data"
              description="Add data to an existing dataset"
              icon={
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
            
            <ImportCard
              title="Customer Import"
              description="Import customer data including contact information"
              icon={
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
            
            <ImportCard
              title="Product Catalog"
              description="Import product details including pricing and inventory"
              icon={
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
            
            <ImportCard
              title="Transaction Records"
              description="Import historical transaction data"
              icon={
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#805AD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              }
              onClick={handleSelectImportType}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportTypeSelection;
