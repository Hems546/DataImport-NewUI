import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enumStatusColor } from '@/constants/importHelpers';

interface ImportStepHeaderProps {
  stepTitle: string;
  status: string;
  docTypeName: string;
  importName: string;
  onImportNameChange: (newName: string) => void;
  currentStep: string;
  completedSteps: string[];
}

export function ImportStepHeader({ 
  stepTitle, 
  status, 
  docTypeName, 
  importName, 
  onImportNameChange,
  currentStep,
  completedSteps
}: ImportStepHeaderProps) {
  const { toast } = useToast();
  const [isEditingImportName, setIsEditingImportName] = useState(false);
  const [editableImportName, setEditableImportName] = useState(importName);

  // Step definitions
  const steps = [
    { id: "FileUpload", label: "File Upload", icon: "upload" },
    { id: "FieldMapping", label: "Column Mapping", icon: "columns" },
    { id: "DataPreflight", label: "File Preflighting", icon: "check" },
    { id: "DataValidation", label: "Data Quality", icon: "quality" },
    { id: "DataVerification", label: "Data Normalization", icon: "transform" },
    { id: "FinalReview", label: "Final Review & Approval", icon: "review" },
    { id: "ImportPush", label: "Import / Push", icon: "upload-cloud" },
  ];

  const getStepIcon = (iconType: string, isActive: boolean, isCompleted: boolean) => {
    const baseClasses = "w-5 h-5";
    
    // For completed steps, show white checkmark
    if (isCompleted) {
      return (
        <svg className={`${baseClasses} text-white`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    const colorClasses = isActive ? "text-white" : "text-gray-400";

    switch (iconType) {
      case "upload":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case "columns":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        );
      case "check":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "quality":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "transform":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "review":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "upload-cloud":
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      default:
        return (
          <svg className={`${baseClasses} ${colorClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  const handleSaveImportName = async () => {
    try {
      if (!editableImportName.trim()) {
        toast({
          title: "Validation Error",
          description: "Import name cannot be empty.",
          variant: "destructive"
        });
        return;
      }

      onImportNameChange(editableImportName.trim());
      setIsEditingImportName(false);
      
      toast({
        title: "Success",
        description: "Import name updated successfully.",
      });
    } catch (error) {
      console.error("Error saving import name:", error);
      toast({
        title: "Error",
        description: "Failed to save import name.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEditImportName = () => {
    setEditableImportName(importName);
    setIsEditingImportName(false);
  };

  const getDisplayStatus = (status: string) => {
    if (!status) return 'Not Started';
    return status;
  };

  const getStatusBadgeStyle = (status: string) => {
    const statusKey = status || 'Not Started';
    const color = enumStatusColor[statusKey as keyof typeof enumStatusColor] || enumStatusColor['Not Started'];
    
    // Convert the color to appropriate CSS classes with modern design
    switch (statusKey.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'error':
      case 'failed':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'in progress':
        return 'bg-blue-500 text-white';
      case 'verification pending':
        return 'bg-violet-500 text-white';
      case 'not started':
      default:
        return 'bg-slate-400 text-white';
    }
  };

  // Update local state when prop changes
  React.useEffect(() => {
    setEditableImportName(importName);
  }, [importName]);

  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header Section */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left side - Title, Status, and Doc Type all in one line */}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 flex-shrink-0">{stepTitle}</h1>
              <Badge 
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 flex-shrink-0 shadow-sm border-0 ${getStatusBadgeStyle(status)}`}
              >
                {/* Dynamic icon based on status */}
                {status?.toLowerCase() === 'success' || status?.toLowerCase() === 'completed' ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : status?.toLowerCase() === 'error' || status?.toLowerCase() === 'failed' ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                ) : status?.toLowerCase() === 'warning' ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : status?.toLowerCase() === 'in progress' ? (
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  </div>
                ) : status?.toLowerCase() === 'verification pending' ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                )}
                {getDisplayStatus(status || 'Not Started')}
              </Badge>
              <div className="flex items-center gap-1.5 text-gray-600 flex-shrink-0">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">{docTypeName || 'Unknown Type'}</span>
              </div>
            </div>
            
            {/* Right side - Editable Import Name - Fill available space */}
            <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
              {isEditingImportName ? (
                <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                  <Input
                    value={editableImportName}
                    onChange={(e) => setEditableImportName(e.target.value)}
                    className="flex-1 max-w-md h-7 text-sm"
                    placeholder="Enter import name"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveImportName}
                    className="h-7 px-2"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEditImportName}
                    className="h-7 px-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate text-right">
                    {importName || 'Untitled Import'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingImportName(true)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="px-8 py-5">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  {/* Step Circle and Icon */}
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 relative z-10
                      ${isCompleted 
                        ? 'bg-green-500 border-2 border-green-500' 
                        : isActive 
                        ? 'bg-blue-500 border-2 border-blue-500' 
                        : 'bg-white border-2 border-gray-300'
                      }
                    `}
                  >
                    {getStepIcon(step.icon, isActive, isCompleted)}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center max-w-[100px]">
                    <span
                      className={`
                        text-xs font-medium leading-tight block
                        ${isCompleted 
                          ? 'text-green-600' 
                          : isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                        }
                      `}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Background connection line */}
            <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-300 z-0"></div>
            
            {/* Completed progress line */}
            {completedSteps.length > 0 && (
              <div 
                className="absolute top-6 left-8 h-0.5 bg-green-500 transition-all duration-300 z-0"
                style={{ 
                  width: `${Math.min((completedSteps.length / (steps.length - 1)) * 100, 100)}%` 
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 