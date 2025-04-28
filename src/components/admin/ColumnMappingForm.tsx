
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRightLeft, Wand2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { systemTemplates } from "@/data/systemTemplates";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  mappingStrategy: z.enum(["auto", "manual", "ai"], {
    required_error: "Please select a mapping strategy.",
  }),
  columnMappings: z.array(
    z.object({
      sourceColumn: z.string(),
      targetField: z.string(),
    })
  ),
});

type MappingStrategy = "auto" | "manual" | "ai";

interface ColumnMappingFormProps {
  template?: string;
  onSave?: (mappings: { sourceColumn: string, targetField: string }[]) => void;
}

export function ColumnMappingForm({ template = "Contacts", onSave }: ColumnMappingFormProps) {
  const { toast } = useToast();
  
  // Find the selected template
  const selectedTemplate = systemTemplates.find(t => t.title === template) || systemTemplates[0];
  
  // Mock source columns (would come from the uploaded file in production)
  const sourceColumns = [
    "First Name", "Last Name", "Email Address", "Company", "Phone Number", 
    "Job Title", "Department", "Address Line 1", "City", "State/Province", 
    "Country", "ZIP/Postal"
  ];

  // Track which fields have been auto-mapped
  const [autoMappedFields, setAutoMappedFields] = useState<string[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mappingStrategy: "auto",
      columnMappings: sourceColumns.map(col => ({
        sourceColumn: col,
        targetField: "" // Auto-mapping will fill this
      })),
    },
  });

  // Apply the mapping strategy when it changes
  useEffect(() => {
    const applyMappingStrategy = async () => {
      const strategy = form.watch("mappingStrategy");
      let mappings = [...form.getValues("columnMappings")];
      
      // Clear previous mappings if switching strategies
      if (strategy === "manual") {
        // In manual mode, we clear all mappings for user to set
        mappings = sourceColumns.map(sourceCol => ({
          sourceColumn: sourceCol,
          targetField: ""
        }));
        setAutoMappedFields([]);
      } 
      else if (strategy === "auto") {
        // Simple auto-mapping based on name similarity
        mappings = sourceColumns.map(sourceCol => {
          const normalizedSourceCol = sourceCol.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
          
          const matchedField = selectedTemplate.fields.find(field => {
            const normalizedFieldName = field.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
            return normalizedSourceCol === normalizedFieldName || 
                  normalizedSourceCol.includes(normalizedFieldName) || 
                  normalizedFieldName.includes(normalizedSourceCol);
          });
          
          return {
            sourceColumn: sourceCol,
            targetField: matchedField?.name || ""
          };
        });
        
        // Track which fields were auto-mapped
        setAutoMappedFields(mappings.filter(m => m.targetField).map(m => m.sourceColumn));
        
        // Show success toast
        toast({
          title: "Auto-mapping complete",
          description: `Mapped ${mappings.filter(m => m.targetField).length} out of ${sourceColumns.length} fields.`
        });
      }
      else if (strategy === "ai") {
        // Simulate AI processing with a delay
        toast({
          title: "AI mapping in progress",
          description: "Analyzing your data and finding the best matches..."
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // AI mapping would be more sophisticated, here it's just a smarter auto-map
        mappings = sourceColumns.map(sourceCol => {
          // AI would use more sophisticated logic, here we simulate with smarter matching
          const normalizedSource = sourceCol.toLowerCase();
          
          // Specific cases for common fields with different naming conventions
          let bestMatch;
          
          if (normalizedSource.includes("first") || normalizedSource.includes("fname")) {
            bestMatch = selectedTemplate.fields.find(f => f.name.toLowerCase().includes("first"));
          } 
          else if (normalizedSource.includes("last") || normalizedSource.includes("lname")) {
            bestMatch = selectedTemplate.fields.find(f => f.name.toLowerCase().includes("last"));
          }
          else if (normalizedSource.includes("email")) {
            bestMatch = selectedTemplate.fields.find(f => f.name.toLowerCase().includes("email"));
          }
          else if (normalizedSource.includes("phone")) {
            bestMatch = selectedTemplate.fields.find(f => f.name.toLowerCase().includes("phone"));
          }
          else if (normalizedSource.includes("zip") || normalizedSource.includes("postal")) {
            bestMatch = selectedTemplate.fields.find(f => 
              f.name.toLowerCase().includes("zip") || f.name.toLowerCase().includes("postal"));
          }
          else {
            // Fallback to simple similarity check
            bestMatch = selectedTemplate.fields.find(field => {
              const normalizedField = field.name.toLowerCase();
              return normalizedSource.includes(normalizedField) || 
                    normalizedField.includes(normalizedSource);
            });
          }
          
          return {
            sourceColumn: sourceCol,
            targetField: bestMatch?.name || ""
          };
        });
        
        // Track which fields were AI-mapped
        setAutoMappedFields(mappings.filter(m => m.targetField).map(m => m.sourceColumn));
        
        // Show success toast for AI mapping
        toast({
          title: "AI mapping complete",
          description: `Successfully mapped ${mappings.filter(m => m.targetField).length} out of ${sourceColumns.length} fields.`
        });
      }
      
      // Update form with new mappings
      form.setValue("columnMappings", mappings);
    };
    
    applyMappingStrategy();
  }, [form.watch("mappingStrategy")]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Column mapping submitted:", data);
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(data.columnMappings);
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
        <FormField
          control={form.control}
          name="mappingStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Mapping Strategy</FormLabel>
              <FormDescription>
                Choose how to map columns from your file to our system fields
              </FormDescription>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-3 gap-4"
              >
                <FormItem className={`flex flex-col items-center space-y-3 rounded-md border p-4 ${field.value === 'auto' ? 'border-primary bg-primary/5' : ''}`}>
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`rounded-full ${field.value === 'auto' ? 'bg-primary/20' : 'bg-primary/10'} p-2`}>
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center font-medium">Auto-Map</div>
                      <div className="text-center text-xs text-gray-500">
                        System automatically matches columns based on names
                      </div>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem value="auto" className="sr-only" />
                  </FormControl>
                </FormItem>

                <FormItem className={`flex flex-col items-center space-y-3 rounded-md border p-4 ${field.value === 'manual' ? 'border-primary bg-primary/5' : ''}`}>
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`rounded-full ${field.value === 'manual' ? 'bg-primary/20' : 'bg-primary/10'} p-2`}>
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                          <path d="M15 5L9 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="text-center font-medium">Manual</div>
                      <div className="text-center text-xs text-gray-500">
                        Manually set each column mapping yourself
                      </div>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem value="manual" className="sr-only" />
                  </FormControl>
                </FormItem>

                <FormItem className={`flex flex-col items-center space-y-3 rounded-md border p-4 ${field.value === 'ai' ? 'border-primary bg-primary/5' : ''}`}>
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`rounded-full ${field.value === 'ai' ? 'bg-primary/20' : 'bg-primary/10'} p-2`}>
                        <Wand2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center font-medium">AI-Assisted</div>
                      <div className="text-center text-xs text-gray-500">
                        Use AI to suggest the best possible mappings
                      </div>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem value="ai" className="sr-only" />
                  </FormControl>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-medium mb-4">Column Mappings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2 font-medium px-4">
              <div>Source Column</div>
              <div>Target Field</div>
            </div>
            {sourceColumns.map((column, index) => (
              <div key={index} className={`grid grid-cols-2 gap-4 items-center p-4 rounded-md ${autoMappedFields.includes(column) ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                <div>
                  <Input
                    value={column}
                    disabled
                    className="bg-white"
                  />
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
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              form.reset({
                mappingStrategy: "manual",
                columnMappings: sourceColumns.map(col => ({
                  sourceColumn: col,
                  targetField: ""
                }))
              });
              setAutoMappedFields([]);
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
