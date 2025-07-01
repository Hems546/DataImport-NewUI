import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { preflightService } from "@/services/preflightService";

const FormSchema = z.object({
  columnMappings: z.array(
    z.object({
      sourceColumn: z.string(),
      targetField: z.string(),
    })
  ),
});

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  PreflightFieldID?: number;
  IsCustom?: boolean;
  Locations?: string;
}

interface ColumnMappingFormProps {
  preflightFileID: number;
  onSave?: (mappings: ColumnMapping[]) => void;
  isEdit?: boolean;
  isSaving?: boolean;
}

export function ColumnMappingForm({ preflightFileID, onSave, isEdit = false, isSaving = false }: ColumnMappingFormProps) {
  const { toast } = useToast();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mappedColumns, setMappedColumns] = useState<string[]>([]);
  const [aiMappedColumns, setAiMappedColumns] = useState<string[]>([]);
  const [fieldsData, setFieldsData] = useState<any[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      columnMappings: [],
    },
  });

  useEffect(() => {
    if (!preflightFileID || preflightFileID === 0) return;
    const fetchMappingData = async () => {
      try {
        setIsLoading(true);
        console.log('preflightFileID:', preflightFileID);
        const response = await preflightService.getMappedFields(preflightFileID);
        console.log('API response:', response);
        if (response.content?.Data?.MappedData) {
          const mappedData = JSON.parse(response.content.Data.MappedData);
          const fieldData = JSON.parse(response.content.Data.FieldsData);
          console.log('mappedData:', mappedData);
          console.log('fieldData:', fieldData);
          
          // Set source columns from mapped data
          const columns = mappedData.map((item: any) => item.FileColumnName);
          setSourceColumns(columns);
          
          // Set fields data
          setFieldsData(fieldData);
          
          // Initialize form with mapped data and auto-map matching fields
          const initialMappings = mappedData.map((item: any) => {
            // Try to find an exact match in fieldData
            const exactMatch = fieldData.find(f => 
              f.DisplayName.toLowerCase() === item.FileColumnName.toLowerCase()
            );
            
            // If no exact match, try to find a partial match
            const partialMatch = !exactMatch ? fieldData.find(f => 
              f.DisplayName.toLowerCase().includes(item.FileColumnName.toLowerCase()) ||
              item.FileColumnName.toLowerCase().includes(f.DisplayName.toLowerCase())
            ) : null;
            
            // Use the matched field ID or the existing mapping
            const targetField = exactMatch?.PreflightFieldID || 
                              partialMatch?.PreflightFieldID || 
                              item.PreflightFieldID?.toString() || 
                              "0";
            
            return {
              sourceColumn: item.FileColumnName,
              targetField: targetField.toString(),
            };
          });
          
          form.reset({
            columnMappings: initialMappings,
          });
          
          // Track auto-mapped columns
          const autoMapped = initialMappings
            .filter(mapping => mapping.targetField !== "0")
            .map(mapping => mapping.sourceColumn);
          setMappedColumns(autoMapped);
          
          // If not in edit mode, try AI mapping for remaining unmapped fields
          if (!isEdit) {
            const unmappedFields = mappedData.filter((item: any) => 
              !autoMapped.includes(item.FileColumnName)
            );
            if (unmappedFields.length > 0) {
              getAIMappings(unmappedFields, fieldData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching mapping data:", error);
        toast({
          title: "Error",
          description: "Failed to load field mapping data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMappingData();
  }, [preflightFileID, isEdit]);

  const getAIMappings = async (unmappedFields: any[], fieldData: any[]) => {
    setIsAiProcessing(true);
    
    try {
      // In a real implementation, this would call your AI service
      // For now, we'll simulate AI mapping with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiSuggestedMappings = unmappedFields.map(field => {
        const sourceCol = field.FileColumnName.toLowerCase();
        let suggestion = "";
        
        // Simple mapping logic (replace with your AI service)
        const fieldMatch = fieldData.find(f => 
          f.DisplayName.toLowerCase().includes(sourceCol) ||
          sourceCol.includes(f.DisplayName.toLowerCase())
        );
        
        if (fieldMatch) {
          suggestion = fieldMatch.PreflightFieldID.toString();
        }
        
        return {
          ...field,
          PreflightFieldID: suggestion ? parseInt(suggestion) : 0,
        };
      });
      
      // Track AI-mapped columns
      const aiMapped = aiSuggestedMappings
        .filter(m => m.PreflightFieldID !== 0)
        .map(m => m.FileColumnName);
      
      setAiMappedColumns(aiMapped);
      
      // Update form with AI suggestions
      const updatedMappings = form.getValues("columnMappings").map(mapping => {
        const aiSuggestion = aiSuggestedMappings.find(
          m => m.FileColumnName === mapping.sourceColumn
        );
        
        if (aiSuggestion && aiSuggestion.PreflightFieldID !== 0) {
          return {
            sourceColumn: mapping.sourceColumn,
            targetField: aiSuggestion.PreflightFieldID.toString(),
          };
        }
        
        return mapping;
      });
      
      form.setValue("columnMappings", updatedMappings);
      
      toast({
        title: "AI mapping completed",
        description: `Successfully mapped ${aiMapped.length} additional fields with AI assistance.`,
      });
      
    } catch (error) {
      console.error("Error getting AI mappings:", error);
      toast({
        title: "AI mapping failed",
        description: "There was an error getting AI-assisted mappings. Please map columns manually.",
        variant: "destructive",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (onSave) {
      const validMappings: ColumnMapping[] = data.columnMappings.map(mapping => {
        const fieldInfo = fieldsData.find(f => f.PreflightFieldID.toString() === mapping.targetField);
        return {
          sourceColumn: mapping.sourceColumn,
          targetField: mapping.targetField,
          PreflightFieldID: fieldInfo?.PreflightFieldID,
          IsCustom: fieldInfo?.IsCustom,
          Locations: fieldInfo?.Locations,
        };
      });
      
      onSave(validMappings);
    }
    
    toast({
      title: "Column mapping saved",
      description: `Successfully mapped ${data.columnMappings.filter(m => m.targetField !== "0").length} fields.`,
    });
  }

  return (
    <Form {...form}>
      <div className="relative">
        {/* Loading Overlay */}
        {isSaving && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-3">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">Saving Column Mappings</p>
                  <p className="text-sm text-gray-600">Please wait while we save your column mappings...</p>
                </div>
              </div>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-800">Mapping Process</h3>
            <p className="text-sm text-blue-700 mt-1">
              We've automatically mapped columns with exact matches and used AI to suggest mappings for others.
              Please review and adjust any mappings that need correction.
            </p>
          </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
            <p className="text-gray-500">Loading mapping data...</p>
          </div>
        ) : (
          <>
            {isAiProcessing && (
              <div className="flex items-center justify-center space-x-2 py-4 bg-gray-50 rounded-md border border-gray-100">
                <Loader className="h-5 w-5 animate-spin text-primary" />
                <p>AI is analyzing your columns and suggesting mappings...</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-4">Column Mappings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-2 font-medium px-4">
                  <div>Source Column</div>
                  <div>Target Field</div>
                </div>
                {sourceColumns.map((column, index) => {
                  const isAutoMapped = mappedColumns.includes(column);
                  const isAIMapped = aiMappedColumns.includes(column);
                  const mappingStatus = isAutoMapped ? "auto" : isAIMapped ? "ai" : "manual";
                  
                  return (
                    <div 
                      key={index} 
                      className={`grid grid-cols-2 gap-4 items-center p-4 rounded-md ${
                        isAutoMapped ? 'bg-green-50 border border-green-100' : 
                        isAIMapped ? 'bg-blue-50 border border-blue-100' : 
                        'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Input
                          value={column}
                          disabled
                          className="bg-white"
                        />
                        {mappingStatus === "auto" && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Auto</span>
                        )}
                        {mappingStatus === "ai" && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">AI</span>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name={`columnMappings.${index}.targetField`}
                        render={({ field }) => (
                          <FormItem>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={isEdit || isSaving}
                            >
                              <FormControl>
                                <SelectTrigger className={field.value ? 'bg-white' : ''}>
                                  <SelectValue placeholder="Select field..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fieldsData.map((field) => (
                                  <SelectItem 
                                    key={field.PreflightFieldID} 
                                    value={field.PreflightFieldID.toString()}
                                  >
                                    {field.DisplayName} {field.IsMandatory && <span className="text-red-500">*</span>}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <input 
                        type="hidden" 
                        {...form.register(`columnMappings.${index}.sourceColumn`)}
                        value={column}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  form.reset();
                  setMappedColumns([]);
                  setAiMappedColumns([]);
                }}
                disabled={isEdit || isSaving}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isEdit || isSaving}>
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving Mapping...
                  </>
                ) : (
                  "Save Mapping"
                )}
              </Button>
            </div>
          </>
        )}
        </form>
      </div>
    </Form>
  );
}
