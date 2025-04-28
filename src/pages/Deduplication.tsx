import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  RotateCcw
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
  CardTitle
} from "@/components/ui/card";

export default function Deduplication() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [deduplicationResults, setDeduplicationResults] = useState<ValidationResult[]>([]);
  const [duplicateRecords, setDuplicateRecords] = useState<any[]>([]);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState<number | null>(null);

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
              'Action required: Review and confirm duplicate removal'
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
  
  const handleViewDuplicates = (groupIndex: number) => {
    setSelectedDuplicateGroup(groupIndex === selectedDuplicateGroup ? null : groupIndex);
  };
  
  const renderDuplicateRecordsTable = () => {
    if (duplicateRecords.length === 0) return null;
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Duplicate Record Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {duplicateRecords.map((group, groupIndex) => (
              <div key={groupIndex} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-3 bg-gray-50 border-b flex justify-between items-center cursor-pointer"
                  onClick={() => handleViewDuplicates(groupIndex)}
                >
                  <div>
                    <span className="font-medium">Group {groupIndex + 1}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({group.length} potential matches)
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {selectedDuplicateGroup === groupIndex ? 'Hide Records' : 'View Records'}
                  </Button>
                </div>
                
                {selectedDuplicateGroup === groupIndex && (
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
                              <Button size="sm" variant="ghost">
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
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline">Discard All Duplicates</Button>
              <Button variant="default">Apply Selected Resolutions</Button>
            </div>
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
                <ValidationStatus 
                  results={deduplicationResults}
                  title="Deduplication Results"
                />
                
                {renderDuplicateRecordsTable()}
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
