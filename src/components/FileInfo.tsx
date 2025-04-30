
import React from "react";
import { Clock, FileType, HardDrive } from "lucide-react";

interface FileInfoProps {
  file: File;
}

export const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
  // Format file size in a readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h4 className="font-medium text-gray-800">{file.name}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <FileType className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-medium">
              {file.type || getFileExtension(file.name).toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Size</p>
            <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Last Modified</p>
            <p className="text-sm font-medium">{formatDate(new Date(file.lastModified))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
