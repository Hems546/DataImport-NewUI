
import React, { createContext, useContext, useState, ReactNode } from 'react';

type InstructionContextType = {
  instructionModeEnabled: boolean;
  toggleInstructionMode: () => void;
};

const InstructionContext = createContext<InstructionContextType | undefined>(undefined);

export function InstructionProvider({ children }: { children: ReactNode }) {
  const [instructionModeEnabled, setInstructionModeEnabled] = useState(false);

  const toggleInstructionMode = () => {
    setInstructionModeEnabled(prev => !prev);
  };

  return (
    <InstructionContext.Provider value={{ instructionModeEnabled, toggleInstructionMode }}>
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
