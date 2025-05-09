
import React, { useState } from 'react';
import { PlusCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstructionBox from './InstructionBox';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface Instruction {
  id: string;
  position: { x: number; y: number };
}

const InstructionManager: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode } = useInstructionMode();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  const handleAddInstruction = () => {
    const newInstruction = {
      id: `instruction-${Date.now()}`,
      position: { x: 100, y: 100 },
    };
    
    setInstructions([...instructions, newInstruction]);
    
    toast({
      description: "New instruction box added. Drag to position it."
    });
  };

  const handleRemoveInstruction = (id: string) => {
    setInstructions(instructions.filter(instruction => instruction.id !== id));
    toast({
      description: "Instruction box removed"
    });
  };

  if (!instructionModeEnabled) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <Button 
          onClick={handleAddInstruction}
          className="rounded-full w-12 h-12 p-0 bg-brand-purple hover:bg-brand-purple/90 shadow-lg"
        >
          <PlusCircle size={24} />
        </Button>
      </div>
      
      {instructions.map(instruction => (
        <InstructionBox
          key={instruction.id}
          id={instruction.id}
          initialPosition={instruction.position}
          onRemove={handleRemoveInstruction}
        />
      ))}
    </>
  );
};

export default InstructionManager;
