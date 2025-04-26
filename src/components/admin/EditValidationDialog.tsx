
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

  const getTechnicalDescription = (type?: string, severity?: string, failAction?: string) => {
    const details = [];

    if (type === 'format') {
      details.push("Input format validation");
    } else if (type === 'structure') {
      details.push("Structural data validation");
    } else if (type === 'content') {
      details.push("Content-based validation");
    } else if (type === 'duplicate') {
      details.push("Duplication detection logic");
    } else if (type === 'mapping') {
      details.push("Field mapping validation");
    } else if (type === 'system') {
      details.push("System-level validation");
    } else if (type === 'review') {
      details.push("Review process validation");
    }

    if (severity === 'critical') {
      details.push("Blocks import process on failure");
    } else if (severity === 'high') {
      details.push("Requires immediate attention");
    } else if (severity === 'medium') {
      details.push("Warning with manual review option");
    } else if (severity === 'low') {
      details.push("Advisory notification only");
    }

    if (failAction === 'reject') {
      details.push("Action: Reject import");
    } else if (failAction === 'warn') {
      details.push("Action: Display warning");
    } else if (failAction === 'auto-fix') {
      details.push("Action: Attempt automatic correction");
    } else if (failAction === 'merge') {
      details.push("Action: Auto-merge records");
    } else if (failAction === 'flag') {
      details.push("Action: Flag for review");
    }

    return details;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            <h3 className="text-sm font-medium">Validation Details</h3>
            <div className="rounded-md bg-muted p-3 text-sm space-y-2">
              <p><strong>Type:</strong> {validation.type || 'Not specified'}</p>
              <p><strong>Severity:</strong> {validation.severity || 'Not specified'}</p>
              {validation.failAction && (
                <p><strong>Fail Action:</strong> {validation.failAction}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Technical Implementation</h3>
            <div className="rounded-md bg-slate-100 p-3 text-sm space-y-1">
              {getTechnicalDescription(validation.type, validation.severity, validation.failAction).map((detail, index) => (
                <p key={index} className="text-slate-700">• {detail}</p>
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

