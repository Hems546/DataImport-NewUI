
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstructionBox from './InstructionBox';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

interface Instruction {
  id: string;
  position: { x: number; y: number };
  text?: string;
  pointer?: { x: number; y: number; active: boolean };
  pagePath?: string; // Store which page this instruction belongs to
}

const STORAGE_KEY = 'instruction-boxes';

const InstructionManager: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode } = useInstructionMode();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;

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

  // Filter instructions based on current page path
  const visibleInstructions = instructions.filter(instruction => {
    // If instruction doesn't have pagePath property, don't show it
    if (!instruction.pagePath) return false;
    // Show instructions that match the current path
    return instruction.pagePath === currentPath;
  });

  const handleAddInstruction = () => {
    const newInstruction = {
      id: `instruction-${Date.now()}`,
      position: { x: 100, y: 100 },
      text: 'Add your instructions here...',
      pagePath: currentPath // Store the current path when adding a new instruction
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

    // Reset editing state if the box being edited was removed
    if (editingBoxId === id) {
      setEditingBoxId(null);
    }
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

  const handleEditBoxClick = (id: string) => {
    // If instruction mode is not enabled, activate it
    if (!instructionModeEnabled) {
      toggleInstructionMode();
      toast({
        description: "Instruction mode enabled for editing"
      });
    }
    
    // Set the box as being edited
    setEditingBoxId(id);
  };

  // If not in edit mode, render boxes with edit icon that can be clicked
  if (!instructionModeEnabled) {
    return (
      <>
        {visibleInstructions.map(instruction => (
          <InstructionBox
            key={instruction.id}
            id={instruction.id}
            initialPosition={instruction.position}
            initialText={instruction.text}
            initialPointer={instruction.pointer}
            onRemove={handleRemoveInstruction}
            onUpdate={() => handleEditBoxClick(instruction.id)}
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
      
      {visibleInstructions.map(instruction => (
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
