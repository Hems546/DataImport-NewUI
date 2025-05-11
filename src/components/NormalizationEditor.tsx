
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Search, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NormalizationIssue {
  id: string;
  rowIndex: number;
  fieldName: string;
  originalValue: string;
  suggestedValue: string;
  type: 'phone' | 'email' | 'name' | 'address' | 'other';
}

interface NormalizationEditorProps {
  issues: NormalizationIssue[];
  onSave: (updatedIssues: NormalizationIssue[]) => void;
  issueType?: string;
}

export default function NormalizationEditor({ issues, onSave, issueType }: NormalizationEditorProps) {
  const { toast } = useToast();
  const [editedIssues, setEditedIssues] = useState<NormalizationIssue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Initialize edited issues when the component receives issues
  useEffect(() => {
    setEditedIssues([...issues]);
  }, [issues]);

  // Filter issues based on search term
  const filteredIssues = editedIssues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.originalValue.toLowerCase().includes(searchLower) ||
      issue.suggestedValue.toLowerCase().includes(searchLower) ||
      issue.fieldName.toLowerCase().includes(searchLower)
    );
  });

  // Handle edit of a value
  const handleValueChange = (index: number, value: string) => {
    const newIssues = [...editedIssues];
    newIssues[index].suggestedValue = value;
    setEditedIssues(newIssues);
  };

  // Accept suggested value
  const acceptSuggestion = (index: number) => {
    const newIssues = [...editedIssues];
    newIssues[index].suggestedValue = issues[index].suggestedValue;
    setEditedIssues(newIssues);
    
    toast({
      title: "Suggestion accepted",
      description: "The suggested value has been applied."
    });
  };

  // Handle save of all changes
  const handleSaveChanges = () => {
    onSave(editedIssues);
    
    toast({
      title: "Changes saved",
      description: `Successfully updated ${editedIssues.length} items.`,
    });
  };

  // Sort issues
  const sortIssues = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Actually sort the data
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (!sortField) return 0;
    
    // Handle different fields
    let valA: any, valB: any;
    
    switch(sortField) {
      case 'rowIndex':
        valA = a.rowIndex;
        valB = b.rowIndex;
        break;
      case 'fieldName':
        valA = a.fieldName;
        valB = b.fieldName;
        break;
      case 'originalValue':
        valA = a.originalValue;
        valB = b.originalValue;
        break;
      case 'suggestedValue':
        valA = a.suggestedValue;
        valB = b.suggestedValue;
        break;
      default:
        return 0;
    }
    
    // Sort based on direction
    if (sortDirection === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" size={18} />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Button 
          onClick={handleSaveChanges} 
          className="bg-brand-purple hover:bg-brand-purple/90"
        >
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          Apply Changes
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[80px] cursor-pointer" 
                onClick={() => sortIssues('rowIndex')}
              >
                Row
                {sortField === 'rowIndex' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => sortIssues('fieldName')}
              >
                Field
                {sortField === 'fieldName' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => sortIssues('originalValue')}
              >
                Original Value
                {sortField === 'originalValue' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Corrected Value</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIssues.length > 0 ? (
              sortedIssues.map((issue, index) => (
                <TableRow key={issue.id}>
                  <TableCell>{issue.rowIndex + 1}</TableCell>
                  <TableCell>{issue.fieldName}</TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    {issue.originalValue}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={issue.suggestedValue}
                      onChange={(e) => handleValueChange(
                        editedIssues.findIndex(i => i.id === issue.id),
                        e.target.value
                      )}
                      className={cn(
                        issue.suggestedValue !== issue.originalValue ? 
                          "border-green-300" : "border-gray-300"
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acceptSuggestion(
                          editedIssues.findIndex(i => i.id === issue.id)
                        )}
                        className="px-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const idx = editedIssues.findIndex(i => i.id === issue.id);
                          handleValueChange(idx, issue.originalValue);
                        }}
                        className="px-2"
                      >
                        <X className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Reset</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  {searchTerm ? "No matching issues found" : "No issues to display"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredIssues.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredIssues.length} of {issues.length} issues
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </div>
          <Button 
            onClick={handleSaveChanges} 
            size="sm"
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            Apply Changes
          </Button>
        </div>
      )}
    </div>
  );
}
