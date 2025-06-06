import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Plus, List, Eye, EyeOff } from 'lucide-react';
import { Instruction, useInstructions } from '../instructions/InstructionManager';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from 'react-router-dom';
import InstructionModeToggle from '@/components/instructions/InstructionModeToggle';
import { useInstructionMode } from '@/contexts/InstructionContext';
import InstructionManagementTable from './InstructionManagementTable';

// Array of all available page paths in the application
const availablePages = [
  "/",
  "/import-wizard",
  "/import-wizard/upload",
  "/import-wizard/verification",
  "/import-wizard/column-mapping",
  "/import-wizard/data-quality",
  "/import-wizard/normalization",
  "/import-wizard/deduplication",
  "/import-wizard/review",
  "/import-wizard/import",
  "/admin",
  "/context",
  "/file-history",
  "/file-history/:fileId",
  "All Pages" // Special value for global instructions
];

const CombinedInstructionManager: React.FC = () => {
  const { instructions, updateInstruction, addInstruction } = useInstructions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { instructionsVisible, toggleInstructionsVisibility } = useInstructionMode();
  
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('general');
  const [pageInstructionsTab, setPageInstructionsTab] = useState<string>('');
  const [newPagePath, setNewPagePath] = useState<string>('');

  // Group instructions by page
  const instructionsByPage = instructions.reduce<Record<string, Instruction[]>>((acc, instruction) => {
    const pagePath = instruction.pagePath || 'Unknown';
    if (!acc[pagePath]) {
      acc[pagePath] = [];
    }
    acc[pagePath].push(instruction);
    return acc;
  }, {});

  // Get all unique page paths that have instructions
  const pagePathsWithInstructions = Object.keys(instructionsByPage);
  
  // Set initial page instructions tab
  React.useEffect(() => {
    if (pagePathsWithInstructions.length > 0 && !pageInstructionsTab) {
      setPageInstructionsTab(pagePathsWithInstructions[0]);
    } else if (pagePathsWithInstructions.length === 0) {
      setPageInstructionsTab('directory'); // Default to directory view if no instructions exist
    }
  }, [pagePathsWithInstructions, pageInstructionsTab]);

  const handleEdit = (instruction: Instruction) => {
    setEditingInstruction(instruction.id);
    setEditText(instruction.text || '');
  };

  const handleSave = (id: string) => {
    updateInstruction(id, { text: editText });
    setEditingInstruction(null);
    
    toast({
      description: "Instruction updated successfully",
    });
  };

  const handleCancel = () => {
    setEditingInstruction(null);
  };

  const handleAddInstruction = () => {
    if (newPagePath) {
      const newInstruction = addInstruction(newPagePath);
      setNewPagePath('');
      
      toast({
        description: "New instruction added for page: " + newPagePath,
      });
      
      // Update the tabs to include the new page if it's not already there
      if (!pagePathsWithInstructions.includes(newPagePath)) {
        // Set active tab to the new page path
        setTimeout(() => {
          setPageInstructionsTab(newPagePath);
        }, 100);
      }
    }
  };

  const handlePreviewPage = (pagePath: string) => {
    if (pagePath !== 'All Pages') {
      navigate(pagePath);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Instructions Management</h2>
      <p className="text-gray-600 mb-6">
        Create, manage, and organize instruction boxes across your application
      </p>
      
      {/* Instruction Mode Toggle Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instruction Mode Settings</CardTitle>
          <CardDescription>
            Control visibility and editing of instruction boxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Instruction Mode</h3>
                <p className="text-gray-600 mb-4">
                  When enabled, you can add draggable instruction boxes anywhere in the application. 
                  These boxes can be positioned and configured to provide guidance to developers.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <InstructionModeToggle />
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleInstructionsVisibility}
                      className="flex items-center gap-2"
                    >
                      {instructionsVisible ? (
                        <>
                          <EyeOff size={16} /> Hide All Instructions
                        </>
                      ) : (
                        <>
                          <Eye size={16} /> Show All Instructions
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">How to Use</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                  <li>Enable Instruction Edit Mode using the toggle above</li>
                  <li>Click the "+" button that appears in the bottom-right corner of any page</li>
                  <li>Drag the instruction box to position it where needed</li>
                  <li>Edit the text by clicking the pencil icon</li>
                  <li>Optionally draw a pointer to highlight specific UI elements</li>
                  <li>Use the Show/Hide toggle to control instruction visibility without disabling edit mode</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general">Instructions Overview</TabsTrigger>
          <TabsTrigger value="by-page">Manage By Page</TabsTrigger>
        </TabsList>
        
        {/* General Instructions Tab */}
        <TabsContent value="general">
          <InstructionManagementTable />
        </TabsContent>
        
        {/* By Page Tab */}
        <TabsContent value="by-page">
          <Card>
            <CardHeader>
              <CardTitle>Instructions By Page</CardTitle>
              <CardDescription>
                Manage instructions for each page in your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="new-page-path">Add Instruction for Page</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="new-page-path"
                      placeholder="Enter page path (e.g., /admin)"
                      value={newPagePath}
                      onChange={(e) => setNewPagePath(e.target.value)}
                      list="page-path-options"
                    />
                    <datalist id="page-path-options">
                      {availablePages.map(page => (
                        <option key={page} value={page} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <Button onClick={handleAddInstruction} disabled={!newPagePath}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full mb-6">
                <AccordionItem value="page-directory">
                  <AccordionTrigger className="font-medium">
                    <div className="flex items-center">
                      <List className="mr-2 h-4 w-4" />
                      Page Directory
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-2 border-l-2 border-muted space-y-1">
                      {availablePages.map(page => {
                        const hasInstructions = instructionsByPage[page]?.length > 0;
                        return (
                          <div 
                            key={page} 
                            className={`flex items-center justify-between p-2 rounded ${
                              hasInstructions ? 'bg-muted/50' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <span className="font-mono text-sm">{page}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasInstructions ? (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                  {instructionsByPage[page].length} instruction{instructionsByPage[page].length !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No instructions</span>
                              )}
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7"
                                  onClick={() => {
                                    setNewPagePath(page);
                                  }}
                                >
                                  Select
                                </Button>
                                {page !== 'All Pages' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7"
                                    onClick={() => handlePreviewPage(page)}
                                  >
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {pagePathsWithInstructions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No instructions found. Add some instructions first.
                </div>
              ) : (
                <Tabs value={pageInstructionsTab} onValueChange={setPageInstructionsTab} className="w-full">
                  <TabsList className="grid grid-cols-3 lg:grid-cols-4 mb-4">
                    {pagePathsWithInstructions.map(pagePath => (
                      <TabsTrigger key={pagePath} value={pagePath}>
                        {pagePath === 'All Pages' ? 'Global' : pagePath}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {pagePathsWithInstructions.map(pagePath => (
                    <TabsContent key={pagePath} value={pagePath} className="space-y-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {pagePath === 'All Pages' ? 'Global Instructions' : `Page: ${pagePath}`}
                      </h3>
                      
                      {instructionsByPage[pagePath].map(instruction => (
                        <Card key={instruction.id} className="mb-4">
                          <CardContent className="pt-6">
                            {editingInstruction === instruction.id ? (
                              <div className="space-y-4">
                                <Textarea 
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleCancel}
                                  >
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSave(instruction.id)}
                                  >
                                    <Save className="w-4 h-4 mr-1" /> Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="whitespace-pre-line">{instruction.text}</div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(instruction)}
                                  >
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CombinedInstructionManager;
