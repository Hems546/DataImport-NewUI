
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type InstructionContextType = {
  instructionModeEnabled: boolean;
  toggleInstructionMode: () => void;
  instructionsVisible: boolean;
  toggleInstructionsVisibility: () => void;
};

const INSTRUCTION_MODE_KEY = 'instruction-mode-enabled';
const INSTRUCTIONS_VISIBLE_KEY = 'instructions-visible';

const InstructionContext = createContext<InstructionContextType | undefined>(undefined);

export function InstructionProvider({ children }: { children: ReactNode }) {
  const [instructionModeEnabled, setInstructionModeEnabled] = useState(() => {
    const saved = localStorage.getItem(INSTRUCTION_MODE_KEY);
    console.log('Initial instruction mode from localStorage:', saved);
    return saved ? JSON.parse(saved) : false;
  });
  
  const [instructionsVisible, setInstructionsVisible] = useState(() => {
    const saved = localStorage.getItem(INSTRUCTIONS_VISIBLE_KEY);
    console.log('Initial instructions visibility from localStorage:', saved);
    return saved ? JSON.parse(saved) : true; // Default to visible
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(INSTRUCTION_MODE_KEY, JSON.stringify(instructionModeEnabled));
    console.log('Saved instruction mode to localStorage:', instructionModeEnabled);
  }, [instructionModeEnabled]);

  useEffect(() => {
    localStorage.setItem(INSTRUCTIONS_VISIBLE_KEY, JSON.stringify(instructionsVisible));
    console.log('Saved instructions visibility to localStorage:', instructionsVisible);
  }, [instructionsVisible]);

  const toggleInstructionMode = () => {
    setInstructionModeEnabled(prev => !prev);
  };

  const toggleInstructionsVisibility = () => {
    setInstructionsVisible(prev => !prev);
  };

  return (
    <InstructionContext.Provider value={{ 
      instructionModeEnabled, 
      toggleInstructionMode,
      instructionsVisible,
      toggleInstructionsVisibility
    }}>
      {children}
    </InstructionContext.Provider>
  );
}

export function useInstructionMode() {
  const context = useContext(InstructionContext);
  if (context === undefined) {
    throw new Error('useInstructionMode must be used within an InstructionProvider');
  }
  return context;
}
