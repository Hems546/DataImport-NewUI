import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enumStatusColor } from '@/constants/importHelpers';
import { preflightService } from '@/services/preflightService';

interface PreflightFileInfo {
  PreflightFileID: number;
  ImportName: string;
  DocTypeID?: number;
  [key: string]: any;
}

interface ImportStepHeaderProps {
  stepTitle: string;
  status: string;
  docTypeName: string;
  importName: string;
  currentStep: string;
  completedSteps: string[];
  preflightFileInfo: any;
  setPreflightFileInfo: (info: any) => void;
}

export function ImportStepHeader({ 
  stepTitle, 
  status, 
  docTypeName, 
  importName, 
  currentStep,
  completedSteps,
  preflightFileInfo,
  setPreflightFileInfo
}: ImportStepHeaderProps) {
  const { toast } = useToast();
  const [isEditingImportName, setIsEditingImportName] = useState(false);
  const [editableImportName, setEditableImportName] = useState(importName);

  // Step definitions
  const steps = [
    { id: "FileUpload", label: "File<br/>Upload", icon: "upload" },
    { id: "FieldMapping", label: "Column<br/>Mapping", icon: "columns" },
    { id: "DataPreflight", label: "File<br/>Preflighting", icon: "check" },
    { id: "DataValidation", label: "Data<br/>Quality", icon: "quality" },
    { id: "DataVerification", label: "Data Normalization", icon: "transform" },
    { id: "FinalReview", label: "Final Review & Approval", icon: "review" },
    { id: "ImportPush", label: "Import /<br/>Push", icon: "upload-cloud" },
  ];

  const getStepIcon = (iconType: string, isActive: boolean, isCompleted: boolean) => {
    const baseClasses = "w-6 h-6";
    
    // For completed steps, show white checkmark
    if (isCompleted) {
      return (
        <svg className={`${baseClasses} text-white`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    const colorClasses = isActive ? "text-white" : "text-gray-500";

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
    console.log("🔄 handleSaveImportName called");
    console.log("📝 editableImportName:", editableImportName);
    console.log("📊 preflightFileInfo:", preflightFileInfo);
    
    try {
      if (!editableImportName.trim()) {
        console.log("❌ Validation failed: Empty import name");
        toast({
          title: "Validation Error",
          description: "Import name cannot be empty.",
          variant: "destructive"
        });
        return;
      }

      // Additional validation for import name length
      if (editableImportName.length > 100) {
        console.log("❌ Validation failed: Import name too long");
        toast({
          title: "Import name too long",
          description: "Import name must be 100 characters or less.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Validation passed, updating local state");
      
      // Update local state immediately
      const updatedPreflightFileInfo = {
        ...preflightFileInfo,
        ImportName: editableImportName.trim()
      };
      setPreflightFileInfo(updatedPreflightFileInfo);
      
      console.log("📋 Updated preflightFileInfo:", updatedPreflightFileInfo);

      // Persist to backend if we have a PreflightFileID
      if (preflightFileInfo.PreflightFileID && preflightFileInfo.PreflightFileID > 0) {
        const request = {
          PreflightFileID: preflightFileInfo.PreflightFileID,
          ImportName: editableImportName.trim(),
          DocTypeID: preflightFileInfo.DocTypeID || 1,
          Action: "Update",
          IsValidate: false,
          // Include all the existing fields to prevent NULL errors
          FileName: preflightFileInfo.FileName || "",
          FilePath: preflightFileInfo.FilePath || "",
          FileType: preflightFileInfo.FileType || "",
          Status: preflightFileInfo.Status || "",
          CreatedBy: preflightFileInfo.CreatedBy || 0,
          MappedFieldIDs: preflightFileInfo.MappedFieldIDs || "",
          DataSummary: preflightFileInfo.DataSummary || "",
          // Include step-specific statuses
          FileUploadStatus: preflightFileInfo.FileUploadStatus || "",
          FieldMappingStatus: preflightFileInfo.FieldMappingStatus || "",
          DataPreflightStatus: preflightFileInfo.DataPreflightStatus || "",
          DataValidationStatus: preflightFileInfo.DataValidationStatus || "",
          DataVerificationStatus: preflightFileInfo.DataVerificationStatus || "",
          DeduplicationStatus: preflightFileInfo.DeduplicationStatus || "",
          FinalReviewStatus: preflightFileInfo.FinalReviewStatus || "",
          ImportPushStatus: preflightFileInfo.ImportPushStatus || "",
        };
        
        console.log("🚀 Calling preflightService.saveFile with request:", request);
        
        const response = await preflightService.saveFile(request);
        
        console.log("📡 Backend response:", response);
        
        toast({
          title: "Success",
          description: "Import name updated successfully.",
        });
      } else {
        console.log("⚠️ No PreflightFileID found, skipping backend update");
        console.log("PreflightFileID:", preflightFileInfo.PreflightFileID);
        // Removed toast for local update without PreflightFileID
      }

      setIsEditingImportName(false);
      
    } catch (error) {
      console.error("💥 Error saving import name:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      });
      
      toast({
        title: "Error",
        description: `Failed to save import name: ${error.message || 'Unknown error'}`,
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
                    maxLength={100}
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
                    className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-colors duration-150 flex-shrink-0 rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="px-8 py-5">
          <div className="relative flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  {/* Step Circle and Icon */}
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 border-2
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : isActive 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-gray-200 border-gray-300'
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
                      dangerouslySetInnerHTML={{ __html: step.label }}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Background connection line */}
            <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-300 z-0"></div>
            
            {/* Completed progress line */}
            {completedSteps.length > 0 && (
              <div 
                className="absolute top-6 left-8 h-0.5 bg-green-500 transition-all duration-500 ease-in-out z-0"
                style={{ 
                  width: `${Math.min(((completedSteps.length - 1) / (steps.length - 1)) * 100, ((steps.length - 2) / (steps.length - 1)) * 100)}%` 
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 