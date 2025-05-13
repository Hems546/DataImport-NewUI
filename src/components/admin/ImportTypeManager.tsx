
import React, { useState } from "react";
import { defaultImportTypes, ImportTypeConfig } from "@/data/importTypeConfigs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

const ImportTypeManager = () => {
  const [importTypes, setImportTypes] = useState<ImportTypeConfig[]>(() => {
    // Try to load from localStorage or use defaults
    const saved = localStorage.getItem("importTypeConfigs");
    return saved ? JSON.parse(saved) : defaultImportTypes;
  });
  
  const { toast } = useToast();
  
  const toggleImportType = (id: string) => {
    const updated = importTypes.map(importType => 
      importType.id === id 
        ? { ...importType, enabled: !importType.enabled } 
        : importType
    );
    setImportTypes(updated);
    
    // Save to localStorage
    localStorage.setItem("importTypeConfigs", JSON.stringify(updated));
    
    const changedType = updated.find(type => type.id === id);
    toast({
      title: `${changedType?.title} ${changedType?.enabled ? 'Enabled' : 'Disabled'}`,
      description: `${changedType?.title} import type has been ${changedType?.enabled ? 'enabled' : 'disabled'}.`,
    });
  };
  
  const saveChanges = () => {
    localStorage.setItem("importTypeConfigs", JSON.stringify(importTypes));
    toast({
      title: "Configuration Saved",
      description: "Your import type configuration has been saved successfully.",
    });
  };
  
  const resetToDefaults = () => {
    setImportTypes(defaultImportTypes);
    localStorage.setItem("importTypeConfigs", JSON.stringify(defaultImportTypes));
    toast({
      title: "Reset to Defaults",
      description: "All import types have been reset to their default configuration.",
    });
  };

  // Dynamically render icons from lucide-react
  const renderIcon = (iconName: string, color: string) => {
    const Icon = (Icons as Record<string, React.ComponentType<{ size?: number, color?: string }>>)[iconName];
    return Icon ? <Icon size={24} color={color} /> : null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Import Types Configuration</h2>
          <p className="text-gray-600">Enable or disable import types that appear in the import wizard</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefaults}>Reset to Defaults</Button>
          <Button onClick={saveChanges}>Save Changes</Button>
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
                    onCheckedChange={() => toggleImportType(importType.id)} 
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImportTypeManager;
