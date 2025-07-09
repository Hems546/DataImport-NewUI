import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Upload,
  FileCheck,
  CheckCircle,
  BarChart3,
  GitBranch,
  RotateCcw,
  ClipboardCheck,
  ArrowUpCircle,
  Columns3
} from "lucide-react";

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
    label: "File<br/>Upload",
    icon: <Upload />
  },
  {
    key: "DataPreflight",
    label: "File<br/>Preflighting", 
    icon: <FileCheck />
  },
  {
    key: "FieldMapping", 
    label: "Column<br/>Mapping",
    icon: <Columns3 />
  },
  {
    key: "DataValidation",
    label: "Data<br/>Quality",
    icon: <BarChart3 />
  },
  {
    key: "DataVerification",
    label: "Data<br/>Normalization",
    icon: <GitBranch />
  },
  {
    key: "FinalReview",
    label: "Final Review &<br/>Approval",
    icon: <ClipboardCheck />
  },
  {
    key: "ImportPush",
    label: "Import /<br/>Push",
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
    <div className={cn("bg-white px-4 py-8", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center justify-between">
          {DEFAULT_STEPS.map((step, index) => {
            const isActive = isStepActive(step.key);
            const isComplete = isStepComplete(step.key);
            
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2",
                    isComplete 
                      ? "bg-green-500 border-green-500" 
                      : isActive 
                      ? "bg-blue-500 border-blue-500" 
                      : "bg-gray-200 border-gray-300"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <div className={cn(
                      "w-6 h-6",
                      isActive ? "text-white" : "text-gray-500"
                    )}>
                      {React.cloneElement(step.icon as React.ReactElement, { 
                        className: "w-6 h-6" 
                      })}
                    </div>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-3 text-center max-w-[100px]">
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight block",
                      isComplete 
                        ? "text-green-600" 
                        : isActive 
                        ? "text-blue-600" 
                        : "text-gray-500"
                    )}
                    dangerouslySetInnerHTML={{ __html: step.label }}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Background connection line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 z-0"></div>
          
          {/* Progress line for completed steps */}
          {completedSteps.length > 0 && (
            <div 
              className="absolute top-6 left-6 h-0.5 bg-green-500 transition-all duration-500 ease-in-out z-0"
              style={{ 
                width: `${Math.min((completedSteps.length / (DEFAULT_STEPS.length - 1)) * 100, 100)}%` 
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StepHeader; 