
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { X, ChevronLeft, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    title: string;
    description: string;
    fields: TemplateField[];
    maxRowCount?: number;
  };
  onSave: (template: { title: string; description: string; fields: TemplateField[]; maxRowCount?: number }) => void;
}

export function EditTemplateDialog({ open, onOpenChange, template, onSave }: EditTemplateDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      title: template.title,
      description: template.description,
      fields: template.fields,
      maxRowCount: template.maxRowCount?.toString() || "100000", // Convert to string for input
    },
  });

  const onSubmit = (data: any) => {
    // Convert maxRowCount from string to number
    const updatedData = {
      ...data,
      maxRowCount: data.maxRowCount ? parseInt(data.maxRowCount, 10) : 100000
    };
    
    onSave(updatedData);
    toast({
      title: "Template updated",
      description: "Your template changes have been saved successfully."
    });
    onOpenChange(false);
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const addField = () => {
    const currentFields = form.getValues().fields;
    form.setValue('fields', [...currentFields, {
      name: '',
      type: 'string',
      required: false,
      description: ''
    }]);
  };

  const removeField = (index: number) => {
    const currentFields = form.getValues().fields;
    form.setValue('fields', currentFields.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxRowCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Row Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of rows allowed for this template.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">Fields</h4>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  Add Field
                </Button>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch('fields').map((field: TemplateField, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`fields.${index}.name`}
                            render={({ field }) => (
                              <Input {...field} className="w-full" />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`fields.${index}.type`}
                            render={({ field }) => (
                              <select
                                className="w-full h-10 px-3 border rounded-md"
                                {...field}
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="boolean">Boolean</option>
                              </select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`fields.${index}.required`}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`fields.${index}.description`}
                            render={({ field }) => (
                              <Input {...field} className="w-full" />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => removeField(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
