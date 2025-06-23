import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressStepProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isComplete?: boolean;
}

const ProgressStep = ({ icon, label, isActive = false, isComplete = false }: ProgressStepProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div 
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
          isActive ? "bg-primary/20 text-primary" : 
          isComplete ? "bg-green-100 text-green-600" : 
          "bg-gray-100 text-gray-400"
        )}
      >
        {icon}
      </div>
      <span className={cn(
        "text-sm text-center w-full", 
        isActive ? "text-primary font-medium" : 
        isComplete ? "text-green-600" : 
        "text-gray-500"
      )}>
        {label}
      </span>
    </div>
  );
};

export default ProgressStep;
