
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Plus, List } from 'lucide-react';
import { Instruction, useInstructions } from '../instructions/InstructionManager';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from 'react-router-dom';

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

const InstructionPageManager: React.FC = () => {
  const { instructions, updateInstruction, addInstruction } = useInstructions();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');
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
  
  // Set initial active tab
  React.useEffect(() => {
    if (pagePathsWithInstructions.length > 0 && !activeTab) {
      setActiveTab(pagePathsWithInstructions[0]);
    } else if (pagePathsWithInstructions.length === 0 && availablePages.length > 0) {
      setActiveTab('directory'); // Default to directory view if no instructions exist
    }
  }, [pagePathsWithInstructions, activeTab]);

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
          setActiveTab(newPagePath);
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
    </div>
  );
};

export default InstructionPageManager;
