
import React, { useState } from 'react';
import { X, Upload, AlertTriangle, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { validateFile, validateDataQuality } from '@/services/fileValidation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryScore {
  category: string;
  score: number;
  issues: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
  }[];
}

export function FileAnalysisModal({ isOpen, onClose }: FileAnalysisModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      toast({
        title: "File selected",
        description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file data'));
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to format similar to Papa Parse output with headers
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          
          const formattedData = rows.map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              if (typeof header === 'string') {
                obj[header] = index < row.length ? row[index] : null;
              }
            });
            return obj;
          });
          
          resolve(formattedData);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const parseFile = async (file: File): Promise<any[]> => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (['.xls', '.xlsx'].includes(fileExtension)) {
      return parseExcelFile(file);
    } else if (fileExtension === '.csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              // Filter out empty rows
              const filteredData = results.data.filter(row => 
                Object.keys(row).length > 0 && 
                !Object.keys(row).every(key => !row[key])
              );
              resolve(filteredData);
            } else {
              resolve([]);
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            reject(error);
          }
        });
      });
    }
    
    return Promise.resolve([]);
  };

  const analyzeFile = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(10);
    
    try {
      // Step 1: Validate the file structure
      setProgress(20);
      const fileValidationResults = await validateFile(file);
      
      // Calculate file structure score
      const fileStructureIssues = fileValidationResults.map(result => ({
        name: result.validation_type,
        status: result.status,
        details: result.message
      }));
      
      const fileStructureScore = calculateScore(fileStructureIssues.map(i => i.status));
      
      setProgress(40);
      
      // Step 2: Parse and validate data quality
      let dataQualityScore = 0;
      let dataQualityIssues: any[] = [];
      
      try {
        // Parse file data for quality analysis
        const parsedData = await parseFile(file);
        
        if (parsedData.length > 0) {
          setProgress(60);
          
          // Get data quality validation results
          const dataQualityResults = validateDataQuality(parsedData);
          
          dataQualityIssues = dataQualityResults.map(result => ({
            name: result.name,
            status: result.status,
            details: result.description || ''
          }));
          
          dataQualityScore = calculateScore(dataQualityResults.map(r => r.status));
        } else {
          toast({
            title: "No data found",
            description: "The file appears to be empty or contains no valid data.",
            variant: "warning"
          });
        }
      } catch (parseError) {
        console.error('Error parsing file:', parseError);
        toast({
          title: "File parsing failed",
          description: "Unable to parse the file content. The file might be corrupted or in an unsupported format.",
          variant: "destructive"
        });
      }
      
      setProgress(80);
      
      // Calculate overall score
      const categoryResults: CategoryScore[] = [
        {
          category: 'File Structure',
          score: fileStructureScore,
          issues: fileStructureIssues
        },
        {
          category: 'Data Quality',
          score: dataQualityScore,
          issues: dataQualityIssues
        }
      ];
      
      const finalScore = Math.round((fileStructureScore + dataQualityScore) / 2);
      
      setOverallScore(finalScore);
      setCategoryScores(categoryResults);
      setProgress(100);
      setAnalysisComplete(true);
      
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your file.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateScore = (statuses: ('pass' | 'fail' | 'warning')[]) => {
    if (statuses.length === 0) return 0;
    
    const weights = {
      pass: 1,
      warning: 0.5,
      fail: 0
    };
    
    const total = statuses.reduce((sum, status) => sum + weights[status], 0);
    return Math.round((total / statuses.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center p-8">
          <div className="mb-4">
            <FileText className="h-16 w-16 text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium mb-4">Analyzing your file...</h3>
          <div className="w-full max-w-md mb-2">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-sm text-gray-500">{progress}% complete</p>
        </div>
      );
    }

    if (analysisComplete) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center p-4">
            <div className="relative mb-4">
              <div className={`h-32 w-32 rounded-full flex items-center justify-center ${getScoreColor(overallScore)}`}>
                <span className="text-4xl font-bold text-white">{overallScore}</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border shadow-sm">
                <span className="font-medium">{getScoreText(overallScore)}</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Data Quality Score</h3>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-md">
              This score represents the overall quality of your data file. Higher scores indicate fewer issues.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {categoryScores.map((category, index) => (
              <div key={index} className="border-b last:border-b-0">
                <div className="flex justify-between items-center p-4 bg-gray-50">
                  <div>
                    <h4 className="font-medium">{category.category}</h4>
                    <p className="text-sm text-gray-500">{category.issues.length} checks performed</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${getScoreColor(category.score)} text-white font-medium`}>
                    {category.score}%
                  </div>
                </div>
                <div className="p-4">
                  <ScrollArea className="h-48 w-full pr-4">
                    {category.issues.map((issue, i) => (
                      <div key={i} className="flex items-start py-2 border-b last:border-b-0">
                        <div className="mr-3 mt-1">
                          {issue.status === 'pass' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : issue.status === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{issue.name}</p>
                          <p className="text-sm text-gray-500">{issue.details}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-medium text-blue-800">Recommendations</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc list-inside">
              <li>Fix critical issues before proceeding with import</li>
              <li>Address warnings to improve data quality</li>
              <li>Use the data quality tools in the import wizard to clean your data</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center p-6">
        <div className="mb-6">
          <Upload className="h-16 w-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-4">Upload a file to analyze</h3>
        <p className="text-gray-500 text-center mb-6">
          We'll check your file structure and data quality to provide a comprehensive analysis.
        </p>
        <div className="flex flex-col items-center w-full">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to select a file</p>
              <p className="text-sm text-gray-500 mt-1">CSV, XLS, XLSX (max 10MB)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
            />
          </label>
          {file && (
            <div className="mt-4 text-center">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button 
                className="mt-4 bg-brand-purple hover:bg-brand-purple/90" 
                onClick={analyzeFile}
              >
                Analyze File
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Analyze Data Quality</DialogTitle>
          <DialogDescription className="text-center">
            Get insights into your file's structure and data quality before starting the import process
          </DialogDescription>
        </DialogHeader>
        {renderAnalysisContent()}
      </DialogContent>
    </Dialog>
  );
}
