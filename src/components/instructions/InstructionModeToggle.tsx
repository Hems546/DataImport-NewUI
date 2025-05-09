
import React from 'react';
import { Info } from 'lucide-react';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

const InstructionModeToggle: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode } = useInstructionMode();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleInstructionMode();
    
    if (!instructionModeEnabled) {
      toast({
        description: "Instruction mode enabled. Click the + button to add instruction boxes."
      });
    } else {
      toast({
        description: "Instruction mode disabled"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-white opacity-70 hover:opacity-100">
            <Info size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle instruction mode for developers</p>
        </TooltipContent>
      </Tooltip>
      <Switch 
        checked={instructionModeEnabled}
        onCheckedChange={handleToggle}
        id="instruction-mode"
      />
      <label htmlFor="instruction-mode" className="text-xs text-white cursor-pointer">
        {instructionModeEnabled ? 'Instruction Mode On' : 'Instruction Mode'}
      </label>
    </div>
  );
};

export default InstructionModeToggle;
