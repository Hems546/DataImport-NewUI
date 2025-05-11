
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
  ChevronLeft
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
  
  // New state for the side-by-side comparison view
  const [currentDuplicatePairIndex, setCurrentDuplicatePairIndex] = useState<number>(0);
  const [showSideBySideView, setShowSideBySideView] = useState<boolean>(false);
  const [mergeOptions, setMergeOptions] = useState<Record<string, MergeFieldOption[]>>({});
  const [editableValues, setEditableValues] = useState<Record<string, string>>({});

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
  
  // Prepare merge options when a duplicate pair is selected
  useEffect(() => {
    if (showSideBySideView && selectedDuplicateGroup !== null) {
      const group = duplicateRecords[selectedDuplicateGroup];
      if (group && currentDuplicatePairIndex < group.length - 1) {
        const record1 = group[0];
        const record2 = group[currentDuplicatePairIndex + 1];
        
        const newMergeOptions: Record<string, MergeFieldOption[]> = {};
        const newEditableValues: Record<string, string> = {};
        
        // Create merge options for each field
        Object.keys(record1).forEach(field => {
          if (field === 'id') return; // Skip ID field
          
          const value1 = record1[field];
          const value2 = record2[field];
          
          // Determine which value to recommend (could implement more sophisticated logic)
          const recommended = value1 === value2 ? 
            value1 : 
            // Simple recommended logic - prefer longer values for company names, 
            // more complete names, assume phone and emails are equal quality if different
            field === 'company' && value2.length > value1.length ? value2 : value1;
          
          newMergeOptions[field] = [
            { field, value: value1, source: 'record1', selected: value1 === recommended },
            { field, value: value2, source: 'record2', selected: value2 === recommended && value1 !== value2 },
            // Only add recommendation if different from both
            ...(value1 !== recommended && value2 !== recommended ? 
                [{ field, value: recommended, source: 'recommendation', selected: true }] : [])
          ];
          
          // Set the initial editable value to the recommended option
          newEditableValues[field] = recommended;
        });
        
        setMergeOptions(newMergeOptions);
        setEditableValues(newEditableValues);
      }
    }
  }, [showSideBySideView, selectedDuplicateGroup, currentDuplicatePairIndex, duplicateRecords]);
  
  const handleViewDuplicates = (groupIndex: number) => {
    setSelectedDuplicateGroup(groupIndex);
    setCurrentDuplicatePairIndex(0);
    setShowSideBySideView(true);
  };
  
  const handleAction = (id: string, action: string, groupId?: string) => {
    if (action === 'view' || action === 'fix') {
      setSelectedWarningId(id);
      
      // If groupId is provided, filter issues to only that group
      if (groupId) {
        setActiveFixGroupId(groupId);
      } else {
        setActiveFixGroupId(null); // Show all issues
      }
      setShowFixer(true);
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
  
  const handleFieldOptionChange = (field: string, source: 'record1' | 'record2' | 'recommendation') => {
    if (!mergeOptions[field]) return;

    const updatedMergeOptions = { ...mergeOptions };
    
    // Update the selected status for each option
    updatedMergeOptions[field] = updatedMergeOptions[field].map(option => ({
      ...option,
      selected: option.source === source
    }));
    
    // Update the editable value
    const selectedOption = updatedMergeOptions[field].find(option => option.selected);
    if (selectedOption) {
      setEditableValues(prev => ({
        ...prev,
        [field]: selectedOption.value
      }));
    }
    
    setMergeOptions(updatedMergeOptions);
  };
  
  const handleEditableValueChange = (field: string, value: string) => {
    setEditableValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Also update merge options to deselect all since we're using a custom value
    const updatedMergeOptions = { ...mergeOptions };
    if (updatedMergeOptions[field]) {
      updatedMergeOptions[field] = updatedMergeOptions[field].map(option => ({
        ...option,
        selected: false
      }));
      setMergeOptions(updatedMergeOptions);
    }
  };
  
  const handleNextDuplicatePair = () => {
    if (selectedDuplicateGroup === null) return;
    
    const group = duplicateRecords[selectedDuplicateGroup];
    if (currentDuplicatePairIndex < group.length - 2) {
      setCurrentDuplicatePairIndex(currentDuplicatePairIndex + 1);
    } else {
      // If we're at the last pair in this group, potentially move to next group
      if (selectedDuplicateGroup < duplicateRecords.length - 1) {
        setSelectedDuplicateGroup(selectedDuplicateGroup + 1);
        setCurrentDuplicatePairIndex(0);
      } else {
        // We're at the end
        toast({
          title: "Review complete",
          description: "You've reviewed all duplicate records."
        });
      }
    }
  };
  
  const handlePreviousDuplicatePair = () => {
    if (selectedDuplicateGroup === null) return;
    
    if (currentDuplicatePairIndex > 0) {
      setCurrentDuplicatePairIndex(currentDuplicatePairIndex - 1);
    } else {
      // If we're at the first pair in this group, potentially move to previous group
      if (selectedDuplicateGroup > 0) {
        const previousGroup = duplicateRecords[selectedDuplicateGroup - 1];
        setSelectedDuplicateGroup(selectedDuplicateGroup - 1);
        // Set to the last pair in the previous group
        setCurrentDuplicatePairIndex(previousGroup.length - 2);
      }
    }
  };
  
  const handleApplyMerge = () => {
    if (selectedDuplicateGroup === null) return;
    
    // In a real application, you would apply these changes to your data model
    // For demonstration, we'll just show a toast and move to the next pair
    toast({
      title: "Records merged",
      description: "The selected record has been merged successfully."
    });
    
    handleNextDuplicatePair();
  };
  
  const calculateTotalDuplicatePairs = () => {
    return duplicateRecords.reduce((total, group) => {
      // Each group has (n-1) pairs where n is the number of records in the group
      return total + (group.length - 1);
    }, 0);
  };
  
  const getCurrentPairNumber = () => {
    if (selectedDuplicateGroup === null) return 0;
    
    // Count pairs in previous groups
    let pairsInPreviousGroups = 0;
    for (let i = 0; i < selectedDuplicateGroup; i++) {
      pairsInPreviousGroups += duplicateRecords[i].length - 1;
    }
    
    // Add the current pair index
    return pairsInPreviousGroups + currentDuplicatePairIndex + 1;
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
  
  const renderSideBySideComparison = () => {
    if (selectedDuplicateGroup === null) return null;
    
    const group = duplicateRecords[selectedDuplicateGroup];
    if (!group || currentDuplicatePairIndex >= group.length - 1) return null;
    
    const record1 = group[0];
    const record2 = group[currentDuplicatePairIndex + 1];
    const allFields = Object.keys(record1).filter(field => field !== 'id');
    const isPerfectMatch = allFields.every(field => record1[field] === record2[field]);
    
    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Duplicate Resolution</CardTitle>
            <p className="text-sm text-gray-500">
              Comparing record pairs {getCurrentPairNumber()} of {calculateTotalDuplicatePairs()} total
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSideBySideView(false)}>
            Back to Summary
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="bg-blue-50 p-3 mb-4 rounded-md">
            <p className="text-sm">
              {isPerfectMatch ? (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  These records are perfect matches. You can safely merge them.
                </span>
              ) : (
                <span>
                  Please review the differences between these records and select the correct value for each field,
                  or edit the values directly.
                </span>
              )}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead className="w-[250px]">Record 1 (#{record1.id})</TableHead>
                  <TableHead className="w-[250px]">Record 2 (#{record2.id})</TableHead>
                  <TableHead>Recommended Merge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFields.map(field => (
                  <TableRow key={field} className={record1[field] !== record2[field] ? "bg-yellow-50" : ""}>
                    <TableCell className="font-medium capitalize">{field}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RadioGroup value={mergeOptions[field]?.find(o => o.selected)?.source || ''}>
                          <RadioGroupItem 
                            value="record1"
                            id={`${field}-record1`}
                            checked={mergeOptions[field]?.find(o => o.source === 'record1')?.selected}
                            onClick={() => handleFieldOptionChange(field, 'record1')}
                          />
                        </RadioGroup>
                        {record1[field]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RadioGroup value={mergeOptions[field]?.find(o => o.selected)?.source || ''}>
                          <RadioGroupItem 
                            value="record2"
                            id={`${field}-record2`}
                            checked={mergeOptions[field]?.find(o => o.source === 'record2')?.selected}
                            onClick={() => handleFieldOptionChange(field, 'record2')}
                          />
                        </RadioGroup>
                        {record2[field]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editableValues[field] || ''}
                        onChange={e => handleEditableValueChange(field, e.target.value)}
                        className={record1[field] !== record2[field] ? "border-yellow-300" : ""}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviousDuplicatePair}
              disabled={selectedDuplicateGroup === 0 && currentDuplicatePairIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextDuplicatePair}
            >
              Skip
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={handleApplyMerge}
            >
              Apply Merge
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  const renderDuplicateRecordsTable = () => {
    if (duplicateRecords.length === 0) return null;
    
    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Duplicate Record Groups</CardTitle>
          <div className="flex items-center space-x-2">
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
                      onClick={() => handleViewDuplicates(groupIndex)}
                    >
                      Compare & Merge
                    </Button>
                  </div>
                </div>
                
                {selectedDuplicateGroup === groupIndex && !showSideBySideView && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.map((record, index) => (
                        <TableRow key={record.id} className={index === 0 ? "bg-blue-50" : ""}>
                          <TableCell>
                            <input 
                              type="radio" 
                              name={`group-${groupIndex}`} 
                              defaultChecked={index === 0} 
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.phone}</TableCell>
                          <TableCell>{record.company}</TableCell>
                          <TableCell>
                            {index !== 0 && (
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                                <UserRoundX className="h-4 w-4 mr-1" />
                                Discard
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
            
            {!showSideBySideView && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline">Discard All Duplicates</Button>
                <Button 
                  variant="default"
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  Apply Changes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
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
                ) : showSideBySideView && selectedDuplicateGroup !== null ? (
                  renderSideBySideComparison()
                ) : (
                  <>
                    <ValidationStatus 
                      results={deduplicationResults}
                      title="Deduplication Results"
                      onAction={handleAction}
                    />
                    
                    {renderDuplicateRecordsTable()}
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
