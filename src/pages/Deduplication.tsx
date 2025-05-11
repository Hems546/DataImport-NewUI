
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import NormalizationEditor, { NormalizationIssue } from "@/components/NormalizationEditor";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  RotateCcw,
  Search,
  UserRoundX,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Check,
  Trash2
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem } from "@/components/ui/form";

interface DuplicateRecord {
  id: number;
  email: string;
  name: string;
  phone: string;
  company: string;
  [key: string]: any;
}

interface MergeFieldOption {
  field: string;
  value: any;
  source: 'record1' | 'record2' | 'recommendation';
  selected: boolean;
}

export default function Deduplication() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [deduplicationResults, setDeduplicationResults] = useState<ValidationResult[]>([]);
  const [duplicateRecords, setDuplicateRecords] = useState<DuplicateRecord[][]>([]);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFixer, setShowFixer] = useState(false);
  const [normalizationIssues, setNormalizationIssues] = useState<NormalizationIssue[]>([]);
  const [activeFixGroupId, setActiveFixGroupId] = useState<string | null>(null);
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
  
  // State for the duplicate resolution view
  const [currentDuplicatePairIndex, setCurrentDuplicatePairIndex] = useState<number>(0);
  const [showFixDuplicatesView, setShowFixDuplicatesView] = useState<boolean>(false);
  const [mergeOptions, setMergeOptions] = useState<Record<string, MergeFieldOption[]>>({});
  const [editableValues, setEditableValues] = useState<Record<string, string>>({});
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());
  const [masterRecordId, setMasterRecordId] = useState<number | null>(null);

  useEffect(() => {
    const analyzeDeduplication = async () => {
      try {
        setIsAnalyzing(true);
        
        // Simulated delay to mimic backend processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sample duplicate records for demonstration
        const sampleDuplicates = [
          [
            { id: 1, email: "john.doe@example.com", name: "John Doe", phone: "555-1234", company: "Acme Inc" },
            { id: 2, email: "john.doe@example.com", name: "Johnny Doe", phone: "555-1234", company: "ACME Inc." }
          ],
          [
            { id: 5, email: "sarah@example.net", name: "Sarah Smith", phone: "555-9876", company: "Tech Corp" },
            { id: 6, email: "s.smith@example.net", name: "Sarah Smith", phone: "555-9876", company: "Technology Corp" }
          ],
          [
            { id: 9, email: "mike@company.co", name: "Michael Brown", phone: "555-5678", company: "XYZ Ltd" },
            { id: 10, email: "mike@company.co", name: "Mike Brown", phone: "555-5678", company: "XYZ Limited" },
            { id: 11, email: "mbrown@personal.net", name: "Michael Brown", phone: "555-5678", company: "XYZ Ltd" }
          ]
        ];
        
        setDuplicateRecords(sampleDuplicates);

        // Convert duplicate records to normalization issues format for the editor
        const issues: NormalizationIssue[] = [];
        let issueId = 0;
        
        sampleDuplicates.forEach((group, groupIndex) => {
          // Use the first record as the base
          const baseRecord = group[0];
          
          // For each other record in the group, create normalization issues for differing fields
          group.slice(1).forEach((record) => {
            Object.keys(record).forEach(key => {
              if (key !== 'id' && baseRecord[key] !== record[key]) {
                issues.push({
                  id: `issue-${issueId++}`,
                  rowIndex: record.id,
                  fieldName: key,
                  originalValue: record[key],
                  suggestedValue: baseRecord[key],
                  type: key === 'email' ? 'email' : key === 'phone' ? 'phone' : key === 'name' ? 'name' : 'other',
                  groupId: `group-${groupIndex}`
                });
              }
            });
          });
        });
        
        setNormalizationIssues(issues);
        
        // Simulated deduplication checks - in production these would come from your backend
        const results: ValidationResult[] = [
          {
            id: 'exact-duplicates',
            name: 'Exact Record Duplicates',
            status: 'warning',
            severity: 'warning',
            description: 'Found exact duplicate records',
            technical_details: [
              'Found 12 exact duplicate records based on email address',
              'Recommend removing 8 duplicate entries',
              'Action required: Review and confirm duplicate removal',
              '<button-action id="exact-duplicates" action="view">Fix Duplicates</button-action>'
            ]
          },
          {
            id: 'fuzzy-matches',
            name: 'Fuzzy Match Detection',
            status: 'warning',
            severity: 'warning',
            description: 'Potential similar records detected',
            technical_details: [
              'Found 5 records with similar names and addresses',
              'Similarity threshold: 85%',
              'Manual review recommended'
            ]
          },
          {
            id: 'case-sensitivity',
            name: 'Case-Sensitive Duplicates',
            status: 'pass',
            severity: 'low',
            description: 'Case-sensitive duplicates will be normalized',
            technical_details: [
              'Found 3 records with case variations',
              'Will be automatically normalized',
              'No action required'
            ]
          },
          {
            id: 'merge-strategy',
            name: 'Merge Strategy Check',
            status: 'pass',
            severity: 'low',
            description: 'Merge strategy determined for duplicates',
            technical_details: [
              'Latest record will be kept for exact duplicates',
              'Manual review required for fuzzy matches',
              'Strategy is ready for implementation'
            ]
          },
          {
            id: 'cross-file-duplicates',
            name: 'Cross-File Duplicate Detection',
            status: 'warning',
            severity: 'medium',
            description: 'Potential duplicates with existing database records',
            technical_details: [
              'Found 7 records matching existing database entries',
              'Based on email and phone number matching',
              'Review recommended before merging/updating'
            ]
          },
          {
            id: 'duplicate-confidence',
            name: 'Duplicate Confidence Scoring',
            status: 'pass',
            severity: 'low',
            description: 'Confidence scores calculated for potential matches',
            technical_details: [
              'High confidence matches (90%+): 8 records',
              'Medium confidence matches (70-89%): 4 records',
              'Low confidence matches (<70%): 3 records',
              'Automatic resolution configured for high confidence matches only'
            ]
          }
        ];

        setDeduplicationResults(results);
        
        const warnings = results.filter(r => r.status === 'warning');
        const failures = results.filter(r => r.status === 'fail' && r.severity === 'critical');

        if (failures.length > 0) {
          toast({
            title: "Critical deduplication issues found",
            description: `${failures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else if (warnings.length > 0) {
          toast({
            title: "Deduplication review needed",
            description: `${warnings.length} potential duplicate records found.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Deduplication check complete",
            description: "No significant duplicate issues found."
          });
        }
      } catch (error) {
        console.error('Deduplication analysis error:', error);
        toast({
          title: "Analysis failed",
          description: "An error occurred during deduplication analysis.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeDeduplication();
  }, [toast]);
  
  // Initialize merge options when entering fix duplicates view
  useEffect(() => {
    if (showFixDuplicatesView && selectedDuplicateGroup !== null) {
      const group = duplicateRecords[selectedDuplicateGroup];
      if (group) {
        initializeMergeOptionsForGroup(group);
      }
    }
  }, [showFixDuplicatesView, selectedDuplicateGroup, duplicateRecords]);
  
  const initializeMergeOptionsForGroup = (group: DuplicateRecord[]) => {
    // Initialize the master record as the first record in the group
    setMasterRecordId(group[0].id);
    
    // Get all field names from the records (excluding 'id')
    const allFields = new Set<string>();
    group.forEach(record => {
      Object.keys(record).forEach(field => {
        if (field !== 'id') allFields.add(field);
      });
    });
    
    // Initialize merge options for each field
    const newMergeOptions: Record<string, MergeFieldOption[]> = {};
    const newEditableValues: Record<string, string> = {};
    
    allFields.forEach(field => {
      newMergeOptions[field] = [];
      
      // Add options from each record
      group.forEach(record => {
        if (field in record) {
          newMergeOptions[field].push({
            field,
            value: record[field],
            source: record.id === group[0].id ? 'record1' : 'record2', // simplified, in reality you'd need more sophisticated logic
            selected: record.id === group[0].id // select master record values by default
          });
        }
      });
      
      // Set the editable value to the selected option's value
      const selectedOption = newMergeOptions[field].find(option => option.selected);
      if (selectedOption) {
        newEditableValues[field] = String(selectedOption.value);
      }
    });
    
    setMergeOptions(newMergeOptions);
    setEditableValues(newEditableValues);
    
    // Initialize selected duplicates (all except the master record)
    const selected = new Set<number>();
    group.forEach(record => {
      if (record.id !== group[0].id) {
        selected.add(record.id);
      }
    });
    setSelectedDuplicates(selected);
  };
  
  const handleMasterRecordChange = (recordId: number) => {
    if (selectedDuplicateGroup === null) return;
    
    const group = duplicateRecords[selectedDuplicateGroup];
    const masterRecord = group.find(r => r.id === recordId);
    if (!masterRecord) return;
    
    setMasterRecordId(recordId);
    
    // Update merge options to select values from the new master record
    const newMergeOptions: Record<string, MergeFieldOption[]> = { ...mergeOptions };
    const newEditableValues: Record<string, string> = { ...editableValues };
    
    Object.keys(newMergeOptions).forEach(field => {
      // Find the option corresponding to the new master record
      const masterOption = newMergeOptions[field].find(
        option => option.value === masterRecord[field]
      );
      
      if (masterOption) {
        // Update selected status for all options in this field
        newMergeOptions[field].forEach(option => {
          option.selected = option === masterOption;
        });
        
        // Update editable value
        newEditableValues[field] = String(masterOption.value);
      }
    });
    
    setMergeOptions(newMergeOptions);
    setEditableValues(newEditableValues);
    
    // Update selected duplicates to include all records except the new master
    const newSelected = new Set<number>();
    group.forEach(record => {
      if (record.id !== recordId) {
        newSelected.add(record.id);
      }
    });
    setSelectedDuplicates(newSelected);
  };
  
  const handleFieldValueSelect = (field: string, recordId: number) => {
    if (selectedDuplicateGroup === null) return;
    
    const group = duplicateRecords[selectedDuplicateGroup];
    const record = group.find(r => r.id === recordId);
    if (!record) return;
    
    // Update merge options to select the value from this record for this field
    const newMergeOptions = { ...mergeOptions };
    
    if (newMergeOptions[field]) {
      newMergeOptions[field].forEach(option => {
        option.selected = option.value === record[field];
      });
      
      // Update the editable value
      setEditableValues(prev => ({
        ...prev,
        [field]: String(record[field])
      }));
      
      setMergeOptions(newMergeOptions);
    }
  };
  
  const handleEditableValueChange = (field: string, value: string) => {
    setEditableValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Deselect all options since we're using a custom value
    const newMergeOptions = { ...mergeOptions };
    if (newMergeOptions[field]) {
      newMergeOptions[field].forEach(option => {
        option.selected = false;
      });
      setMergeOptions(newMergeOptions);
    }
  };
  
  const handleDuplicateSelectionToggle = (recordId: number) => {
    const newSelected = new Set(selectedDuplicates);
    
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    
    setSelectedDuplicates(newSelected);
  };
  
  const handleApplyMerge = () => {
    if (selectedDuplicateGroup === null || masterRecordId === null) return;
    
    // In a real application, you would apply these changes to your data model
    // For demonstration, we'll just show a toast
    toast({
      title: "Duplicates merged",
      description: `${selectedDuplicates.size} duplicate records have been merged into record #${masterRecordId}.`,
    });
    
    // Close the fix duplicates view and reset state
    setShowFixDuplicatesView(false);
    setSelectedDuplicateGroup(null);
    setMasterRecordId(null);
    setSelectedDuplicates(new Set());
  };
  
  const handleFixDuplicates = () => {
    setShowFixDuplicatesView(true);
    // Select the first group by default if none is selected
    if (selectedDuplicateGroup === null && duplicateRecords.length > 0) {
      setSelectedDuplicateGroup(0);
    }
  };
  
  const handleAction = (id: string, action: string, groupId?: string) => {
    if (action === 'view' || action === 'fix') {
      if (id === 'exact-duplicates') {
        handleFixDuplicates();
      } else {
        setSelectedWarningId(id);
        
        // If groupId is provided, filter issues to only that group
        if (groupId) {
          setActiveFixGroupId(groupId);
        } else {
          setActiveFixGroupId(null); // Show all issues
        }
        setShowFixer(true);
      }
    }
  };
  
  const handleSaveNormalization = (updatedIssues: NormalizationIssue[]) => {
    setNormalizationIssues(updatedIssues);
    
    // In a real application, you would apply these changes to your data model
    // For now, we'll just close the editor
    toast({
      title: "Duplicate resolutions applied",
      description: "Your changes have been saved successfully."
    });
    
    setShowFixer(false);
    setActiveFixGroupId(null);
    setSelectedWarningId(null);
  };
  
  // Filter duplicate groups based on search term if provided
  const filteredDuplicateGroups = searchTerm 
    ? duplicateRecords.filter(group => 
        group.some(record => 
          Object.values(record).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      )
    : duplicateRecords;
  
  // Get filtered normalization issues based on active fix group and selected warning
  const getFilteredNormalizationIssues = () => {
    let filteredIssues = normalizationIssues;
    
    // Filter by group if specified
    if (activeFixGroupId) {
      filteredIssues = filteredIssues.filter(issue => issue.groupId === activeFixGroupId);
    }
    
    // Further filter by warning type if needed in the future
    if (selectedWarningId) {
      // In a real app, you might filter by warning type
    }
    
    return filteredIssues;
  };

  // Render the fix duplicates view
  const renderFixDuplicatesView = () => {
    if (selectedDuplicateGroup === null) return null;
    
    const group = duplicateRecords[selectedDuplicateGroup];
    if (!group || group.length === 0) return null;
    
    // Get all field names (excluding 'id')
    const fields = Object.keys(group[0]).filter(field => field !== 'id');
    
    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="space-y-1">
            <CardTitle className="text-lg">Fix Duplicates</CardTitle>
            <p className="text-sm text-gray-500">
              Select a master record and choose which values to keep for each field
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowFixDuplicatesView(false);
                setSelectedDuplicateGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90"
              size="sm"
              onClick={handleApplyMerge}
            >
              Apply Merge ({selectedDuplicates.size})
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Master</TableHead>
                  <TableHead className="w-[70px]">Delete</TableHead>
                  <TableHead className="w-[90px]">Record ID</TableHead>
                  {fields.map(field => (
                    <TableHead key={field} className="capitalize">
                      {field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.map(record => {
                  const isMaster = masterRecordId === record.id;
                  const isSelected = selectedDuplicates.has(record.id);
                  
                  return (
                    <TableRow 
                      key={record.id}
                      className={isMaster ? "bg-blue-50" : (isSelected ? "bg-red-50" : "")}
                    >
                      <TableCell>
                        <RadioGroup value={String(masterRecordId)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={String(record.id)} 
                              id={`master-${record.id}`}
                              checked={isMaster}
                              onClick={() => handleMasterRecordChange(record.id)}
                            />
                          </div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          disabled={isMaster} // Can't delete the master record
                          onCheckedChange={() => {
                            if (!isMaster) handleDuplicateSelectionToggle(record.id);
                          }}
                        />
                      </TableCell>
                      <TableCell>#{record.id}</TableCell>
                      {fields.map(field => (
                        <TableCell 
                          key={`${record.id}-${field}`}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleFieldValueSelect(field, record.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 overflow-hidden text-ellipsis">
                              {record[field]}
                            </div>
                            {editableValues[field] === String(record[field]) && (
                              <div className="text-green-500">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={3}>
                    Final Values
                  </TableCell>
                  {fields.map(field => (
                    <TableCell key={`final-${field}`}>
                      <Input
                        value={editableValues[field] || ''}
                        onChange={e => handleEditableValueChange(field, e.target.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            {selectedDuplicates.size} records selected for deletion
          </div>
          <Button 
            className="bg-brand-purple hover:bg-brand-purple/90"
            onClick={handleApplyMerge}
          >
            Apply Merge
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/normalization">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Deduplication</h2>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileCheck />}
              label="File Upload"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<DataQuality />}
              label="Data Quality"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<TransformData />}
              label="Data Normalization"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileBox />}
              label="Deduplication"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
            />
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Deduplication Analysis</h3>
            <p className="text-gray-600 mb-6">
              We're analyzing your data for duplicate records within this file and against your existing database.
            </p>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">Analyzing data for duplicates...</p>
              </div>
            ) : (
              <>
                {showFixer ? (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {activeFixGroupId ? `Fixing Duplicate Group ${activeFixGroupId.replace('group-', '')}` : 'Duplicate Record Resolution'}
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowFixer(false);
                          setActiveFixGroupId(null);
                          setSelectedWarningId(null);
                        }}
                      >
                        Back to Summary
                      </Button>
                    </div>
                    <NormalizationEditor 
                      issues={getFilteredNormalizationIssues()}
                      onSave={handleSaveNormalization}
                      issueType="duplicate"
                    />
                  </div>
                ) : showFixDuplicatesView ? (
                  renderFixDuplicatesView()
                ) : (
                  <>
                    <ValidationStatus 
                      results={deduplicationResults}
                      title="Deduplication Results"
                      onAction={handleAction}
                    />
                    
                    <Card className="mt-6">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Duplicate Record Groups</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleFixDuplicates}
                            >
                              Fix All Duplicates
                            </Button>
                          </div>
                          <Search className="text-gray-400" size={18} />
                          <Input
                            placeholder="Search duplicates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredDuplicateGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="border rounded-lg overflow-hidden">
                              <div 
                                className="p-3 bg-gray-50 border-b flex justify-between items-center"
                              >
                                <div 
                                  className="flex-1 cursor-pointer" 
                                  onClick={() => setSelectedDuplicateGroup(selectedDuplicateGroup === groupIndex ? null : groupIndex)}
                                >
                                  <span className="font-medium">Group {groupIndex + 1}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({group.length} potential matches)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedDuplicateGroup(selectedDuplicateGroup === groupIndex ? null : groupIndex)}
                                  >
                                    {selectedDuplicateGroup === groupIndex ? 'Hide Records' : 'View Records'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDuplicateGroup(groupIndex);
                                      setShowFixDuplicatesView(true);
                                    }}
                                  >
                                    Fix Duplicates
                                  </Button>
                                </div>
                              </div>
                              
                              {selectedDuplicateGroup === groupIndex && !showFixDuplicatesView && (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Phone</TableHead>
                                      <TableHead>Company</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell>#{record.id}</TableCell>
                                        <TableCell>{record.email}</TableCell>
                                        <TableCell>{record.name}</TableCell>
                                        <TableCell>{record.phone}</TableCell>
                                        <TableCell>{record.company}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/normalization">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <Button variant="outline">
                <RotateCcw className="mr-2" />
                Start Over
              </Button>
            </div>
            <Link to="/import-wizard/review">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={isAnalyzing || deduplicationResults.some(v => v.status === 'fail' && v.severity === 'critical')}
              >
                Continue to Final Review
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
