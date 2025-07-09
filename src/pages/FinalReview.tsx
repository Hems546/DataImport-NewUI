import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  Undo,
  FileText,
} from "lucide-react";
import { ImportStepHeader } from "@/components/ImportStepHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import FinalReviewValidations from "@/components/FinalReviewValidations";
import { Loading } from '@/components/ui/loading';
import { preflightService } from "@/services/preflightService";

interface AutoFix {
  id: string;
  issueType: string;
  description: string;
  count: number;
  canUndo: boolean;
}

type IssueSeverity = 'warning' | 'critical';

interface UnresolvedIssue {
  id: string;
  severity: IssueSeverity;
  description: string;
  affectedCount: number;
  stage: string;
}

export default function FinalReview() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const locationPreflightFileInfo = location.state?.preflightFileInfo;
  const currentStep = location.state?.currentStep;
  const completedSteps = location.state?.completedSteps || [];
  const [preflightFileInfo, setPreflightFileInfo] = useState(() => 
    locationPreflightFileInfo || {
      PreflightFileID: 0,
      Status: "",
      FileUploadStatus: "",
      FieldMappingStatus: "",
      DataPreflightStatus: "",
      DataValidationStatus: "",
      DataVerificationStatus: "",
      FinalReviewStatus: "",
      ImportPushStatus: "",
      ImportName: "",
      Action: "Final Review & Approval",
      AddColumns: "",
      FileName: "",
      FileType: "",
      FileSize: 0,
      FileExtension: "",
      FileData: "",
      DocTypeID: 0,
      ImportTypeName: "",
      MappedFieldIDs: [],
      DataSummary: ""
    }
  );
  const [isLoading, setIsLoading] = useState(true);
  const [autoFixes, setAutoFixes] = useState<AutoFix[]>([]);
  const [unresolvedIssues, setUnresolvedIssues] = useState<UnresolvedIssue[]>([]);
  const [rowStats, setRowStats] = useState({
    originalRows: 0,
    validRows: 0,
    percentValid: 0,
  });
  const [canContinue, setCanContinue] = useState(false);
  const [finalApproved, setFinalApproved] = useState(false);

  useEffect(() => {
    // Get data from route state and update preflightFileInfo if available
    const state = location.state as any;
    const { preflightFileInfo: incomingPreflightFileInfo } = state || {};
    
    if (incomingPreflightFileInfo) {
      setPreflightFileInfo(incomingPreflightFileInfo);
    }
  }, [location.state]);

  useEffect(() => {
    const loadReviewData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockAutoFixes = [
          {
            id: "af1",
            issueType: "Formatting",
            description: "Phone numbers standardized to E.164 format",
            count: 45,
            canUndo: true
          },
          {
            id: "af2",
            issueType: "Data Correction",
            description: "Email domains fixed (e.g., gmial.com → gmail.com)",
            count: 12,
            canUndo: true
          },
          {
            id: "af3",
            issueType: "Normalization",
            description: "State abbreviations converted to full names",
            count: 28,
            canUndo: false
          }
        ];

        const mockUnresolvedIssues: UnresolvedIssue[] = [
          {
            id: "ui1",
            severity: "warning",
            description: "Potential duplicate records (85-95% similarity)",
            affectedCount: 8,
            stage: "Deduplication"
          },
          {
            id: "ui2",
            severity: "warning",
            description: "Missing optional fields (website URLs)",
            affectedCount: 23,
            stage: "Data Quality"
          }
        ];

        const mockRowStats = {
          originalRows: 500,
          validRows: 492,
          percentValid: 98.4
        };

        setAutoFixes(mockAutoFixes);
        setUnresolvedIssues(mockUnresolvedIssues);
        setRowStats(mockRowStats);
        
        const hasCriticalIssues = mockUnresolvedIssues.some(
          (issue): issue is UnresolvedIssue & { severity: 'critical' } => 
            issue.severity === 'critical'
        );

        setCanContinue(!hasCriticalIssues);

        if (hasCriticalIssues) {
          toast({
            title: "Critical issues found",
            description: "You must resolve critical issues before continuing.",
            variant: "destructive"
          });
        } else if (mockUnresolvedIssues.length > 0) {
          toast({
            title: "Review needed",
            description: `${mockUnresolvedIssues.length} non-critical issues found that may be overridden.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Review ready",
            description: "Your data is ready for import. No issues found."
          });
        }
      } catch (error) {
        console.error("Error loading review data:", error);
        toast({
          title: "Error loading review data",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewData();
  }, [toast]);

  const handleUndoFix = (fixId: string) => {
    const fixToUndo = autoFixes.find(fix => fix.id === fixId);
    
    if (!fixToUndo) return;

    const undoDetails = {
      "af1": () => {
        toast({
          title: "Phone Number Fix Undone",
          description: "Reverted 45 phone numbers to original format.",
          variant: "warning"
        });
      },
      "af2": () => {
        toast({
          title: "Email Domain Fix Undone",
          description: "Restored 12 email domains to their original form.",
          variant: "warning"
        });
      },
      "af3": () => {
        toast({
          title: "Cannot Undo",
          description: "This normalization cannot be reversed.",
          variant: "destructive"
        });
        return false;
      }
    };

    const canUndo = undoDetails[fixId as keyof typeof undoDetails]?.();

    if (canUndo !== false) {
      setAutoFixes(prev => prev.filter(fix => fix.id !== fixId));
    }
  };

  const handleOverrideIssue = (issueId: string) => {
    toast({
      title: "Issue overridden",
      description: "You've chosen to proceed despite this warning.",
    });
    
    setUnresolvedIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleFinalApproval = () => {
    setFinalApproved(true);
    toast({
      title: "Final approval granted",
      description: "You have approved the import. You can now proceed to the final step.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Import Step Header */}
          <ImportStepHeader
            stepTitle="Final Review & Approval"
            status={preflightFileInfo.Status || 'Not Started'}
            docTypeName={preflightFileInfo.ImportTypeName || 'Unknown Type'}
            importName={preflightFileInfo.ImportName || 'Untitled Import'}
            currentStep={currentStep || "FinalReview"}
            completedSteps={completedSteps}
            preflightFileInfo={preflightFileInfo}
            setPreflightFileInfo={setPreflightFileInfo}
          />

          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/import-step-handler', { 
                state: { 
                  requestedStep: 'DataVerification',
                  preflightFileInfo: preflightFileInfo
                }
              })}
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold mb-6">Final Review & Approval</h3>
            
            {isLoading ? (
              <Loading message="Loading review data..." />
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Import Summary</h4>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-700">Records processed</span>
                    <span className="font-semibold">{rowStats.originalRows}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-700">Valid records</span>
                    <span className="font-semibold">{rowStats.validRows}</span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blue-700 mb-1">
                      <span>Data Quality</span>
                      <span>{rowStats.percentValid}%</span>
                    </div>
                    <Progress value={rowStats.percentValid} className="h-2 bg-blue-200">
                      <div className="bg-blue-600" />
                    </Progress>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <FinalReviewValidations isLoading={false} />
                </div>
                
                {autoFixes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                      Auto-Fixes Applied
                    </h4>
                    <Table className="border rounded-md">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Issue Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {autoFixes.map((fix) => (
                          <TableRow key={fix.id}>
                            <TableCell className="font-medium">{fix.issueType}</TableCell>
                            <TableCell>{fix.description}</TableCell>
                            <TableCell className="text-right">{fix.count}</TableCell>
                            <TableCell>
                              {fix.canUndo && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUndoFix(fix.id)}
                                  className="flex items-center text-gray-600"
                                >
                                  <Undo className="h-4 w-4 mr-1" />
                                  Undo
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {unresolvedIssues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      Unresolved Issues
                    </h4>
                    
                    <div className="space-y-3">
                      {unresolvedIssues.map((issue) => (
                        <Alert 
                          key={issue.id}
                          variant={issue.severity === 'critical' ? "destructive" : "warning"}
                          className="flex justify-between items-start"
                        >
                          <div>
                            <AlertTitle className="flex items-center">
                              {issue.description} 
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {issue.stage}
                              </span>
                            </AlertTitle>
                            <AlertDescription>
                              Affects {issue.affectedCount} record{issue.affectedCount !== 1 ? 's' : ''}
                            </AlertDescription>
                          </div>
                          
                          {issue.severity === 'warning' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOverrideIssue(issue.id)}
                              className="mt-0 shrink-0"
                            >
                              Override
                            </Button>
                          )}
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
                
                {unresolvedIssues.length === 0 && autoFixes.length === 0 && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Check className="h-5 w-5 text-green-600" />
                    <AlertTitle>All systems go!</AlertTitle>
                    <AlertDescription>
                      Your data has passed all quality checks and is ready for import.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Final Approval</span>
                    <Button 
                      variant={finalApproved ? "outline" : "default"}
                      className={finalApproved ? "bg-green-50 text-green-700 border-green-200" : "bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"}
                      onClick={handleFinalApproval}
                      disabled={finalApproved}
                    >
                      {finalApproved ? "Approved ✓" : "Approve Import Data"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    By approving, you confirm that you have reviewed all data modifications and are ready to proceed with the import.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/import-step-handler', { 
                  state: { 
                    requestedStep: 'DataVerification',
                    preflightFileInfo: preflightFileInfo
                  }
                })}
              >
                <ArrowLeft className="mr-2" />
                Back
              </Button>
            </div>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90"
              disabled={isLoading || !canContinue || !finalApproved}
              onClick={() => navigate('/import-step-handler', {
                state: {
                  requestedStep: 'ImportPush',
                  preflightFileInfo: {
                    ...preflightFileInfo,
                    FinalReviewStatus: 'Success'
                  }
                }
              })}
            >
              Continue to Import
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
