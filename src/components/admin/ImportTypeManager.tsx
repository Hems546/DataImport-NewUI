import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { preflightService, PreflightType, ImportTypeConfig } from "@/services/preflightService";
import { 
  UserCircle, 
  Package, 
  Receipt, 
  Users,
  FileText,
  WalletCardsIcon
} from "lucide-react";

const ImportTypeManager = () => {
  const [importTypes, setImportTypes] = useState<ImportTypeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Helper functions to get icon and color for type
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
  
  const refreshData = async () => {
    setIsLoading(true);
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
      toast({
        title: "Data Refreshed",
        description: "Import types have been refreshed from the backend.",
      });
    } catch (error) {
      console.error('Error refreshing import types:', error);
      toast({
        title: "Error",
        description: "Failed to refresh import types. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map of icon names to their components
  const iconMap: Record<string, React.ReactNode> = {
    UserCircle: <UserCircle />,
    Package: <Package />,
    Receipt: <Receipt />,
    Users: <Users />,
    FileText: <FileText />,
    WalletCardsIcon: <WalletCardsIcon />
  };
  
  // Render the icon based on its name
  const renderIcon = (iconName: string, color: string) => {
    const icon = iconMap[iconName];
    
    // If the icon exists, clone it with the right props
    if (icon) {
      return React.cloneElement(icon as React.ReactElement, { 
        size: 24, 
        color: color 
      });
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Import Types Configuration</h2>
            <p className="text-gray-600">View import types that are configured in the system</p>
          </div>
        </div>
        <Loading message="Loading import types configuration..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Import Types Configuration</h2>
          <p className="text-gray-600">View import types that are configured in the system</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refreshData}>Refresh Data</Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Icon</TableHead>
            <TableHead>Import Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {importTypes.map((importType) => (
            <TableRow key={importType.id}>
              <TableCell>
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${importType.iconColor}15` }}>
                  {renderIcon(importType.icon, importType.iconColor)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{importType.title}</TableCell>
              <TableCell>{importType.description}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch 
                    checked={importType.enabled} 
                    disabled={true}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Import type configurations are now managed through the backend system. 
          The status shown reflects the current backend configuration. To modify these settings, 
          please use the appropriate backend administration tools.
        </p>
      </div>
    </div>
  );
};

export default ImportTypeManager;
