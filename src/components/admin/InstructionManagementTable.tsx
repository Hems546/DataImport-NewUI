
import React, { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Instruction, useInstructions, STORAGE_KEY } from "../instructions/InstructionManager";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstructionMode } from "@/contexts/InstructionContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InstructionManagementTable: React.FC = () => {
  const { instructions, updateInstruction, removeInstruction } = useInstructions();
  const { toggleInstructionsVisibility } = useInstructionMode();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instructionToDelete, setInstructionToDelete] = useState<string | null>(null);
  
  // Group instructions by page
  const instructionsByPage = instructions.reduce<Record<string, Instruction[]>>((acc, instruction) => {
    const pagePath = instruction.pagePath || 'All Pages';
    if (!acc[pagePath]) {
      acc[pagePath] = [];
    }
    acc[pagePath].push(instruction);
    return acc;
  }, {});
  
  const handleToggleActive = (id: string, currentActive?: boolean) => {
    updateInstruction(id, { active: currentActive === undefined ? true : !currentActive });
    
    toast({
      description: `Instruction ${currentActive ? "disabled" : "enabled"}`
    });
  };
  
  const handleDeleteClick = (id: string) => {
    setInstructionToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (instructionToDelete) {
      removeInstruction(instructionToDelete);
      setDeleteDialogOpen(false);
      setInstructionToDelete(null);
      
      toast({
        description: "Instruction deleted"
      });
    }
  };
  
  const clearAllInstructions = () => {
    // Remove all instructions from localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Force page reload to apply changes
    window.location.reload();
    
    toast({
      description: "All instructions have been cleared",
      variant: "destructive"
    });
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Instructions</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" onClick={() => {
                setInstructionToDelete(null);
                setDeleteDialogOpen(true);
              }} size="sm">
                Clear All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This will permanently delete all instruction boxes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {Object.keys(instructionsByPage).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No instructions found</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(instructionsByPage).map(([pagePath, pageInstructions]) => (
          <Card key={pagePath} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{pagePath === "All Pages" ? "Global Instructions" : `Page: ${pagePath}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageInstructions.map(instruction => (
                    <TableRow key={instruction.id}>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">
                        {instruction.id}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate">
                          {instruction.text || "No text"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={instruction.active !== false}
                          onCheckedChange={() => handleToggleActive(instruction.id, instruction.active)}
                          aria-label="Toggle instruction visibility"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(instruction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {instructionToDelete 
                ? "Delete Instruction" 
                : "Clear All Instructions"}
            </DialogTitle>
          </DialogHeader>
          <p>
            {instructionToDelete 
              ? "Are you sure you want to delete this instruction? This action cannot be undone."
              : "Are you sure you want to clear all instructions? This action cannot be undone."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={instructionToDelete ? confirmDelete : clearAllInstructions}
            >
              {instructionToDelete ? "Delete" : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstructionManagementTable;
