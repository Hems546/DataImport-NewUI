
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { X, ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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
    maxRowCount?: number; // Added maxRowCount as an optional property
  };
  onSave: (template: { title: string; description: string; fields: TemplateField[]; maxRowCount?: number }) => void;
}

export function EditTemplateDialog({ open, onOpenChange, template, onSave }: EditTemplateDialogProps) {
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      title: template.title,
      description: template.description,
      fields: template.fields,
      maxRowCount: template.maxRowCount || 100000, // Default to 100,000 if not provided
    },
  });

  const onSubmit = (data: any) => {
    onSave(data);
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
      <DialogContent className="sm:max-w-4xl">
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
                      type="number" 
                      min="1" 
                      max="1000000" 
                      step="1000" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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

            <DialogFooter className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
