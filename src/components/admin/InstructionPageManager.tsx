
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Plus } from 'lucide-react';
import { Instruction, useInstructions } from '../instructions/InstructionManager';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const InstructionPageManager: React.FC = () => {
  const { instructions, updateInstruction, addInstruction } = useInstructions();
  const { toast } = useToast();
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

  // Get all unique page paths
  const pagePaths = Object.keys(instructionsByPage);

  // Set initial active tab
  React.useEffect(() => {
    if (pagePaths.length > 0 && !activeTab) {
      setActiveTab(pagePaths[0]);
    }
  }, [pagePaths, activeTab]);

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
      addInstruction(newPagePath);
      setNewPagePath('');
      
      toast({
        description: "New instruction added for page: " + newPagePath,
      });
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
              <Input
                id="new-page-path"
                placeholder="Enter page path (e.g., /admin)"
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
              />
            </div>
            <Button onClick={handleAddInstruction} disabled={!newPagePath}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          
          {pagePaths.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No instructions found. Add some instructions first.
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-4 mb-4">
                {pagePaths.map(pagePath => (
                  <TabsTrigger key={pagePath} value={pagePath}>
                    {pagePath === 'All Pages' ? 'Global' : pagePath}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {pagePaths.map(pagePath => (
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
