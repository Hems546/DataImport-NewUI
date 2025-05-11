
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
    return saved ? JSON.parse(saved) : false;
  });
  
  const [instructionsVisible, setInstructionsVisible] = useState(() => {
    const saved = localStorage.getItem(INSTRUCTIONS_VISIBLE_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(INSTRUCTION_MODE_KEY, JSON.stringify(instructionModeEnabled));
  }, [instructionModeEnabled]);

  useEffect(() => {
    localStorage.setItem(INSTRUCTIONS_VISIBLE_KEY, JSON.stringify(instructionsVisible));
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
