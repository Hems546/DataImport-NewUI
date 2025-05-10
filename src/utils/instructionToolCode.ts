
export const instructionManagerCode = `
import React, { useState, useEffect } from 'react';
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
  pagePath?: string;
  active?: boolean;
}

export const STORAGE_KEY = 'instruction-boxes';

// ... rest of InstructionManager.tsx code ...
`;

export const instructionBoxCode = `
import React, { useState, useRef, useEffect } from 'react';
import { Pencil, X, Trash2, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInstructionMode } from '@/contexts/InstructionContext';
import type { Instruction } from './InstructionManager';

interface InstructionBoxProps {
  id: string;
  initialPosition: { x: number; y: number };
  initialText?: string;
  initialPointer?: { x: number; y: number; active: boolean };
  onRemove: (id: string) => void;
  onUpdate: ((id: string, updates: Partial<Instruction>) => void) | ((id: string) => void);
  editMode?: boolean;
}

// ... rest of InstructionBox.tsx code ...
`;

export const instructionToggleCode = `
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useInstructionMode } from '@/contexts/InstructionContext';
import { StickyNote } from 'lucide-react';
import { Label } from '@/components/ui/label';

const InstructionModeToggle: React.FC = () => {
  const { instructionModeEnabled, toggleInstructionMode } = useInstructionMode();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="instruction-mode"
        checked={instructionModeEnabled}
        onCheckedChange={toggleInstructionMode}
      />
      <Label htmlFor="instruction-mode" className="flex items-center gap-1.5">
        <StickyNote size={14} />
        Instruction Mode
      </Label>
    </div>
  );
};

export default InstructionModeToggle;
`;

export const instructionContextCode = `
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
`;

export const instructionManagementTableCode = `
import React, { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Instruction, useInstructions, STORAGE_KEY } from "../instructions/InstructionManager";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ... rest of InstructionManagementTable.tsx code ...
`;

export const appModificationCode = `
// Modifications needed for App.tsx

// 1. Import the InstructionProvider and InstructionManager
import { InstructionProvider } from "./contexts/InstructionContext";
import InstructionManager from "./components/instructions/InstructionManager";

// 2. Wrap your app with InstructionProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InstructionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* 3. Place InstructionManager inside the router but outside routes */}
          <InstructionManager />
          <Routes>
            {/* Your routes here */}
          </Routes>
        </BrowserRouter>
      </InstructionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
`;
