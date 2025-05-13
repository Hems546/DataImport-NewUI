
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstructionBox from './InstructionBox';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

export interface Instruction {
  id: string;
  position: { x: number; y: number };
  text?: string;
  pointer?: { x: number; y: number; active: boolean };
  pagePath?: string; // Store which page this instruction belongs to
  active?: boolean; // Whether this instruction is enabled
}

export const STORAGE_KEY = 'instruction-boxes';

export const useInstructions = () => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loaded, setLoaded] = useState(false);
  
  // Load instructions from localStorage when component mounts
  useEffect(() => {
    try {
      const savedInstructions = localStorage.getItem(STORAGE_KEY);
      if (savedInstructions) {
        const parsedInstructions = JSON.parse(savedInstructions);
        if (Array.isArray(parsedInstructions)) {
          setInstructions(parsedInstructions);
          console.log('Loaded instructions from localStorage:', parsedInstructions);
        } else {
          console.error('Saved instructions is not an array:', parsedInstructions);
          setInstructions([]);
        }
      } else {
        console.log('No saved instructions found in localStorage');
      }
    } catch (err) {
      console.error('Failed to parse saved instructions', err);
    } finally {
      setLoaded(true);
    }
  }, []);
  
  // Save instructions to localStorage whenever they change
  // But only after initial load to prevent unnecessary operations
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(instructions));
        console.log('Saved instructions to localStorage:', instructions);
      } catch (err) {
        console.error('Failed to save instructions to localStorage', err);
      }
    }
  }, [instructions, loaded]);
  
  const addInstruction = useCallback((pagePath: string) => {
    const newInstruction = {
      id: `instruction-${Date.now()}`,
      position: { x: 100, y: 100 },
      text: 'Add your instructions here...',
      pagePath,
      active: true
    };
    
    setInstructions(prev => [...prev, newInstruction]);
    return newInstruction;
  }, []);
  
  const updateInstruction = useCallback((id: string, updates: Partial<Instruction>) => {
    setInstructions(prev => 
      prev.map(instruction => 
        instruction.id === id 
          ? { ...instruction, ...updates } 
          : instruction
      )
    );
  }, []);
  
  const removeInstruction = useCallback((id: string) => {
    setInstructions(prev => prev.filter(instruction => instruction.id !== id));
  }, []);
  
  const toggleInstructionActive = useCallback((id: string) => {
    setInstructions(prev => 
      prev.map(instruction => 
        instruction.id === id 
          ? { ...instruction, active: !instruction.active } 
          : instruction
      )
    );
  }, []);
  
  // Filter instructions to only show on the page they were created for
  const getVisibleInstructions = useCallback((currentPath: string) => {
    // Debug logging to help diagnose the issue
    console.log('Filtering instructions for path:', currentPath);
    console.log('Available instructions:', instructions);
    
    return instructions.filter(instruction => {
      // If the instruction is not active, don't show it
      if (instruction.active === false) return false;
      
      // All Pages instructions should show on all pages
      if (instruction.pagePath === "All Pages") return true;
      
      // If no pagePath is specified (for backwards compatibility), default to '/'
      const instructionPath = instruction.pagePath || '/';
      
      // Show instructions that match the current path
      const shouldShow = instructionPath === currentPath;
      console.log(`Instruction ${instruction.id} for path ${instructionPath} visible: ${shouldShow}`);
      
      return shouldShow;
    });
  }, [instructions]);
  
  return {
    instructions,
    getVisibleInstructions,
    addInstruction,
    updateInstruction,
    removeInstruction,
    toggleInstructionActive,
    loaded
  };
};

const InstructionManager: React.FC = () => {
  const { instructionModeEnabled, instructionsVisible } = useInstructionMode();
  const { toast } = useToast();
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;
  
  const { 
    instructions, 
    getVisibleInstructions,
    addInstruction, 
    updateInstruction, 
    removeInstruction,
    loaded
  } = useInstructions();

  // Get only the instructions for the current page
  const visibleInstructions = getVisibleInstructions(currentPath);
  
  // Debug log to see what instructions are actually visible
  useEffect(() => {
    if (loaded) {
      console.log('Current path:', currentPath);
      console.log('Visible instructions:', visibleInstructions);
      console.log('Instruction mode enabled:', instructionModeEnabled);
      console.log('Instructions visible setting:', instructionsVisible);
    }
  }, [loaded, currentPath, visibleInstructions, instructionModeEnabled, instructionsVisible]);

  const handleAddInstruction = () => {
    const newInstruction = addInstruction(currentPath);
    
    toast({
      description: "New instruction box added. Drag to position it."
    });
  };

  const handleEditBoxClick = (id: string) => {
    // If instruction mode is not enabled, activate it
    if (!instructionModeEnabled) {
      // Don't toggle instruction mode here, just notify user they need to enable it
      toast({
        description: "Enable instruction mode to edit instructions",
        variant: "default"
      });
      return;
    }
    
    // Set the box as being edited
    setEditingBoxId(id);
  };

  // Don't render until instructions are loaded from localStorage
  if (!loaded) {
    return null;
  }

  // Always render the component, but control visibility of its content
  return (
    <>
      {instructionModeEnabled && instructionsVisible && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          <Button 
            onClick={handleAddInstruction}
            className="rounded-full w-12 h-12 p-0 bg-brand-purple hover:bg-brand-purple/90 shadow-lg"
          >
            <PlusCircle size={24} />
          </Button>
        </div>
      )}
      
      {instructionsVisible && visibleInstructions.map(instruction => (
        <InstructionBox
          key={instruction.id}
          id={instruction.id}
          initialPosition={instruction.position}
          initialText={instruction.text}
          initialPointer={instruction.pointer}
          onRemove={removeInstruction}
          onUpdate={instructionModeEnabled ? updateInstruction : handleEditBoxClick}
          editMode={instructionModeEnabled}
        />
      ))}
    </>
  );
};

export default InstructionManager;
