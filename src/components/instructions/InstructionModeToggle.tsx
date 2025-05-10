
import React from 'react';
import { Info, EyeOff, Eye } from 'lucide-react';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const InstructionModeToggle: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode, instructionsVisible, toggleInstructionsVisibility } = useInstructionMode();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleInstructionMode();
    
    if (!instructionModeEnabled) {
      toast({
        description: "Instruction edit mode enabled. Click the + button to add instruction boxes."
      });
    } else {
      toast({
        description: "Instruction edit mode disabled"
      });
    }
  };

  const handleVisibilityToggle = () => {
    toggleInstructionsVisibility();
    
    toast({
      description: instructionsVisible ? "Instructions hidden" : "Instructions visible"
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-white opacity-70 hover:opacity-100">
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle instruction edit mode for developers</p>
          </TooltipContent>
        </Tooltip>
        <Switch 
          checked={instructionModeEnabled}
          onCheckedChange={handleToggle}
          id="instruction-mode"
        />
        <label htmlFor="instruction-mode" className="text-xs text-white cursor-pointer">
          {instructionModeEnabled ? 'Edit Mode On' : 'Edit Mode'}
        </label>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVisibilityToggle}
        className="h-7 px-2 text-white hover:bg-white/20"
      >
        {instructionsVisible ? (
          <EyeOff size={14} className="mr-1" />
        ) : (
          <Eye size={14} className="mr-1" />
        )}
        <span className="text-xs">{instructionsVisible ? 'Hide Instructions' : 'Show Instructions'}</span>
      </Button>
    </div>
  );
};

export default InstructionModeToggle;
