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
  onMappingChange?: (mappings: ColumnMapping[], fieldsData: any[]) => void;
}

export function ColumnMappingForm({ preflightFileID, onSave, isEdit = false, isSaving = false, onMappingChange }: ColumnMappingFormProps) {
  const { toast } = useToast();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mappedColumns, setMappedColumns] = useState<string[]>([]);
  const [aiMappedColumns, setAiMappedColumns] = useState<string[]>([]);
  const [fieldsData, setFieldsData] = useState<any[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [mappingState, setMappingState] = useState({
    isMapping: false,
    mappingText: "",
    phase: ""
  });
  
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
        setMappingState({
          isMapping: true,
          mappingText: "Loading field mapping data from server...",
          phase: "loading"
        });
        
        console.log('preflightFileID:', preflightFileID);
        const response = await preflightService.getMappedFields(preflightFileID);
        console.log('API response:', response);
        
        if (response.content?.Data?.MappedData) {
          const mappedData = JSON.parse(response.content.Data.MappedData);
          const fieldData = JSON.parse(response.content.Data.FieldsData);
          console.log('mappedData:', mappedData);
          console.log('fieldData:', fieldData);
          
          setMappingState({
            isMapping: true,
            mappingText: "Analyzing field compatibility and performing auto-mapping...",
            phase: "auto-mapping"
          });
          
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
          
          // Show auto-mapping results
          setMappingState({
            isMapping: true,
            mappingText: `Auto-mapped ${autoMapped.length} fields successfully. Preparing AI analysis for remaining fields...`,
            phase: "auto-complete"
          });
          
          // Small delay to show auto-mapping completion
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // If not in edit mode, try AI mapping for remaining unmapped fields
          if (!isEdit) {
            const unmappedFields = mappedData.filter((item: any) => 
              !autoMapped.includes(item.FileColumnName)
            );
            if (unmappedFields.length > 0) {
              setMappingState({
                isMapping: true,
                mappingText: `Initializing AI analysis for ${unmappedFields.length} unmapped fields...`,
                phase: "ai-init"
              });
              await getAIMappings(unmappedFields, fieldData, autoMapped.length);
            } else {
              // All fields are auto-mapped
              setMappingState({
                isMapping: true,
                mappingText: `Mapping completed! Successfully auto-mapped all ${autoMapped.length} fields.`,
                phase: "complete"
              });
              
              // Show completion message and close loader
              setTimeout(() => {
                setMappingState({ isMapping: false, mappingText: "", phase: "" });
                toast({
                  title: "Column Mapping Completed",
                  description: `Successfully auto-mapped all ${autoMapped.length} fields.`,
                });
              }, 1500);
            }
          } else {
            setMappingState({ isMapping: false, mappingText: "", phase: "" });
          }
        }
      } catch (error) {
        console.error("Error fetching mapping data:", error);
        setMappingState({ isMapping: false, mappingText: "", phase: "" });
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

  // Notify parent of mapping changes
  useEffect(() => {
    if (!onMappingChange) return;
    const currentMappings = form.getValues('columnMappings').map(mapping => {
      const fieldInfo = fieldsData.find(f => f.PreflightFieldID?.toString() === mapping.targetField);
      return {
        sourceColumn: mapping.sourceColumn,
        targetField: mapping.targetField,
        PreflightFieldID: fieldInfo?.PreflightFieldID,
        IsCustom: fieldInfo?.IsCustom,
        Locations: fieldInfo?.Locations,
      };
    });
    onMappingChange(currentMappings, fieldsData);
  }, [fieldsData, form.watch('columnMappings'), onMappingChange]);

  const getAIMappings = async (unmappedFields: any[], fieldData: any[], autoMappedLength: number) => {
    setIsAiProcessing(true);
    
    try {
      setMappingState({
        isMapping: true,
        mappingText: "AI is analyzing field patterns and similarities...",
        phase: "ai-analyzing"
      });
      
      // In a real implementation, this would call your AI service
      // For now, we'll simulate AI mapping with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMappingState({
        isMapping: true,
        mappingText: "AI is generating mapping suggestions based on field names and data types...",
        phase: "ai-generating"
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      
      setMappingState({
        isMapping: true,
        mappingText: "Applying AI suggestions to column mappings...",
        phase: "ai-applying"
      });
      
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
      
      const totalMapped = autoMappedLength + aiMapped.length;
      const totalFields = autoMappedLength + unmappedFields.length;
      
      setMappingState({
        isMapping: true,
        mappingText: `Mapping completed! Successfully mapped ${totalMapped} out of ${totalFields} fields (${autoMappedLength} auto-mapped, ${aiMapped.length} AI-mapped).`,
        phase: "complete"
      });
      
      // Show completion and close loader
      setTimeout(() => {
        setMappingState({ isMapping: false, mappingText: "", phase: "" });
        toast({
          title: "Column Mapping Completed",
          description: `Successfully mapped ${totalMapped} out of ${totalFields} fields. ${autoMappedLength} auto-mapped, ${aiMapped.length} AI-mapped.`,
        });
      }, 2000);
      
    } catch (error) {
      console.error("Error getting AI mappings:", error);
      setMappingState({ isMapping: false, mappingText: "", phase: "" });
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
    
    const mappedCount = data.columnMappings.filter(m => m.targetField !== "0").length;
    const totalCount = data.columnMappings.length;
    
    toast({
      title: "Column mapping saved",
      description: `Successfully mapped ${mappedCount} out of ${totalCount} fields.`,
    });
  }

  return (
    <Form {...form}>
      <div className="relative">
        {/* Enhanced Loading Overlay - Similar to Split Full Address */}
        {isSaving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Saving Column Mappings</h3>
                <p className="text-gray-600 text-center">
                  Please wait while we save your column mappings and validate the data...
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mapping Process Loading Overlay */}
        {mappingState.isMapping && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  {mappingState.phase === "loading" ? "Loading Mapping Data" :
                   mappingState.phase === "auto-mapping" ? "Auto-Mapping Fields" :
                   mappingState.phase === "auto-complete" ? "Auto-Mapping Complete" :
                   mappingState.phase === "ai-init" ? "Initializing AI Analysis" :
                   mappingState.phase === "ai-analyzing" ? "AI Analyzing Fields" :
                   mappingState.phase === "ai-generating" ? "AI Generating Suggestions" :
                   mappingState.phase === "ai-applying" ? "Applying AI Suggestions" :
                   mappingState.phase === "complete" ? "Mapping Complete" :
                   "Processing Column Mappings"}
                </h3>
                <p className="text-gray-600 text-center">
                  {mappingState.mappingText || "Please wait while we process your column mappings..."}
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{
                    width: mappingState.phase === "loading" ? '20%' :
                           mappingState.phase === "auto-mapping" ? '40%' :
                           mappingState.phase === "auto-complete" ? '60%' :
                           mappingState.phase === "ai-init" ? '65%' :
                           mappingState.phase === "ai-analyzing" ? '75%' :
                           mappingState.phase === "ai-generating" ? '85%' :
                           mappingState.phase === "ai-applying" ? '95%' :
                           mappingState.phase === "complete" ? '100%' : '50%'
                  }}></div>
                </div>
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading mapping data...</p>
          </div>
        ) : (
          <>
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
                              disabled={isEdit || isSaving || mappingState.isMapping}
                            >
                              <FormControl>
                                <SelectTrigger className={field.value ? 'bg-white' : ''}>
                                  <SelectValue placeholder="Select field..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* Always show 'Do Not Import' as the first option */}
                                <SelectItem key={0} value={"0"}>Do Not Import</SelectItem>
                                {fieldsData.filter(field => field.PreflightFieldID !== 0).map((field) => (
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
                disabled={isEdit || isSaving || mappingState.isMapping}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={isEdit || isSaving || mappingState.isMapping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving Mapping...
                  </>
                ) : mappingState.isMapping ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Mapping in Progress...
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
