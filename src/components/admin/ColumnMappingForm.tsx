
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRightLeft } from "lucide-react";
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

export function ColumnMappingForm({ template = "Contacts" }) {
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
      mappingStrategy: "auto",
      columnMappings: sourceColumns.map(col => ({
        sourceColumn: col,
        targetField: "" // Auto-mapping would fill this based on algorithms
      })),
    },
  });

  // This would be populated by auto-mapping algorithm in production
  React.useEffect(() => {
    if (form.watch("mappingStrategy") === "auto") {
      // Simple exact match or fuzzy match example
      const mappings = sourceColumns.map(sourceCol => {
        const matchedField = selectedTemplate.fields.find(field => 
          field.name.toLowerCase() === sourceCol.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") ||
          sourceCol.toLowerCase().includes(field.name.toLowerCase())
        );
        
        return {
          sourceColumn: sourceCol,
          targetField: matchedField?.name || ""
        };
      });
      
      form.setValue("columnMappings", mappings);
    }
  }, [form.watch("mappingStrategy"), selectedTemplate]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Column mapping submitted:", data);
    // Here you would save the mapping or proceed to next stage
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
                <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4">
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="rounded-full bg-primary/10 p-2">
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

                <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4">
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="rounded-full bg-primary/10 p-2">
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

                <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4">
                  <FormLabel className="cursor-pointer font-normal">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
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
              <div key={index} className="grid grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-md">
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit">Save Mapping</Button>
        </div>
      </form>
    </Form>
  );
}
