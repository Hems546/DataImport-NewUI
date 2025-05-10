
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstructionBox from './InstructionBox';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { useToast } from '@/hooks/use-toast';

interface Instruction {
  id: string;
  position: { x: number; y: number };
  text?: string;
  pointer?: { x: number; y: number; active: boolean };
}

const STORAGE_KEY = 'instruction-boxes';

const InstructionManager: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode } = useInstructionMode();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  // Load instructions from localStorage when component mounts
  useEffect(() => {
    const savedInstructions = localStorage.getItem(STORAGE_KEY);
    if (savedInstructions) {
      try {
        setInstructions(JSON.parse(savedInstructions));
      } catch (err) {
        console.error('Failed to parse saved instructions', err);
      }
    }
  }, []);

  // Save instructions to localStorage whenever they change
  useEffect(() => {
    if (instructions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(instructions));
    }
  }, [instructions]);

  const handleAddInstruction = () => {
    const newInstruction = {
      id: `instruction-${Date.now()}`,
      position: { x: 100, y: 100 },
      text: 'Add your instructions here...'
    };
    
    setInstructions([...instructions, newInstruction]);
    
    toast({
      description: "New instruction box added. Drag to position it."
    });
  };

  const handleRemoveInstruction = (id: string) => {
    const updatedInstructions = instructions.filter(instruction => instruction.id !== id);
    setInstructions(updatedInstructions);
    
    // If we removed the last instruction, clear localStorage
    if (updatedInstructions.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    toast({
      description: "Instruction box removed"
    });
  };

  const handleUpdateInstruction = (id: string, updates: Partial<Instruction>) => {
    setInstructions(prev => 
      prev.map(instruction => 
        instruction.id === id 
          ? { ...instruction, ...updates } 
          : instruction
      )
    );
  };

  if (!instructionModeEnabled) {
    // Only render boxes without controls when not in edit mode
    return (
      <>
        {instructions.map(instruction => (
          <InstructionBox
            key={instruction.id}
            id={instruction.id}
            initialPosition={instruction.position}
            initialText={instruction.text}
            initialPointer={instruction.pointer}
            onRemove={handleRemoveInstruction}
            onUpdate={handleUpdateInstruction}
            editMode={false}
          />
        ))}
      </>
    );
  }

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
          initialText={instruction.text}
          initialPointer={instruction.pointer}
          onRemove={handleRemoveInstruction}
          onUpdate={handleUpdateInstruction}
          editMode={true}
        />
      ))}
    </>
  );
};

export default InstructionManager;
