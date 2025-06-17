import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Search, ArrowUpCircle, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NormalizationIssue {
  id: string;
  rowIndex: number;
  fieldName: string;
  originalValue: string;
  suggestedValue: string;
  type: 'phone' | 'email' | 'name' | 'address' | 'other';
  groupId?: string;
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Initialize edited issues when the component receives issues
  useEffect(() => {
    setEditedIssues([...issues]);
    // Initialize with all types selected
    const types = Array.from(new Set(issues.map(issue => issue.type)));
    setSelectedTypes(types);
  }, [issues]);

  // Get all unique groups
  const allGroups = React.useMemo(() => {
    if (!editedIssues.some(i => i.groupId)) return [];
    return Array.from(new Set(editedIssues.map(issue => issue.groupId).filter(Boolean)));
  }, [editedIssues]);

  // Get all unique types
  const allTypes = React.useMemo(() => {
    return Array.from(new Set(issues.map(issue => issue.type)));
  }, [issues]);

  // Filter issues based on search term, selected types, and selected group
  const filteredIssues = editedIssues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      issue.originalValue.toLowerCase().includes(searchLower) ||
      issue.suggestedValue.toLowerCase().includes(searchLower) ||
      issue.fieldName.toLowerCase().includes(searchLower)
    );
    const matchesType = selectedTypes.includes(issue.type);
    const matchesGroup = !selectedGroup || issue.groupId === selectedGroup;
    return matchesSearch && matchesType && matchesGroup;
  });

  // Group issues by groupId if present
  const groupedIssues = React.useMemo(() => {
    if (!allGroups.length) return { ungrouped: filteredIssues };
    
    return filteredIssues.reduce<Record<string, NormalizationIssue[]>>((acc, issue) => {
      const group = issue.groupId || 'ungrouped';
      if (!acc[group]) acc[group] = [];
      acc[group].push(issue);
      return acc;
    }, {});
  }, [filteredIssues, allGroups]);

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

  // Apply all suggestions for current view
  const acceptAllSuggestions = () => {
    const newIssues = [...editedIssues];
    
    filteredIssues.forEach(filtered => {
      const index = newIssues.findIndex(i => i.id === filtered.id);
      if (index !== -1) {
        newIssues[index].suggestedValue = issues.find(i => i.id === filtered.id)?.suggestedValue || newIssues[index].suggestedValue;
      }
    });
    
    setEditedIssues(newIssues);
    
    toast({
      title: "All suggestions accepted",
      description: `Applied ${filteredIssues.length} suggestions.`
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
  const getSortedIssues = (issues: NormalizationIssue[]) => {
    if (!sortField) return issues;
    
    return [...issues].sort((a, b) => {
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
  };

  const getTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[80px] cursor-pointer" 
          onClick={() => sortIssues('rowIndex')}
        >
          <div className="flex items-center">
            Row
            {sortField === 'rowIndex' && (
              <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
            {sortField !== 'rowIndex' && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer" 
          onClick={() => sortIssues('fieldName')}
        >
          <div className="flex items-center">
            Field
            {sortField === 'fieldName' && (
              <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
            {sortField !== 'fieldName' && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => sortIssues('originalValue')}
        >
          <div className="flex items-center">
            Original Value
            {sortField === 'originalValue' && (
              <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
            {sortField !== 'originalValue' && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </div>
        </TableHead>
        <TableHead>Corrected Value</TableHead>
        <TableHead className="w-[120px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderTableBody = (issues: NormalizationIssue[]) => {
    const sortedIssues = getSortedIssues(issues);
    
    return (
      <TableBody>
        {sortedIssues.length > 0 ? (
          sortedIssues.map((issue) => (
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
                    title="Accept suggested value"
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
                    title="Reset to original value"
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
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={18} />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          {allGroups.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {selectedGroup ? `Group ${selectedGroup.replace('group-', '')}` : 'All Groups'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={!selectedGroup}
                  onCheckedChange={() => setSelectedGroup(null)}
                >
                  All Groups
                </DropdownMenuCheckboxItem>
                {allGroups.map(group => (
                  <DropdownMenuCheckboxItem
                    key={group}
                    checked={selectedGroup === group}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGroup(group);
                      } else {
                        setSelectedGroup(null);
                      }
                    }}
                  >
                    Group {group?.replace('group-', '') || 'Unspecified'}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter Types
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allTypes.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTypes([...selectedTypes, type]);
                    } else {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    }
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} fields
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {filteredIssues.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={acceptAllSuggestions}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept All Suggestions
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSaveChanges} 
          className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
        >
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          Apply Changes
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        {Object.keys(groupedIssues).length > 0 && allGroups.length > 0 ? (
          // If there are groups, render each group separately
          Object.entries(groupedIssues).map(([groupId, groupIssues]) => (
            groupIssues.length > 0 && (
              <div key={groupId} className="mb-4">
                {groupId !== 'ungrouped' && (
                  <div className="bg-gray-100 px-4 py-2 font-medium">
                    Duplicate Group {groupId.replace('group-', '')}
                  </div>
                )}
                <Table>
                  {getTableHeader()}
                  {renderTableBody(groupIssues)}
                </Table>
              </div>
            )
          ))
        ) : (
          // Otherwise, render all issues in a single table
          <Table>
            {getTableHeader()}
            {renderTableBody(filteredIssues)}
          </Table>
        )}
      </div>
      
      {filteredIssues.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredIssues.length} of {issues.length} issues
            {searchTerm && ` (filtered by "${searchTerm}")`}
            {selectedTypes.length !== allTypes.length && ` (filtered by ${selectedTypes.length} types)`}
            {selectedGroup && ` (Group ${selectedGroup.replace('group-', '')})`}
          </div>
          <Button 
            onClick={handleSaveChanges} 
            size="sm"
            className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
          >
            Apply Changes
          </Button>
        </div>
      )}
    </div>
  );
}
