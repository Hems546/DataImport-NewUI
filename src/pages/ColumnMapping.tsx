
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import FileBox from "@/components/icons/FileBox";
import ClipboardCheck from "@/components/icons/ClipboardCheck";
import ArrowUpCircle from "@/components/icons/ArrowUpCircle";
import ValidationStatus from "@/components/ValidationStatus";

import { ValidationCategory } from "@/constants/validations";
import { runValidationsForStage, allValidationsPass } from "@/services/validationRunner";

export default function ColumnMapping() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [columns, setColumns] = useState<string[]>([]);
  const [mappingConfig, setMappingConfig] = useState<{ [key: string]: string }>({});
  const [requiredFields, setRequiredFields] = useState<string[]>(['email', 'name']); // Example required fields

  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const handleMappingChange = (column: string, targetField: string) => {
    setMappingConfig(prev => ({ ...prev, [column]: targetField }));
  };

  const handleSubmit = () => {
    // Save mapping configuration and proceed
    console.log("Mapping Configuration:", mappingConfig);
    navigate("/import-wizard/data-quality");
  };
  
  const validateColumnMappings = async () => {
    setIsValidating(true);
    
    try {
      // Prepare data for validation
      const validationData = {
        sourceColumns: columns,
        mappings: mappingConfig,
        requiredFields: requiredFields
      };
      
      // Run validations for COLUMN_MAPPING stage
      const results = await runValidationsForStage(ValidationCategory.COLUMN_MAPPING, validationData);
      
      setValidationResults(results);
      
      // Check if there are any critical errors that block continuing
      const hasCriticalErrors = !allValidationsPass(results, 'none');
      setHasBlockingErrors(hasCriticalErrors);
      
      if (hasCriticalErrors) {
        toast({
          title: "Mapping issues detected",
          description: "Please fix these issues before proceeding.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during column mapping validation:", error);
      toast({
        title: "Validation error",
        description: "An error occurred during mapping validation.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Add validation call when mappings change
  useEffect(() => {
    if (columns.length > 0 && Object.keys(mappingConfig).length > 0) {
      validateColumnMappings();
    }
  }, [mappingConfig, columns]);
  
  useEffect(() => {
    // Mock columns for demo purposes
    setColumns([
      "customer_id",
      "first_name",
      "last_name",
      "email_address",
      "phone_number",
      "address"
    ]);
  }, []);

  return (
    <>
      <Header />
      <div className="container mx-auto mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Column Mapping</h2>
          <p className="text-gray-600">Map the columns from your file to the appropriate fields.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <ProgressStep step={2} label="Column Mapping" icon={<MapColumns />} />
            <StepConnector />
            <ProgressStep step={3} label="Data Quality" icon={<DataQuality />} />
            <StepConnector />
            <ProgressStep step={4} label="Transform Data" icon={<TransformData />} />
            <StepConnector />
            <ProgressStep step={5} label="Deduplication" icon={<FileBox />} />
            <StepConnector />
            <ProgressStep step={6} label="Final Review" icon={<ClipboardCheck />} />
            <StepConnector />
            <ProgressStep step={7} label="Import / Push" icon={<ArrowUpCircle />} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Source Columns</h3>
            <div className="space-y-4">
              {columns.map(column => (
                <div key={column} className="flex items-center justify-between">
                  <Label htmlFor={column}>{column}</Label>
                  <Select onValueChange={(value) => handleMappingChange(column, value)}>
                    <SelectTrigger id={column}>
                      <SelectValue placeholder="Map to Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="ignore">Ignore this column</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Validation Status</h3>
            <ValidationStatus results={validationResults} title="Column Mapping Validations" />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Link to="/import-wizard/file-verification">
            <Button variant="outline">
              <ArrowLeft className="mr-2" />
              Previous
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={hasBlockingErrors || isValidating}>
            Next
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}
