import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressStepProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isComplete?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressStep = ({ 
  icon, 
  label, 
  isActive = false, 
  isComplete = false, 
  size = 'md',
  className = ""
}: ProgressStepProps) => {
  const sizeClasses = {
    sm: {
      circle: "w-8 h-8",
      text: "text-xs",
      iconSize: 16
    },
    md: {
      circle: "w-12 h-12", 
      text: "text-sm",
      iconSize: 20
    },
    lg: {
      circle: "w-16 h-16",
      text: "text-base", 
      iconSize: 24
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center text-center max-w-[120px]", className)}>
      <div 
        className={cn(
          currentSize.circle + " rounded-full flex items-center justify-center mb-2 transition-all duration-200",
          isActive ? "bg-[rgb(59,130,246)]/20 text-[rgb(59,130,246)] border-2 border-[rgb(59,130,246)]" : 
          isComplete ? "bg-green-100 text-green-600 border-2 border-green-600" : 
          "bg-gray-100 text-gray-400 border-2 border-transparent"
        )}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: currentSize.iconSize 
        })}
      </div>
      <span className={cn(
        currentSize.text + " text-center w-full leading-tight", 
        isActive ? "text-[rgb(59,130,246)] font-medium" : 
        isComplete ? "text-green-600 font-medium" : 
        "text-gray-500"
      )}>
        {label}
      </span>
    </div>
  );
};

export default ProgressStep;
