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
import { systemTemplates } from "@/data/systemTemplates";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

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
}

interface ColumnMappingFormProps {
  template?: string;
  onSave?: (mappings: ColumnMapping[]) => void;
}

export function ColumnMappingForm({ template = "Contacts", onSave }: ColumnMappingFormProps) {
  const { toast } = useToast();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [mappedColumns, setMappedColumns] = useState<string[]>([]);
  const [aiMappedColumns, setAiMappedColumns] = useState<string[]>([]);
  
  // Find the selected template
  const selectedTemplate = systemTemplates.find(t => t.title === template) || systemTemplates[0];
  
  // Mock source columns (would come from the uploaded file in production)
  const sourceColumns = [
    "First Name", "Last Name", "Email Address", "Company", "Phone Number", 
    "Job Title", "Department", "Address Line 1", "City", "State/Province", 
    "Country", "ZIP/Postal"
  ];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      columnMappings: sourceColumns.map(col => ({
        sourceColumn: col,
        targetField: "" // Auto-mapping will fill this
      })),
    },
  });

  // Function to get AI-assisted mappings
  const getAIMappings = async (unmappedColumns: ColumnMapping[]) => {
    setIsAiProcessing(true);
    
    try {
      // In a real app, this would call an OpenAI API endpoint
      // Simulating AI processing with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate AI mapping for columns that couldn't be automatically mapped
      const aiSuggestedMappings = unmappedColumns.map(mapping => {
        const sourceCol = mapping.sourceColumn.toLowerCase();
        let suggestion = "";
        
        // More sophisticated mapping logic with common naming patterns
        if (sourceCol.includes("first") || sourceCol === "fname") {
          suggestion = "firstName";
        } 
        else if (sourceCol.includes("last") || sourceCol === "lname") {
          suggestion = "lastName";
        }
        else if (sourceCol.includes("email") || sourceCol.includes("e-mail")) {
          suggestion = "email";
        }
        else if (sourceCol.includes("phone") || sourceCol.includes("tel") || sourceCol.includes("mobile")) {
          suggestion = "phone";
        }
        else if (sourceCol.includes("company") || sourceCol.includes("organization") || sourceCol.includes("org")) {
          suggestion = "company";
        }
        else if (sourceCol.includes("job") || sourceCol.includes("title") || sourceCol.includes("position") || sourceCol.includes("role")) {
          suggestion = "title";
        }
        else if (sourceCol.includes("dept") || sourceCol.includes("department")) {
          suggestion = "department";
        }
        else if (sourceCol.includes("address") || sourceCol.includes("street") || sourceCol.includes("line 1")) {
          suggestion = "address";
        }
        else if (sourceCol === "city") {
          suggestion = "city";
        }
        else if (sourceCol.includes("state") || sourceCol.includes("province")) {
          suggestion = "state";
        }
        else if (sourceCol.includes("country") || sourceCol.includes("nation")) {
          suggestion = "country";
        }
        else if (sourceCol.includes("zip") || sourceCol.includes("postal")) {
          suggestion = "zipCode";
        }
        
        return {
          ...mapping,
          targetField: suggestion
        };
      });
      
      // Track which columns were mapped by AI
      const aiMapped = aiSuggestedMappings
        .filter(m => m.targetField !== "")
        .map(m => m.sourceColumn);
      
      setAiMappedColumns(aiMapped);
      
      // Update form with AI suggestions
      const updatedMappings = form.getValues("columnMappings").map(mapping => {
        // Keep already mapped fields
        if (mapping.targetField !== "") {
          return mapping;
        }
        
        // Find and apply AI suggestion
        const aiSuggestion = aiSuggestedMappings.find(m => m.sourceColumn === mapping.sourceColumn);
        return {
          sourceColumn: mapping.sourceColumn,
          targetField: aiSuggestion?.targetField || ""
        };
      });
      
      form.setValue("columnMappings", updatedMappings);
      
      toast({
        title: "AI mapping completed",
        description: `Successfully mapped ${aiMapped.length} additional fields with AI assistance.`
      });
      
    } catch (error) {
      console.error("Error getting AI mappings:", error);
      toast({
        title: "AI mapping failed",
        description: "There was an error getting AI-assisted mappings. Please map columns manually.",
        variant: "destructive"
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Run auto-mapping on initial load
  useEffect(() => {
    const applyInitialMapping = () => {
      // Simple auto-mapping based on exact name matches
      const mappings = sourceColumns.map(sourceCol => {
        // Normalize the source column name for comparison
        const normalizedSourceCol = sourceCol.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
        
        // Look for exact matches first (case insensitive)
        const exactMatch = selectedTemplate.fields.find(field => {
          const normalizedFieldName = field.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
          return normalizedSourceCol === normalizedFieldName;
        });
        
        return {
          sourceColumn: sourceCol,
          targetField: exactMatch?.name || ""
        };
      });
      
      // Track which fields were auto-mapped
      const autoMapped = mappings.filter(m => m.targetField).map(m => m.sourceColumn);
      setMappedColumns(autoMapped);
      
      // Update form with mapped fields
      form.setValue("columnMappings", mappings);
      
      // Show toast notification with mapping results
      toast({
        title: "Auto-mapping complete",
        description: `Mapped ${autoMapped.length} out of ${sourceColumns.length} fields.`
      });
      
      // Get AI suggestions for unmapped fields
      const unmappedFields = mappings.filter(m => !m.targetField);
      if (unmappedFields.length > 0) {
        getAIMappings(unmappedFields);
      }
    };
    
    applyInitialMapping();
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Column mapping submitted:", data);
    
    // Call the onSave callback if provided
    if (onSave) {
      // Ensure all mappings have valid sourceColumn and targetField values
      const validMappings: ColumnMapping[] = data.columnMappings.map(mapping => ({
        sourceColumn: mapping.sourceColumn || '',
        targetField: mapping.targetField || ''
      }));
      
      onSave(validMappings);
    }
    
    // Show success toast
    toast({
      title: "Column mapping saved",
      description: `Successfully mapped ${data.columnMappings.filter(m => m.targetField).length} fields.`
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800">Mapping Process</h3>
          <p className="text-sm text-blue-700 mt-1">
            We've automatically mapped columns with exact matches and used AI to suggest mappings for others.
            Please review and adjust any mappings that need correction.
          </p>
        </div>
        
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
              // Determine the status of this mapping
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
                        >
                          <FormControl>
                            <SelectTrigger className={field.value ? 'bg-white' : ''}>
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedTemplate.fields.map((templateField) => (
                              <SelectItem 
                                key={templateField.name} 
                                value={templateField.name}
                              >
                                {templateField.name} {templateField.required && <span className="text-red-500">*</span>}
                              </SelectItem>
                            ))}
                            <SelectItem value="ignore">Ignore this column</SelectItem>
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
              form.reset({
                columnMappings: sourceColumns.map(col => ({
                  sourceColumn: col,
                  targetField: ""
                }))
              });
              setMappedColumns([]);
              setAiMappedColumns([]);
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save Mapping</Button>
        </div>
      </form>
    </Form>
  );
}
