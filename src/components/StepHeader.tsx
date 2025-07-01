import React from 'react';
import { cn } from '@/lib/utils';
import ProgressStep from './ProgressStep';
import StepConnector from './StepConnector';
import { 
  Upload,
  FileCheck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  FileSpreadsheet,
  Eye
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";

interface StepConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface StepHeaderProps {
  currentStep: string;
  completedSteps?: string[];
  className?: string;
  variant?: 'default' | 'compact';
}

const DEFAULT_STEPS: StepConfig[] = [
  {
    key: "FileUpload",
    label: "File Upload",
    icon: <Upload />
  },
  {
    key: "FieldMapping", 
    label: "Column Mapping",
    icon: <MapColumns />
  },
  {
    key: "DataPreflight",
    label: "File Preflighting", 
    icon: <FileCheck />
  },
  {
    key: "DataValidation",
    label: "Data Quality",
    icon: <DataQuality />
  },
  {
    key: "DataVerification",
    label: "Data Normalization",
    icon: <TransformData />
  },
  {
    key: "FinalReview",
    label: "Final Review & Approval",
    icon: <ClipboardCheck />
  },
  {
    key: "ImportPush",
    label: "Import / Push",
    icon: <ArrowUpCircle />
  }
];

const StepHeader: React.FC<StepHeaderProps> = ({ 
  currentStep, 
  completedSteps = [], 
  className = "",
  variant = "default"
}) => {
  const isStepActive = (stepKey: string) => stepKey === currentStep;
  const isStepComplete = (stepKey: string) => completedSteps.includes(stepKey);

  if (variant === 'compact') {
    return (
      <div className={cn("bg-white border-b border-gray-200 px-4 py-6", className)}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {DEFAULT_STEPS.map((step, index) => {
                const isActive = isStepActive(step.key);
                const isComplete = isStepComplete(step.key);
                
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex items-center">
                      <div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                          isActive ? "bg-blue-100 text-blue-600 border-2 border-blue-600" : 
                          isComplete ? "bg-green-100 text-green-600" : 
                          "bg-gray-100 text-gray-400"
                        )}
                      >
                        {React.cloneElement(step.icon as React.ReactElement, { 
                          size: 16 
                        })}
                      </div>
                      {variant === 'compact' && isActive && (
                        <span className="ml-2 font-medium text-gray-900">
                          {step.label}
                        </span>
                      )}
                    </div>
                    {index < DEFAULT_STEPS.length - 1 && (
                      <div className="w-8 h-px bg-gray-300"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border-b border-gray-200 px-4 py-8", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          {DEFAULT_STEPS.map((step, index) => (
            <React.Fragment key={step.key}>
              <ProgressStep 
                icon={step.icon}
                label={step.label}
                isActive={isStepActive(step.key)}
                isComplete={isStepComplete(step.key)}
              />
              {index < DEFAULT_STEPS.length - 1 && <StepConnector />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepHeader; 