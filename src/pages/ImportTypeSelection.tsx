
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ImportCard from '@/components/ImportCard';
import { FileText, UserCircle, Package, Receipt, Users } from 'lucide-react';
import { ImportTypeConfig, defaultImportTypes } from '@/data/importTypeConfigs';

const ImportTypeSelection = () => {
  const navigate = useNavigate();
  const [importTypes, setImportTypes] = useState<ImportTypeConfig[]>([]);
  
  useEffect(() => {
    // Load import type configurations from localStorage or use defaults
    const savedConfig = localStorage.getItem("importTypeConfigs");
    setImportTypes(savedConfig ? JSON.parse(savedConfig) : defaultImportTypes);
  }, []);

  const handleSelectImportType = (typeId: string) => {
    // Handle type selection logic
    navigate('/import-wizard/upload');
  };
  
  // Map icon names to actual components
  const iconComponents: Record<string, React.ReactNode> = {
    UserCircle: <UserCircle size={20} />,
    Package: <Package size={20} />,
    Receipt: <Receipt size={20} />,
    Users: <Users size={20} />,
    FileText: <FileText size={20} />,
  };
  
  // Filter to only show enabled import types
  const enabledImportTypes = importTypes.filter(type => type.enabled);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import" />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Import Data</h1>
              <p className="text-gray-600">
                Select the type of data you want to import. You can import data from various sources
                including CSV, Excel, or JSON files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enabledImportTypes.map((importType) => (
                <ImportCard
                  key={importType.id}
                  title={importType.title}
                  description={importType.description}
                  icon={
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${importType.iconColor}15` }}
                    >
                      {React.cloneElement(
                        iconComponents[importType.icon] as React.ReactElement, 
                        { stroke: importType.iconColor }
                      )}
                    </div>
                  }
                  onClick={() => handleSelectImportType(importType.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportTypeSelection;
