
import React, { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes: string[];
  maxSizeMB: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  acceptedFileTypes = ['.csv', '.xls', '.xlsx'],
  maxSizeMB = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isValidType = acceptedFileTypes.some(type => 
      type.toLowerCase() === `.${fileExt}` ||
      type.toLowerCase() === fileExt
    );
    
    if (!isValidType) {
      setError(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size: ${maxSizeMB}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
        />

        <Upload className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 font-medium">
          Drag & drop or click to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {acceptedFileTypes.join(', ')} (Max {maxSizeMB}MB)
        </p>
        
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileInput();
          }}
        >
          Select File
        </Button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            className="text-red-500 hover:text-red-700" 
            onClick={(e) => {
              e.stopPropagation();
              clearError();
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
