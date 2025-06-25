import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ImportCard from '@/components/ImportCard';
import { FileText, UserCircle, Package, Receipt, Users, WalletCardsIcon} from 'lucide-react';
import { ImportTypeConfig } from '@/data/importTypeConfigs';
import { preflightService, PreflightType } from '@/services/preflightService';
import { useToast } from '@/hooks/use-toast';
import { useImport } from '@/contexts/ImportContext';
import { Loading } from '@/components/ui/loading';

const ImportTypeSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSelectedImportType, setSelectedImportTypeName } = useImport();
  const [importTypes, setImportTypes] = useState<ImportTypeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadImportTypes = async () => {
      try {
        const preflightTypes = await preflightService.getPreflightTypeData();
        const convertedTypes: ImportTypeConfig[] = preflightTypes.map((type: PreflightType) => ({
          id: type.Value.toString(),
          title: type.Display,
          description: type.Display,
          icon: getIconForType(type.Display),
          iconColor: getColorForType(type.Display),
          enabled: type.IsSelected
        }));
        setImportTypes(convertedTypes);
      } catch (error) {
        console.error('Error loading import types:', error);
        toast({
          title: "Error",
          description: "Failed to load import types. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadImportTypes();
  }, [toast]);

  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      'Mirabel Application Users & Sales Reps': 'UserCircle',
      'Company & Contact Data': 'Users',
      'Orders/Sales': 'Package',
      'Contact/Company Notes': 'FileText',
      'Accounts Receivables - Open Invoices': 'Receipt',
      'Subscriptions & Subscribers (for ChargeBrite)': 'Receipt',
      'Rate Cards': 'WalletCardsIcon',
      'Orum Notes': 'FileText'
    };
    return iconMap[type] || 'FileText';
  };

  const getColorForType = (type: string): string => {
    const colorMap: Record<string, string> = {
      'Mirabel Application Users & Sales Reps': '#4F46E5',
      'Company & Contact Data': '#10B981',
      'Orders/Sales': '#F59E0B',
      'Contact/Company Notes': '#6366F1',
      'Accounts Receivables - Open Invoices': '#ED8936',
      'Subscriptions & Subscribers (for ChargeBrite)': '#8B5CF6',
      'Rate Cards': '#EC4899',
      'Orum Notes': '#14B8A6'
    };
    return colorMap[type] || '#6B7280';
  };

  const handleSelectImportType = (typeId: string, typeName: string) => {
    setSelectedImportType(typeId);
    setSelectedImportTypeName(typeName);
    navigate('/import-wizard/upload');
  };
  
  // Map icon names to actual components
  const iconComponents: Record<string, React.ReactNode> = {
    UserCircle: <UserCircle size={20} />,
    Package: <Package size={20} />,
    Receipt: <Receipt size={20} />,
    Users: <Users size={20} />,
    FileText: <FileText size={20} />,
    WalletCardsIcon: <WalletCardsIcon size={20} />,
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header currentPage="import" />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Loading message="Loading import types..." />
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                including CSV or Excel files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importTypes.map((importType) => (
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
                  onClick={() => handleSelectImportType(importType.id, importType.title)}
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
