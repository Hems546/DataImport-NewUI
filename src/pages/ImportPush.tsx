import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  FileCheck,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  FileSearch
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ImportProgress from "@/components/ImportProgress";
import { FileAnalysisModal } from "@/components/FileAnalysisModal";
import { supabase } from "@/integrations/supabase/client";

export default function ImportPush() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    totalRows: 0,
    processedRows: 0,
    failedRows: 0
  });
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Check for critical validation failures
  const checkValidations = async (importSessionId: string) => {
    const { data: validations, error } = await supabase
      .from('file_validations')
      .select('*')
      .eq('import_session_id', importSessionId)
      .eq('status', 'fail')
      .eq('severity', 'critical');

    if (error) {
      throw new Error('Failed to check validations');
    }

    return validations.length === 0;
  };

  const startImport = async () => {
    try {
      setIsImporting(true);
      setImportStatus('processing');

      // Get current import session from local storage
      const sessionData = localStorage.getItem('importSession');
      if (!sessionData) {
        throw new Error('No active import session found');
      }

      const { id: importSessionId } = JSON.parse(sessionData);

      // Check validations first
      const canProceed = await checkValidations(importSessionId);
      if (!canProceed) {
        throw new Error('Critical validation failures must be resolved before import');
      }

      // Get the imported data to calculate total rows
      const { data: importedData } = await supabase
        .from('imported_data')
        .select('row_count')
        .eq('import_session_id', importSessionId)
        .single();

      if (!importedData) {
        throw new Error('No imported data found');
      }

      // Create import execution record
      // Since we don't have authentication implemented yet, we'll use a placeholder user_id
      // In a real application, this would come from the authenticated user's session
      const placeholderUserId = '00000000-0000-0000-0000-000000000000';
      
      const { data: execution, error: executionError } = await supabase
        .from('import_executions')
        .insert({
          import_session_id: importSessionId,
          total_rows: importedData.row_count,
          status: 'processing',
          user_id: placeholderUserId // Add the required user_id field
        })
        .select()
        .single();

      if (executionError) throw executionError;

      // Simulate row-by-row processing
      const totalRows = importedData.row_count;
      setStats(prev => ({ ...prev, totalRows }));

      for (let i = 0; i < totalRows; i++) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const success = Math.random() > 0.05; // 5% failure rate for demo
        
        setStats(prev => ({
          ...prev,
          processedRows: prev.processedRows + 1,
          failedRows: success ? prev.failedRows : prev.failedRows + 1
        }));

        setProgress(Math.round(((i + 1) / totalRows) * 100));
      }

      // Update execution record
      const finalStatus = stats.failedRows === 0 ? 'completed' : 'completed_with_errors';
      await supabase
        .from('import_executions')
        .update({
          status: finalStatus,
          completed_at: new Date().toISOString(),
          processed_rows: stats.processedRows,
          failed_rows: stats.failedRows
        })
        .eq('id', execution.id);

      setImportStatus('completed');
      toast({
        title: "Import completed",
        description: stats.failedRows === 0 
          ? "All rows were imported successfully"
          : `Import completed with ${stats.failedRows} failed rows`,
        variant: stats.failedRows === 0 ? "default" : "warning"
      });

    } catch (error) {
      setImportStatus('failed');
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/review">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Import / Push</h2>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
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
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
              isActive={true}
            />
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Import Data</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Important:</strong> Before starting the import:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Make sure all critical validation issues are resolved</li>
                  <li>Review your column mappings</li>
                  <li>Check data transformations and normalization rules</li>
                  <li>Verify deduplication settings</li>
                </ul>
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">
              Once started, the import process will:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Validate your data one final time</li>
                <li>Process each row according to your settings</li>
                <li>Apply transformations and normalizations</li>
                <li>Handle duplicates based on your rules</li>
                <li>Import valid records into your database</li>
              </ol>
            </p>
            
            {importStatus === 'pending' ? (
              <div className="p-8 bg-gray-50 border rounded-md text-center">
                <p className="text-gray-600">Click "Start Import" when you're ready to begin.</p>
                <p className="text-sm text-gray-500 mt-2">This process cannot be interrupted once started.</p>
              </div>
            ) : (
              <ImportProgress 
                status={importStatus}
                progress={progress}
                totalRows={stats.totalRows}
                processedRows={stats.processedRows}
                failedRows={stats.failedRows}
              />
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/review">
                <Button variant="outline" disabled={isImporting}>
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-brand-purple text-brand-purple hover:bg-brand-purple/10"
                onClick={() => setIsAnalysisModalOpen(true)}
                disabled={isImporting || importStatus === 'completed'}
              >
                <FileSearch className="mr-2" />
                Analyze your file
              </Button>
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={isImporting || importStatus === 'completed'}
                onClick={startImport}
              >
                {importStatus === 'completed' ? 'Import Complete' : 'Start Import'}
                <ArrowUpCircle className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <FileAnalysisModal 
        isOpen={isAnalysisModalOpen} 
        onClose={() => setIsAnalysisModalOpen(false)} 
      />
    </div>
  );
}
