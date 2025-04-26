
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
}

const FileUploadZone = ({ onFileSelected }: FileUploadZoneProps) => {
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  return (
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
  );
};

export default FileUploadZone;
