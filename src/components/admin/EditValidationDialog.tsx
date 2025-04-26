
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidationCategory } from "@/constants/validations";
import { Edit } from "lucide-react";
import { useState } from "react";

interface EditValidationDialogProps {
  validation: {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity?: string;
    type?: string;
    failAction?: string;
  };
  onSave: (updatedValidation: any) => void;
}

export function EditValidationDialog({ validation, onSave }: EditValidationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ValidationCategory>(validation.category);

  const handleSaveChanges = () => {
    onSave({
      ...validation,
      category: selectedCategory,
    });
    setOpen(false);
  };

  const getTechnicalDescription = (validationId: string) => {
    const descriptions: Record<string, string[]> = {
      'row-length-consistency': [
        "Purpose: Verifies data structure integrity by comparing row lengths",
        "Implementation: Counts columns in each row and compares to header length",
        "Common Issues:",
        "- Missing delimiters causing merged columns",
        "- Extra delimiters creating empty columns",
        "- Line breaks within fields causing row splits",
        "Resolution Steps:",
        "1. Export data with proper delimiters",
        "2. Remove any line breaks within fields",
        "3. Ensure all rows have consistent delimiters"
      ],
      'required-columns': [
        "Purpose: Ensures all mandatory fields are present in the import file",
        "Implementation: Compares header names against required field list",
        "Common Issues:",
        "- Missing required column headers",
        "- Misspelled column names",
        "- Case sensitivity mismatches",
        "Resolution Steps:",
        "1. Compare headers against template",
        "2. Add missing columns with valid data",
        "3. Correct any misspelled headers"
      ],
      'header-uniqueness': [
        "Purpose: Prevents ambiguous column mapping",
        "Implementation: Checks for duplicate column names",
        "Common Issues:",
        "- Multiple columns with same name",
        "- Hidden whitespace in headers",
        "Resolution Steps:",
        "1. Rename duplicate columns uniquely",
        "2. Remove any trailing/leading spaces"
      ]
      // ... Add more validation descriptions as needed
    };

    return descriptions[validationId] || [
      "Type: " + (validation.type || 'Not specified'),
      "Implementation details not yet documented.",
      "Please refer to validation documentation for more information."
    ];
  };

  const isCriticalSeverity = validation.severity === 'critical';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Validation: {validation.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Validation Stage</label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as ValidationCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ValidationCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Validation Configuration</h3>
            <div className="rounded-md bg-muted p-3 text-sm space-y-2">
              <p><strong>Type:</strong> {validation.type || 'Not specified'}</p>
              <p>
                <strong>Severity:</strong> 
                <span className={validation.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}>
                  {' '}{validation.severity || 'Not specified'}
                </span>
                {!isCriticalSeverity && (
                  <span className="ml-2 text-xs text-gray-500">(Can be overridden)</span>
                )}
              </p>
              {validation.failAction && (
                <p><strong>Fail Action:</strong> {validation.failAction}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Technical Implementation</h3>
            <div className="rounded-md bg-slate-100 p-3 text-sm space-y-1">
              {getTechnicalDescription(validation.id).map((detail, index) => (
                <p key={index} className="text-slate-700">
                  {detail.startsWith('-') || detail.match(/^\d+\./) ? detail : `• ${detail}`}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{validation.description}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
