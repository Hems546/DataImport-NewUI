import React, { createContext, useContext, useState } from 'react';

interface ImportContextType {
  selectedImportType: string | null;
  selectedImportTypeName: string | null;
  setSelectedImportType: (typeId: string) => void;
  setSelectedImportTypeName: (typeName: string) => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: { children: React.ReactNode }) {
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null);
  const [selectedImportTypeName, setSelectedImportTypeName] = useState<string | null>(null);

  return (
    <ImportContext.Provider value={{ 
      selectedImportType, 
      selectedImportTypeName,
      setSelectedImportType,
      setSelectedImportTypeName
    }}>
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
} 